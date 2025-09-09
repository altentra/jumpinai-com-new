import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize Supabase client with service role key for database operations
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

async function generateComponents(userProfile: any, userId: string): Promise<GeneratedComponents> {
  const componentPrompt = `You are an expert AI transformation coach. Based on this user profile, generate personalized AI implementation components:

USER PROFILE:
- Current Role: ${userProfile.currentRole || 'Not specified'}
- Industry: ${userProfile.industry || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
- Current AI Knowledge: ${userProfile.aiKnowledge || 'Not specified'}
- Primary Goals: ${userProfile.goals || 'Not specified'}
- Biggest Challenges: ${userProfile.challenges || 'Not specified'}
- Available Time: ${userProfile.timeCommitment || 'Not specified'}
- Budget Range: ${userProfile.budget || 'Not specified'}

Generate exactly 4 components for each category, tailored to this user's profile. Return ONLY a valid JSON object with this exact structure:

{
  "prompts": [
    {
      "title": "Specific prompt title",
      "description": "What this prompt does (1-2 sentences)",
      "prompt_text": "The actual prompt text ready to use",
      "category": "productivity|content|analysis|automation",
      "ai_tools": ["ChatGPT", "Claude", "Gemini"],
      "use_cases": ["specific use case 1", "specific use case 2"],
      "instructions": "Step-by-step how to use this prompt effectively",
      "tags": ["tag1", "tag2"]
    }
  ],
  "workflows": [
    {
      "title": "Workflow title",
      "description": "What this workflow accomplishes",
      "workflow_steps": [
        {
          "step": 1,
          "title": "Step title",
          "description": "What to do",
          "tools": ["tool names"],
          "estimated_time": "time estimate"
        }
      ],
      "category": "productivity|content|analysis|automation",
      "ai_tools": ["tool names"],
      "duration_estimate": "total time needed",
      "complexity_level": "beginner|intermediate|advanced",
      "prerequisites": ["what's needed before starting"],
      "expected_outcomes": ["what results to expect"],
      "instructions": "How to implement this workflow",
      "tags": ["tag1", "tag2"]
    }
  ],
  "blueprints": [
    {
      "title": "Blueprint title",
      "description": "What this blueprint creates",
      "blueprint_content": {
        "overview": "Blueprint overview",
        "components": ["component1", "component2"],
        "structure": "How it's organized",
        "implementation": "Implementation details"
      },
      "category": "productivity|content|analysis|automation",
      "ai_tools": ["tool names"],
      "implementation_time": "time to implement",
      "difficulty_level": "beginner|intermediate|advanced",
      "resources_needed": ["required resources"],
      "deliverables": ["what will be created"],
      "instructions": "Implementation guide",
      "tags": ["tag1", "tag2"]
    }
  ],
  "strategies": [
    {
      "title": "Strategy title",
      "description": "What this strategy achieves",
      "strategy_framework": {
        "overview": "Strategy overview",
        "phases": ["phase1", "phase2"],
        "objectives": ["objective1", "objective2"],
        "approach": "Strategic approach"
      },
      "category": "productivity|content|analysis|automation",
      "ai_tools": ["tool names"],
      "timeline": "implementation timeline",
      "success_metrics": ["how to measure success"],
      "key_actions": ["main action items"],
      "potential_challenges": ["possible obstacles"],
      "mitigation_strategies": ["how to overcome challenges"],
      "instructions": "How to execute this strategy",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Make components highly specific to the user's role, industry, and goals. Focus on practical, actionable content.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: componentPrompt }
      ],
      max_completion_tokens: 4000,
      stream: false
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  
  try {
    // Clean the content to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const components = JSON.parse(jsonMatch[0]);
    console.log('Generated components:', components);
    return components;
  } catch (error) {
    console.error('Error parsing components JSON:', error);
    console.error('Raw content:', content);
    throw new Error('Failed to parse generated components');
  }
}

async function saveComponentsToDatabase(components: GeneratedComponents, userId: string, jumpId: string) {
  try {
    // Save prompts
    for (const prompt of components.prompts) {
      const { error: promptError } = await supabase
        .from('user_prompts')
        .insert({
          user_id: userId,
          jump_id: jumpId,
          ...prompt
        });
      
      if (promptError) {
        console.error('Error saving prompt:', promptError);
      }
    }

    // Save workflows
    for (const workflow of components.workflows) {
      const { error: workflowError } = await supabase
        .from('user_workflows')
        .insert({
          user_id: userId,
          jump_id: jumpId,
          ...workflow
        });
      
      if (workflowError) {
        console.error('Error saving workflow:', workflowError);
      }
    }

    // Save blueprints
    for (const blueprint of components.blueprints) {
      const { error: blueprintError } = await supabase
        .from('user_blueprints')
        .insert({
          user_id: userId,
          jump_id: jumpId,
          ...blueprint
        });
      
      if (blueprintError) {
        console.error('Error saving blueprint:', blueprintError);
      }
    }

    // Save strategies
    for (const strategy of components.strategies) {
      const { error: strategyError } = await supabase
        .from('user_strategies')
        .insert({
          user_id: userId,
          jump_id: jumpId,
          ...strategy
        });
      
      if (strategyError) {
        console.error('Error saving strategy:', strategyError);
      }
    }

    console.log('All components saved successfully');
  } catch (error) {
    console.error('Error saving components to database:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Ensure OpenAI API key is configured
  if (!openAIApiKey) {
    console.error('OPENAI_API_KEY is not set');
    return new Response(JSON.stringify({ 
      error: 'Missing OpenAI API key. Please set OPENAI_API_KEY in Supabase Edge Function secrets.'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, userProfile, userId, jumpId, generateComponents: shouldGenerateComponents } = await req.json();

    // System prompt for personalized AI transformation coaching (main plan)
    const systemPrompt = `You are an expert AI transformation coach and strategist. Your role is to create personalized "Jumps" - comprehensive transformation plans that help individuals and businesses successfully adapt to and implement AI in their daily operations.

CONTEXT ABOUT THE USER:
${userProfile ? `
- Current Role: ${userProfile.currentRole || 'Not specified'}
- Industry: ${userProfile.industry || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
- Current AI Knowledge: ${userProfile.aiKnowledge || 'Not specified'}
- Primary Goals: ${userProfile.goals || 'Not specified'}
- Biggest Challenges: ${userProfile.challenges || 'Not specified'}
- Available Time: ${userProfile.timeCommitment || 'Not specified'}
- Budget Range: ${userProfile.budget || 'Not specified'}
` : 'User profile not yet collected - ask relevant questions to understand their situation.'}

YOUR COACHING APPROACH:
1. **Deep Assessment**: Understand their current situation, knowledge gaps, and specific goals
2. **Personalized Strategy**: Create tailored recommendations based on their unique context
3. **Actionable Plans**: Provide specific, step-by-step implementation strategies
4. **Tool Recommendations**: Suggest specific AI tools, platforms, and resources
5. **Timeline & Milestones**: Create realistic timelines with measurable milestones
6. **Risk Mitigation**: Address potential challenges and provide solutions

RESPONSE STRUCTURE for "Jumps" plans:
When creating a comprehensive transformation plan, structure it as:

**🎯 TRANSFORMATION OVERVIEW**
- Personalized vision statement
- Key transformation areas
- Expected timeline and outcomes

**📊 CURRENT STATE ANALYSIS**
- Strengths to leverage
- Gaps to address
- Opportunities to capture

**🚀 THE JUMP PLAN**
Phase 1: Foundation (Weeks 1-4)
- Specific actions and tools
- Learning resources
- Success metrics

Phase 2: Implementation (Weeks 5-12)
- Advanced strategies
- Workflow integration
- Performance optimization

Phase 3: Mastery & Scale (Weeks 13-24)
- Advanced applications
- Team/organization scaling
- Continuous improvement

**🛠️ RECOMMENDED TOOLS & RESOURCES**
- Specific AI tools with use cases
- Learning platforms and courses
- Communities and networks

**📈 SUCCESS METRICS & MILESTONES**
- Weekly/monthly checkpoints
- Key performance indicators
- Long-term success measures

**⚠️ POTENTIAL CHALLENGES & SOLUTIONS**
- Common obstacles
- Mitigation strategies
- Support resources

Be conversational, insightful, and highly practical. Ask clarifying questions when needed. Always provide specific, actionable advice rather than generic suggestions.`;

    // Generate main transformation plan
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_completion_tokens: 1500,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = (
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      (Array.isArray(data?.output_text) ? data.output_text.join('\n') : data?.output_text) ??
      ''
    );

    const finishReason = data?.choices?.[0]?.finish_reason ?? 'unknown';
    if (!content || typeof content !== 'string' || content.trim() === '') {
      console.error('OpenAI returned empty content', { finishReason, model: data?.model });
      console.error('OpenAI raw (truncated):', JSON.stringify(data).slice(0, 4000));
    }

    // Generate components if requested
    let generatedComponents = null;
    if (shouldGenerateComponents && userProfile && userId && jumpId) {
      try {
        console.log('Generating comprehensive Jump components...');
        generatedComponents = await generateComponents(userProfile, userId);
        
        console.log('Saving components to database...');
        await saveComponentsToDatabase(generatedComponents, userId, jumpId);
        
        console.log('Jump package generated successfully!');
      } catch (error) {
        console.error('Error generating components:', error);
        // Don't fail the whole request if component generation fails
      }
    }

    return new Response(JSON.stringify({ 
      message: content || '',
      usage: data?.usage,
      debug: { finish_reason: finishReason, model: data?.model },
      components: generatedComponents ? 'Generated and saved successfully' : 'Not requested'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in jumps-ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});