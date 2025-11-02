import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const xaiApiKey = Deno.env.get('XAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jumpOverview, phaseTitle, phaseNumber, stepTitle, stepDescription, stepNumber } = await req.json();

    console.log('Reroute Step - Generating alternative routes for:', { phaseTitle, stepTitle });

    const systemPrompt = `You are an expert AI assistant helping users find alternative approaches to achieve their goals. 
Your task is to generate 3 completely different but viable alternative directions for a specific step in their plan.

Each direction should:
1. Offer a unique approach or perspective
2. Be practical and actionable
3. Include 3 detailed sub-steps with comprehensive descriptions
4. Maintain similar scope and effort as the original step

IMPORTANT: Each sub-step description should be substantial and detailed - approximately half to two-thirds the length of the original step's description. Provide clear, actionable guidance with specific examples and context.

Format your response as valid JSON with this exact structure:
{
  "directions": [
    {
      "direction_number": 1,
      "overview": "Brief overview of this direction and why it's valuable (2-3 sentences)",
      "sub_steps": [
        {
          "sub_step_number": 1,
          "title": "Clear, actionable title",
          "description": "Detailed, comprehensive description with specific guidance, examples, and actionable steps. This should be substantial - aim for half to two-thirds the length of the original step description.",
          "estimated_time": "Time estimate (e.g., '30 minutes', '2 hours')"
        }
      ]
    }
  ]
}`;

    const userPrompt = `Context:
Jump Overview: ${jumpOverview}
Phase ${phaseNumber}: ${phaseTitle}

Current Step (Step ${stepNumber}):
Title: ${stepTitle}
Description: ${stepDescription}

Generate 3 completely different alternative approaches/directions to accomplish this step. Each direction should have a unique perspective and include 3 detailed sub-steps.

Make each direction:
- Distinctly different from the others
- Practical and actionable
- Similar in scope to the original step
- Include specific, clear sub-steps with substantial descriptions (each sub-step description should be approximately half to two-thirds the length of the original step description)

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw xAI response:', content);
    
    // Parse the JSON response
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsedContent.directions || !Array.isArray(parsedContent.directions) || parsedContent.directions.length !== 3) {
      console.error('Invalid response structure:', parsedContent);
      throw new Error('Invalid response structure from AI');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reroute-step function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
