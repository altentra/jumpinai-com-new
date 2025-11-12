import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    
    // Extract IP from headers (prioritize cf-connecting-ip for Cloudflare)
    let ip = 'unknown';
    if (cfConnectingIP) {
      ip = cfConnectingIP;
    } else if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      ip = realIP;
    } else if (clientIP) {
      ip = clientIP;
    }
    
    // Get location data from IP using ip-api.com (free, no API key needed)
    let location = 'Unknown';
    if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            const parts = [];
            if (geoData.city) parts.push(geoData.city);
            if (geoData.regionName) parts.push(geoData.regionName);
            if (geoData.country) parts.push(geoData.country);
            location = parts.join(', ') || 'Unknown';
          }
        }
      } catch (geoError) {
        console.error('Geolocation error:', geoError);
      }
    }
    
    return new Response(JSON.stringify({ ip, location }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', ip: 'unknown', location: 'Unknown' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});