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

  // Strip code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  // Extract largest object slice
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
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
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') stack.push(i);
    if (ch === '}' && stack.length) {
      const s = stack.pop()!;
      if (stack.length === 0) candidates.push(cleaned.slice(s, i + 1));
    }
  }
  for (const cand of candidates) {
    const fixed = cand.replace(/,(\s*[}\]])/g, '$1');
    obj = tryParse(fixed);
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

    // Create comprehensive system prompt for structured JSON response
    const systemPrompt = [
      "You are Jumps Studio, an elite AI transformation strategist and business consultant.",
      "Create comprehensive, deeply personalized transformation plans called 'Jumps' that are actionable roadmaps for professional and business transformation.",
      "",
      "CRITICAL: Return ONLY a valid JSON object. Use professional language - no emojis, special symbols, or decorative characters.",
      "",
      "User Profile Analysis:",
      `- Current Role: ${userProfile?.currentRole || 'Not specified'}`,
      `- Industry: ${userProfile?.industry || 'Not specified'}`,
      `- Experience Level: ${userProfile?.experienceLevel || 'Not specified'}`,
      `- AI Knowledge: ${userProfile?.aiKnowledge || 'Not specified'}`,
      `- Transformation Goals: ${userProfile?.goals || 'Not specified'}`,
      `- Key Challenges: ${userProfile?.challenges || 'Not specified'}`,
      `- Time Commitment: ${userProfile?.timeCommitment || 'Not specified'}`,
      `- Budget Range: ${userProfile?.budget || 'Not specified'}`,
      "",
      "Create a COMPREHENSIVE transformation plan with this EXACT JSON structure:",
      "",
      JSON.stringify({
        "title": "Compelling, specific transformation plan title",
        "executive_summary": "Compelling 3-4 sentence overview of the complete transformation journey and expected outcomes",
        "overview": {
          "vision_statement": "Inspirational vision of the user's transformed state",
          "transformation_scope": "Detailed scope of what will be transformed",
          "expected_outcomes": ["Specific outcome 1", "Specific outcome 2", "Specific outcome 3", "Specific outcome 4"],
          "timeline_overview": "High-level timeline summary"
        },
        "analysis": {
          "current_state": {
            "strengths": ["Key strength 1", "Key strength 2", "Key strength 3", "Key strength 4"],
            "weaknesses": ["Area for improvement 1", "Area for improvement 2", "Area for improvement 3"],
            "opportunities": ["Market opportunity 1", "Growth opportunity 2", "Technology opportunity 3"],
            "threats": ["Potential threat 1", "Market threat 2", "Technology threat 3"]
          },
          "gap_analysis": ["Critical gap 1", "Strategic gap 2", "Skills gap 3", "Technology gap 4"],
          "readiness_assessment": {
            "score": 8,
            "factors": [
              {"factor": "Technical Readiness", "level": "High", "description": "Strong foundation for implementation"},
              {"factor": "Resource Availability", "level": "Medium", "description": "Adequate resources with some constraints"},
              {"factor": "Change Management", "level": "High", "description": "Good adaptability to change"}
            ]
          },
          "market_context": "Analysis of market conditions and competitive landscape"
        },
        "action_plan": {
          "phases": [
            {
              "phase_number": 1,
              "title": "Foundation Phase",
              "description": "Detailed description of what this phase accomplishes",
              "duration": "4-6 weeks",
              "objectives": ["Clear objective 1", "Clear objective 2", "Clear objective 3"],
              "key_actions": [
                {
                  "action": "Specific actionable task",
                  "description": "Detailed description of how to execute this action",
                  "priority": "High",
                  "effort_level": "Medium", 
                  "dependencies": ["Prerequisite 1", "Prerequisite 2"]
                }
              ],
              "milestones": [
                {
                  "milestone": "Key milestone name",
                  "target_date": "Week 4",
                  "success_criteria": ["Measurable criterion 1", "Measurable criterion 2"]
                }
              ],
              "deliverables": ["Tangible deliverable 1", "Tangible deliverable 2"],
              "risks": [
                {
                  "risk": "Potential risk description",
                  "impact": "High",
                  "probability": "Medium",
                  "mitigation": "Specific mitigation strategy"
                }
              ]
            }
          ]
        },
        "tools_prompts": {
          "recommended_ai_tools": [
            {
              "tool": "ChatGPT/GPT-4",
              "category": "Content Creation",
              "use_case": "Specific use case for this user's goals",
              "learning_curve": "Low",
              "cost_estimate": "$20/month",
              "integration_priority": "High"
            }
          ],
          "custom_prompts": [
            {
              "title": "Strategic Planning Prompt",
              "purpose": "Generate strategic business plans",
              "prompt": "Act as a strategic business consultant...",
              "ai_tool": "ChatGPT/Claude",
              "expected_output": "Structured strategic plan with analysis"
            }
          ]
        },
        "workflows_strategies": {
          "workflows": [
            {
              "title": "Daily AI-Powered Content Creation",
              "description": "Streamlined process for creating high-quality content",
              "trigger": "Daily content planning session",
              "steps": [
                {
                  "step": "Content ideation",
                  "description": "Generate content ideas using AI brainstorming prompts",
                  "tools_used": ["ChatGPT", "Claude"],
                  "estimated_time": "15 minutes"
                }
              ],
              "automation_level": "Semi-automated",
              "frequency": "Daily"
            }
          ],
          "strategies": [
            {
              "strategy": "Gradual AI Integration Strategy",
              "description": "Phase-by-phase approach to integrating AI tools",
              "success_factors": ["Start with low-risk applications", "Train team incrementally"],
              "implementation_tips": ["Begin with content creation tasks", "Document all processes"],
              "monitoring_approach": "Weekly assessment of adoption rates"
            }
          ]
        },
        "metrics_tracking": {
          "kpis": [
            {
              "metric": "AI Tool Adoption Rate",
              "description": "Percentage of recommended AI tools successfully integrated",
              "target": "80% within 90 days",
              "measurement_frequency": "Weekly",
              "data_source": "Usage analytics and team reports"
            }
          ],
          "tracking_methods": [
            {
              "method": "Automated Dashboard Monitoring",
              "tools": ["Google Analytics", "Custom dashboards"],
              "setup_complexity": "Medium",
              "cost": "$50-100/month"
            }
          ],
          "reporting_schedule": {
            "daily": ["AI tool usage metrics", "Content output tracking"],
            "weekly": ["Team productivity metrics", "Goal progress assessment"],
            "monthly": ["Comprehensive performance review", "ROI analysis"],
            "quarterly": ["Strategic goal assessment", "Long-term planning review"]
          },
          "success_criteria": [
            {
              "timeframe": "30 days",
              "criteria": ["All Phase 1 tools implemented", "Team training completed"]
            }
          ]
        },
        "investment": {
          "time_investment": {
            "total_hours": "120-150 hours over 6 months",
            "weekly_commitment": "5-8 hours per week",
            "phase_breakdown": [
              {"phase": "Foundation", "hours": "40-50 hours"}
            ]
          },
          "financial_investment": {
            "total_budget": "$2,000-4,000 over 6 months",
            "categories": [
              {"category": "AI Tool Subscriptions", "amount": "$500-1,200", "description": "Monthly subscriptions for AI platforms"}
            ]
          },
          "roi_projection": {
            "timeframe": "6-12 months",
            "expected_roi": "300-500%",
            "break_even_point": "4-6 months"
          }
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
    
    if (!shouldGenerateComponents) {
      const systemJSON = 'Return ONLY a single valid JSON object with the requested structure. No markdown, no code fences, no commentary.';
      
      let rawContent = '';
      const res1 = await callOpenAI([
        { role: 'system', content: systemJSON },
        { role: 'user', content: systemPrompt },
        ...recentMessages
      ], 1800, true, 'gpt-4.1-2025-04-14');
      
      usage = res1.usage;
      finish_reason = res1.finish_reason;
      rawContent = res1.content;
      
      jumpPlan = safeParse(res1.content);
      
      // If parsing failed, try repair attempt
      if (!jumpPlan) {
        console.warn('[jump-plan] parse failed (attempt 1). First 400 chars:', res1.content?.slice(0, 400));
        
        const repair = await callOpenAI([
          { role: 'system', content: systemJSON },
          { role: 'user', content: `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON in the exact format specified. No other text. Create exactly 3 phases in the phases array.` },
          ...recentMessages
        ], 1800, true, 'gpt-4.1-2025-04-14');
        
        rawContent = repair.content || rawContent;
        jumpPlan = safeParse(repair.content);
        if (!jumpPlan) {
          console.warn('[jump-plan] parse failed (attempt 2). First 400 chars:', repair.content?.slice(0, 400));
        }
      }

      // Convert structured plan back to formatted text for backward compatibility
      if (jumpPlan) {
        content = formatJumpPlanToText(jumpPlan);
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