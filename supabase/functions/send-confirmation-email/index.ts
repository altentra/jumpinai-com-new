import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    
    console.log('Auth hook called successfully');
    console.log('Payload keys:', Object.keys(payload));
    console.log('Full payload:', JSON.stringify(payload));
    
    return new Response(JSON.stringify({ 
      success: true,
      receivedKeys: Object.keys(payload)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 200, // Return 200 even on error for debugging
      headers: { 'Content-Type': 'application/json' }
    });
  }
});