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
  model = 'gpt-4o'
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), 60000);
  
  try {
    // Use gpt-4o for reliability - it supports both max_tokens and temperature
    const body: any = {
      model: 'gpt-4o',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    };
    
    if (isJSON) {
      body.response_format = { type: 'json_object' };
    }

    console.log(`[OpenAI] Calling ${body.model} with ${messages.length} messages, max_tokens: ${maxTokens}, JSON: ${isJSON}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenAI] API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log(`[OpenAI] Response received. Usage:`, data.usage);
    
    if (data.error) {
      throw new Error(`OpenAI returned error: ${data.error.message || data.error}`);
    }

    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};
    const finish_reason = data.choices?.[0]?.finish_reason || 'unknown';

    if (!content && isJSON) {
      console.warn('[OpenAI] Empty content returned for JSON request. Full response:', data);
    }

    return { content, usage, finish_reason, modelUsed: 'gpt-4o' };
    
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[OpenAI] Request failed:', err.message);
    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
      throw new Error('OpenAI request timeout');
    }
    throw err;
  }
}

// Simplified JSON parsing with better error handling
function safeParse(text: string): any {
  if (!text || typeof text !== 'string') return null;
  
  // Clean the text first
  let cleaned = text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .replace(/^\uFEFF/, ''); // Remove BOM

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try fixing common issues
    try {
      // Fix single quotes to double quotes
      cleaned = cleaned.replace(/'/g, '"');
      // Fix trailing commas
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(cleaned);
    } catch {
      console.warn('[JSON] Failed to parse:', cleaned.slice(0, 200));
      return null;
    }
  }
}

// Convert structured plan to readable text format
function formatJumpPlanToText(plan: any): string {
  if (!plan) return '';
  
  let text = '';
  
  if (plan.title) {
    text += `# ${plan.title}\n\n`;
  }
  
  if (plan.executive_summary) {
    text += `## Executive Summary\n\n${plan.executive_summary}\n\n`;
  }
  
  if (plan.overview) {
    text += `## Overview\n\n`;
    if (plan.overview.vision_statement) {
      text += `**Vision:** ${plan.overview.vision_statement}\n\n`;
    }
    if (plan.overview.transformation_scope) {
      text += `**Scope:** ${plan.overview.transformation_scope}\n\n`;
    }
    if (plan.overview.expected_outcomes && Array.isArray(plan.overview.expected_outcomes)) {
      text += `**Expected Outcomes:**\n${plan.overview.expected_outcomes.map((o: string) => `• ${o}`).join('\n')}\n\n`;
    }
  }
  
  if (plan.analysis) {
    text += `## Analysis\n\n`;
    if (plan.analysis.current_state) {
      const cs = plan.analysis.current_state;
      if (cs.strengths && Array.isArray(cs.strengths)) {
        text += `**Strengths:**\n${cs.strengths.map((s: string) => `• ${s}`).join('\n')}\n\n`;
      }
      if (cs.weaknesses && Array.isArray(cs.weaknesses)) {
        text += `**Areas for Improvement:**\n${cs.weaknesses.map((w: string) => `• ${w}`).join('\n')}\n\n`;
      }
      if (cs.opportunities && Array.isArray(cs.opportunities)) {
        text += `**Opportunities:**\n${cs.opportunities.map((o: string) => `• ${o}`).join('\n')}\n\n`;
      }
    }
  }
  
  if (plan.action_plan && plan.action_plan.phases && Array.isArray(plan.action_plan.phases)) {
    text += `## Action Plan\n\n`;
    plan.action_plan.phases.forEach((phase: any, index: number) => {
      text += `### Phase ${phase.phase_number || index + 1}: ${phase.title || 'Phase'}\n\n`;
      if (phase.description) {
        text += `${phase.description}\n\n`;
      }
      if (phase.duration) {
        text += `**Duration:** ${phase.duration}\n\n`;
      }
      if (phase.objectives && Array.isArray(phase.objectives)) {
        text += `**Objectives:**\n${phase.objectives.map((o: string) => `• ${o}`).join('\n')}\n\n`;
      }
      if (phase.key_actions && Array.isArray(phase.key_actions)) {
        text += `**Key Actions:**\n`;
        phase.key_actions.forEach((action: any) => {
          if (typeof action === 'string') {
            text += `• ${action}\n`;
          } else if (action.action) {
            text += `• ${action.action}`;
            if (action.description) text += ` - ${action.description}`;
            text += `\n`;
          }
        });
        text += `\n`;
      }
      if (phase.milestones && Array.isArray(phase.milestones)) {
        text += `**Milestones:**\n${phase.milestones.map((m: any) => {
          if (typeof m === 'string') return `• ${m}`;
          return `• ${m.milestone || 'Milestone'} (${m.target_date || 'TBD'})`;
        }).join('\n')}\n\n`;
      }
    });
  }
  
  if (plan.metrics_tracking) {
    text += `## Metrics & Tracking\n\n`;
    if (plan.metrics_tracking.kpis && Array.isArray(plan.metrics_tracking.kpis)) {
      text += `**Key Performance Indicators:**\n${plan.metrics_tracking.kpis.map((k: string) => `• ${k}`).join('\n')}\n\n`;
    }
  }
  
  return text.trim();
}

