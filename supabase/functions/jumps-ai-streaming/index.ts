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
            return;
          }
          try {
            const message = `data: ${JSON.stringify({ step, type, data })}\n\n`;
            controller.enqueue(encoder.encode(message));
            console.log(`✓ Sent event: step ${step}, type ${type}`);
          } catch (error) {
            console.error('Error sending event:', error);
            if (!isClosed) {
              isClosed = true;
              try {
                controller.close();
              } catch (e) {
                // Already closed
              }
            }
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

          // Steps 3-8: Generate all components
          const steps = [
            { step: 3, type: 'plan', name: 'Plan' },
            { step: 4, type: 'tools', name: 'Tools' },
            { step: 5, type: 'prompts', name: 'Prompts' },
            { step: 6, type: 'workflows', name: 'Workflows' },
            { step: 7, type: 'blueprints', name: 'Blueprints' },
            { step: 8, type: 'strategies', name: 'Strategies' }
          ];

          for (const { step, type, name } of steps) {
            if (isClosed) break;
            console.log(`Step ${step}: Generating ${name}...`);
            const response = await callXAI(XAI_API_KEY, step, formData, overviewContent);
            console.log(`Step ${step} response:`, response);
            sendEvent(step, type, response);
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
        expectedTokens: 150
      };
    
    case 2:
      // STEP 2: Comprehensive overview and strategic plan
      return {
        systemPrompt: `You are an AI transformation strategist. Create a comprehensive overview and strategic plan.`,
        userPrompt: `${baseContext}

Create a detailed AI transformation plan with:
1. Executive Summary (2-3 paragraphs)
2. Situation Analysis (current state, challenges, opportunities)
3. Strategic Vision (what success looks like)
4. Implementation Roadmap (phases, timeline, milestones)
5. Key Success Factors
6. Risk Mitigation Strategies

Return ONLY valid JSON in this exact format:
{
  "executiveSummary": "2-3 paragraph summary",
  "situationAnalysis": {
    "currentState": "Description of where they are now",
    "challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  },
  "strategicVision": "What success looks like",
  "roadmap": {
    "phase1": {"name": "Phase name", "timeline": "X weeks", "milestones": []},
    "phase2": {"name": "Phase name", "timeline": "X weeks", "milestones": []},
    "phase3": {"name": "Phase name", "timeline": "X weeks", "milestones": []}
  },
  "successFactors": ["Factor 1", "Factor 2"],
  "riskMitigation": ["Strategy 1", "Strategy 2"]
}`,
        expectedTokens: 4000
      };

    case 3:
      // STEP 3: Detailed implementation plan
      return {
        systemPrompt: `You are an AI implementation strategist. Create detailed action plans.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Create a detailed implementation plan with specific actions, timelines, and success metrics.

Return ONLY valid JSON with structured plan data.`,
        expectedTokens: 4000
      };

    case 4:
      return {
        systemPrompt: `You are an AI tools specialist. Recommend specific AI tools based on the overview.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Recommend 4-6 specific AI tools. Return ONLY valid JSON:
{
  "tools": [
    {
      "title": "Tool name",
      "description": "What it does",
      "category": "Category",
      "aiToolType": "Type",
      "useCases": ["Use case 1", "Use case 2"],
      "instructions": "How to use it",
      "tags": ["tag1", "tag2"],
      "difficultyLevel": "beginner|intermediate|advanced",
      "setupTime": "X minutes",
      "integrationComplexity": "low|medium|high",
      "costEstimate": "$X/month or free",
      "features": ["Feature 1", "Feature 2"],
      "limitations": ["Limitation 1", "Limitation 2"]
    }
  ]
}`,
        expectedTokens: 5000
      };

    case 5:
      return {
        systemPrompt: `You are an AI prompt engineering expert. Create powerful prompts.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Create 4-6 ready-to-use AI prompts. Return ONLY valid JSON:
{
  "prompts": [
    {
      "title": "Prompt title",
      "description": "What this prompt achieves",
      "promptText": "The actual prompt text",
      "category": "Category",
      "aiTools": ["Tool 1", "Tool 2"],
      "useCases": ["Use case 1", "Use case 2"],
      "instructions": "How to use this prompt",
      "tags": ["tag1", "tag2"],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "X minutes"
    }
  ]
}`,
        expectedTokens: 6000
      };

    case 6:
      return {
        systemPrompt: `You are a workflow optimization expert. Design AI-powered workflows.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Design 3-5 AI-powered workflows. Return ONLY valid JSON:
{
  "workflows": [
    {
      "title": "Workflow title",
      "description": "What this workflow accomplishes",
      "category": "Category",
      "aiTools": ["Tool 1", "Tool 2"],
      "durationEstimate": "X hours",
      "complexityLevel": "low|medium|high",
      "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
      "expectedOutcomes": ["Outcome 1", "Outcome 2"],
      "instructions": "Detailed steps",
      "tags": ["tag1", "tag2"],
      "toolsNeeded": ["Tool 1", "Tool 2"],
      "skillLevel": "beginner|intermediate|advanced",
      "workflowSteps": [
        {
          "stepNumber": 1,
          "title": "Step title",
          "description": "What to do",
          "aiTool": "Tool name",
          "estimatedTime": "X minutes",
          "deliverable": "What you get"
        }
      ]
    }
  ]
}`,
        expectedTokens: 6500
      };

    case 7:
      return {
        systemPrompt: `You are an AI implementation architect. Create detailed blueprints.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Create 3-5 implementation blueprints. Return ONLY valid JSON:
{
  "blueprints": [
    {
      "title": "Blueprint title",
      "description": "What this blueprint implements",
      "category": "Category",
      "aiTools": ["Tool 1", "Tool 2"],
      "implementationTime": "X weeks",
      "difficultyLevel": "beginner|intermediate|advanced",
      "resourcesNeeded": ["Resource 1", "Resource 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "instructions": "Detailed implementation guide",
      "tags": ["tag1", "tag2"],
      "implementation": "Step-by-step implementation",
      "requirements": ["Requirement 1", "Requirement 2"],
      "toolsUsed": ["Tool 1", "Tool 2"],
      "blueprintContent": {
        "phases": [
          {
            "phase": 1,
            "name": "Phase name",
            "duration": "X weeks",
            "objectives": ["Objective 1", "Objective 2"],
            "tasks": ["Task 1", "Task 2"],
            "milestones": ["Milestone 1", "Milestone 2"]
          }
        ]
      }
    }
  ]
}`,
        expectedTokens: 7000
      };

    case 8:
      return {
        systemPrompt: `You are a strategic AI advisor. Develop comprehensive strategies.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Develop 3-5 strategic initiatives. Return ONLY valid JSON:
{
  "strategies": [
    {
      "title": "Strategy title",
      "description": "What this strategy achieves",
      "category": "Category",
      "aiTools": ["Tool 1", "Tool 2"],
      "timeline": "X months",
      "successMetrics": ["Metric 1", "Metric 2"],
      "keyActions": ["Action 1", "Action 2"],
      "potentialChallenges": ["Challenge 1", "Challenge 2"],
      "mitigationStrategies": ["Strategy 1", "Strategy 2"],
      "instructions": "How to execute",
      "tags": ["tag1", "tag2"],
      "priorityLevel": "low|medium|high",
      "resourceRequirements": ["Resource 1", "Resource 2"],
      "strategyFramework": {
        "vision": "Strategic vision",
        "objectives": ["Objective 1", "Objective 2"],
        "initiatives": [
          {
            "name": "Initiative name",
            "description": "What it does",
            "timeline": "X months",
            "kpis": ["KPI 1", "KPI 2"]
          }
        ]
      }
    }
  ]
}`,
        expectedTokens: 7000
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
    4: { tools: [] },
    5: { prompts: [] },
    6: { workflows: [] },
    7: { blueprints: [] },
    8: { strategies: [] }
  };

  return fallbacks[step] || {};
}
