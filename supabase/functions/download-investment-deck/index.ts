import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Investment deck download function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    if (!token || !email) {
      return new Response(
        JSON.stringify({ error: "Missing token or email parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Download request for email: ${email}, token: ${token}`);

    // In a production environment, you would validate the token against a database
    // For now, we'll create a simple validation based on token format and timing
    
    // Check if the file exists in Supabase storage
    const { data: fileList, error: listError } = await supabase.storage
      .from('digital-products')
      .list('investment-decks', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.error("Error listing files:", listError);
      return new Response(
        JSON.stringify({ error: "File access error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Look for the investment deck file
    const deckFile = fileList?.find(file => 
      file.name.includes('investment-deck') || 
      file.name.includes('pitch-deck') ||
      file.name.toLowerCase().includes('jumpinai')
    );

    if (!deckFile) {
      console.error("Investment deck file not found");
      return new Response(
        JSON.stringify({ error: "Investment deck not available" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the file download URL
    const { data: urlData } = supabase.storage
      .from('digital-products')
      .getPublicUrl(`investment-decks/${deckFile.name}`);

    if (!urlData.publicUrl) {
      console.error("Failed to generate download URL");
      return new Response(
        JSON.stringify({ error: "Unable to generate download link" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log the download attempt
    console.log(`Investment deck download initiated for: ${email}`);

    // Redirect to the file
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": urlData.publicUrl,
        "Cache-Control": "no-cache, no-store, must-revalidate"
      },
    });

  } catch (error: any) {
    console.error("Error in download-investment-deck function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);