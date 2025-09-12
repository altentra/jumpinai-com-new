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
  maxTokens = 1200,
  isJSON = false,
  model = 'gpt-5-mini-2025-08-07'
) {
  // Helper to detect param style per model family
  const isNewerModel = (m: string) => /(gpt-5|gpt-4\.1|o3|o4)/.test(m);

  // Helper to perform a timed request and normalize the response
  const makeRequest = async (mdl: string, tokens: number, timeoutMs: number) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
    try {
      // Build request body with correct token param key
      const body: any = {
        model: mdl,
        messages,
      };
      if (isNewerModel(mdl)) {
        body.max_completion_tokens = tokens; // Newer models param
      } else {
        body.max_tokens = tokens; // Legacy models param
      }
      body.response_format = isJSON ? { type: 'json_object' } : { type: 'text' };

      const doFetch = async (b: any) => fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(b),
        signal: controller.signal,
      });

      let response = await doFetch(body);

      // Auto-retry once if token param key is rejected by the endpoint
      if (!response.ok) {
        const errTxt = await response.text().catch(() => '');
        const needsSwapToMaxTokens = /max_completion_tokens/i.test(errTxt);
        const needsSwapToMaxCompletion = /max_tokens/i.test(errTxt) && isNewerModel(mdl);
        if (needsSwapToMaxTokens || needsSwapToMaxCompletion) {
          const swapped: any = { ...body };
          delete swapped.max_completion_tokens;
          delete swapped.max_tokens;
          if (needsSwapToMaxTokens) swapped.max_tokens = tokens; else swapped.max_completion_tokens = tokens;
          response = await doFetch(swapped);
        }
        if (!response.ok) {
          console.error('OpenAI API error:', response.status, errTxt);
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      }

      const data = await response.json();
      const choice = data?.choices?.[0];
      const msg = choice?.message;
      let content = '';

      // 1) Standard text content
      if (typeof msg?.content === 'string' && msg.content.trim()) {
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

      // 2) Tool/function call arguments (common in JSON modes)
      if (!content && Array.isArray((msg as any)?.tool_calls) && (msg as any).tool_calls.length) {
        try {
          const args = (msg as any).tool_calls
            .map((tc: any) => tc?.function?.arguments || '')
            .filter((s: string) => typeof s === 'string' && s.trim())
            .join('\n');
          if (args && args.trim()) content = args.trim();
        } catch (_) {}
      }

      // 3) Legacy single function_call
      if (!content && (msg as any)?.function_call?.arguments) {
        const args = (msg as any).function_call.arguments;
        if (typeof args === 'string' && args.trim()) content = args.trim();
      }

      // 4) Responses API shape
      if (!content) {
        const ot = (data as any)?.output_text;
        if (Array.isArray(ot)) content = ot.join('\n');
        else if (typeof ot === 'string') content = ot;
      }

      // 5) Fallbacks
      if (!content && typeof (data as any)?.message === 'string') {
        content = (data as any).message;
      }

      const finish_reason = choice?.finish_reason;

      if (!content || content.trim() === '') {
        console.error('OpenAI response contained no textual content. Debug snapshot:', {
          finish_reason,
          usage: data?.usage,
          hasMessage: !!msg,
          hasToolCalls: Array.isArray((msg as any)?.tool_calls) ? (msg as any).tool_calls.length : 0,
          types: {
            messageContentType: typeof msg?.content,
            outputTextType: Array.isArray((data as any)?.output_text) ? 'array' : typeof (data as any)?.output_text,
          },
        });
      }

      return { content, usage: data.usage, finish_reason, modelUsed: mdl };
    } finally {
      clearTimeout(timer);
    }
  };

  // Try fast model first, then fallback if needed
  try {
    return await makeRequest(model, Math.min(maxTokens, 1200), 60_000);
  } catch (primaryErr) {
    console.warn('Primary model failed/timed out, retrying with nano fallback:', String(primaryErr));
    try {
      return await makeRequest('gpt-5-nano-2025-08-07', Math.min(maxTokens, 800), 45_000);
    } catch (nanoErr) {
      console.warn('Nano fallback also failed, retrying with 4o-mini (legacy param)...', String(nanoErr));
      try {
        return await makeRequest('gpt-4o-mini', Math.min(maxTokens, 700), 45_000);
      } catch (miniErr) {
        console.warn('4o-mini failed, retrying with gpt-4.1...', String(miniErr));
        return await makeRequest('gpt-4.1-2025-04-14', Math.min(maxTokens, 900), 75_000);
      }
    }
  }
}

