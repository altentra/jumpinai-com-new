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
            // New: handle JSON/content parts from newer APIs
            if (part?.type === 'output_json' && part?.json) {
              try { return JSON.stringify(part.json); } catch { return ''; }
            }
            if (part?.type === 'json' && part?.json) {
              try { return JSON.stringify(part.json); } catch { return ''; }
            }
            if (Array.isArray(part?.content)) return part.content.map((p: any) => p?.text || p?.content || '').join('');
            return '';
          })
          .filter(Boolean)
          .join('\n')
          .trim();
      } else if (msg?.content && typeof msg.content === 'object') {
        // New: some SDKs put JSON result directly in content.json
        const maybeJson = (msg as any).content?.json;
        if (maybeJson) {
          try { content = JSON.stringify(maybeJson); } catch { /* ignore */ }
        }
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
    // Pre-clean: strip code fences, normalize smart quotes, remove BOM
    let cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .replace(/^\uFEFF/, '')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    // Try parsing whole cleaned text first
    const parsedWhole = safeParse(cleaned);
    const keys = [key, ...altKeys];
    if (parsedWhole && typeof parsedWhole === 'object') {
      for (const k of keys) {
        const arr = (parsedWhole as any)[k];
        if (Array.isArray(arr)) return arr;
      }
    }

    // Robust extraction: locate the first '[' after the key and do manual bracket matching
    const quoteGroup = `[\"\u201C\u201D]`;
    for (const k of keys) {
      const keyIdx = cleaned.search(new RegExp(`${quoteGroup}${k}${quoteGroup}`, 'i'));
      if (keyIdx === -1) continue;
      const startArr = cleaned.indexOf('[', keyIdx);
      if (startArr === -1) continue;
      let depth = 0, endArr = -1, inStr = false, esc = false;
      for (let i = startArr; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '[') depth++;
        if (ch === ']') { depth--; if (depth === 0) { endArr = i; break; } }
      }
      if (endArr > startArr) {
        const slice = cleaned.slice(startArr, endArr + 1);
        const arr = safeParse(slice);
        if (Array.isArray(arr)) return arr;
      }
    }

    // As a last resort, try a tolerant regex-based extraction
    for (const k of keys) {
      const re = new RegExp(`${quoteGroup}${k}${quoteGroup}\\s*:\\s*(\\[([\\s\\S]*?)\\])`, 'i');
      const m = cleaned.match(re);
      if (m && m[1]) {
        const slice = m[1];
        const arr = safeParse(slice);
        if (Array.isArray(arr)) return arr;
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
        // Ensure workflow_steps is properly structured
        const steps = it.workflow_steps || it.steps || it.workflow || it.tasks || [];
        it.workflow_steps = Array.isArray(steps) ? steps : toArray(steps);
        if (it.workflow_steps.length === 0) {
          // Create at least one default step
          it.workflow_steps = [{
            step: 1,
            title: it.title || 'Initial Step',
            description: it.description || 'Start implementing this workflow',
            tools: toArray(it.ai_tools || ['ChatGPT']),
            estimated_time: '30 minutes'
          }];
        } else {
          it.workflow_steps = it.workflow_steps.map((s: any, idx: number) => {
            if (typeof s === 'string') return { step: idx + 1, title: s, description: s, tools: [], estimated_time: '15 minutes' };
            const so = typeof s === 'object' && s !== null ? s : {};
            return {
              step: so.step ?? idx + 1,
              title: so.title || so.name || `Step ${idx + 1}`,
              description: so.description || so.details || 'Complete this step',
              tools: toArray(so.tools || so.ai_tools || []),
              estimated_time: so.estimated_time || so.duration || '15 minutes'
            };
          });
        }
        it.ai_tools = toArray(it.ai_tools);
        it.prerequisites = toArray(it.prerequisites);
        it.expected_outcomes = toArray(it.expected_outcomes);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
        it.complexity_level = it.complexity_level || 'beginner';
        it.duration_estimate = it.duration_estimate || '1-2 hours';
        it.tools_needed = toArray(it.tools_needed || it.ai_tools || []);
        it.skill_level = it.skill_level || 'beginner';
      }
      if (key === 'blueprints') {
        if (!it.blueprint_content || typeof it.blueprint_content !== 'object') {
          it.blueprint_content = {
            overview: it.overview || it.description || 'Blueprint overview',
            components: toArray(it.components || it.modules || ['Core component']),
            structure: it.structure || 'Blueprint structure and organization',
            implementation: it.implementation || it.instructions || 'Implementation guidance'
          };
        }
        // Ensure blueprint_content has required structure
        if (!it.blueprint_content.overview) it.blueprint_content.overview = it.description || 'Blueprint overview';
        if (!Array.isArray(it.blueprint_content.components)) it.blueprint_content.components = ['Core component'];
        if (!it.blueprint_content.implementation) it.blueprint_content.implementation = it.instructions || 'Follow the blueprint steps';
        
        it.ai_tools = toArray(it.ai_tools);
        it.resources_needed = toArray(it.resources_needed);
        it.deliverables = toArray(it.deliverables);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
        it.difficulty_level = it.difficulty_level || 'beginner';
        it.implementation_time = it.implementation_time || '1-2 weeks';
        it.implementation = it.implementation || it.instructions || '';
        it.requirements = toArray(it.requirements || it.prerequisites || []);
        it.tools_used = toArray(it.tools_used || it.ai_tools || []);
      }
      if (key === 'strategies') {
        if (!it.strategy_framework || typeof it.strategy_framework !== 'object') {
          it.strategy_framework = {
            overview: it.overview || it.description || 'Strategic approach and methodology',
            phases: toArray(it.phases || ['Planning', 'Execution', 'Review']),
            objectives: toArray(it.objectives || ['Primary objective']),
            approach: it.approach || it.description || 'Strategic implementation approach'
          };
        }
        // Ensure strategy_framework has required structure
        if (!it.strategy_framework.overview) it.strategy_framework.overview = it.description || 'Strategic overview';
        if (!Array.isArray(it.strategy_framework.phases)) it.strategy_framework.phases = ['Planning', 'Execution'];
        if (!Array.isArray(it.strategy_framework.objectives)) it.strategy_framework.objectives = ['Primary objective'];
        if (!it.strategy_framework.approach) it.strategy_framework.approach = 'Systematic approach';
        
        it.ai_tools = toArray(it.ai_tools);
        it.success_metrics = toArray(it.success_metrics);
        it.key_actions = toArray(it.key_actions);
        it.potential_challenges = toArray(it.potential_challenges);
        it.mitigation_strategies = toArray(it.mitigation_strategies);
        it.tags = toArray(it.tags);
        it.category = it.category || 'productivity';
        it.timeline = it.timeline || '3-6 months';
        it.priority_level = it.priority_level || 'medium';
        it.resource_requirements = toArray(it.resource_requirements || it.resources_needed || []);
      }
      return it;
    }).filter((it: any) => !!it && typeof it.title === 'string' && it.title.trim().length > 0);
  };

  const buildPromptFor = (key: Key) => {
    const base = `Generate exactly 4 high-quality, detailed ${key} based on this user profile.
Return ONLY valid JSON with a single top-level object containing the "${key}" array (length=4). 
Make each item comprehensive and actionable.
No markdown, no fences, no commentary.

User Profile:
- Role: ${userProfile.currentRole} in ${userProfile.industry}
- Experience: ${userProfile.experienceLevel}
- Goals: ${userProfile.goals}
- AI Knowledge: ${userProfile.aiKnowledge}
- Time: ${userProfile.timeCommitment}
- Budget: ${userProfile.budget}`;

    const schemas: Record<Key, string> = {
      prompts: `{"prompts":[{"title":"Specific prompt title","description":"What this prompt accomplishes","prompt_text":"Detailed prompt text ready to use","category":"productivity","ai_tools":["ChatGPT","Claude"],"use_cases":["specific use case 1","use case 2"],"instructions":"How to use this prompt effectively","tags":["relevant","tags"],"difficulty":"beginner","estimated_time":"5-10 minutes"}]}`,
      workflows: `{"workflows":[{"title":"Complete workflow name","description":"What this workflow achieves","workflow_steps":[{"step":1,"title":"Step name","description":"Detailed step description","tools":["required tool"],"estimated_time":"10 minutes"}],"category":"productivity","ai_tools":["specific AI tools"],"duration_estimate":"2-4 hours","complexity_level":"beginner","prerequisites":["requirement"],"expected_outcomes":["outcome 1","outcome 2"],"instructions":"Implementation guidance","tags":["workflow","automation"],"tools_needed":["tool"],"skill_level":"beginner"}]}`,
      blueprints: `{"blueprints":[{"title":"Comprehensive blueprint name","description":"What this blueprint creates","blueprint_content":{"overview":"Detailed overview","components":["component 1","component 2"],"structure":"Implementation structure","implementation":"Step-by-step implementation"},"category":"productivity","ai_tools":["specific tools"],"implementation_time":"1-2 weeks","difficulty_level":"beginner","resources_needed":["resource 1"],"deliverables":["deliverable 1","deliverable 2"],"instructions":"Complete implementation guide","tags":["blueprint","framework"],"implementation":"Detailed implementation steps","requirements":["requirement"],"tools_used":["tool"]}]}`,
      strategies: `{"strategies":[{"title":"Strategic plan name","description":"Strategic objective and approach","strategy_framework":{"overview":"Strategy overview","phases":["phase 1","phase 2"],"objectives":["objective 1"],"approach":"Implementation approach"},"category":"productivity","ai_tools":["strategic tools"],"timeline":"3-6 months","success_metrics":["metric 1","metric 2"],"key_actions":["action 1","action 2"],"potential_challenges":["challenge 1"],"mitigation_strategies":["solution 1"],"instructions":"Strategic implementation guide","tags":["strategy","planning"],"priority_level":"high","resource_requirements":["resource"]}]}`
    };

    return `${base}\n\nUse this JSON structure (ensure array has exactly 4 detailed items):\n${schemas[key]}`;
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

    arr = normalizeItems(key, arr);

    // Ensure exactly 4 items by topping up if needed
    if (arr.length < 4) {
      const missing = 4 - arr.length;
      const existingTitles = new Set(arr.map((i: any) => (i.title || '').toLowerCase()));
      const fillPrompt = `Generate exactly ${missing} additional unique ${key} that complement the previous ones. Titles must be distinct from this list: ${[...existingTitles].join(', ')}.\nReturn ONLY valid JSON with a single object containing the "${key}" array (length=${missing}).`;
      const systemJSON = 'Return ONLY a single valid JSON object with the requested top-level key. No markdown, no code fences, no commentary.';
      try {
        const fillRes = await callOpenAI([
          { role: 'system', content: systemJSON },
          { role: 'user', content: fillPrompt },
        ], 500, true, 'gpt-4.1-2025-04-14');
        let fillObj = safeParse(fillRes.content);
        let fillArr: any[] = [];
        if (fillObj && Array.isArray(fillObj[key])) {
          fillArr = fillObj[key];
        } else {
          fillArr = extractArrayByKey(fillRes.content, key, altKeysMap[key]);
        }
        const normalizedFill = normalizeItems(key, fillArr);
        for (const item of normalizedFill) {
          const t = (item.title || '').toLowerCase();
          if (!existingTitles.has(t) && arr.length < 4) {
            arr.push(item);
            existingTitles.add(t);
          }
        }
      } catch (e) {
        console.warn(`[gen:${key}] top-up generation failed:`, e);
      }
    }

    if (arr.length > 4) arr = arr.slice(0, 4);

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
  // Sanitize payloads to match exact database schema
  const sanitizePrompt = (p: any) => {
    console.log('Sanitizing prompt:', p.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: p.title ?? '',
      description: p.description ?? null,
      prompt_text: p.prompt_text ?? '',
      category: p.category ?? null,
      ai_tools: Array.isArray(p.ai_tools) ? p.ai_tools : (p.ai_tools ? [p.ai_tools] : []),
      use_cases: Array.isArray(p.use_cases) ? p.use_cases : (p.use_cases ? [p.use_cases] : []),
      instructions: p.instructions ?? null,
      tags: Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []),
      difficulty: p.difficulty ?? null,
      estimated_time: p.estimated_time ?? null
    };
  };

  const sanitizeWorkflow = (w: any) => {
    console.log('Sanitizing workflow:', w.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: w.title ?? '',
      description: w.description ?? null,
      workflow_steps: Array.isArray(w.workflow_steps) ? w.workflow_steps : [],
      category: w.category ?? null,
      ai_tools: Array.isArray(w.ai_tools) ? w.ai_tools : (w.ai_tools ? [w.ai_tools] : []),
      duration_estimate: w.duration_estimate ?? null,
      complexity_level: w.complexity_level ?? null,
      prerequisites: Array.isArray(w.prerequisites) ? w.prerequisites : [],
      expected_outcomes: Array.isArray(w.expected_outcomes) ? w.expected_outcomes : [],
      instructions: w.instructions ?? null,
      tags: Array.isArray(w.tags) ? w.tags : (w.tags ? [w.tags] : []),
      tools_needed: Array.isArray(w.tools_needed) ? w.tools_needed : [],
      skill_level: w.skill_level ?? null
    };
  };

  const sanitizeBlueprint = (b: any) => {
    console.log('Sanitizing blueprint:', b.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: b.title ?? '',
      description: b.description ?? null,
      blueprint_content: typeof b.blueprint_content === 'object' && b.blueprint_content !== null ? b.blueprint_content : {},
      category: b.category ?? null,
      ai_tools: Array.isArray(b.ai_tools) ? b.ai_tools : (b.ai_tools ? [b.ai_tools] : []),
      implementation_time: b.implementation_time ?? null,
      difficulty_level: b.difficulty_level ?? null,
      resources_needed: Array.isArray(b.resources_needed) ? b.resources_needed : [],
      deliverables: Array.isArray(b.deliverables) ? b.deliverables : [],
      instructions: b.instructions ?? null,
      tags: Array.isArray(b.tags) ? b.tags : (b.tags ? [b.tags] : []),
      implementation: b.implementation ?? null,
      requirements: Array.isArray(b.requirements) ? b.requirements : [],
      tools_used: Array.isArray(b.tools_used) ? b.tools_used : []
    };
  };

  const sanitizeStrategy = (s: any) => {
    console.log('Sanitizing strategy:', s.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: s.title ?? '',
      description: s.description ?? null,
      strategy_framework: typeof s.strategy_framework === 'object' && s.strategy_framework !== null ? s.strategy_framework : {},
      category: s.category ?? null,
      ai_tools: Array.isArray(s.ai_tools) ? s.ai_tools : (s.ai_tools ? [s.ai_tools] : []),
      timeline: s.timeline ?? null,
      success_metrics: Array.isArray(s.success_metrics) ? s.success_metrics : [],
      key_actions: Array.isArray(s.key_actions) ? s.key_actions : [],
      potential_challenges: Array.isArray(s.potential_challenges) ? s.potential_challenges : [],
      mitigation_strategies: Array.isArray(s.mitigation_strategies) ? s.mitigation_strategies : [],
      instructions: s.instructions ?? null,
      tags: Array.isArray(s.tags) ? s.tags : (s.tags ? [s.tags] : []),
      priority_level: s.priority_level ?? null,
      resource_requirements: Array.isArray(s.resource_requirements) ? s.resource_requirements : []
    };
  };

  console.log('Saving components - counts:', {
    prompts: components.prompts?.length || 0,
    workflows: components.workflows?.length || 0,
    blueprints: components.blueprints?.length || 0,
    strategies: components.strategies?.length || 0
  });

  const saves = [
    ...components.prompts.map(p => supabase.from('user_prompts').insert(sanitizePrompt(p))),
    ...components.workflows.map(w => supabase.from('user_workflows').insert(sanitizeWorkflow(w))),
    ...components.blueprints.map(b => supabase.from('user_blueprints').insert(sanitizeBlueprint(b))),
    ...components.strategies.map(s => supabase.from('user_strategies').insert(sanitizeStrategy(s)))
  ];

  const results = await Promise.allSettled(saves);
  let saved = 0;
  const errors: Array<any> = [];
  
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const val: any = (r as any).value;
      if (val?.error) {
        console.error('Database insert error:', val.error);
        errors.push({ type: 'fulfilled-error', error: val.error });
      } else {
        saved++;
      }
    } else {
      console.error('Promise rejected:', (r as any).reason);
      errors.push({ type: 'rejected', reason: (r as any).reason });
    }
  }
  
  if (errors.length) {
    console.error('Errors while saving generated components:', errors);
  }
  
  console.log('Components save result:', { total: saves.length, saved, errors: errors.length });
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
      "CRITICAL: Return ONLY valid JSON matching this EXACT structure with COMPLETE data in ALL fields:",
      "IMPORTANT: The 'phases' array MUST contain exactly 3 phases with detailed, actionable content for each phase.",
      JSON.stringify({
        title: "AI Transformation Plan",
        executive_summary: "Comprehensive summary of the transformation plan with specific goals and expected outcomes",
        overview: {
          vision_statement: "Clear vision statement for the transformation",
          transformation_scope: "Detailed scope of what will be transformed",
          expected_outcomes: ["specific outcome 1", "specific outcome 2", "specific outcome 3"],
          timeline_overview: "Overall timeline and phases breakdown"
        },
        analysis: {
          current_state: {
            strengths: ["strength 1", "strength 2"],
            weaknesses: ["weakness 1", "weakness 2"],
            opportunities: ["opportunity 1", "opportunity 2"],
            threats: ["threat 1", "threat 2"]
          },
          gap_analysis: ["gap 1", "gap 2", "gap 3"],
          readiness_assessment: { 
            score: 75, 
            factors: [{"factor": "factor name", "level": "high", "description": "detailed description"}] 
          },
          market_context: "Detailed market analysis and context"
        },
        action_plan: {
          phases: [
            { 
              phase_number: 1, 
              title: "Foundation Phase", 
              description: "Detailed phase 1 description with specific objectives", 
              duration: "4-6 weeks", 
              objectives: ["objective 1", "objective 2"], 
              key_actions: [
                {"action": "specific action", "description": "detailed description", "priority": "high", "effort_level": "medium", "dependencies": []}
              ], 
              milestones: [{"milestone": "milestone name", "target_date": "Week 4", "success_criteria": ["criteria"]}], 
              deliverables: ["deliverable 1", "deliverable 2"], 
              risks: [{"risk": "risk description", "impact": "medium", "probability": "low", "mitigation": "mitigation strategy"}] 
            },
            { 
              phase_number: 2, 
              title: "Implementation Phase", 
              description: "Detailed phase 2 description with specific objectives", 
              duration: "6-8 weeks", 
              objectives: ["objective 1", "objective 2"], 
              key_actions: [
                {"action": "specific action", "description": "detailed description", "priority": "high", "effort_level": "medium", "dependencies": []}
              ], 
              milestones: [{"milestone": "milestone name", "target_date": "Week 8", "success_criteria": ["criteria"]}], 
              deliverables: ["deliverable 1", "deliverable 2"], 
              risks: [{"risk": "risk description", "impact": "medium", "probability": "low", "mitigation": "mitigation strategy"}] 
            },
            { 
              phase_number: 3, 
              title: "Optimization Phase", 
              description: "Detailed phase 3 description with specific objectives", 
              duration: "4-6 weeks", 
              objectives: ["objective 1", "objective 2"], 
              key_actions: [
                {"action": "specific action", "description": "detailed description", "priority": "high", "effort_level": "medium", "dependencies": []}
              ], 
              milestones: [{"milestone": "milestone name", "target_date": "Week 12", "success_criteria": ["criteria"]}], 
              deliverables: ["deliverable 1", "deliverable 2"], 
              risks: [{"risk": "risk description", "impact": "medium", "probability": "low", "mitigation": "mitigation strategy"}] 
            }
          ]
        },
        tools_prompts: { 
          recommended_ai_tools: [{"tool": "ChatGPT", "category": "content", "use_case": "content creation", "learning_curve": "easy", "cost_estimate": "$20/month", "integration_priority": "high"}], 
          custom_prompts: [{"title": "prompt title", "purpose": "prompt purpose", "prompt": "detailed prompt text", "ai_tool": "ChatGPT", "expected_output": "expected result"}], 
          templates: [{"name": "template name", "type": "template type", "description": "template description", "use_case": "when to use"}] 
        },
        workflows_strategies: { 
          workflows: [{"title": "workflow name", "description": "workflow description", "trigger": "when to start", "steps": [{"step": "step name", "description": "step description", "tools_used": ["tool"], "estimated_time": "30 min"}], "automation_level": "semi-automated", "frequency": "daily"}], 
          strategies: [{"strategy": "strategy name", "description": "strategy description", "success_factors": ["factor"], "implementation_tips": ["tip"], "monitoring_approach": "how to monitor"}] 
        },
        metrics_tracking: { 
          kpis: [{"metric": "conversion rate", "description": "tracks effectiveness", "target": "25%", "measurement_frequency": "weekly", "data_source": "analytics"}], 
          tracking_methods: [{"method": "method name", "tools": ["tool"], "setup_complexity": "low", "cost": "free"}], 
          reporting_schedule: {"daily": ["task 1"], "weekly": ["task 2"], "monthly": ["task 3"], "quarterly": ["task 4"]}, 
          success_criteria: [{"timeframe": "3 months", "criteria": ["criteria 1", "criteria 2"]}] 
        },
        investment: { 
          time_investment: {"total_hours": "40-60 hours", "weekly_commitment": "8-10 hours", "phase_breakdown": [{"phase": "Phase 1", "hours": "20 hours"}]}, 
          financial_investment: {"total_budget": "$500-1000", "categories": [{"category": "Tools", "amount": "$300", "description": "AI subscriptions"}]}, 
          roi_projection: {"timeframe": "6 months", "expected_roi": "300%", "break_even_point": "3 months"} 
        }
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
      ], 1500, true, 'gpt-4.1-2025-04-14');
      
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
          
          // Attempt direct repair without another AI call first
          let repairedContent = res1.content;
          if (repairedContent) {
            // Remove markdown fences
            repairedContent = repairedContent.replace(/```(?:json)?\s*/gi, '').replace(/```$/g, '');
            // Try parsing the cleaned content
            const directParse = safeParse(repairedContent);
            if (directParse) {
              console.log('[jump-plan] Successfully parsed after direct cleanup');
              jumpPlan = directParse;
            }
          }
          
          // If direct repair failed, use AI to fix it
          if (!jumpPlan) {
            const repair = await callOpenAI([
              { role: 'system', content: systemJSON },
              { role: 'user', content: `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON in the exact format specified. No other text. Create exactly 3 phases in the phases array with complete data.\n\nHere is the draft to normalize (may include markdown fences or invalid JSON):` },
              { role: 'user', content: rawContent || res1.content || '' },
              ...recentMessages
            ], 1500, true, 'gpt-4.1-2025-04-14');
            
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