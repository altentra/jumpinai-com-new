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
  level?: number; // Optional: 1 for regular sub-steps, 2 for Level 2 sub-steps
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
    const level = requestData.level || 1; // Default to level 1 if not specified
    const labelPrefix = level === 2 ? 'Level 2. Sub-Step' : 
                       level === 3 ? 'Level 3. Sub-Step' :
                       level === 4 ? 'Level 4. Sub-Step' : 'Sub-Step';
    console.log(`Clarifying ${labelPrefix}:`, requestData);

    const systemPrompt = `You are an expert strategic planner specializing in breaking down complex tasks into clear, manageable sub-steps. Your goal is to provide detailed, actionable guidance that helps users execute each step with clarity and confidence.

${level === 2 ? 'NOTE: You are generating Level 2 sub-steps (breaking down a sub-step into even more detailed actions). Label these as "Level 2. Sub-Step 1", "Level 2. Sub-Step 2", etc.' : ''}
${level === 3 ? 'NOTE: You are generating Level 3 sub-steps (breaking down a Level 2 sub-step into ultra-detailed micro-actions). Label these as "Level 3. Sub-Step 1", "Level 3. Sub-Step 2", etc.' : ''}
${level === 4 ? 'NOTE: You are generating Level 4 sub-steps (breaking down a Level 3 sub-step into the most granular possible actions). Label these as "Level 4. Sub-Step 1", "Level 4. Sub-Step 2", etc.' : ''}`;

    const levelLabel = level === 2 ? 'sub-step' : 
                      level === 3 ? 'Level 2 sub-step' :
                      level === 4 ? 'Level 3 sub-step' : 'step';
    const outputLabel = level === 2 ? 'Level 2 sub-steps' : 
                       level === 3 ? 'Level 3 sub-steps' :
                       level === 4 ? 'Level 4 sub-steps' : 'sub-steps';
    const stepLabel = level === 2 ? 'Sub-Step' :
                     level === 3 ? 'Level 2 Sub-Step' :
                     level === 4 ? 'Level 3 Sub-Step' : 'Step';

    const userPrompt = `I need you to break down a specific ${levelLabel} from an implementation plan into 5 detailed ${outputLabel}.

JUMP OVERVIEW CONTEXT:
${requestData.jumpOverview}

CURRENT PHASE: ${requestData.phaseTitle} (Phase ${requestData.phaseNumber})

${stepLabel.toUpperCase()} TO CLARIFY:
Title: ${requestData.stepTitle}
Description: ${requestData.stepDescription}
${stepLabel} Number: ${requestData.stepNumber}

Your task:
Generate EXACTLY 5 detailed ${outputLabel} that break down the above ${levelLabel} into more manageable, executable actions. Each ${outputLabel.slice(0, -1)} should:
1. Be specific and actionable (not vague or generic)
2. Follow a logical sequence
3. Include clear guidance on HOW to execute it
4. Be slightly shorter in text volume than the original ${level === 2 ? 'sub-step' : 'step'} (concise but complete)
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
