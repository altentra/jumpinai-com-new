import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedComponents {
  prompts: Array<{
    title: string;
    description: string;
    prompt_text: string;
    category: string;
    ai_tools: string[];
    use_cases: string[];
    instructions: string;
    tags: string[];
  }>;
  workflows: Array<{
    title: string;
    description: string;
    workflow_steps: object[];
    category: string;
    ai_tools: string[];
    duration_estimate: string;
    complexity_level: string;
    prerequisites: string[];
    expected_outcomes: string[];
    instructions: string;
    tags: string[];
  }>;
  blueprints: Array<{
    title: string;
    description: string;
    blueprint_content: object;
    category: string;
    ai_tools: string[];
    implementation_time: string;
    difficulty_level: string;
    resources_needed: string[];
    deliverables: string[];
    instructions: string;
    tags: string[];
  }>;
  strategies: Array<{
    title: string;
    description: string;
    strategy_framework: object;
    category: string;
    ai_tools: string[];
    timeline: string;
    success_metrics: string[];
    key_actions: string[];
    potential_challenges: string[];
    mitigation_strategies: string[];
    instructions: string;
    tags: string[];
  }>;
}

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 2000,
  isJSON = false,
  model = 'gpt-4.1-2025-04-14'
 ) {
  const body: any = {
    model,
    messages,
    max_completion_tokens: maxTokens,
  };
  
  // Explicitly request text outputs for reasoning models to avoid empty responses
  if (isJSON) {
    body.response_format = { type: 'json_object' };
  } else {
    body.response_format = { type: 'text' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('OpenAI API error:', response.status, err);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  const msg = choice?.message;
  let content = '';

  if (typeof msg?.content === 'string') {
    content = msg.content;
  } else if (Array.isArray(msg?.content)) {
    content = msg.content
      .map((part: any) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        if (typeof part?.content === 'string') return part.content;
        if (Array.isArray(part?.content)) return part.content.map((p: any) => p?.text || p?.content || '').join('');
        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  if (!content && typeof choice?.text === 'string') {
    content = choice.text;
  }

  if (!content) {
    const ot = (data as any)?.output_text;
    if (Array.isArray(ot)) content = ot.join('\n');
    else if (typeof ot === 'string') content = ot;
  }

  if (!content && typeof (data as any)?.message === 'string') {
    content = (data as any).message;
  }

  const finish_reason = choice?.finish_reason;
  
  if (!content || content.trim() === '') {
    console.error('OpenAI response contained no textual content. Debug snapshot:', {
      finish_reason,
      usage: data?.usage,
      hasMessage: !!msg,
      types: {
        messageContentType: typeof msg?.content,
        outputTextType: Array.isArray((data as any)?.output_text) ? 'array' : typeof (data as any)?.output_text,
      },
    });
  }

  return { content, usage: data.usage, finish_reason };
}

async function generateComponents(userProfile: any): Promise<GeneratedComponents> {
  // Helper: robust JSON parser with extraction fallback
  const safeParse = (text: string): any | null => {
    try { return JSON.parse(text); } catch (_) {}
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const sliced = text.slice(start, end + 1);
        return JSON.parse(sliced);
      }
    } catch (_) {}
    return null;
  };

  type Key = 'prompts' | 'workflows' | 'blueprints' | 'strategies';

  const buildPromptFor = (key: Key) => {
    const base = `Generate exactly 4 high-quality ${key} based on this user profile.
No emojis or special symbols. Return ONLY valid JSON for the "${key}" key.
User: ${userProfile.currentRole} in ${userProfile.industry}
Goals: ${userProfile.goals}
AI Knowledge: ${userProfile.aiKnowledge}
`;

    // Minimal per-key schema
    const schemas: Record<Key, string> = {
      prompts: `{"prompts": [{"title":"","description":"","prompt_text":"","category":"productivity","ai_tools":["ChatGPT"],"use_cases":[""],"instructions":"","tags":[""]}]}`,
      workflows: `{"workflows": [{"title":"","description":"","workflow_steps":[{"step":1,"title":"","description":"","tools":[],"estimated_time":""}],"category":"productivity","ai_tools":[],"duration_estimate":"","complexity_level":"beginner","prerequisites":[],"expected_outcomes":[],"instructions":"","tags":[]}]}`,
      blueprints: `{"blueprints": [{"title":"","description":"","blueprint_content":{"overview":"","components":[],"structure":"","implementation":""},"category":"productivity","ai_tools":[],"implementation_time":"","difficulty_level":"beginner","resources_needed":[],"deliverables":[],"instructions":"","tags":[]}]}`,
      strategies: `{"strategies": [{"title":"","description":"","strategy_framework":{"overview":"","phases":[],"objectives":[],"approach":""},"category":"productivity","ai_tools":[],"timeline":"","success_metrics":[],"key_actions":[],"potential_challenges":[],"mitigation_strategies":[],"instructions":"","tags":[]}]}`
    };

    return `${base}\nUse this JSON shape (example with 1 item). Output 4 items in the array:\n${schemas[key]}`;
  };

  const generateForKey = async (key: Key) => {
    const prompt = buildPromptFor(key);

    const systemJSON = 'Return ONLY a single valid JSON object with the requested top-level key. No markdown, no code fences, no commentary.';
    // First attempt
    let res = await callOpenAI([
      { role: 'system', content: systemJSON },
      { role: 'user', content: prompt },
    ], 1500, true, 'gpt-4.1-2025-04-14');

    let obj = safeParse(res.content);
    if (!obj) {
      console.warn(`[gen:${key}] parse failed (attempt 1). First 400 chars:`, res.content?.slice(0, 400));
    }

    // Repair attempt
    if (!obj || (!Array.isArray((obj as any)[key]))) {
      const repair = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON in this exact format with the "${key}" array containing exactly 4 items. No other text.` },
      ], 1500, true, 'gpt-4.1-2025-04-14');
      obj = safeParse(repair.content);
      if (!obj) {
        console.warn(`[gen:${key}] parse failed (attempt 2). First 400 chars:`, repair.content?.slice(0, 400));
      }
    }

    // Extract array with alt-key fallback
    const altKeysMap: Record<Key, string[]> = {
      prompts: ['prompt', 'prompts_list'],
      workflows: ['workflow', 'processes', 'pipeline', 'workflows_list'],
      blueprints: ['blueprint', 'templates', 'blueprints_list'],
      strategies: ['strategy', 'plan', 'roadmaps', 'strategies_list'],
    };
    let arr: any[] = [];
    if (obj && typeof obj === 'object') {
      const keysToCheck = [key, ...altKeysMap[key]];
      for (const k of keysToCheck) {
        if (Array.isArray((obj as any)[k])) {
          if (k !== key) console.warn(`[gen:${key}] used fallback key "${k}" from model output.`);
          arr = (obj as any)[k];
          break;
        }
      }
    }

    // Compact fallback attempt if still empty
    if (!arr || arr.length === 0) {
      const compactSchema: Record<Key, string> = {
        prompts: `{"prompts":[{"title":"","description":"","prompt_text":"","category":"productivity","ai_tools":["ChatGPT"],"use_cases":[""],"instructions":"","tags":[""]}]}`,
        workflows: `{"workflows":[{"title":"","description":"","workflow_steps":[{"step":1,"title":"","description":""}],"category":"productivity","ai_tools":[],"duration_estimate":"","complexity_level":"beginner","prerequisites":[],"expected_outcomes":[],"instructions":"","tags":[]}]}`,
        blueprints: `{"blueprints":[{"title":"","description":"","blueprint_content":{"overview":"","components":[],"implementation":""},"category":"productivity","ai_tools":[],"implementation_time":"","difficulty_level":"beginner","resources_needed":[],"deliverables":[],"instructions":"","tags":[]}]}`,
        strategies: `{"strategies":[{"title":"","description":"","strategy_framework":{"overview":"","phases":[],"objectives":[]},"category":"productivity","ai_tools":[],"timeline":"","success_metrics":[],"key_actions":[],"potential_challenges":[],"mitigation_strategies":[],"instructions":"","tags":[]}]}`,
      };
      const compactPrompt = `${buildPromptFor(key)}\n\nMake each item concise (2-3 sentences per field).`;
      const compact = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: `${compactPrompt}\n\nReturn ONLY JSON. Use this minimal example shape:\n${compactSchema[key]}` },
      ], 1200, true, 'gpt-4.1-2025-04-14');
      const compactObj = safeParse(compact.content);
      if (compactObj && Array.isArray(compactObj[key])) {
        arr = compactObj[key];
      } else {
        console.warn(`[gen:${key}] compact attempt also failed. First 400 chars:`, compact.content?.slice(0, 400));
        arr = [];
      }
    }

    console.log(`Generated ${key}: ${arr.length} items`);
    return arr;
  };

  const prompts = await generateForKey('prompts');
  const workflows = await generateForKey('workflows');
  const blueprints = await generateForKey('blueprints');
  const strategies = await generateForKey('strategies');

  return { prompts, workflows, blueprints, strategies };
}

async function saveComponents(components: GeneratedComponents, userId: string, jumpId: string) {
  const saves = [
    ...components.prompts.map(p => supabase.from('user_prompts').insert({ user_id: userId, jump_id: jumpId, ...p })),
    ...components.workflows.map(w => supabase.from('user_workflows').insert({ user_id: userId, jump_id: jumpId, ...w })),
    ...components.blueprints.map(b => supabase.from('user_blueprints').insert({ user_id: userId, jump_id: jumpId, ...b })),
    ...components.strategies.map(s => supabase.from('user_strategies').insert({ user_id: userId, jump_id: jumpId, ...s }))
  ];

  const results = await Promise.allSettled(saves);
  let saved = 0;
  const errors: Array<any> = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const val: any = (r as any).value;
      if (val?.error) {
        errors.push({ type: 'fulfilled-error', error: val.error });
      } else {
        saved++;
      }
    } else {
      errors.push({ type: 'rejected', reason: (r as any).reason });
    }
  }
  if (errors.length) {
    console.error('Errors while saving generated components:', errors);
  }
  return { total: saves.length, saved, errors };
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, userProfile, userId, jumpId, generateComponents: shouldGenerateComponents } = await req.json();

    // Create system prompt
    const systemPrompt = `You are Jumps Studio, an expert AI transformation coach. Create personalized transformation plans called "Jumps".

IMPORTANT: Use only plain text - no emojis, special symbols, or decorative characters for better PDF compatibility.

User Profile:
- Role: ${userProfile?.currentRole || 'Not specified'}
- Industry: ${userProfile?.industry || 'Not specified'}
- Experience: ${userProfile?.experienceLevel || 'Not specified'}
- AI Knowledge: ${userProfile?.aiKnowledge || 'Not specified'}
- Goals: ${userProfile?.goals || 'Not specified'}
- Challenges: ${userProfile?.challenges || 'Not specified'}
- Time Available: ${userProfile?.timeCommitment || 'Not specified'}
- Budget: ${userProfile?.budget || 'Not specified'}

Structure your response as a comprehensive transformation plan with:
1. Transformation Overview
2. Current State Analysis  
3. The Jump Plan (3 phases with specific actions)
4. Recommended Tools & Resources
5. Success Metrics & Milestones
6. Potential Challenges & Solutions

Be conversational, specific, and actionable.`;

    // Get recent messages (last 6 to avoid token limits)
    const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];
    
    // If this request is only for component generation, skip plan generation to reduce latency and failures
    let content = '';
    let usage: any = undefined;
    let finish_reason: any = undefined;
    if (!shouldGenerateComponents) {
      const res1 = await callOpenAI([
        { role: 'system', content: systemPrompt },
        ...recentMessages
      ], 1600, false, 'gpt-4.1-2025-04-14');
      content = res1.content;
      usage = res1.usage;
      finish_reason = res1.finish_reason;

      // If cut off or empty, request a concise continuation; fallback to GPT-4.1 only if still empty
      if (!content || content.trim() === '' || finish_reason === 'length') {
        const cont = await callOpenAI([
          { role: 'system', content: systemPrompt },
          ...recentMessages,
          { role: 'user', content: 'Continue and deliver the complete plan in under 1200 words. Plain text only. No emojis or special symbols.' }
        ], 1200, false, 'gpt-4.1-2025-04-14');
        if (cont.content && cont.content.trim() !== '') {
          content = (content && content.trim() !== '') ? `${content}\n\n${cont.content}` : cont.content;
          finish_reason = cont.finish_reason;
        } else {
          const fb = await callOpenAI([
            { role: 'system', content: systemPrompt },
            ...recentMessages
          ], 1600, false, 'gpt-4.1-2025-04-14');
          content = fb.content || '';
          finish_reason = fb.finish_reason;
        }
      }

      if (!content || content.trim() === '') {
        content = 'Sorry, I couldn’t complete the plan this time. Please try again in a moment.';
      }
    }


    // Handle component generation
    let componentsStatus: string | object = 'Not requested';
    let componentsDetail: any = null;
    if (shouldGenerateComponents) {
      if (!userProfile || !userId || !jumpId) {
        componentsStatus = 'Missing userProfile, userId, or jumpId';
      } else {
        try {
          console.log('Generating components...');
          const components = await generateComponents(userProfile);
          const expectedCounts = {
            prompts: components.prompts?.length || 0,
            workflows: components.workflows?.length || 0,
            blueprints: components.blueprints?.length || 0,
            strategies: components.strategies?.length || 0,
            total: (components.prompts?.length || 0) + (components.workflows?.length || 0) + (components.blueprints?.length || 0) + (components.strategies?.length || 0),
          };
          const summary = await saveComponents(components, userId, jumpId);
          if (summary.saved === 0) {
            componentsStatus = 'Failed to save';
          } else if (summary.saved < summary.total) {
            componentsStatus = `Partially saved (${summary.saved}/${summary.total})`;
          } else {
            componentsStatus = 'Generated and saved successfully';
          }
          componentsDetail = { expectedCounts, saveSummary: summary };
          console.log('Components save summary:', summary, 'Expected counts:', expectedCounts);
        } catch (error) {
          console.error('Component generation failed:', error);
          componentsStatus = 'Failed to generate';
          componentsDetail = { error: String(error) };
        }
      }
    }

    return new Response(JSON.stringify({
      message: content,
      usage,
      debug: { finish_reason, model: 'gpt-4.1-2025-04-14' },
      components: componentsStatus,
      components_detail: componentsDetail
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Generation failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});