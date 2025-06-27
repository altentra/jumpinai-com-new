
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

    // Use the direct working Supabase storage URL
    const directUrl = `https://cieczaajcgkgdgenfdzi.supabase.co/storage/v1/object/public/lead-magnets/${fileName}`;
    console.log("Fetching from direct URL:", directUrl);

    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch PDF:", response.status, response.statusText);
      return new Response(`PDF not found - Status: ${response.status}`, {
        status: 404,
        headers: corsHeaders,
      });
    }

    const pdfBuffer = await response.arrayBuffer();
    
    console.log("PDF fetched successfully, size:", pdfBuffer.byteLength, "bytes");

    // Return the PDF with professional headers
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Jumpstart AI - 7 Fast Wins You Can Use Today.pdf"`,
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
