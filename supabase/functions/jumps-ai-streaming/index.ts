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

    const formData: StudioFormData = await req.json();
    console.log('Starting streaming generation for:', formData);

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
  // Map form fields correctly to prompt context
  const baseContext = `
Current Role: ${context.currentRole || 'Not specified'}
Industry: ${context.industry || 'Not specified'}
Experience Level: ${context.experienceLevel || 'Not specified'}
AI Knowledge: ${context.aiKnowledge || 'Not specified'}
Goals & Aspirations: ${context.goals || 'Not specified'}
Challenges & Obstacles: ${context.challenges || 'Not specified'}
Time Commitment: ${context.timeCommitment || 'Not specified'}
Budget: ${context.budget || 'Not specified'}
  `.trim();

  switch (step) {
    case 1:
      // STEP 1: Quick name generation (3-5 seconds)
      return {
        systemPrompt: `You are a creative naming expert specializing in personal transformation and AI-powered career development. Generate inspiring, memorable names that resonate with the user's unique situation.`,
        userPrompt: `Based on this person's profile, create an inspiring name for their AI transformation journey:

${baseContext}

The name should:
- Directly reflect their specific goals and current role
- Be motivating and action-oriented
- Be 3-5 words maximum
- Sound professional yet inspiring

Return ONLY valid JSON:
{
  "jumpName": "Inspiring 3-5 word name based on THEIR actual goals and role"
}`,
        expectedTokens: 500
      };
    
    case 2:
      // STEP 2: Comprehensive overview and strategic plan
      return {
        systemPrompt: `You are an expert AI transformation strategist. Create deeply personalized, actionable transformation plans based ONLY on the user's actual input. Use their exact words and context.`,
        userPrompt: `Create a detailed AI transformation overview for this specific person. Use THEIR actual details:

${baseContext}

CRITICAL: Reference their ACTUAL role (${context.currentRole}), ACTUAL goals (${context.goals}), ACTUAL challenges (${context.challenges}), ACTUAL time (${context.timeCommitment}), and ACTUAL budget (${context.budget}) throughout your response.

Create these sections:

1. Executive Summary (3 focused paragraphs):
   - Paragraph 1: Acknowledge THEIR current situation with empathy (reference their role: ${context.currentRole})
   - Paragraph 2: Present a transformation path given THEIR constraints (time: ${context.timeCommitment}, budget: ${context.budget})
   - Paragraph 3: Paint success picture FOR THEM based on THEIR goals: ${context.goals}

2. Situation Analysis:
   - Current State: Describe THEIR situation (role: ${context.currentRole}, industry: ${context.industry}, AI level: ${context.aiKnowledge})
   - Challenges: 3 challenges from THEIR input: ${context.challenges}
   - Opportunities: 3 opportunities for THEIR context

3. Strategic Vision:
   - Success description FOR THEM addressing: ${context.goals}
   - Realistic given: ${context.timeCommitment} and ${context.budget}

4. 3-Phase Roadmap (fit ${context.timeCommitment}):
   - Each phase: name, timeline, 3 milestones
   - Must align with THEIR time and budget

5. Success Factors: 3 factors for THEIR situation

6. Risk Mitigation: 3 strategies for THEIR challenges: ${context.challenges}

Return ONLY valid JSON:
{
  "executiveSummary": "3 paragraphs with THEIR specifics",
  "situationAnalysis": {
    "currentState": "THEIR actual situation",
    "challenges": ["From their input", "From their input", "From their input"],
    "opportunities": ["For their context", "For their context", "For their context"]
  },
  "strategicVision": "Success for THEM",
  "roadmap": {
    "phase1": {"name": "Phase name", "timeline": "Fits their time", "milestones": ["M1", "M2", "M3"]},
    "phase2": {"name": "Phase name", "timeline": "Fits their time", "milestones": ["M1", "M2", "M3"]},
    "phase3": {"name": "Phase name", "timeline": "Fits their time", "milestones": ["M1", "M2", "M3"]}
  },
  "successFactors": ["For them", "For them", "For them"],
  "riskMitigation": ["For their challenges", "For their challenges", "For their challenges"]
}`,
        expectedTokens: 10000
      };

    case 3:
      // STEP 3: Detailed strategic action plan
      return {
        systemPrompt: `You are an expert AI transformation strategist. Create action plans based on the user's ACTUAL input. Return ONLY valid JSON.`,
        userPrompt: `Create a 3-phase strategic plan for THIS person using THEIR actual details:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL: Make phases specific to:
- THEIR Role: ${context.currentRole}
- THEIR Goals: ${context.goals}
- THEIR Time: ${context.timeCommitment}
- THEIR Budget: ${context.budget}
- THEIR AI Level: ${context.aiKnowledge}

Each phase must be actionable for THEIR specific situation.

Return ONLY valid JSON:
{
  "phases": [
    {
      "name": "Phase 1: [Relevant to their role]",
      "description": "[Specific to their goals]",
      "duration": "[Realistic for their time: ${context.timeCommitment}]",
      "objectives": ["Objective for THEM", "Objective for THEM"],
      "actions": ["Action for THEM", "Action for THEM", "Action for THEM"],
      "milestones": ["Milestone for THEM", "Milestone for THEM"]
    },
    {
      "name": "Phase 2: [Relevant to their role]",
      "description": "[Specific to their goals]",
      "duration": "[Realistic for their time]",
      "objectives": ["Objective for THEM", "Objective for THEM"],
      "actions": ["Action for THEM", "Action for THEM", "Action for THEM"],
      "milestones": ["Milestone for THEM", "Milestone for THEM"]
    },
    {
      "name": "Phase 3: [Relevant to their role]",
      "description": "[Specific to their goals]",
      "duration": "[Realistic for their time]",
      "objectives": ["Objective for THEM", "Objective for THEM"],
      "actions": ["Action for THEM", "Action for THEM", "Action for THEM"],
      "milestones": ["Milestone for THEM", "Milestone for THEM"]
    }
  ],
  "successMetrics": ["Metric for their goals", "Metric for their goals", "Metric for their goals"]
}`,
        expectedTokens: 3000
      };

    case 4:
      // STEP 4: Tools & Prompts (Generate 6 items)
      return {
        systemPrompt: `You are an expert AI tools specialist. Create tool+prompt combinations based ONLY on the user's ACTUAL input. Reference their exact role, goals, challenges, and constraints.`,
        userPrompt: `Generate 6 AI tool+prompt combinations for THIS specific person:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL: Every combo must be tailored to:
- THEIR Role: ${context.currentRole}
- THEIR Industry: ${context.industry}
- THEIR Goals: ${context.goals}
- THEIR Challenges: ${context.challenges}
- THEIR Budget: ${context.budget}
- THEIR AI Level: ${context.aiKnowledge}
- THEIR Time: ${context.timeCommitment}

Each tool+prompt must:
1. Address THEIR specific goals (${context.goals})
2. Solve THEIR challenges (${context.challenges})
3. Fit THEIR budget (${context.budget})
4. Match THEIR AI level (${context.aiKnowledge})
5. Work with THEIR time (${context.timeCommitment})

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Use Case for ${context.currentRole}",
      "description": "How this solves THEIR challenge: ${context.challenges}",
      "category": "Content Creation|Marketing|Automation|Data Analysis|Strategy|Planning",
      "tool_name": "ChatGPT|Claude|Gemini|Perplexity|etc",
      "tool_url": "https://actual-url.com",
      "tool_type": "Text Generation|Image Generation|Data Analysis|etc",
      "prompt_text": "Ready-to-copy prompt (200-300 words) specifically for ${context.currentRole} working on ${context.goals}. Reference THEIR industry: ${context.industry}. Address THEIR challenge: ${context.challenges}.",
      "prompt_instructions": "Step-by-step for THEIR use case",
      "when_to_use": "When in THEIR journey (reference phases from plan)",
      "why_this_combo": "Why perfect for THEIR situation",
      "alternatives": [
        {"tool": "Alt 1", "url": "https://url.com", "note": "Why for them"},
        {"tool": "Alt 2", "url": "https://url.com", "note": "Why for them"}
      ],
      "use_cases": ["For their role", "For their goal", "For their challenge"],
      "tags": ["relevant-tag1", "relevant-tag2"],
      "difficulty_level": "Match ${context.aiKnowledge}",
      "setup_time": "Realistic for ${context.timeCommitment}",
      "cost_estimate": "Within ${context.budget}"
    }
  ]
}

Generate EXACTLY 6 combos. Each must feel hand-picked for THEIR specific situation.`,
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
