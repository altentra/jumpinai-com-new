import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [jumpsRes, toolPromptsRes, clarificationsRes, automationsRes] = await Promise.all([
      supabase.from("user_jumps").select("id", { count: "exact", head: true }),
      supabase.from("user_tool_prompts").select("id", { count: "exact", head: true }),
      supabase.from("user_jump_actions").select("id", { count: "exact", head: true }).eq("action_type", "clarify"),
      supabase.from("user_agents").select("id", { count: "exact", head: true }),
    ]);

    const totalAutomations = (automationsRes.count || 0) + 300;
    const hoursSaved = totalAutomations * 32 + 1000;

    const stats = {
      totalJumps: (jumpsRes.count || 0) + 500,
      totalToolPrompts: (toolPromptsRes.count || 0) + 700,
      totalClarifications: (clarificationsRes.count || 0) + 200,
      totalAutomations,
      estimatedHoursSaved: hoursSaved,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
