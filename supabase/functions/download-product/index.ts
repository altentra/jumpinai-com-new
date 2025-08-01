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
    console.log("Token length:", downloadToken?.length);
    console.log("Expected token: 81f23298-6a87-43b8-b2c1-91f1d5f48c39");
    console.log("Token comparison:", downloadToken === "81f23298-6a87-43b8-b2c1-91f1d5f48c39");
    
    if (!downloadToken) {
      return new Response(JSON.stringify({ error: "No download token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Test with the specific token we know exists
    if (downloadToken === "81f23298-6a87-43b8-b2c1-91f1d5f48c39") {
      console.log("=== TOKEN MATCHED - STARTING REAL DOWNLOAD ===");
      
      try {
        // Initialize Supabase client
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        
        console.log("Supabase client initialized, attempting storage download...");
        
        // Try to download the specific file we know exists
        const { data: fileData, error: fileError } = await supabase.storage
          .from("digital-products")
          .download("jump-in-ai-text-creation-copywriting.pdf");
        
        console.log("Storage download completed");
        
        if (fileError) {
          console.error("Storage error:", JSON.stringify(fileError));
          throw new Error(`Storage error: ${fileError.message}`);
        }
        
        if (!fileData) {
          throw new Error("No file data returned");
        }
        
        console.log("Real file downloaded successfully, size:", fileData.size);
        
        return new Response(fileData, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Jump in AI of Text Creation & Copywriting.pdf"`,
          },
        });
        
      } catch (error) {
        console.error("Download failed, error details:", error.message);
        
        // Instead of fallback, let's return the error so we can see what's happening
        return new Response(JSON.stringify({ 
          error: "Storage download failed",
          details: error.message,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }
    
    console.log("Token did not match expected value");
    console.log("Received token:", JSON.stringify(downloadToken));
    console.log("Expected token:", JSON.stringify("81f23298-6a87-43b8-b2c1-91f1d5f48c39"));
    
    return new Response(JSON.stringify({ 
      message: "Token processing completed but did not match",
      receivedToken: downloadToken,
      expectedToken: "81f23298-6a87-43b8-b2c1-91f1d5f48c39",
      comparison: downloadToken === "81f23298-6a87-43b8-b2c1-91f1d5f48c39"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
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