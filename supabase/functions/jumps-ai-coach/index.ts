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
  model = 'gpt-4.1-2025-04-14'
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
    return await makeRequest(model, Math.min(maxTokens, 800), 60_000);
  } catch (primaryErr) {
    console.warn('Primary model failed/timed out, retrying with 4o-mini fallback:', String(primaryErr));
    try {
      return await makeRequest('gpt-4o-mini', Math.min(maxTokens, 600), 45_000);
    } catch (miniErr) {
      console.warn('4o-mini failed, retrying with gpt-4.1 (reduced tokens)...', String(miniErr));
      return await makeRequest('gpt-4.1-2025-04-14', Math.min(maxTokens, 600), 75_000);
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

  // Extract an array by top-level key directly from raw text, even if wrapped with extra text
  const extractArrayByKey = (text: string, key: Key, altKeys: string[] = []): any[] => {
    if (!text || typeof text !== 'string') return [];
    const keys = [key, ...altKeys];
    for (const k of keys) {
      const idx = text.indexOf(`"${k}"`);
      if (idx === -1) continue;
      const startArr = text.indexOf('[', idx);
      if (startArr === -1) continue;
      let depth = 0;
      let endArr = -1;
      let inStr = false;
      let esc = false;
      for (let i = startArr; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '[') depth++;
        if (ch === ']') {
          depth--;
          if (depth === 0) { endArr = i; break; }
        }
      }
      if (endArr > startArr) {
        const slice = text.slice(startArr, endArr + 1);
        const parsed = safeParse(slice);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    return [];
  };

  // Normalize items to match our DB schemas per key
  const normalizeItems = (key: Key, arr: any[]): any[] => {
    const toArray = (v: any) => Array.isArray(v) ? v : (v ? [v] : []);
    return (arr || []).map((item: any) => {
      const it = typeof item === 'object' && item !== null ? { ...item } : { title: String(item || '') };
      if (key === 'prompts') {
        it.prompt_text = it.prompt_text || it.prompt || it.text || '';
        it.ai_tools = toArray(it.ai_tools);
        it.use_cases = toArray(it.use_cases);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
      }
      if (key === 'workflows') {
        const steps = it.workflow_steps || it.steps || it.workflow || it.tasks || [];
        it.workflow_steps = Array.isArray(steps) ? steps : toArray(steps);
        it.workflow_steps = it.workflow_steps.map((s: any, idx: number) => {
          if (typeof s === 'string') return { step: idx + 1, title: s, description: s };
          const so = typeof s === 'object' && s !== null ? s : {};
          return {
            step: so.step ?? idx + 1,
            title: so.title || so.name || `Step ${idx + 1}`,
            description: so.description || so.details || '',
            tools: toArray(so.tools || so.ai_tools || []),
            estimated_time: so.estimated_time || so.duration || ''
          };
        });
        it.ai_tools = toArray(it.ai_tools);
        it.prerequisites = toArray(it.prerequisites);
        it.expected_outcomes = toArray(it.expected_outcomes);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
        it.complexity_level = it.complexity_level || 'beginner';
      }
      if (key === 'blueprints') {
        if (!it.blueprint_content || typeof it.blueprint_content !== 'object') {
          it.blueprint_content = {
            overview: it.overview || '',
            components: toArray(it.components || it.modules || []),
            structure: it.structure || '',
            implementation: it.implementation || it.instructions || ''
          };
        }
        it.ai_tools = toArray(it.ai_tools);
        it.resources_needed = toArray(it.resources_needed);
        it.deliverables = toArray(it.deliverables);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
        it.difficulty_level = it.difficulty_level || 'beginner';
      }
      if (key === 'strategies') {
        if (!it.strategy_framework || typeof it.strategy_framework !== 'object') {
          it.strategy_framework = {
            overview: it.overview || '',
            phases: toArray(it.phases || []),
            objectives: toArray(it.objectives || []),
            approach: it.approach || ''
          };
        }
        it.ai_tools = toArray(it.ai_tools);
        it.success_metrics = toArray(it.success_metrics);
        it.key_actions = toArray(it.key_actions);
        it.potential_challenges = toArray(it.potential_challenges);
        it.mitigation_strategies = toArray(it.mitigation_strategies);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
      }
      return it;
    }).filter((it: any) => !!it && typeof it.title === 'string' && it.title.trim().length > 0);
  };

  const buildPromptFor = (key: Key) => {
    const base = `Generate exactly 4 high-quality ${key} based on this user profile.\nReturn ONLY valid JSON with a single top-level object containing the \"${key}\" array (length=4). No markdown, no fences, no commentary.\nUser: ${userProfile.currentRole} in ${userProfile.industry}\nGoals: ${userProfile.goals}\nAI Knowledge: ${userProfile.aiKnowledge}`;

    const schemas: Record<Key, string> = {
      prompts: `{"prompts":[{"title":"","description":"","prompt_text":"","category":"productivity","ai_tools":["ChatGPT"],"use_cases":[""],"instructions":"","tags":[""]}]}`,
      workflows: `{"workflows":[{"title":"","description":"","workflow_steps":[{"step":1,"title":"","description":"","tools":[],"estimated_time":""}],"category":"productivity","ai_tools":[],"duration_estimate":"","complexity_level":"beginner","prerequisites":[],"expected_outcomes":[],"instructions":"","tags":[]}]}`,
      blueprints: `{"blueprints":[{"title":"","description":"","blueprint_content":{"overview":"","components":[],"structure":"","implementation":""},"category":"productivity","ai_tools":[],"implementation_time":"","difficulty_level":"beginner","resources_needed":[],"deliverables":[],"instructions":"","tags":[]}]}`,
      strategies: `{"strategies":[{"title":"","description":"","strategy_framework":{"overview":"","phases":[],"objectives":[],"approach":""},"category":"productivity","ai_tools":[],"timeline":"","success_metrics":[],"key_actions":[],"potential_challenges":[],"mitigation_strategies":[],"instructions":"","tags":[]}]}`
    };

    return `${base}\nUse this JSON shape (single object, array length 4):\n${schemas[key]}`;
  };

  const generateForKey = async (key: Key) => {
    const prompt = buildPromptFor(key);
    const systemJSON = 'Return ONLY a single valid JSON object with the requested top-level key. No markdown, no code fences, no commentary.';

    const res = await callOpenAI([
      { role: 'system', content: systemJSON },
      { role: 'user', content: prompt },
    ], 700, true, 'gpt-4.1-2025-04-14');

    const altKeysMap: Record<Key, string[]> = {
      prompts: ['prompt', 'prompts_list'],
      workflows: ['workflow', 'processes', 'pipeline', 'workflows_list'],
      blueprints: ['blueprint', 'templates', 'blueprints_list'],
      strategies: ['strategy', 'plan', 'roadmaps', 'strategies_list'],
    };

    let obj = safeParse(res.content);
    if (!obj) {
      console.warn(`[gen:${key}] parse failed (attempt 1). First 400 chars:`, res.content?.slice(0, 400));
    }

    let arr: any[] = [];
    if (!obj) {
      arr = extractArrayByKey(res.content, key, altKeysMap[key]);
      if (arr.length) console.warn(`[gen:${key}] recovered array via raw extraction on attempt 1.`);
    }

    if ((!arr || arr.length === 0) && obj && typeof obj === 'object') {
      const keysToCheck = [key, ...altKeysMap[key]];
      for (const k of keysToCheck) {
        if (Array.isArray((obj as any)[k])) { arr = (obj as any)[k]; break; }
      }
    }

    if (!arr || arr.length === 0) {
      const repair = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON in this exact format with the "${key}" array containing exactly 4 items. No other text.` },
      ], 700, true, 'gpt-4.1-2025-04-14');
      obj = safeParse(repair.content);
      if (!obj) {
        console.warn(`[gen:${key}] parse failed (attempt 2). First 400 chars:`, repair.content?.slice(0, 400));
        arr = extractArrayByKey(repair.content, key, altKeysMap[key]);
        if (arr.length) console.warn(`[gen:${key}] recovered array via raw extraction on attempt 2.`);
      }
      if ((!arr || arr.length === 0) && obj && typeof obj === 'object') {
        const keysToCheck = [key, ...altKeysMap[key]];
        for (const k of keysToCheck) {
          if (Array.isArray((obj as any)[k])) { arr = (obj as any)[k]; break; }
        }
      }
    }

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
      ], 700, true, 'gpt-4.1-2025-04-14');
      const compactObj = safeParse(compact.content);
      if (compactObj && Array.isArray(compactObj[key])) {
        arr = compactObj[key];
      } else {
        arr = extractArrayByKey(compact.content, key, altKeysMap[key]);
        if (!arr || arr.length === 0) {
          console.warn(`[gen:${key}] compact attempt also failed. First 400 chars:`, compact.content?.slice(0, 400));
          arr = [];
        }
      }
    }

    arr = normalizeItems(key, arr).slice(0, 4);

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
      "You are an AI transformation strategist. Create a comprehensive 'Jump' plan.",
      `User Context: Role=${userProfile?.currentRole || 'Professional'} | Industry=${userProfile?.industry || 'General'} | Goals=${userProfile?.goals || 'AI Integration'} | Experience=${userProfile?.experienceLevel || 'Beginner'} | Time=${userProfile?.timeCommitment || 'Flexible'} | Budget=${userProfile?.budget || 'Moderate'}`,
      "Return ONLY valid JSON matching this schema (exact keys, exactly 3 phases):",
      JSON.stringify({
        title: "AI Transformation Plan",
        executive_summary: "",
        overview: {
          vision_statement: "",
          transformation_scope: "",
          expected_outcomes: [],
          timeline_overview: ""
        },
        analysis: {
          current_state: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          },
          gap_analysis: [],
          readiness_assessment: { score: 0, factors: [] },
          market_context: ""
        },
        action_plan: {
          phases: [
            { phase_number: 1, title: "", description: "", duration: "", objectives: [], key_actions: [], milestones: [], deliverables: [], risks: [] },
            { phase_number: 2, title: "", description: "", duration: "", objectives: [], key_actions: [], milestones: [], deliverables: [], risks: [] },
            { phase_number: 3, title: "", description: "", duration: "", objectives: [], key_actions: [], milestones: [], deliverables: [], risks: [] }
          ]
        },
        tools_prompts: { recommended_ai_tools: [], custom_prompts: [], templates: [] },
        workflows_strategies: { workflows: [], strategies: [] },
        metrics_tracking: { kpis: [], tracking_methods: [], reporting_schedule: {}, success_criteria: [] },
        investment: { time_investment: {}, financial_investment: {}, roi_projection: {} }
      }, null, 0)
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
      ], 800, true, 'gpt-4.1-2025-04-14');
      
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
        ], 800, true, 'gpt-4.1-2025-04-14');
        
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