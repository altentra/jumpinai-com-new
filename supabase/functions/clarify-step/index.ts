import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClarifyStepRequest {
  jumpOverview: string;
  phaseTitle: string;
  phaseNumber: number;
  stepTitle: string;
  stepDescription: string;
  stepNumber: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY not configured');
    }

    const requestData: ClarifyStepRequest = await req.json();
    console.log('Clarifying step:', requestData);

    const systemPrompt = `You are an expert strategic planner specializing in breaking down complex tasks into clear, manageable sub-steps. Your goal is to provide detailed, actionable guidance that helps users execute each step with clarity and confidence.`;

    const userPrompt = `I need you to break down a specific step from an implementation plan into 5 detailed sub-steps.

JUMP OVERVIEW CONTEXT:
${requestData.jumpOverview}

CURRENT PHASE: ${requestData.phaseTitle} (Phase ${requestData.phaseNumber})

STEP TO CLARIFY:
Title: ${requestData.stepTitle}
Description: ${requestData.stepDescription}
Step Number: ${requestData.stepNumber}

Your task:
Generate EXACTLY 5 detailed sub-steps that break down the above step into more manageable, executable actions. Each sub-step should:
1. Be specific and actionable (not vague or generic)
2. Follow a logical sequence
3. Include clear guidance on HOW to execute it
4. Be slightly shorter in text volume than the original step (concise but complete)
5. Use **bold** markdown for key terms and important actions

Return ONLY valid JSON in this exact format (NO markdown blocks, NO extra text):
{
  "subSteps": [
    {
      "sub_step_number": 1,
      "title": "**Clear, action-oriented title**",
      "description": "2-3 sentences explaining exactly what to do, how to do it, and why it matters. Use **bold** for key actions and deliverables.",
      "estimated_time": "2-4 hours"
    },
    {
      "sub_step_number": 2,
      "title": "**Clear, action-oriented title**",
      "description": "2-3 sentences with specific guidance.",
      "estimated_time": "3-5 hours"
    },
    {
      "sub_step_number": 3,
      "title": "**Clear, action-oriented title**",
      "description": "2-3 sentences with specific guidance.",
      "estimated_time": "2-3 hours"
    },
    {
      "sub_step_number": 4,
      "title": "**Clear, action-oriented title**",
      "description": "2-3 sentences with specific guidance.",
      "estimated_time": "4-6 hours"
    },
    {
      "sub_step_number": 5,
      "title": "**Clear, action-oriented title**",
      "description": "2-3 sentences with specific guidance.",
      "estimated_time": "2-4 hours"
    }
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown code blocks, no explanations.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Clean and parse JSON
    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{[]*/, '')
      .replace(/[^}\]]*$/, '')
      .replace(/,(\s*[}\]])/g, '$1')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
      console.log('Successfully parsed clarify response');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Failed content:', content.substring(0, 500));
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify(parsed),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in clarify-step function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
