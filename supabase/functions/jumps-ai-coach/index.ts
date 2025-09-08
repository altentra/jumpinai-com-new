import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { messages, userProfile } = await req.json();

    // System prompt for personalized AI transformation coaching
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
        max_completion_tokens: 1200,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    // Try to robustly extract content from various possible response shapes
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

    return new Response(JSON.stringify({ 
      message: content || '',
      usage: data?.usage,
      debug: { finish_reason: finishReason, model: data?.model }
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