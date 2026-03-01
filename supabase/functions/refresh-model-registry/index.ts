import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if we already refreshed in the last 20 hours
    const { data: recentEntry } = await supabase
      .from('ai_model_registry')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (recentEntry) {
      const lastUpdate = new Date(recentEntry.updated_at);
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      let forceRefresh = false;
      try {
        const body = await req.json();
        forceRefresh = body?.force === true;
      } catch { /* no body */ }

      if (hoursSinceUpdate < 20 && !forceRefresh) {
        console.log(`⏭️ Skipping refresh — last updated ${hoursSinceUpdate.toFixed(1)}h ago`);
        return new Response(
          JSON.stringify({ status: 'skipped', reason: 'Recently updated', hours_ago: hoursSinceUpdate.toFixed(1) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const today = new Date().toISOString().split('T')[0];
    console.log(`🔄 Refreshing AI model registry as of ${today}...`);

    // Use Lovable AI Gateway for reliable JSON response
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a factual AI industry analyst. Return ONLY valid JSON, nothing else. Be concise.'
          },
          {
            role: 'user',
            content: `Today is ${today}. For each AI provider below, give the current latest flagship model name. If unsure, use "unknown". Return ONLY this JSON:\n{"Anthropic":"name","OpenAI":"name","Google":"name","xAI":"name","Midjourney":"name","Runway":"name","ElevenLabs":"name","Perplexity":"name","Suno":"name","Manus":"name","StabilityAI":"name","OpenAI_image":"name","Google_video":"name"}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ status: 'error', error: 'Rate limited, try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from AI Gateway');
    }

    console.log('📥 AI response:', responseText);

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let modelData: Record<string, any>;
    try {
      modelData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse response as JSON:', jsonStr);
      throw new Error('Invalid JSON from AI');
    }

    // Map flat keys to provider/tool pairs
    const keyMap: Record<string, { provider: string; toolName: string }> = {
      'Anthropic': { provider: 'Anthropic', toolName: 'Claude' },
      'OpenAI': { provider: 'OpenAI', toolName: 'ChatGPT' },
      'Google': { provider: 'Google', toolName: 'Gemini' },
      'xAI': { provider: 'xAI', toolName: 'Grok' },
      'Midjourney': { provider: 'Midjourney', toolName: 'Midjourney' },
      'Runway': { provider: 'Runway', toolName: 'Runway' },
      'ElevenLabs': { provider: 'ElevenLabs', toolName: 'ElevenLabs' },
      'Perplexity': { provider: 'Perplexity', toolName: 'Perplexity' },
      'Suno': { provider: 'Suno', toolName: 'Suno' },
      'Manus': { provider: 'Manus', toolName: 'Manus' },
      'StabilityAI': { provider: 'Stability AI', toolName: 'Stable Diffusion' },
      'OpenAI_image': { provider: 'OpenAI', toolName: 'DALL-E' },
      'Google_video': { provider: 'Google', toolName: 'Veo' },
    };

    let updatedCount = 0;

    for (const [key, value] of Object.entries(modelData)) {
      const mapping = keyMap[key];
      if (!mapping || !value || value === 'unknown') continue;

      const { error } = await supabase
        .from('ai_model_registry')
        .update({
          latest_models: { flagship: value },
          source: 'gemini_auto',
          updated_at: new Date().toISOString()
        })
        .eq('provider', mapping.provider)
        .eq('tool_name', mapping.toolName);

      if (error) {
        console.error(`Error updating ${mapping.provider}/${mapping.toolName}:`, error);
      } else {
        updatedCount++;
        console.log(`✅ Updated ${mapping.provider}/${mapping.toolName}: ${value}`);
      }
    }

    console.log(`🎉 Registry refresh complete. Updated ${updatedCount} providers.`);

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        updated: updatedCount, 
        date: today,
        data: modelData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error refreshing model registry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ status: 'error', error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