async function generateComponents(userProfile: any): Promise<GeneratedComponents> {
  type Key = 'prompts' | 'workflows' | 'blueprints' | 'strategies';

  // Extract an array by top-level key directly from raw text
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

    // Robust extraction: locate the first '[' after the key
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

    return [];
  };

  // Normalize items to match our DB schemas
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
        it.difficulty = it.difficulty || 'beginner';
        it.estimated_time = it.estimated_time || '5-10 minutes';
        it.instructions = it.instructions || 'Use this prompt with your preferred AI tool';
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
            if (typeof s === 'string') return { 
              step: idx + 1, 
              title: s, 
              description: s, 
              tools: [], 
              estimated_time: '15 minutes' 
            };
            
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
        it.instructions = it.instructions || 'Follow the workflow steps in order';
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
        it.instructions = it.instructions || 'Implement this strategy systematically';
      }
      
      return it;
    }).filter((it: any) => !!it && typeof it.title === 'string' && it.title.trim().length > 0);
  };

  const buildPromptFor = (key: Key) => {
    const base = `Generate exactly 4 high-quality, detailed ${key} based on this user profile.
Return ONLY valid JSON with a single top-level object containing the "${key}" array (length=4). 
Make each item comprehensive and actionable with realistic, useful content.
No markdown, no fences, no commentary.

User Profile:
- Role: ${userProfile.currentRole || 'Professional'} in ${userProfile.industry || 'General'}
- Experience: ${userProfile.experienceLevel || 'Intermediate'}
- Goals: ${userProfile.goals || 'AI Integration'}
- AI Knowledge: ${userProfile.aiKnowledge || 'Basic'}
- Time: ${userProfile.timeCommitment || '1-3 hours/week'}
- Budget: ${userProfile.budget || '$0-100'}`;

    const schemas: Record<Key, string> = {
      prompts: `{"prompts":[{"title":"Specific actionable prompt title","description":"Clear description of what this accomplishes","prompt_text":"Detailed, ready-to-use prompt text that gets results","category":"productivity","ai_tools":["ChatGPT","Claude"],"use_cases":["specific use case 1","use case 2"],"instructions":"Step-by-step instructions for best results","tags":["relevant","actionable","tags"],"difficulty":"beginner","estimated_time":"5-10 minutes"}]}`,
      workflows: `{"workflows":[{"title":"Complete workflow name with clear objective","description":"What this workflow achieves and why it's valuable","workflow_steps":[{"step":1,"title":"Descriptive step name","description":"Detailed explanation of what to do","tools":["specific tool name"],"estimated_time":"10 minutes"}],"category":"productivity","ai_tools":["specific AI tools needed"],"duration_estimate":"2-4 hours","complexity_level":"beginner","prerequisites":["specific requirement"],"expected_outcomes":["measurable outcome 1","measurable outcome 2"],"instructions":"Clear implementation guidance","tags":["workflow","automation"],"tools_needed":["required tool"],"skill_level":"beginner"}]}`,
      blueprints: `{"blueprints":[{"title":"Comprehensive blueprint name","description":"What this blueprint creates and its value","blueprint_content":{"overview":"Detailed overview of the blueprint","components":["component 1","component 2","component 3"],"structure":"Clear structure and organization","implementation":"Step-by-step implementation guide"},"category":"productivity","ai_tools":["specific tools needed"],"implementation_time":"1-2 weeks","difficulty_level":"beginner","resources_needed":["resource 1","resource 2"],"deliverables":["deliverable 1","deliverable 2"],"instructions":"Complete implementation guide","tags":["blueprint","framework"],"implementation":"Detailed implementation steps","requirements":["requirement 1"],"tools_used":["tool 1"]}]}`,
      strategies: `{"strategies":[{"title":"Strategic plan name with clear goal","description":"Strategic objective and comprehensive approach","strategy_framework":{"overview":"Strategy overview and methodology","phases":["phase 1","phase 2","phase 3"],"objectives":["objective 1","objective 2"],"approach":"Detailed implementation approach"},"category":"productivity","ai_tools":["strategic tools needed"],"timeline":"3-6 months","success_metrics":["metric 1","metric 2"],"key_actions":["action 1","action 2","action 3"],"potential_challenges":["challenge 1","challenge 2"],"mitigation_strategies":["solution 1","solution 2"],"instructions":"Strategic implementation guide","tags":["strategy","planning"],"priority_level":"high","resource_requirements":["resource 1"]}]}`
    };

    return `${base}\n\nUse this JSON structure (ensure array has exactly 4 detailed items with realistic content):\n${schemas[key]}`;
  };

  const generateForKey = async (key: Key) => {
    console.log(`[Components] Generating ${key}...`);
    const prompt = buildPromptFor(key);
    const systemJSON = 'Return ONLY a single valid JSON object with the requested top-level key. No markdown, no code fences, no commentary.';

    const res = await callOpenAI([
      { role: 'system', content: systemJSON },
      { role: 'user', content: prompt },
    ], 1000, true);

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
        if (Array.isArray((obj as any)[k])) { 
          arr = (obj as any)[k]; 
          break; 
        }
      }
    }

    // If still no results, try repair
    if (!arr || arr.length === 0) {
      console.log(`[Components] Attempting repair for ${key}...`);
      const repair = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON in this exact format with the "${key}" array containing exactly 4 detailed items. No other text.` },
      ], 1000, true);
      
      obj = safeParse(repair.content);
      if (!obj) {
        console.warn(`[gen:${key}] parse failed (attempt 2). First 400 chars:`, repair.content?.slice(0, 400));
        arr = extractArrayByKey(repair.content, key, altKeysMap[key]);
        if (arr.length) console.warn(`[gen:${key}] recovered array via raw extraction on attempt 2.`);
      }
      
      if ((!arr || arr.length === 0) && obj && typeof obj === 'object') {
        const keysToCheck = [key, ...altKeysMap[key]];
        for (const k of keysToCheck) {
          if (Array.isArray((obj as any)[k])) { 
            arr = (obj as any)[k]; 
            break; 
          }
        }
      }
    }

    arr = normalizeItems(key, arr);

    // Ensure we have 4 items by generating more if needed
    if (arr.length < 4) {
      const missing = 4 - arr.length;
      const existingTitles = new Set(arr.map((i: any) => (i.title || '').toLowerCase()));
      const fillPrompt = `Generate exactly ${missing} additional unique ${key} that complement the previous ones. Titles must be distinct from this list: ${[...existingTitles].join(', ')}.\nReturn ONLY valid JSON with a single object containing the "${key}" array (length=${missing}).`;
      
      try {
        console.log(`[Components] Filling missing ${key} items...`);
        const fillRes = await callOpenAI([
          { role: 'system', content: systemJSON },
          { role: 'user', content: fillPrompt },
        ], 800, true);
        
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
      title: p.title || 'Untitled Prompt',
      description: p.description || '',
      prompt_text: p.prompt_text || '',
      category: p.category || 'productivity',
      ai_tools: p.ai_tools || [],
      use_cases: p.use_cases || [],
      instructions: p.instructions || '',
      tags: p.tags || [],
      difficulty: p.difficulty || 'beginner',
      estimated_time: p.estimated_time || '5-10 minutes'
    };
  };

  const sanitizeWorkflow = (w: any) => {
    console.log('Sanitizing workflow:', w.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: w.title || 'Untitled Workflow',
      description: w.description || '',
      workflow_steps: w.workflow_steps || [],
      category: w.category || 'productivity',
      ai_tools: w.ai_tools || [],
      duration_estimate: w.duration_estimate || '1-2 hours',
      complexity_level: w.complexity_level || 'beginner',
      prerequisites: w.prerequisites || [],
      expected_outcomes: w.expected_outcomes || [],
      instructions: w.instructions || '',
      tags: w.tags || [],
      tools_needed: w.tools_needed || [],
      skill_level: w.skill_level || 'beginner'
    };
  };

  const sanitizeBlueprint = (b: any) => {
    console.log('Sanitizing blueprint:', b.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: b.title || 'Untitled Blueprint',
      description: b.description || '',
      blueprint_content: b.blueprint_content || {},
      category: b.category || 'productivity',
      ai_tools: b.ai_tools || [],
      implementation_time: b.implementation_time || '1-2 weeks',
      difficulty_level: b.difficulty_level || 'beginner',
      resources_needed: b.resources_needed || [],
      deliverables: b.deliverables || [],
      instructions: b.instructions || '',
      tags: b.tags || [],
      implementation: b.implementation || '',
      requirements: b.requirements || [],
      tools_used: b.tools_used || []
    };
  };

  const sanitizeStrategy = (s: any) => {
    console.log('Sanitizing strategy:', s.title);
    return {
      user_id: userId,
      jump_id: jumpId,
      title: s.title || 'Untitled Strategy',
      description: s.description || '',
      strategy_framework: s.strategy_framework || {},
      category: s.category || 'productivity',
      ai_tools: s.ai_tools || [],
      timeline: s.timeline || '3-6 months',
      success_metrics: s.success_metrics || [],
      key_actions: s.key_actions || [],
      potential_challenges: s.potential_challenges || [],
      mitigation_strategies: s.mitigation_strategies || [],
      instructions: s.instructions || '',
      tags: s.tags || [],
      priority_level: s.priority_level || 'medium',
      resource_requirements: s.resource_requirements || []
    };
  };

  console.log('Saving components - counts:', {
    prompts: components.prompts?.length || 0,
    workflows: components.workflows?.length || 0,
    blueprints: components.blueprints?.length || 0,
    strategies: components.strategies?.length || 0,
  });

  let saved = 0;
  let total = 0;
  const errors: string[] = [];

  // Save prompts
  if (components.prompts && components.prompts.length > 0) {
    for (const prompt of components.prompts) {
      try {
        total++;
        const sanitized = sanitizePrompt(prompt);
        const { error } = await supabase.from('user_prompts').insert(sanitized);
        if (error) {
          console.error('Error saving prompt:', error);
          errors.push(`Prompt: ${error.message}`);
        } else {
          saved++;
        }
      } catch (e) {
        console.error('Error processing prompt:', e);
        errors.push(`Prompt processing: ${String(e)}`);
      }
    }
  }

  // Save workflows
  if (components.workflows && components.workflows.length > 0) {
    for (const workflow of components.workflows) {
      try {
        total++;
        const sanitized = sanitizeWorkflow(workflow);
        const { error } = await supabase.from('user_workflows').insert(sanitized);
        if (error) {
          console.error('Error saving workflow:', error);
          errors.push(`Workflow: ${error.message}`);
        } else {
          saved++;
        }
      } catch (e) {
        console.error('Error processing workflow:', e);
        errors.push(`Workflow processing: ${String(e)}`);
      }
    }
  }

  // Save blueprints
  if (components.blueprints && components.blueprints.length > 0) {
    for (const blueprint of components.blueprints) {
      try {
        total++;
        const sanitized = sanitizeBlueprint(blueprint);
        const { error } = await supabase.from('user_blueprints').insert(sanitized);
        if (error) {
          console.error('Error saving blueprint:', error);
          errors.push(`Blueprint: ${error.message}`);
        } else {
          saved++;
        }
      } catch (e) {
        console.error('Error processing blueprint:', e);
        errors.push(`Blueprint processing: ${String(e)}`);
      }
    }
  }

  // Save strategies
  if (components.strategies && components.strategies.length > 0) {
    for (const strategy of components.strategies) {
      try {
        total++;
        const sanitized = sanitizeStrategy(strategy);
        const { error } = await supabase.from('user_strategies').insert(sanitized);
        if (error) {
          console.error('Error saving strategy:', error);
          errors.push(`Strategy: ${error.message}`);
        } else {
          saved++;
        }
      } catch (e) {
        console.error('Error processing strategy:', e);
        errors.push(`Strategy processing: ${String(e)}`);
      }
    }
  }

  console.log('Components save result:', { total, saved, errors: errors.length });
  console.log('Components save summary:', { total, saved, errors }, 'Expected counts:', {
    prompts: components.prompts?.length || 0,
    workflows: components.workflows?.length || 0,
    blueprints: components.blueprints?.length || 0,
    strategies: components.strategies?.length || 0,
    total: (components.prompts?.length || 0) + (components.workflows?.length || 0) + (components.blueprints?.length || 0) + (components.strategies?.length || 0)
  });

  return { total, saved, errors };
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
    const body = await req.json();
    console.log('Edge function called with body:', JSON.stringify(body, null, 2));
    const { messages, userProfile, userId, jumpId, generateComponents: shouldGenerateComponents } = body;

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
              description: "Detailed phase 2 description", 
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
              description: "Detailed phase 3 description", 
              duration: "4-6 weeks", 
              objectives: ["objective 1", "objective 2"], 
              key_actions: [
                {"action": "specific action", "description": "detailed description", "priority": "high", "effort_level": "medium", "dependencies": []}
              ], 
              milestones: [{"milestone": "milestone name", "target_date": "Week 12", "success_criteria": ["criteria"]}], 
              deliverables: ["deliverable 1", "deliverable 2"], 
              risks: [{"risk": "risk description", "impact": "low", "probability": "low", "mitigation": "mitigation strategy"}] 
            }
          ]
        },
        tools_prompts: {
          recommended_ai_tools: ["tool 1", "tool 2"],
          custom_prompts: ["prompt 1", "prompt 2"],
          templates: ["template 1", "template 2"]
        },
        workflows_strategies: {
          workflows: ["workflow 1", "workflow 2"],
          strategies: ["strategy 1", "strategy 2"]
        },
        metrics_tracking: {
          kpis: ["kpi 1", "kpi 2"],
          tracking_methods: ["method 1", "method 2"],
          reporting_schedule: { 
            daily: ["daily task 1"], 
            weekly: ["weekly task 1"], 
            monthly: ["monthly task 1"], 
            quarterly: ["quarterly task 1"] 
          },
          success_criteria: ["criteria 1", "criteria 2"]
        },
        investment: {
          time_investment: { 
            total_hours: "40-60 hours", 
            weekly_commitment: "3-5 hours", 
            phase_breakdown: ["Phase 1: 20 hours", "Phase 2: 25 hours", "Phase 3: 15 hours"] 
          },
          financial_investment: { 
            total_budget: "$500-1000", 
            categories: [{"category": "Tools", "amount": "$200"}, {"category": "Training", "amount": "$300"}] 
          },
          roi_projection: { 
            timeframe: "6-12 months", 
            expected_roi: "300-500%", 
            break_even_point: "4-6 months" 
          }
        }
      })
    ].join('\n');

    const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];
    
    // Generate structured jump plan
    let content = '';
    let jumpPlan: any = null;
    let usage: any = undefined;
    let finish_reason: any = undefined;
    let modelUsed: string | undefined = undefined;
    
    if (!shouldGenerateComponents) {
      console.log('[Jump Generation] Starting jump plan generation...');
      const systemJSON = 'Return ONLY a single valid JSON object with the requested structure. No markdown, no code fences, no commentary. Make sure to include all required fields with realistic, detailed content.';
      
      let rawContent = '';
      const res1 = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: systemPrompt },
        ...recentMessages
      ], 2000, true);
      
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
          console.log('[Jump Generation] Attempting AI repair of JSON...');
          const repair = await callOpenAI([
            { role: 'system', content: systemJSON },
            { role: 'user', content: `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON in the exact format specified. No other text. Create exactly 3 phases in the phases array with complete data.\n\nHere is the draft to normalize (may include markdown fences or invalid JSON):` },
            { role: 'user', content: rawContent || res1.content || '' },
            ...recentMessages
          ], 2000, true);
          
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
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Generation failed',
      details: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});