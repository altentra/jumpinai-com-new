import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudioFormData {
  currentRole: string;
  industry: string;
  experienceLevel: string;
  aiKnowledge: string;
  goals: string;
  challenges: string;
  timeCommitment: string;
  budget: string;
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

    // CRITICAL FIX: Frontend sends { formData: {...} }, so we need to destructure
    const { formData }: { formData: StudioFormData } = await req.json();
    console.log('Starting streaming generation for:', { formData });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        
        // Helper to safely send SSE event
        const sendEvent = (step: number, type: string, data: any) => {
          if (isClosed) {
            console.log(`Skipping event (stream closed): step ${step}, type ${type}`);
            return false;
          }
          try {
            const message = `data: ${JSON.stringify({ step, type, data })}\n\n`;
            controller.enqueue(encoder.encode(message));
            console.log(`✓ Sent event: step ${step}, type ${type}`);
            return true;
          } catch (error) {
            console.error('Error sending event:', error);
            // Don't mark as closed - this might be a temporary issue
            return false;
          }
        };

        try {
          // Step 1: Generate JUST the name (quick, 3-5 seconds)
          console.log('Step 1: Generating jump name...');
          const namingResponse = await callXAI(XAI_API_KEY, 1, formData, '');
          console.log('Naming response:', namingResponse);
          sendEvent(1, 'naming', namingResponse);
          
          // Step 2: Generate Overview & Plan
          console.log('Step 2: Generating overview...');
          const overviewResponse = await callXAI(XAI_API_KEY, 2, formData, '');
          console.log('Overview response:', overviewResponse);
          sendEvent(2, 'overview', overviewResponse);
          
          const overviewContent = typeof overviewResponse === 'string' 
            ? overviewResponse 
            : JSON.stringify(overviewResponse);

          // Remaining steps (3 and 4 only - naming and overview already done)
          const remainingSteps = [
            { step: 3, type: 'comprehensive', name: 'Comprehensive Plan' },
            { step: 4, type: 'tool_prompts', name: 'Tools & Prompts' }
          ];

          for (const { step, type, name } of remainingSteps) {
            try {
              console.log(`Step ${step}: Generating ${name}...`);
              const response = await callXAI(XAI_API_KEY, step, formData, overviewContent);
              console.log(`Step ${step} response:`, response);
              
              // Try to send the event
              const sent = sendEvent(step, type, response);
              if (!sent) {
                console.error(`Failed to send step ${step}, attempting to continue...`);
                // Wait a bit and try to continue anyway
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (stepError) {
              console.error(`Error in step ${step}:`, stepError);
              // Try to send error event, then continue
              sendEvent(step, 'error', { message: `Step ${step} failed: ${stepError.message}` });
            }
          }

          // Send completion event
          if (!isClosed) {
            console.log('Sending completion event...');
            sendEvent(9, 'complete', { message: 'Generation complete' });
          }

        } catch (error) {
          console.error('Generation error:', error);
          if (!isClosed) {
            sendEvent(-1, 'error', { message: error.message });
          }
        } finally {
          // Always close the stream at the end
          if (!isClosed) {
            try {
              controller.close();
              isClosed = true;
            } catch (e) {
              console.error('Error closing stream:', e);
            }
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function callXAI(
  apiKey: string,
  step: number,
  context: StudioFormData,
  overviewContent: string
): Promise<any> {
  const { systemPrompt, userPrompt, expectedTokens } = getStepPrompts(step, context, overviewContent);
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: expectedTokens,
        stream: false, // Ensure non-streaming for simpler response handling
      }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`xAI API error (step ${step}):`, response.status, errorText);
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in API response');
  }

  // Clean and parse JSON more aggressively
  content = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^[^{[]*/, '') // Remove any text before first { or [
    .replace(/[^}\]]*$/, '') // Remove any text after last } or ]
    .trim();
  
  try {
    const parsed = JSON.parse(content);
    console.log(`Step ${step} parsed successfully:`, JSON.stringify(parsed).substring(0, 200));
    return parsed;
  } catch (parseError) {
    console.error(`JSON parse error for step ${step}:`, parseError);
    console.log('Failed content preview:', content.substring(0, 500));
    
    // Try to extract JSON object from text
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        console.log(`Step ${step} extracted and parsed successfully`);
        return extracted;
      } catch (e) {
        console.error('Extraction also failed:', e);
      }
    }
    
    return validateStepResponse(content, step, content);
  }
}

