import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudioFormData {
  goals: string;
  challenges: string;
  industry: string;
  aiExperience: string;
  urgency: string;
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

          const stepComponents = [
            { step: 1, type: 'overview', name: 'Overview & Plan' },
            { step: 2, type: 'comprehensive', name: 'Comprehensive Plan' },
            { step: 3, type: 'summary', name: 'Executive Summary' },
            { step: 4, type: 'tool_prompts', name: 'Tools & Prompts' }
          ];

          for (const { step, type, name } of stepComponents) {
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

  // Clean and parse JSON
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.log('Raw content:', content);
    return validateStepResponse(content, step, content);
  }
}

function getStepPrompts(step: number, context: any, overviewContent: string) {
  const baseContext = `
User Goals: ${context.goals}
Challenges: ${context.challenges}
Industry: ${context.industry}
AI Experience: ${context.aiExperience}
Urgency: ${context.urgency}
Budget: ${context.budget}
  `.trim();

  switch (step) {
    case 1:
      // STEP 1: Quick name generation (3-5 seconds)
      return {
        systemPrompt: `You are a creative naming expert. Generate inspiring, memorable names for AI transformation journeys.`,
        userPrompt: `${baseContext}

Create an inspiring, memorable name for this AI transformation journey. The name should be:
- Catchy and motivating
- 3-5 words maximum
- Relevant to their goals and industry
- Professional yet inspiring

Return ONLY valid JSON:
{
  "jumpName": "Inspiring 3-5 word name"
}`,
        expectedTokens: 500
      };
    
    case 2:
      // STEP 2: Comprehensive overview and strategic plan
      return {
        systemPrompt: `You are an AI transformation strategist. Create comprehensive, actionable plans.`,
        userPrompt: `${baseContext}

Create a detailed AI transformation plan with these sections:
1. Executive Summary (3 focused paragraphs about their situation and solution)
2. Situation Analysis with currentState, 3 challenges, 3 opportunities
3. Strategic Vision (clear description of success)
4. 3-Phase Roadmap with timelines and 3 milestones per phase
5. 3 Key Success Factors
6. 3 Risk Mitigation Strategies

Return ONLY valid JSON:
{
  "executiveSummary": "Comprehensive 3-paragraph summary",
  "situationAnalysis": {
    "currentState": "Current situation",
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
  },
  "strategicVision": "Clear success description",
  "roadmap": {
    "phase1": {"name": "Phase name", "timeline": "X weeks", "milestones": ["M1", "M2", "M3"]},
    "phase2": {"name": "Phase name", "timeline": "X weeks", "milestones": ["M1", "M2", "M3"]},
    "phase3": {"name": "Phase name", "timeline": "X weeks", "milestones": ["M1", "M2", "M3"]}
  },
  "successFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "riskMitigation": ["Strategy 1", "Strategy 2", "Strategy 3"]
}`,
        expectedTokens: 8000
      };

    case 3:
      // STEP 3: Detailed implementation plan
      return {
        systemPrompt: `You are an AI implementation strategist. Create detailed, actionable plans.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Create a comprehensive implementation plan with:
1. 3 Implementation Phases (each with name, duration, objectives, and actions)
2. Weekly breakdown for first phase
3. Key milestones and deliverables
4. Success metrics

Return ONLY valid JSON:
{
  "implementationPlan": {
    "phases": [
      {
        "name": "Phase name",
        "duration": "X weeks",
        "objectives": ["Objective 1", "Objective 2"],
        "actions": ["Action 1", "Action 2", "Action 3"],
        "milestones": ["Milestone 1", "Milestone 2"]
      }
    ],
    "weeklyBreakdown": {
      "week1": {"focus": "Focus area", "tasks": ["Task 1", "Task 2"]},
      "week2": {"focus": "Focus area", "tasks": ["Task 1", "Task 2"]}
    },
    "successMetrics": ["Metric 1", "Metric 2", "Metric 3"]
  }
}`,
        expectedTokens: 8000
      };

    case 4:
      // STEP 4: Tools & Prompts (Generate 6 items)
      return {
        systemPrompt: `You are an AI tools and prompt engineering expert. Create powerful tool+prompt combinations that are immediately actionable.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Generate exactly 6 AI tool + prompt combinations. Each combo must be a complete, ready-to-use solution.

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Clear Use Case Title (e.g., 'Content Strategy with ChatGPT')",
      "description": "2-3 sentences explaining how this tool+prompt combo solves their specific challenge and fits into their plan",
      "category": "Content Creation|Marketing|Automation|Data Analysis|Strategy|Planning",
      "tool_name": "ChatGPT|Claude|Gemini|Perplexity|Midjourney|Canva|etc",
      "tool_url": "https://actual-working-url.com",
      "tool_type": "Text Generation|Image Generation|Data Analysis|Automation|Research",
      "prompt_text": "Complete, ready-to-copy prompt (150-250 words). Must be highly specific to their situation, include their industry/goals/challenges, and produce immediate value. Make it copy-paste ready.",
      "prompt_instructions": "Step-by-step guide: 1) Go to [Tool URL] 2) Paste the prompt above 3) Customize [specific field] with your data 4) Review output and iterate. Make it foolproof.",
      "when_to_use": "Explain exactly WHEN in their transformation journey to use this (e.g., 'Use this in Week 2 when defining your content strategy')",
      "why_this_combo": "2-3 sentences explaining WHY this specific tool+prompt combination is perfect for their situation",
      "alternatives": [
        {"tool": "Alternative Tool 1", "url": "https://alt1-url.com", "note": "Brief why this alternative"},
        {"tool": "Alternative Tool 2", "url": "https://alt2-url.com", "note": "Brief why this alternative"}
      ],
      "use_cases": ["Specific use case 1", "Specific use case 2", "Specific use case 3"],
      "tags": ["tag1", "tag2"],
      "difficulty_level": "beginner|intermediate|advanced",
      "setup_time": "5 minutes|15 minutes|30 minutes|1 hour",
      "cost_estimate": "Free|$20/month|$50/month|Custom"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Generate EXACTLY 6 combos
- Each prompt must be 150-250 words and immediately usable
- Include 2 alternatives for each combo
- Make everything specific to their situation
- Focus on immediate, practical value`,
        expectedTokens: 12000
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
