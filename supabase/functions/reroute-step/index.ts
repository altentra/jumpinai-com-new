const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jumpOverview, phaseTitle, phaseNumber, stepTitle, stepDescription, stepNumber } = await req.json();

    console.log('Reroute Step - Generating alternative routes for:', { phaseTitle, stepTitle });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert AI assistant helping users find alternative approaches to achieve their goals. 
Your task is to generate 3 completely different but viable alternative directions for a specific step in their plan.

Each direction should:
1. Offer a unique approach or perspective
2. Be practical and actionable
3. Include 3 detailed sub-steps with comprehensive descriptions
4. Maintain similar scope and effort as the original step

IMPORTANT: Each sub-step description should be substantial and detailed - approximately half to two-thirds the length of the original step's description. Provide clear, actionable guidance with specific examples and context.`;

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
- Include specific, clear sub-steps with substantial descriptions (each sub-step description should be approximately half to two-thirds the length of the original step description)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_alternative_routes',
              description: 'Generate 3 alternative approaches with sub-steps',
              parameters: {
                type: 'object',
                properties: {
                  directions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        direction_number: {
                          type: 'integer',
                          description: 'The direction number (1, 2, or 3)'
                        },
                        overview: {
                          type: 'string',
                          description: 'Brief overview of this direction and why it is valuable (2-3 sentences)'
                        },
                        sub_steps: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              sub_step_number: {
                                type: 'integer',
                                description: 'The sub-step number'
                              },
                              title: {
                                type: 'string',
                                description: 'Clear, actionable title'
                              },
                              description: {
                                type: 'string',
                                description: 'Detailed, comprehensive description with specific guidance, examples, and actionable steps. Should be substantial - aim for half to two-thirds the length of the original step description.'
                              },
                              estimated_time: {
                                type: 'string',
                                description: 'Time estimate (e.g., "30 minutes", "2 hours")'
                              }
                            },
                            required: ['sub_step_number', 'title', 'description', 'estimated_time'],
                            additionalProperties: false
                          },
                          minItems: 3,
                          maxItems: 3
                        }
                      },
                      required: ['direction_number', 'overview', 'sub_steps'],
                      additionalProperties: false
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ['directions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_alternative_routes' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');
    
    // Extract structured output from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_alternative_routes') {
      console.error('Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from AI');
    }

    const parsedContent = JSON.parse(toolCall.function.arguments);
    
    // Validate structure
    if (!parsedContent.directions || !Array.isArray(parsedContent.directions) || parsedContent.directions.length !== 3) {
      console.error('Invalid directions structure:', parsedContent);
      throw new Error('Invalid response structure from AI');
    }

    console.log('Successfully generated', parsedContent.directions.length, 'alternative routes');

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