function getStepPrompts(step: number, context: StudioFormData, overviewContent: string) {
  // Build context from user input - NO hardcoded role
  const baseContext = `
What they're trying to achieve: ${context.goals || 'Not specified'}
What's preventing them: ${context.challenges || 'Not specified'}
Industry: ${context.industry || 'Not specified'}
AI Experience: ${context.aiKnowledge || 'Not specified'}
Urgency: ${context.timeCommitment || 'Not specified'}
Budget: ${context.budget || 'Not specified'}
  `.trim();

  switch (step) {
    case 1:
      // STEP 1: Quick name generation
      return {
        systemPrompt: `You are a creative naming expert. First ANALYZE what the person is trying to achieve to understand their situation, then create an inspiring journey name.`,
        userPrompt: `Read what this person is trying to achieve and understand their situation:

${baseContext}

Steps:
1. Analyze their goals to understand their current role/situation
2. Identify what transformation they're seeking
3. Create an inspiring 3-5 word name that captures their journey

Return ONLY valid JSON:
{
  "jumpName": "3-5 word name reflecting THEIR specific transformation"
}`,
        expectedTokens: 500
      };
    
    case 2:
      // STEP 2: Strategic Overview - CONCISE & HIGH-IMPACT
      return {
        systemPrompt: `You are a senior strategy consultant known for clarity and precision. Provide sharp, actionable insights with zero fluff. Every word must add value. Focus on QUALITY over quantity.`,
        userPrompt: `Analyze this person's transformation journey with laser focus:

${baseContext}

CRITICAL: Be CONCISE and IMPACTFUL. No verbose explanations. Focus on key insights.

Return ONLY valid JSON:
{
  "executiveSummary": "Write 2-3 crisp paragraphs (80-120 words total). Para 1: Their current situation and transformation goal. Para 2: Core challenges and why they matter. Para 3: Path to success with timeline: ${context.timeCommitment} and budget: ${context.budget}. Be direct and specific.",
  
  "situationAnalysis": {
    "currentState": "2-3 sharp sentences capturing their current position and what's driving change",
    "challenges": [
      "Top challenge with specific impact (1 concise sentence)",
      "Second critical barrier (1 concise sentence)",
      "Third key obstacle (1 concise sentence)"
    ],
    "opportunities": [
      "Major opportunity they can leverage (1 concise sentence)",
      "Second key advantage (1 concise sentence)",  
      "Third strategic opportunity (1 concise sentence)"
    ]
  },
  
  "strategicVision": "2 focused paragraphs (60-80 words) painting clear picture of success. Include specific outcomes, lifestyle changes, and measurable impact. Be concrete and inspiring.",
  
  "keyObjectives": [
    "Primary objective with clear outcome (1 concise sentence)",
    "Second key objective (1 concise sentence)",
    "Third strategic objective (1 concise sentence)",
    "Fourth important goal (1 concise sentence)"
  ],
  
  "successMetrics": [
    "KPI 1: Specific metric with target (e.g., 'Generate $5K/month by month 3')",
    "KPI 2: Another measurable goal with timeline",
    "KPI 3: Third quantifiable metric",
    "KPI 4: Fourth success indicator"
  ],
  
  "riskAssessment": {
    "risks": [
      "Top risk with impact (1 concise sentence)",
      "Second major risk (1 concise sentence)",
      "Third key risk (1 concise sentence)"
    ],
    "mitigations": [
      "Strategy to address risk 1 (1 action-focused sentence)",
      "Strategy to address risk 2 (1 action-focused sentence)",
      "Strategy to address risk 3 (1 action-focused sentence)"
    ]
  }
}

REMEMBER: CONCISE, SHARP, ACTIONABLE. One sentence per bullet. Short paragraphs. Maximum clarity and impact.`,
        expectedTokens: 3000
      };

    case 3:
      // STEP 3: Action Plan - FOCUSED & ACTIONABLE
      return {
        systemPrompt: `You are an execution expert. Create clear, actionable implementation plans. Be specific about steps, but concise in explanation. Focus on WHAT to do and HOW to measure success.`,
        userPrompt: `Create a focused action plan:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL: Keep it actionable and scannable. Clear steps, not lengthy explanations.

Return ONLY valid JSON:
{
  "phases": [
    {
      "name": "Phase 1: [Clear name for foundation phase]",
      "description": "2-3 sharp sentences: what's achieved, why it's the starting point, expected outcomes.",
      "duration": "Specific timeline (e.g., 'Weeks 1-4: 10 hrs/week')",
      "objectives": [
        "Clear objective 1 (1 sentence)",
        "Clear objective 2 (1 sentence)",
        "Clear objective 3 (1 sentence)"
        "Objective 4: Additional objective specific to their transformation",
        "Objective 5: Extra objective for thorough planning"
      ],
      "actions": [
        "Specific action 1: what + how (1-2 sentences max)",
        "Specific action 2 (1-2 sentences max)",
        "Specific action 3 (1-2 sentences max)",
        "Specific action 4 (1-2 sentences max)",
        "Specific action 5 (1-2 sentences max)"
      ],
      "milestones": [
        "Measurable milestone 1 with metric",
        "Measurable milestone 2 with metric",
        "Measurable milestone 3 with metric"
      ]
    },
    {
      "name": "Phase 2: [Clear name for growth phase]",
      "description": "2-3 sentences: builds on Phase 1, new capabilities, outcomes.",
      "duration": "Specific timeline",
      "objectives": [
        "Clear objective 1 (1 sentence)",
        "Clear objective 2 (1 sentence)",
        "Clear objective 3 (1 sentence)"
      ],
      "actions": [
        "Specific action 1 (1-2 sentences max)",
        "Specific action 2 (1-2 sentences max)",
        "Specific action 3 (1-2 sentences max)",
        "Specific action 4 (1-2 sentences max)",
        "Specific action 5 (1-2 sentences max)"
      ],
      "milestones": [
        "Measurable milestone 1 with metric",
        "Measurable milestone 2 with metric",
        "Measurable milestone 3 with metric"
      ]
    },
    {
      "name": "Phase 3: [Clear name for mastery phase]",
      "description": "2-3 sentences: achieves ultimate goal, scale/mastery, sustainability.",
      "duration": "Specific timeline with end state",
      "objectives": [
        "Clear objective 1 (1 sentence)",
        "Clear objective 2 (1 sentence)",
        "Clear objective 3 (1 sentence)"
      ],
      "actions": [
        "Specific action 1 (1-2 sentences max)",
        "Specific action 2 (1-2 sentences max)",
        "Specific action 3 (1-2 sentences max)",
        "Specific action 4 (1-2 sentences max)",
        "Specific action 5 (1-2 sentences max)"
      ],
      "milestones": [
        "Major milestone 1 with clear metric",
        "Major milestone 2 with clear metric",
        "Final milestone with success proof"
      ]
    }
  ],
  "successMetrics": [
    "KPI 1: Specific metric with target",
    "KPI 2: Another metric with target",
    "KPI 3: Third metric with target"
  ]
}

REMEMBER: CONCISE and ACTIONABLE. One sentence per item. Clear metrics. No fluff.`,
        expectedTokens: 4000
      };

    case 4:
      // STEP 4: Tools & Prompts
      return {
        systemPrompt: `You are an AI tools specialist. Analyze what the person is trying to achieve to understand their situation, then create tailored tool+prompt combos.`,
        userPrompt: `Create 6 tool+prompt combinations:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL INSTRUCTIONS:
1. Understand their situation from what they're trying to achieve
2. Each combo must solve what's preventing them
3. Fit their budget: ${context.budget}
4. Match AI experience: ${context.aiKnowledge}
5. Work with urgency: ${context.timeCommitment}

DO NOT use generic roles. Tailor to THEIR specific situation.

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Use case for their situation",
      "description": "How this helps them achieve their goals and overcome obstacles",
      "category": "Relevant category",
      "tool_name": "Specific tool",
      "tool_url": "https://url.com",
      "tool_type": "Tool type",
      "prompt_text": "200-300 word ready-to-copy prompt tailored to what they're trying to achieve. Reference what's preventing them. Include industry: ${context.industry}.",
      "prompt_instructions": "Steps for THEIR use case",
      "when_to_use": "When in their journey",
      "why_this_combo": "Why perfect for their situation",
      "alternatives": [
        {"tool": "Alt", "url": "url", "note": "Why for them"},
        {"tool": "Alt", "url": "url", "note": "Why for them"}
      ],
      "use_cases": ["For their situation", "For their goal", "For their challenge"],
      "tags": ["relevant-tags"],
      "difficulty_level": "${context.aiKnowledge}",
      "setup_time": "Fits ${context.timeCommitment}",
      "cost_estimate": "Within ${context.budget}"
    }
  ]
}

Generate EXACTLY 6 combos tailored to THEIR input.`,
        expectedTokens: 25000
      };

    default:
      throw new Error(`Invalid step: ${step}`);
  }
}

function validateStepResponse(content: any, step: number, rawContent: string): any {
  // If content is already an object, return it
  if (typeof content === 'object' && content !== null) {
    return content;
  }

  // Fallback responses
  const fallbacks: Record<number, any> = {
    1: { jumpName: "AI Transformation Journey" },
    2: {
      executiveSummary: rawContent.slice(0, 500),
      situationAnalysis: { currentState: "Starting AI journey", challenges: [], opportunities: [] },
      strategicVision: "Success through AI",
      roadmap: {},
      successFactors: [],
      riskMitigation: []
    },
    3: { structuredPlan: {} },
    4: { tools: [] }
  };

  return fallbacks[step] || {};
}
