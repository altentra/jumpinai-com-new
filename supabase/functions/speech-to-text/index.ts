import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Rate limiting via IP
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 'unknown';
    
    // Check auth status
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id || null;
      } catch (_) { /* guest user */ }
    }

    // Rate limit check (reuse existing RPC)
    const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('check_stt_rate_limit', {
      p_user_id: userId,
      p_ip_address: ipAddress
    });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (!rateLimitData.allowed) {
      return new Response(JSON.stringify({ 
        error: `Rate limit exceeded. ${rateLimitData.current_usage}/${rateLimitData.limit} requests this hour.`
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { audio, language } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    // Validate audio size (max ~10MB base64 ≈ ~7.5MB audio)
    if (typeof audio !== 'string' || audio.length > 10_000_000) {
      return new Response(JSON.stringify({ error: 'Audio data too large (max 10MB)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate language code if provided
    if (language && (typeof language !== 'string' || language.length > 10)) {
      return new Response(JSON.stringify({ error: 'Invalid language code' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing audio transcription request');

    // Convert base64 audio to binary
    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    
    // Prepare form data for ElevenLabs API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'recording.webm');
    formData.append('model_id', 'scribe_v1');  // Use scribe_v1 for file-based transcription
    if (language) {
      formData.append('language_code', language);  // Use language_code not language
    }

    // Send to ElevenLabs SST API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    const result = await response.json();
    console.log('Transcription successful');

    // Log usage
    try {
      await supabase.from('stt_usage_logs').insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: req.headers.get('user-agent') || 'unknown',
        transcript_length: result.text?.length || 0
      });
    } catch (e) {
      console.error('Failed to log STT usage:', e);
    }

    return new Response(
      JSON.stringify({ text: result.text || '' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Speech-to-text error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
