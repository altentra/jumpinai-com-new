import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const clientIP = req.headers.get('x-client-ip');
    
    // Extract IP from x-forwarded-for if it exists (first IP in the list)
    let ip = 'unknown';
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      ip = realIP;
    } else if (clientIP) {
      ip = clientIP;
    }
    
    return new Response(JSON.stringify({ ip }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', ip: 'unknown' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});