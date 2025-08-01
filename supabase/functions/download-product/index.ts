import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== DOWNLOAD FUNCTION STARTED ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Method:", req.method, "URL:", req.url);
    
    // Get download token from URL or body
    let downloadToken;
    const url = new URL(req.url);
    const pathToken = url.pathname.split('/').pop();
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        downloadToken = body.token || pathToken;
      } catch (e) {
        downloadToken = pathToken;
      }
    } else {
      downloadToken = pathToken;
    }
    
    console.log("Download token:", downloadToken);
    
    if (!downloadToken) {
      return new Response(JSON.stringify({ error: "No download token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Looking up order...");
    
    // Simple order lookup
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("download_token", downloadToken)
      .eq("status", "paid")
      .single();

    if (orderError || !order) {
      console.log("Order not found:", orderError);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    console.log("Order found:", order.id);

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", order.product_id)
      .single();

    if (productError || !product) {
      console.log("Product not found:", productError);
      return new Response(JSON.stringify({ error: "Product not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    console.log("Product found:", product.name);
    console.log("File path:", product.file_path);

    // Download file from storage
    const filePath = product.file_path.replace("digital-products/", "");
    console.log("Downloading from storage:", filePath);
    
    const { data: fileData, error: fileError } = await supabase.storage
      .from("digital-products")
      .download(filePath);

    if (fileError || !fileData) {
      console.log("File download error:", fileError);
      return new Response(JSON.stringify({ error: "File not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    console.log("File downloaded successfully, size:", fileData.size);

    // Update download count
    await supabase
      .from("orders")
      .update({ download_count: order.download_count + 1 })
      .eq("id", order.id);

    console.log("Download count updated");

    // Return the file
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${product.file_name}"`,
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