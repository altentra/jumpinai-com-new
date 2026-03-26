import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) {
    return new Response("ELEVENLABS_API_KEY not configured", { status: 500 });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Extract user info
  const authHeader = headers.get('authorization');
  let userId: string | null = null;
  
  if (authHeader) {
    try {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  // Get IP address and user agent
  const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || 
                    headers.get('x-real-ip') || 
                    'unknown';
  const userAgent = headers.get('user-agent') || 'unknown';

  // Check rate limit
  const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('check_stt_rate_limit', {
    p_user_id: userId,
    p_ip_address: ipAddress
  });

  if (rateLimitError) {
    console.error('Rate limit check error:', rateLimitError);
    return new Response(JSON.stringify({ error: 'Rate limit check failed' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!rateLimitData.allowed) {
    return new Response(JSON.stringify({ 
      error: 'Rate limit exceeded',
      message: `You have reached the limit of ${rateLimitData.limit} requests per hour. Current usage: ${rateLimitData.current_usage}`,
      limit: rateLimitData.limit,
      current_usage: rateLimitData.current_usage,
      remaining: rateLimitData.remaining
    }), { 
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let elevenLabsSocket: WebSocket | null = null;
  let sessionStartTime: number | null = null;
  let totalTranscriptLength = 0;

  socket.onopen = async () => {
    console.log("Client connected to relay");
    
    try {
      // Generate a single-use token for WebSocket authentication
      console.log("Generating single-use token from ElevenLabs...");
      const tokenResponse = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token generation failed:", tokenResponse.status, errorText);
        throw new Error(`Failed to generate token: ${tokenResponse.status} ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log("Token response:", JSON.stringify(tokenData));
      const token = tokenData.token;
      
      if (!token) {
        throw new Error('No token received from ElevenLabs');
      }

      console.log("Token generated successfully, connecting to WebSocket...");
      
      // Connect to ElevenLabs Realtime API using token
      const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=en&audio_format=pcm_16000&commit_strategy=vad&token=${token}`;
      
      console.log("Connecting to ElevenLabs with model: scribe_v2_realtime");
      elevenLabsSocket = new WebSocket(wsUrl);
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: `Failed to create connection: ${error.message}` 
      }));
      return;
    }

    elevenLabsSocket.onopen = () => {
      console.log("Connected to ElevenLabs Realtime API");
      sessionStartTime = Date.now();
      socket.send(JSON.stringify({ type: "session_started" }));
    };

    elevenLabsSocket.onmessage = (event) => {
      try {
        console.log("Raw ElevenLabs message:", event.data);
        const data = JSON.parse(event.data);
        console.log("Parsed data:", JSON.stringify(data));
        console.log("Data type:", data.type);
        
        // Track transcript length
        if (data.text && (data.type === 'partial_transcript' || data.type === 'committed_transcript')) {
          totalTranscriptLength = data.text.length;
        }
        
        // Forward all transcription events to client
        socket.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error parsing ElevenLabs message:", error);
        console.error("Raw data was:", event.data);
      }
    };

    elevenLabsSocket.onerror = (error) => {
      console.error("ElevenLabs WebSocket error:", error);
      console.error("WebSocket URL:", elevenLabsSocket?.url);
      console.error("WebSocket readyState:", elevenLabsSocket?.readyState);
      const errorMessage = error instanceof Error ? error.message : "Connection to transcription service failed";
      console.error("Error details:", errorMessage);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: `ElevenLabs connection failed: ${errorMessage}. Please check your ElevenLabs API key has Speech-to-Text Realtime access enabled.` 
      }));
    };

    elevenLabsSocket.onclose = () => {
      console.log("ElevenLabs connection closed");
      socket.send(JSON.stringify({ type: "session_ended" }));
    };
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Forward audio chunks to ElevenLabs with correct format
      if (message.type === "input_audio_chunk" && elevenLabsSocket?.readyState === WebSocket.OPEN) {
        console.log("Forwarding audio chunk to ElevenLabs");
        elevenLabsSocket.send(JSON.stringify({
          message_type: "input_audio_chunk",
          audio_base_64: message.audio_chunk,
          sample_rate: 16000,
        }));
      }
    } catch (error) {
      console.error("Error processing client message:", error);
    }
  };

  socket.onclose = async () => {
    console.log("Client disconnected");
    
    // Log usage before closing
    if (sessionStartTime) {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      
      try {
        await supabase.from('stt_usage_logs').insert({
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          session_duration_seconds: sessionDuration,
          transcript_length: totalTranscriptLength
        });
        console.log('STT usage logged successfully');
      } catch (error) {
        console.error('Failed to log STT usage:', error);
      }
    }
    
    if (elevenLabsSocket) {
      elevenLabsSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client socket error:", error);
    if (elevenLabsSocket) {
      elevenLabsSocket.close();
    }
  };

  return response;
});
