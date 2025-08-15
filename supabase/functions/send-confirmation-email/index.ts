import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req) => {
  console.log('Function called successfully');
  
  try {
    const payload = await req.json();
    console.log('Payload received:', JSON.stringify(payload));
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Function working',
      received: payload 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});