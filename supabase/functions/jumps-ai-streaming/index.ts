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
      // STEP 2: Comprehensive overview
      return {
        systemPrompt: `You are an expert AI strategist. Deeply analyze what the person is trying to achieve to understand their situation, then create a personalized plan.`,
        userPrompt: `Deeply analyze this person's situation:

${baseContext}

CRITICAL INSTRUCTIONS:
1. First, carefully read "What they're trying to achieve" to understand their current role/situation
2. Analyze "What's preventing them" to understand obstacles
3. Create a transformation plan specific to THEIR situation

DO NOT use generic roles or examples. Extract understanding from THEIR input.

Return ONLY valid JSON:
{
  "executiveSummary": "3 paragraphs showing you understand their situation, transformation path for time: ${context.timeCommitment} and budget: ${context.budget}, and success picture",
  "situationAnalysis": {
    "currentState": "What you understand from their goals",
    "challenges": ["From what's preventing them", "Challenge 2", "Challenge 3"],
    "opportunities": ["Relevant to them", "Opportunity 2", "Opportunity 3"]
  },
  "strategicVision": "Success for what they're trying to achieve",
  "roadmap": {
    "phase1": {
      "name": "Phase 1 name",
      "timeline": "Fits ${context.timeCommitment}",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    },
    "phase2": {
      "name": "Phase 2 name", 
      "timeline": "Realistic timeline",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    },
    "phase3": {
      "name": "Phase 3 name",
      "timeline": "Realistic timeline",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"]
    }
  },
  "keyObjectives": ["Objective 1 for them", "Objective 2 for them", "Objective 3 for them"],
  "successMetrics": ["Metric 1", "Metric 2", "Metric 3"],
  "riskAssessment": {
    "risks": ["Risk 1", "Risk 2", "Risk 3"],
    "mitigations": ["Mitigation 1", "Mitigation 2", "Mitigation 3"]
  }
}`,
        expectedTokens: 10000
      };

    case 3:
      // STEP 3: Detailed action plan
      return {
        systemPrompt: `You are an action planning expert. Analyze the person's goals to understand their situation, then create specific action phases.`,
        userPrompt: `Analyze and create action plan:

${baseContext}

Overview Context:
${overviewContent}

INSTRUCTIONS:
1. Understand their situation from what they're trying to achieve
2. Create 3 phases specific to THEIR journey
3. Address what's preventing them
4. Fit their urgency: ${context.timeCommitment} and budget: ${context.budget}

Return ONLY valid JSON:
{
  "phases": [
    {
      "name": "Phase 1: [Based on their situation]",
      "description": "[For what they're trying to achieve]",
      "duration": "[Fits urgency: ${context.timeCommitment}]",
      "objectives": ["For THEM", "For THEM"],
      "actions": ["Action for THEM", "Action for THEM", "Action for THEM"],
      "milestones": ["For THEM", "For THEM"]
    },
    {
      "name": "Phase 2: [Based on their situation]",
      "description": "[For their goals]",
      "duration": "[Fits urgency]",
      "objectives": ["For THEM", "For THEM"],
      "actions": ["For THEM", "For THEM", "For THEM"],
      "milestones": ["For THEM", "For THEM"]
    },
    {
      "name": "Phase 3: [Based on their situation]",
      "description": "[For their goals]",
      "duration": "[Fits urgency]",
      "objectives": ["For THEM", "For THEM"],
      "actions": ["For THEM", "For THEM", "For THEM"],
      "milestones": ["For THEM", "For THEM"]
    }
  ],
  "successMetrics": ["For their goals", "For their goals", "For their goals"]
}`,
        expectedTokens: 3000
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
        expectedTokens: 15000
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
