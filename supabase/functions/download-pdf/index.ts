
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

serve(async (req: Request) => {
  console.log("PDF download proxy called with method:", req.method, "at", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET") {
    console.log("Invalid method:", req.method);
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pdfName = url.searchParams.get('file');
    
    // Map of allowed PDF files for security
    const allowedPDFs = {
      'ai-guide': 'jumpstart-ai-7-fast-wins.pdf',
      'jumpstart-ai': 'jumpstart-ai-7-fast-wins.pdf'
    };

    // Default to the main guide if no file specified
    const fileName = pdfName && allowedPDFs[pdfName] ? allowedPDFs[pdfName] : allowedPDFs['ai-guide'];
    
    console.log("Requesting PDF file:", fileName);

    // Try multiple possible storage URLs to find the working one
    const possibleUrls = [
      `https://cieczaajcgkgdgenfdzi.supabase.co/storage/v1/object/public/lead-magnets/${fileName}`,
      `https://cieczaajcgkgdgenfdzi.supabase.co/storage/v1/object/public/lead_magnets/${fileName}`,
      `https://cieczaajcgkgdgenfdzi.supabase.co/storage/v1/object/public/pdfs/${fileName}`,
    ];

    let response;
    let workingUrl;
    
    for (const testUrl of possibleUrls) {
      console.log("Trying URL:", testUrl);
      try {
        response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (response.ok) {
          workingUrl = testUrl;
          console.log("Successfully fetched from:", workingUrl);
          break;
        } else {
          console.log("Failed with status:", response.status, "for URL:", testUrl);
        }
      } catch (fetchError) {
        console.error("Fetch error for URL:", testUrl, fetchError);
        continue;
      }
    }
    
    if (!response || !response.ok) {
      console.error("All URLs failed. Last response status:", response?.status);
      return new Response("PDF not found - please check if the file exists in storage", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const pdfBuffer = await response.arrayBuffer();
    
    console.log("PDF fetched successfully, size:", pdfBuffer.byteLength, "bytes from:", workingUrl);

    // Return the PDF with proper headers
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("Error in PDF download proxy:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
