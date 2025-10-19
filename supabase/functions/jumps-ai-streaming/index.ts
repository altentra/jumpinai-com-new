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
        userPrompt: `${baseContext}

Create an inspiring, memorable name for this AI transformation journey. The name should:
- Be deeply relevant to their specific goals, current role, and aspirations
- Capture their unique situation and desired transformation
- Be motivating and action-oriented
- Be 3-5 words maximum
- Sound professional yet inspiring and personal

Consider their industry, experience level, challenges, and what they want to achieve. Make it feel tailored to THEM.

Return ONLY valid JSON:
{
  "jumpName": "Inspiring 3-5 word name"
}`,
        expectedTokens: 500
      };
    
    case 2:
      // STEP 2: Comprehensive overview and strategic plan
      return {
        systemPrompt: `You are an expert AI transformation strategist and career development coach. Create deeply personalized, actionable transformation plans that address the user's specific situation, constraints, and aspirations.`,
        userPrompt: `${baseContext}

Create a detailed, highly personalized AI transformation overview that speaks directly to THIS person's situation. Be specific about their current role, challenges, goals, time availability, and budget constraints.

CRITICAL: Make this feel like it was written specifically for them by analyzing:
- Their current role and what it tells you about their daily work
- Their specific goals and what they're trying to achieve
- Their real challenges (money, time, knowledge gaps)
- Their industry context and opportunities
- Their AI knowledge level and where they need to start

Create these sections:

1. Executive Summary (3 focused paragraphs):
   - Paragraph 1: Acknowledge their current situation with empathy and specificity
   - Paragraph 2: Present a realistic, achievable transformation path given their constraints
   - Paragraph 3: Paint a compelling picture of their success and what it means for them

2. Situation Analysis:
   - Current State: Describe their ACTUAL current situation (role, skills, constraints)
   - Challenges: List 3 SPECIFIC challenges relevant to their situation
   - Opportunities: List 3 SPECIFIC opportunities they can leverage in their context

3. Strategic Vision:
   - A clear, inspiring description of what success looks like FOR THEM
   - Must be realistic given their time commitment and budget
   - Should address their specific goals

4. 3-Phase Roadmap (must fit their time commitment):
   - Each phase: name, realistic timeline, 3 specific milestones
   - Phase 1: Quick wins and foundation (fits their schedule)
   - Phase 2: Skill building and implementation (realistic pace)
   - Phase 3: Advanced application and results (achievable outcomes)

5. Success Factors: 3 factors critical for THEIR specific situation

6. Risk Mitigation: 3 strategies addressing THEIR specific challenges

Return ONLY valid JSON:
{
  "executiveSummary": "3 paragraphs addressing their specific situation",
  "situationAnalysis": {
    "currentState": "Their actual current situation",
    "challenges": ["Specific challenge 1", "Specific challenge 2", "Specific challenge 3"],
    "opportunities": ["Specific opportunity 1", "Specific opportunity 2", "Specific opportunity 3"]
  },
  "strategicVision": "Their specific success description",
  "roadmap": {
    "phase1": {"name": "Phase name", "timeline": "Realistic weeks/months", "milestones": ["M1", "M2", "M3"]},
    "phase2": {"name": "Phase name", "timeline": "Realistic weeks/months", "milestones": ["M1", "M2", "M3"]},
    "phase3": {"name": "Phase name", "timeline": "Realistic weeks/months", "milestones": ["M1", "M2", "M3"]}
  },
  "successFactors": ["Factor 1 for their situation", "Factor 2 for their situation", "Factor 3 for their situation"],
  "riskMitigation": ["Strategy 1 for their challenges", "Strategy 2 for their challenges", "Strategy 3 for their challenges"]
}`,
        expectedTokens: 10000
      };

    case 3:
      // STEP 3: Detailed strategic action plan
      return {
        systemPrompt: `You are an expert AI transformation strategist creating detailed, step-by-step action plans. Focus on practical, achievable actions that fit the user's constraints and maximize their chances of success.`,
        userPrompt: `${baseContext}

Overview Context (use this to ensure consistency):
${overviewContent}

Create a highly detailed, actionable strategic plan that this person can actually follow given their time commitment and budget. Be SPECIFIC and PRACTICAL.

For each of the 3 phases, provide:

1. Phase Information:
   - Clear name and description
   - Realistic duration based on their time commitment
   - 2-3 specific objectives
   - 3-5 concrete actions with descriptions
   - 2-3 milestones with success criteria

2. Weekly Breakdown for FIRST PHASE ONLY:
   - Break down the first 4-8 weeks (depending on their time commitment)
   - Each week: specific focus area and 2-3 actionable tasks
   - Tasks should be doable in their available time

3. Success Metrics:
   - 5-7 specific, measurable metrics they can track
   - Must be relevant to their goals and achievable

CRITICAL: Everything must align with:
- Their available time (${context.timeCommitment})
- Their budget constraints (${context.budget})
- Their current AI knowledge level (${context.aiKnowledge})
- Their specific goals and challenges

Return ONLY valid JSON:
{
  "phases": [
    {
      "name": "Phase name",
      "description": "What this phase accomplishes",
      "duration": "Realistic duration",
      "objectives": ["Specific objective 1", "Specific objective 2"],
      "actions": ["Concrete action 1", "Concrete action 2", "Concrete action 3"],
      "milestones": ["Measurable milestone 1", "Measurable milestone 2"]
    }
  ],
  "weeklyBreakdown": {
    "week1": {"focus": "Specific focus", "tasks": ["Task 1", "Task 2"]},
    "week2": {"focus": "Specific focus", "tasks": ["Task 1", "Task 2"]}
  },
  "successMetrics": ["Metric 1", "Metric 2", "Metric 3", "Metric 4", "Metric 5"]
}`,
        expectedTokens: 10000
      };

    case 4:
      // STEP 4: Tools & Prompts (Generate 6 items)
      return {
        systemPrompt: `You are an expert AI tools and prompt engineering specialist. Create powerful, personalized tool+prompt combinations that are immediately actionable and specifically tailored to the user's situation, goals, and constraints.`,
        userPrompt: `${baseContext}

Overview Context:
${overviewContent}

Generate exactly 6 AI tool + prompt combinations that are PERFECT for this person's specific situation. Each must:
- Address their specific goals and challenges
- Fit their budget constraints (${context.budget})
- Match their AI knowledge level (${context.aiKnowledge})
- Work with their time commitment (${context.timeCommitment})
- Be immediately actionable and practical

CRITICAL: Make each tool+prompt combo feel personally selected FOR THEM based on:
- Their current role and industry
- Their specific transformation goals
- Their real constraints (time, money, knowledge)
- The phases and actions in the strategic plan above

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
- Generate EXACTLY 6 combos that feel hand-picked for THIS person
- Each prompt must be 200-300 words, highly specific, and copy-paste ready
- Prompts must reference their specific situation, goals, and challenges
- Include 2 relevant alternatives for each combo
- Tool selection must match their budget and knowledge level
- Everything must be immediately actionable and practical
- Focus on tools and prompts that will help them achieve their stated goals`,
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
