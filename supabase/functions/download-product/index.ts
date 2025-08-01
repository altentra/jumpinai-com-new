import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const downloadToken = url.pathname.split('/').pop();
    const isInfoRequest = url.searchParams.get('info') === 'true';

    if (!downloadToken) {
      throw new Error("Download token required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get order and product info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products(*)")
      .eq("download_token", downloadToken)
      .eq("status", "paid")
      .single();

    if (orderError || !order) {
      throw new Error("Invalid download link");
    }

    // If this is an info request, return product info as JSON
    if (isInfoRequest) {
      return new Response(JSON.stringify({
        product: order.products,
        order: {
          download_count: order.download_count,
          max_downloads: order.max_downloads
        }
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      });
    }

    // Download file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("digital-products")
      .download(order.products.file_path.replace("digital-products/", ""));

    if (fileError || !fileData) {
      throw new Error("File not found");
    }

    // Update download count
    await supabase
      .from("orders")
      .update({ download_count: order.download_count + 1 })
      .eq("id", order.id);

    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.products.file_name}"`,
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});