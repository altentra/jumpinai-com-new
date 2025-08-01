import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== DOWNLOAD FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let downloadToken;
    
    // Try to get token from URL path first (for direct links)
    const url = new URL(req.url);
    const pathToken = url.pathname.split('/').pop();
    
    // Try to get token from request body (for API calls)
    let bodyToken;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        bodyToken = body.token;
      } catch (e) {
        // No JSON body, that's fine
      }
    }
    
    downloadToken = bodyToken || pathToken;

    console.log("Processing download request:", {
      method: req.method,
      url: req.url,
      pathToken,
      bodyToken,
      finalToken: downloadToken
    });

    if (!downloadToken) {
      console.error("No download token found");
      return new Response(JSON.stringify({ 
        error: "Download token is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get order with product details using LEFT JOIN
    console.log("Fetching order for token:", downloadToken);
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        products!inner (
          id,
          name,
          file_path,
          file_name
        )
      `)
      .eq("download_token", downloadToken)
      .eq("status", "paid")
      .single();

    console.log("Order query result:", { orderData, orderError });

    if (orderError) {
      console.error("Order fetch error:", orderError);
      return new Response(JSON.stringify({ 
        error: "Invalid or expired download link",
        details: orderError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!orderData) {
      console.error("No order found");
      return new Response(JSON.stringify({ 
        error: "Invalid or expired download link" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Temporarily disable download limits for testing
    console.log(`Download count: ${orderData.download_count}/${orderData.max_downloads}`);
    
    // TODO: Re-enable this check later
    // if (orderData.download_count >= orderData.max_downloads) {
    //   return new Response(JSON.stringify({ 
    //     error: "Download limit exceeded" 
    //   }), {
    //     headers: { ...corsHeaders, "Content-Type": "application/json" },
    //     status: 403,
    //   });
    // }

    // Check if order is not too old (30 days)
    const orderDate = new Date(orderData.created_at);
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
    const product = orderData.products;
    console.log("Product details:", product);
    
    if (!product || !product.file_path) {
      return new Response(JSON.stringify({ 
        error: "Product file not configured" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const filePath = product.file_path.startsWith("digital-products/") 
      ? product.file_path.replace("digital-products/", "")
      : product.file_path;
    
    console.log("Downloading file from storage:", filePath);
    
    const { data: fileData, error: fileError } = await supabase.storage
      .from("digital-products")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      return new Response(JSON.stringify({ 
        error: "Product file not found",
        details: fileError?.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Update download count
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        download_count: orderData.download_count + 1
      })
      .eq("id", orderData.id);

    if (updateError) {
      console.error("Download count update error:", updateError);
    }

    console.log("File download successful for:", product.name);

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