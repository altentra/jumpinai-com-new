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

async function callOpenAI(messages: Array<{ role: string; content: string }>, maxTokens = 2000, isJSON = false) {
  const body: any = {
    model: 'gpt-5-2025-08-07',
    messages,
    max_completion_tokens: maxTokens,
  };
  
  if (isJSON) {
    body.response_format = { type: 'json_object' };
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
    console.error('OpenAI API error:', response.status);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  
  return { content, usage: data.usage, finish_reason: data?.choices?.[0]?.finish_reason };
}

async function generateComponents(userProfile: any): Promise<GeneratedComponents> {
  const prompt = `Generate 4 personalized AI components for each category based on this user profile. No emojis or special symbols.

User: ${userProfile.currentRole} in ${userProfile.industry}
Goals: ${userProfile.goals}
AI Knowledge: ${userProfile.aiKnowledge}

Return valid JSON with this structure:
{
  "prompts": [{"title": "", "description": "", "prompt_text": "", "category": "productivity", "ai_tools": ["ChatGPT"], "use_cases": [""], "instructions": "", "tags": [""]}],
  "workflows": [{"title": "", "description": "", "workflow_steps": [{"step": 1, "title": "", "description": "", "tools": [], "estimated_time": ""}], "category": "productivity", "ai_tools": [], "duration_estimate": "", "complexity_level": "beginner", "prerequisites": [], "expected_outcomes": [], "instructions": "", "tags": []}],
  "blueprints": [{"title": "", "description": "", "blueprint_content": {"overview": "", "components": [], "structure": "", "implementation": ""}, "category": "productivity", "ai_tools": [], "implementation_time": "", "difficulty_level": "beginner", "resources_needed": [], "deliverables": [], "instructions": "", "tags": []}],
  "strategies": [{"title": "", "description": "", "strategy_framework": {"overview": "", "phases": [], "objectives": [], "approach": ""}, "category": "productivity", "ai_tools": [], "timeline": "", "success_metrics": [], "key_actions": [], "potential_challenges": [], "mitigation_strategies": [], "instructions": "", "tags": []}]
}`;

  const { content } = await callOpenAI([{ role: 'user', content: prompt }], 3000, true);
  return JSON.parse(content);
}

async function saveComponents(components: GeneratedComponents, userId: string, jumpId: string) {
  const saves = [
    ...components.prompts.map(p => supabase.from('user_prompts').insert({ user_id: userId, jump_id: jumpId, ...p })),
    ...components.workflows.map(w => supabase.from('user_workflows').insert({ user_id: userId, jump_id: jumpId, ...w })),
    ...components.blueprints.map(b => supabase.from('user_blueprints').insert({ user_id: userId, jump_id: jumpId, ...b })),
    ...components.strategies.map(s => supabase.from('user_strategies').insert({ user_id: userId, jump_id: jumpId, ...s }))
  ];
  
  await Promise.all(saves);
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
    const systemPrompt = `You are JumpinAI Studio, an expert AI transformation coach. Create personalized transformation plans called "Jumps".

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
    
    // Call OpenAI
    const { content, usage, finish_reason } = await callOpenAI([
      { role: 'system', content: systemPrompt },
      ...recentMessages
    ], 2500);

    // Handle component generation
    let componentsStatus = 'Not requested';
    if (shouldGenerateComponents && userProfile && userId && jumpId) {
      try {
        console.log('Generating components...');
        const components = await generateComponents(userProfile);
        await saveComponents(components, userId, jumpId);
        componentsStatus = 'Generated and saved successfully';
        console.log('Components saved successfully');
      } catch (error) {
        console.error('Component generation failed:', error);
        componentsStatus = 'Failed to generate';
      }
    }

    return new Response(JSON.stringify({
      message: content,
      usage,
      debug: { finish_reason, model: 'gpt-5-2025-08-07' },
      components: componentsStatus
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