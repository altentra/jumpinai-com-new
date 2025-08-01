import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let downloadToken;
    
    // Try to get token from URL path first (for direct links)
    const url = new URL(req.url);
    const pathToken = url.pathname.split('/').pop();
    
    // Try to get token from request body (for API calls)
    let bodyToken;
    try {
      const body = await req.json();
      bodyToken = body.token;
    } catch (e) {
      // No JSON body, that's fine
    }
    
    downloadToken = bodyToken || pathToken;

    console.log("Full URL:", req.url);
    console.log("URL pathname:", url.pathname);
    console.log("Path token:", pathToken);
    console.log("Body token:", bodyToken);
    console.log("Final token:", downloadToken);

    if (!downloadToken) {
      console.error("No download token found in URL or body");
      throw new Error("Download token is required");
    }

    console.log("Processing download for token:", downloadToken);

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get order by download token
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        products (*)
      `)
      .eq("download_token", downloadToken)
      .eq("status", "paid")
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(JSON.stringify({ 
        error: "Invalid or expired download link" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Check download limits
    if (order.download_count >= order.max_downloads) {
      return new Response(JSON.stringify({ 
        error: "Download limit exceeded" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Check if order is not too old (30 days)
    const orderDate = new Date(order.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    if (orderDate < thirtyDaysAgo) {
      return new Response(JSON.stringify({ 
        error: "Download link has expired" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 410,
      });
    }

    // Get the file from storage
    const filePath = order.products.file_path.startsWith("digital-products/") 
      ? order.products.file_path.replace("digital-products/", "")
      : order.products.file_path;
    
    const { data: fileData, error: fileError } = await supabase.storage
      .from("digital-products")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      return new Response(JSON.stringify({ 
        error: "Product file not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Update download count
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        download_count: order.download_count + 1
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Download count update error:", updateError);
    }

    console.log("File download successful for:", order.products.name);

    // Return the file
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.products.file_name}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});