// Helper: robust JSON parser with extraction + repair attempts
const safeParse = (text: string): any | null => {
  if (!text || typeof text !== 'string') return null;

  const tryParse = (t: string) => {
    try { return JSON.parse(t); } catch { return null; }
  };

  // 1) Direct parse
  let obj = tryParse(text);
  if (obj) return obj;

  // 2) Normalize/clean input
  let cleaned = text.trim();

  // Strip common code fences (single or multi)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  // Attempt parse again
  obj = tryParse(cleaned);
  if (obj) return obj;

  // Extract largest object slice
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliceObj = cleaned.slice(firstBrace, lastBrace + 1);
    obj = tryParse(sliceObj);
    if (obj) return obj;
  }

  // Extract largest array slice (in case the model returned an array)
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const sliceArr = cleaned.slice(firstBracket, lastBracket + 1);
    obj = tryParse(sliceArr);
    if (obj) return obj;
  }

  // Remove BOM if present
  cleaned = cleaned.replace(/^\uFEFF/, '');

  // Normalize smart quotes
  cleaned = cleaned.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // Remove JS-style comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '');

  // Remove trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  obj = tryParse(cleaned);
  if (obj) return obj;

  // 3) Attempt single-quoted JSON repair (cautious)
  const singleCount = (cleaned.match(/'/g) || []).length;
  const doubleCount = (cleaned.match(/\"/g) || []).length;
  if (doubleCount < singleCount) {
    const singleToDouble = cleaned
      // property names
      .replace(/'([^'\\]*(\\.[^'\\]*)*)'\s*:/g, '"$1":')
      // string values
      .replace(/:\s*'([^'\\]*(\\.[^'\\]*)*)'/g, ': "$1"');
    obj = tryParse(singleToDouble);
    if (obj) return obj;
  }

  // 4) Try parsing candidate top-level objects greedily
  const candidates: string[] = [];
  const stack: number[] = [];
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') stack.push(i);
    if ((ch === '}' || ch === ']') && stack.length) {
      const s = stack.pop()!;
      if (stack.length === 0) candidates.push(cleaned.slice(s, i + 1));
    }
  }
  for (const cand of candidates) {
    const fixed = cand.replace(/,(\s*[}\]])/g, '$1');
    obj = tryParse(fixed);
    if (obj) return obj;
  }

  // 5) Slice to last balanced position if any
  const sliceToLastBalanced = (t: string): string => {
    let resEnd = -1;
    let inStr = false;
    let esc = false;
    const st: number[] = [];
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{') st.push(1);
      else if (c === '[') st.push(2);
      else if (c === '}' || c === ']') {
        if (st.length && ((st[st.length - 1] === 1 && c === '}') || (st[st.length - 1] === 2 && c === ']'))) {
          st.pop();
          if (st.length === 0) resEnd = i;
        }
      }
    }
    return resEnd >= 0 ? t.slice(0, resEnd + 1) : t;
  };

  const lastBalanced = sliceToLastBalanced(cleaned);
  if (lastBalanced && lastBalanced !== cleaned) {
    obj = tryParse(lastBalanced);
    if (obj) return obj;
  }

  // 6) Balance unclosed braces/brackets by appending necessary closers
  const balanceAndClose = (t: string): string => {
    let inStr = false;
    let esc = false;
    const st: string[] = [];
    let out = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      out += c;
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{' || c === '[') st.push(c);
      else if (c === '}' || c === ']') {
        if (st.length && ((st[st.length - 1] === '{' && c === '}') || (st[st.length - 1] === '[' && c === ']'))) {
          st.pop();
        } else {
          // ignore unmatched closer
        }
      }
    }
    while (st.length) {
      const open = st.pop()!;
      out += open === '{' ? '}' : ']';
    }
    return out;
  };

  const balanced = balanceAndClose(cleaned);
  if (balanced && balanced !== cleaned) {
    obj = tryParse(balanced);
    if (obj) return obj;
  }

  return null;
};

// Helper function to format structured jump plan back to text for backward compatibility
function formatJumpPlanToText(plan: any): string {
  let text = '';
  
  if (plan.title) {
    text += `# ${plan.title}\n\n`;
  }
  
  if (plan.executive_summary) {
    text += `## Executive Summary\n\n${plan.executive_summary}\n\n`;
  }
  
  if (plan.current_state_analysis) {
    text += `## Current State Analysis\n\n${plan.current_state_analysis}\n\n`;
  }
  
  if (plan.transformation_goal) {
    text += `## Transformation Goal\n\n${plan.transformation_goal}\n\n`;
  }
  
  if (plan.phases && Array.isArray(plan.phases)) {
    text += `## The Jump Plan\n\n`;
    plan.phases.forEach((phase: any, index: number) => {
      text += `### Phase ${phase.phase_number || index + 1}: ${phase.title}\n\n`;
      if (phase.description) text += `${phase.description}\n\n`;
      if (phase.timeline) text += `**Timeline:** ${phase.timeline}\n\n`;
      
      if (phase.key_actions && Array.isArray(phase.key_actions)) {
        text += `**Key Actions:**\n`;
        phase.key_actions.forEach((action: string) => {
          text += `- ${action}\n`;
        });
        text += '\n';
      }
      
      if (phase.deliverables && Array.isArray(phase.deliverables)) {
        text += `**Deliverables:**\n`;
        phase.deliverables.forEach((deliverable: string) => {
          text += `- ${deliverable}\n`;
        });
        text += '\n';
      }
      
      if (phase.success_criteria && Array.isArray(phase.success_criteria)) {
        text += `**Success Criteria:**\n`;
        phase.success_criteria.forEach((criteria: string) => {
          text += `- ${criteria}\n`;
        });
        text += '\n';
      }
    });
  }
  
  if (plan.recommended_tools && Array.isArray(plan.recommended_tools)) {
    text += `## Recommended Tools & Resources\n\n`;
    plan.recommended_tools.forEach((tool: string) => {
      text += `- ${tool}\n`;
    });
    text += '\n';
  }
  
  if (plan.success_metrics && Array.isArray(plan.success_metrics)) {
    text += `## Success Metrics\n\n`;
    plan.success_metrics.forEach((metric: string) => {
      text += `- ${metric}\n`;
    });
    text += '\n';
  }
  
  if (plan.potential_challenges && Array.isArray(plan.potential_challenges)) {
    text += `## Potential Challenges & Solutions\n\n`;
    plan.potential_challenges.forEach((challenge: string, index: number) => {
      text += `**Challenge:** ${challenge}\n`;
      if (plan.mitigation_strategies && plan.mitigation_strategies[index]) {
        text += `**Solution:** ${plan.mitigation_strategies[index]}\n\n`;
      } else {
        text += '\n';
      }
    });
  }
  
  if (plan.next_immediate_steps && Array.isArray(plan.next_immediate_steps)) {
    text += `## Next Immediate Steps\n\n`;
    plan.next_immediate_steps.forEach((step: string, index: number) => {
      text += `${index + 1}. ${step}\n`;
    });
    text += '\n';
  }
  
  if (plan.estimated_timeline) {
    text += `## Timeline\n\n${plan.estimated_timeline}\n\n`;
  }
  
  if (plan.investment_required) {
    text += `## Investment Required\n\n${plan.investment_required}\n\n`;
  }
  
  return text.trim();
}

async function generateComponents(userProfile: any): Promise<GeneratedComponents> {
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
    ], 800, true, 'gpt-5-mini-2025-08-07');

    let obj = safeParse(res.content);
    if (!obj) {
      console.warn(`[gen:${key}] parse failed (attempt 1). First 400 chars:`, res.content?.slice(0, 400));
    }

    // Repair attempt
    if (!obj || (!Array.isArray((obj as any)[key]))) {
      const repair = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON in this exact format with the "${key}" array containing exactly 4 items. No other text.` },
      ], 800, true, 'gpt-5-mini-2025-08-07');
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
      ], 800, true, 'gpt-5-mini-2025-08-07');
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

    // Streamlined system prompt for faster generation
    const systemPrompt = [
      "You are an AI transformation strategist. Create a comprehensive 'Jump' plan as JSON.",
      "",
      "User Context:",
      `Role: ${userProfile?.currentRole || 'Professional'} | Industry: ${userProfile?.industry || 'General'}`,
      `Goals: ${userProfile?.goals || 'AI Integration'} | Experience: ${userProfile?.experienceLevel || 'Beginner'}`,
      `Time: ${userProfile?.timeCommitment || 'Flexible'} | Budget: ${userProfile?.budget || 'Moderate'}`,
      "",
      "Return ONLY valid JSON with this structure (3 phases required):",
      JSON.stringify({
        "title": "AI Transformation Plan",
        "executive_summary": "Strategic roadmap for AI integration and business transformation",
        "overview": {
          "vision_statement": "Transform operations through strategic AI adoption",
          "transformation_scope": "Comprehensive AI integration across key business functions",
          "expected_outcomes": ["Increased efficiency", "Enhanced decision-making", "Competitive advantage"],
          "timeline_overview": "3-phase implementation over 4-6 months"
        },
        "analysis": {
          "current_state": {
            "strengths": ["Existing expertise", "Available resources"],
            "weaknesses": ["Limited AI experience", "Change management needs"],
            "opportunities": ["AI automation", "Data-driven insights"],
            "threats": ["Competitor adoption", "Technology gaps"]
          },
          "gap_analysis": ["Technical skills", "Process optimization", "Tool integration"],
          "readiness_assessment": {
            "score": 7,
            "factors": [
              {"factor": "Technical Readiness", "level": "Medium", "description": "Foundation exists"},
              {"factor": "Resource Availability", "level": "High", "description": "Resources committed"}
            ]
          },
          "market_context": "Rapid AI adoption creates opportunities and competitive pressure"
        },
        "action_plan": {
          "phases": [
            {
              "phase_number": 1,
              "title": "Foundation Phase",
              "description": "Establish AI foundation and initial tools",
              "duration": "4-6 weeks",
              "objectives": ["Setup core tools", "Build initial capabilities"],
              "key_actions": [{"action": "Deploy ChatGPT", "description": "Implement for content creation", "priority": "High", "effort_level": "Low", "dependencies": []}],
              "milestones": [{"milestone": "Core tools active", "target_date": "Week 4", "success_criteria": ["Tools deployed", "Team trained"]}],
              "deliverables": ["AI tool setup", "Initial workflows"],
              "risks": [{"risk": "Adoption resistance", "impact": "Medium", "probability": "Low", "mitigation": "Change management"}]
            },
            {
              "phase_number": 2,
              "title": "Implementation Phase", 
              "description": "Scale AI tools across operations",
              "duration": "6-8 weeks",
              "objectives": ["Integrate advanced tools", "Optimize processes"],
              "key_actions": [{"action": "Deploy automation", "description": "Implement workflow automation", "priority": "High", "effort_level": "Medium", "dependencies": ["Foundation complete"]}],
              "milestones": [{"milestone": "Full deployment", "target_date": "Week 6", "success_criteria": ["All tools active", "Processes optimized"]}],
              "deliverables": ["Automated workflows", "Performance metrics"],
              "risks": [{"risk": "Integration issues", "impact": "Medium", "probability": "Medium", "mitigation": "Phased rollout"}]
            },
            {
              "phase_number": 3,
              "title": "Optimization Phase",
              "description": "Fine-tune and scale successful implementations", 
              "duration": "4-6 weeks",
              "objectives": ["Optimize performance", "Scale operations"],
              "key_actions": [{"action": "Performance tuning", "description": "Optimize all systems", "priority": "Medium", "effort_level": "Medium", "dependencies": ["Implementation complete"]}],
              "milestones": [{"milestone": "Optimization complete", "target_date": "Week 4", "success_criteria": ["Targets met", "ROI achieved"]}],
              "deliverables": ["Optimized systems", "Scale playbook"],
              "risks": [{"risk": "Performance issues", "impact": "Low", "probability": "Low", "mitigation": "Monitoring"}]
            }
          ]
        },
        "tools_prompts": {
          "recommended_ai_tools": [{"tool": "ChatGPT", "category": "Content", "use_case": "Content creation", "learning_curve": "Low", "cost_estimate": "$20/month", "integration_priority": "High"}],
          "custom_prompts": [{"title": "Strategy Prompt", "purpose": "Strategic planning", "prompt": "Act as strategist...", "ai_tool": "ChatGPT", "expected_output": "Strategic plan"}],
          "templates": [{"name": "Planning Template", "type": "Strategy", "description": "Strategic planning template", "use_case": "Business strategy"}]
        },
        "workflows_strategies": {
          "workflows": [{"title": "Content Creation", "description": "AI-powered content workflow", "trigger": "Daily", "steps": [{"step": "Ideation", "description": "Generate ideas", "tools_used": ["ChatGPT"], "estimated_time": "15 min"}], "automation_level": "Semi-automated", "frequency": "Daily"}],
          "strategies": [{"strategy": "Gradual Integration", "description": "Phased AI adoption", "success_factors": ["Start simple"], "implementation_tips": ["Begin with content"], "monitoring_approach": "Weekly reviews"}]
        },
        "metrics_tracking": {
          "kpis": [{"metric": "Adoption Rate", "description": "Tool adoption percentage", "target": "80% in 90 days", "measurement_frequency": "Weekly", "data_source": "Usage analytics"}],
          "tracking_methods": [{"method": "Dashboard", "tools": ["Analytics"], "setup_complexity": "Medium", "cost": "$50/month"}],
          "reporting_schedule": {"daily": ["Usage metrics"], "weekly": ["Progress review"], "monthly": ["ROI analysis"], "quarterly": ["Strategic review"]},
          "success_criteria": [{"timeframe": "30 days", "criteria": ["Tools deployed", "Training complete"]}]
        },
        "investment": {
          "time_investment": {"total_hours": "100-120 hours", "weekly_commitment": "5-8 hours", "phase_breakdown": [{"phase": "Foundation", "hours": "30-40 hours"}]},
          "financial_investment": {"total_budget": "$1,500-3,000", "categories": [{"category": "AI Subscriptions", "amount": "$500-1,000", "description": "Tool subscriptions"}]},
          "roi_projection": {"timeframe": "6 months", "expected_roi": "200-400%", "break_even_point": "4 months"}
        }
      }, null, 2)
    ].join('\n');

    // Get recent messages (last 6 to avoid token limits)
    const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];
    
    // Generate structured jump plan
    let content = '';
    let jumpPlan: any = null;
    let usage: any = undefined;
    let finish_reason: any = undefined;
    let modelUsed: string | undefined = undefined;
    
    if (!shouldGenerateComponents) {
      const systemJSON = 'Return ONLY a single valid JSON object with the requested structure. No markdown, no code fences, no commentary.';
      
      let rawContent = '';
      const res1 = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: systemPrompt },
        ...recentMessages
      ], 1000, true, 'gpt-5-mini-2025-08-07');
      
      usage = res1.usage;
      finish_reason = res1.finish_reason;
      rawContent = res1.content;
      modelUsed = res1.modelUsed;
      
      jumpPlan = safeParse(res1.content);
      
      // Enhanced debugging for parsing failures
      if (!jumpPlan) {
        console.warn('[jump-plan] parse failed (attempt 1). Response length:', res1.content?.length);
        console.warn('[jump-plan] First 200 chars:', res1.content?.slice(0, 200));
        console.warn('[jump-plan] Last 200 chars:', res1.content?.slice(-200));
        
        // Try to identify the issue
        if (res1.content?.includes('```json')) {
          console.warn('[jump-plan] Content appears to have markdown code fences');
        }
        if (res1.content?.includes("'")) {
          console.warn('[jump-plan] Content contains single quotes that may need conversion');
        }
        
        const repair = await callOpenAI([
          { role: 'system', content: systemJSON },
          { role: 'user', content: `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON in the exact format specified. No other text. Create exactly 3 phases in the phases array.` },
          ...recentMessages
        ], 1000, true, 'gpt-5-mini-2025-08-07');
        
        rawContent = repair.content || rawContent;
        jumpPlan = safeParse(repair.content);
        modelUsed = repair.modelUsed;
        if (!jumpPlan) {
          console.warn('[jump-plan] parse failed (attempt 2). Response length:', repair.content?.length);
          console.warn('[jump-plan] First 200 chars:', repair.content?.slice(0, 200));
          console.warn('[jump-plan] Last 200 chars:', repair.content?.slice(-200));
          
          // Log the entire failed content for debugging (truncated)
          console.warn('[jump-plan] Full failed content (first 1000 chars):', repair.content?.slice(0, 1000));
        } else {
          console.log('[jump-plan] Successfully parsed on attempt 2');
        }
      } else {
        console.log('[jump-plan] Successfully parsed on attempt 1');
      }
      // Removed stray brace to keep content generation inside this block

      // Convert structured plan back to formatted text for backward compatibility
      if (jumpPlan) {
        // Check if this is a comprehensive structure
        const isComprehensive = jumpPlan.overview && jumpPlan.analysis && jumpPlan.action_plan;
        if (isComprehensive) {
          // For comprehensive plans, create a simple title + summary text for backward compatibility
          // The actual structured display will use the jumpPlan object
          content = `# ${jumpPlan.title || 'Your AI-Generated Jump Plan'}\n\n${jumpPlan.executive_summary || 'Your personalized transformation roadmap has been generated.'}`;
        } else {
          // For simpler plans, convert to full text format
          content = formatJumpPlanToText(jumpPlan);
        }
      } else {
        content = rawContent?.trim() ? rawContent : "Sorry, I couldn't complete the plan this time. Please try again in a moment.";
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
      structured_plan: jumpPlan, // Include structured data for enhanced display
      usage,
      debug: { finish_reason, model: modelUsed || 'unknown' },
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