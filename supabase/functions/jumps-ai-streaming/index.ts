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
      // STEP 2: Comprehensive overview - SIGNIFICANTLY ENHANCED FOR DEPTH
      return {
        systemPrompt: `You are a senior AI transformation strategist with 15+ years of experience. Your role is to provide COMPREHENSIVE, DETAILED strategic analysis. Every section must be thorough, specific, and actionable. Provide professional-grade depth.`,
        userPrompt: `Conduct a COMPREHENSIVE strategic analysis of this person's situation:

${baseContext}

CRITICAL REQUIREMENTS FOR MAXIMUM DETAIL:

1. DEEPLY analyze their current situation, goals, and barriers
2. Provide EXTENSIVE detail in every section - this is a professional strategic document
3. Be SPECIFIC with examples, timelines, and actionable insights
4. Make it rich, detailed, and valuable - NOT superficial

Return ONLY valid JSON with EXTENSIVE DETAIL:
{
  "executiveSummary": "Write 5-7 COMPREHENSIVE paragraphs (minimum 250 words total). Paragraph 1: Deep analysis of their current situation and what drives their desire for change. Paragraph 2: Detailed breakdown of their specific challenges and how they interconnect. Paragraph 3: Thorough explanation of transformation path tailored to time: ${context.timeCommitment} and budget: ${context.budget}. Paragraph 4: Specific opportunities they can leverage given their background. Paragraph 5: Detailed success vision with concrete outcomes. Paragraphs 6-7: Strategic approach and why this plan will work for THEM specifically.",
  
  "situationAnalysis": {
    "currentState": "4-5 detailed sentences analyzing what you understand from their goals, their current position, their mindset, and what's driving their desire for change",
    "challenges": [
      "Challenge 1: Detailed explanation of this barrier with specific examples and impact (2-3 sentences)",
      "Challenge 2: Another major obstacle with context on why it matters for their journey (2-3 sentences)",
      "Challenge 3: Third significant challenge with analysis of how to address it (2-3 sentences)",
      "Challenge 4: Additional barrier specific to their situation (2-3 sentences)",
      "Challenge 5: Extra challenge showing deep understanding (2-3 sentences)",
      "Challenge 6: [Optional] Another relevant obstacle if applicable",
      "Challenge 7: [Optional] Final challenge demonstrating thoroughness"
    ],
    "opportunities": [
      "Opportunity 1: Detailed explanation of this advantage with specific ways to leverage it (2-3 sentences)",
      "Opportunity 2: Another major opportunity with actionable insights on capitalizing (2-3 sentences)",
      "Opportunity 3: Third opportunity with strategic context (2-3 sentences)",
      "Opportunity 4: Additional advantage specific to their background (2-3 sentences)",
      "Opportunity 5: Extra opportunity showing market awareness (2-3 sentences)",
      "Opportunity 6: [Optional] Another leverage point if applicable",
      "Opportunity 7: [Optional] Final opportunity for comprehensive coverage"
    ]
  },
  
  "strategicVision": "3-4 paragraphs (minimum 150 words) painting a DETAILED picture of success for what they're trying to achieve. Include: specific revenue targets, lifestyle changes, daily routine transformation, emotional and financial outcomes, and long-term impact.",
  
  "roadmap": {
    "phase1": {
      "name": "Descriptive Phase 1 name reflecting their journey",
      "timeline": "Specific timeline fitting ${context.timeCommitment} with weekly breakdown",
      "milestones": [
        "Milestone 1: Specific, measurable achievement with clear success criteria",
        "Milestone 2: Detailed milestone with context on significance",
        "Milestone 3: Another key achievement with expected outcomes",
        "Milestone 4: Additional milestone showing progression",
        "Milestone 5: Extra milestone for comprehensive tracking",
        "Milestone 6: [Optional] Another achievement marker",
        "Milestone 7: [Optional] Final milestone if needed"
      ]
    },
    "phase2": {
      "name": "Descriptive Phase 2 name showing evolution", 
      "timeline": "Specific timeline with weekly/monthly breakdown",
      "milestones": [
        "Milestone 1: Specific achievement building on Phase 1",
        "Milestone 2: Key milestone with measurable outcomes",
        "Milestone 3: Important achievement with context",
        "Milestone 4: Additional milestone for this phase",
        "Milestone 5: Extra milestone showing growth",
        "Milestone 6: [Optional] Another key marker",
        "Milestone 7: [Optional] Final milestone for depth"
      ]
    },
    "phase3": {
      "name": "Descriptive Phase 3 name reflecting mastery/scale",
      "timeline": "Specific timeline with clear end goals",
      "milestones": [
        "Milestone 1: Major achievement showing transformation",
        "Milestone 2: Significant milestone with impact metrics",
        "Milestone 3: Key achievement demonstrating success",
        "Milestone 4: Additional milestone for final phase",
        "Milestone 5: Extra milestone showing full implementation",
        "Milestone 6: [Optional] Another success marker",
        "Milestone 7: [Optional] Ultimate achievement milestone"
      ]
    }
  },
  
  "keyObjectives": [
    "Objective 1: Detailed objective (2-3 sentences) with specific outcomes and why it matters for THEM",
    "Objective 2: Another key objective with context on how it drives success",
    "Objective 3: Third objective showing strategic alignment",
    "Objective 4: Additional objective specific to their situation",
    "Objective 5: Extra objective demonstrating comprehensive planning",
    "Objective 6: [Optional] Another strategic goal if applicable",
    "Objective 7: [Optional] Final objective for thoroughness"
  ],
  
  "successMetrics": [
    "Metric 1: Specific, measurable KPI with target numbers and timeline",
    "Metric 2: Another quantifiable metric with clear success criteria",
    "Metric 3: Third metric tracking progress toward goals",
    "Metric 4: Additional metric relevant to their transformation",
    "Metric 5: Extra metric for comprehensive tracking",
    "Metric 6: [Optional] Another measurement for depth",
    "Metric 7: [Optional] Final metric showing full coverage"
  ],
  
  "riskAssessment": {
    "risks": [
      "Risk 1: Detailed risk analysis (2-3 sentences) with likelihood and impact assessment",
      "Risk 2: Another significant risk with context on why it's concerning",
      "Risk 3: Third risk with analysis of potential consequences",
      "Risk 4: Additional risk specific to their situation",
      "Risk 5: Extra risk showing thorough evaluation",
      "Risk 6: [Optional] Another risk factor if applicable",
      "Risk 7: [Optional] Final risk for comprehensive assessment"
    ],
    "mitigations": [
      "Mitigation 1: Detailed strategy (2-3 sentences) to address corresponding risk with specific actions",
      "Mitigation 2: Another mitigation plan with clear steps and expected outcomes",
      "Mitigation 3: Third mitigation strategy with implementation details",
      "Mitigation 4: Additional mitigation for their context",
      "Mitigation 5: Extra mitigation demonstrating proactive planning",
      "Mitigation 6: [Optional] Another mitigation strategy",
      "Mitigation 7: [Optional] Final mitigation for complete coverage"
    ]
  }
}

REMEMBER: This is a PROFESSIONAL STRATEGIC DOCUMENT. Every section must be DETAILED, SPECIFIC, and VALUABLE. Minimum 2-3 sentences per bullet point. Rich, actionable content throughout.`,
        expectedTokens: 20000
      };

    case 3:
      // STEP 3: Detailed action plan - SIGNIFICANTLY ENHANCED FOR DEPTH
      return {
        systemPrompt: `You are a senior implementation strategist specializing in detailed action planning. Your plans are COMPREHENSIVE, SPECIFIC, and ACTIONABLE. Every phase must be thoroughly detailed with step-by-step guidance. This is professional-grade implementation planning.`,
        userPrompt: `Create a COMPREHENSIVE, DETAILED action plan:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL REQUIREMENTS FOR MAXIMUM DETAIL:

1. Each phase must be EXTENSIVELY detailed with specific, actionable steps
2. Provide DEEP context and guidance - NOT surface-level instructions
3. Include specific examples, timeframes, and success criteria
4. Make every action item clear, measurable, and achievable
5. Show HOW to execute, not just WHAT to execute

Return ONLY valid JSON with EXTENSIVE DETAIL:
{
  "phases": [
    {
      "name": "Phase 1: [Descriptive name reflecting their starting point]",
      "description": "COMPREHENSIVE description (4-5 sentences minimum, 100+ words) explaining: what this phase accomplishes, why it's the right starting point for THEM, how it addresses their challenges, what transformation occurs, and expected outcomes. Be thorough and specific.",
      "duration": "Specific timeline fitting urgency: ${context.timeCommitment} with weekly breakdown (e.g., 'Weeks 1-4: 10-15 hours/week' or 'Month 1: Daily 2-hour sessions')",
      "objectives": [
        "Objective 1: DETAILED objective (3-4 sentences) explaining what they'll achieve, why it matters, how it builds toward the goal, and success criteria",
        "Objective 2: Another comprehensive objective with full context on significance and expected outcomes",
        "Objective 3: Third detailed objective showing strategic progression",
        "Objective 4: Additional objective specific to their transformation",
        "Objective 5: Extra objective for thorough planning"
      ],
      "actions": [
        "Action 1: SPECIFIC step-by-step action (3-4 sentences) with: what to do, how to do it, tools/resources needed, time required, expected outcome, and success criteria",
        "Action 2: Detailed action with clear execution steps and context on why this matters",
        "Action 3: Comprehensive action item with specific guidance and implementation details",
        "Action 4: Another thorough action with examples and best practices",
        "Action 5: Detailed action showing progression from previous steps",
        "Action 6: Additional action building on earlier achievements",
        "Action 7: Extra action for comprehensive coverage",
        "Action 8: [Optional] Another detailed step if needed for their situation",
        "Action 9: [Optional] Additional action for thorough planning",
        "Action 10: [Optional] Final action ensuring complete phase execution"
      ],
      "milestones": [
        "Milestone 1: Specific, measurable milestone with clear success criteria and timeline",
        "Milestone 2: Detailed milestone showing progress with quantifiable outcomes",
        "Milestone 3: Another key milestone with context on significance"
      ],
      "successCriteria": [
        "Criteria 1: Specific metric or outcome that indicates phase completion",
        "Criteria 2: Another measurable indicator of success",
        "Criteria 3: Third criterion for comprehensive evaluation"
      ],
      "prerequisites": [
        "Prerequisite 1: What must be in place before starting this phase",
        "Prerequisite 2: Another requirement or resource needed",
        "Prerequisite 3: [Optional] Additional prerequisite if applicable"
      ],
      "expectedOutcomes": [
        "Outcome 1: Specific result they'll achieve with metrics",
        "Outcome 2: Another tangible outcome from this phase",
        "Outcome 3: Third outcome showing transformation"
      ]
    },
    {
      "name": "Phase 2: [Descriptive name showing progression]",
      "description": "COMPREHENSIVE description (4-5 sentences minimum, 100+ words) explaining: how this builds on Phase 1, what new capabilities they'll develop, how challenges are addressed, what transformation deepens, and bridge to Phase 3. Rich detail throughout.",
      "duration": "Specific timeline with weekly/monthly breakdown fitting their schedule",
      "objectives": [
        "Objective 1: DETAILED objective (3-4 sentences) building on Phase 1 achievements",
        "Objective 2: Comprehensive objective showing evolution and growth",
        "Objective 3: Third detailed objective with strategic context",
        "Objective 4: Additional objective for this phase",
        "Objective 5: Extra objective demonstrating thorough planning"
      ],
      "actions": [
        "Action 1: SPECIFIC action (3-4 sentences) leveraging Phase 1 foundation with detailed execution steps",
        "Action 2: Detailed action advancing their capabilities",
        "Action 3: Comprehensive action with clear implementation guidance",
        "Action 4: Another thorough action building momentum",
        "Action 5: Detailed action addressing intermediate challenges",
        "Action 6: Additional action scaling their efforts",
        "Action 7: Extra action for depth and progression",
        "Action 8: [Optional] Another step for comprehensive coverage",
        "Action 9: [Optional] Additional action ensuring success",
        "Action 10: [Optional] Final action completing phase objectives"
      ],
      "milestones": [
        "Milestone 1: Specific achievement marking progress with success metrics",
        "Milestone 2: Detailed milestone demonstrating capability growth",
        "Milestone 3: Another key milestone with measurable outcomes"
      ],
      "successCriteria": [
        "Criteria 1: Specific indicator of Phase 2 completion",
        "Criteria 2: Another measurable success marker",
        "Criteria 3: Third criterion for thorough evaluation"
      ],
      "prerequisites": [
        "Prerequisite 1: What Phase 1 outcomes are needed",
        "Prerequisite 2: Additional requirements for Phase 2",
        "Prerequisite 3: [Optional] Extra prerequisite if applicable"
      ],
      "expectedOutcomes": [
        "Outcome 1: Specific result with quantifiable impact",
        "Outcome 2: Another tangible outcome from Phase 2",
        "Outcome 3: Third outcome showing growth"
      ]
    },
    {
      "name": "Phase 3: [Descriptive name reflecting mastery/scale]",
      "description": "COMPREHENSIVE description (4-5 sentences minimum, 100+ words) explaining: how this achieves their ultimate goal, what mastery/scale looks like, final transformation, sustainability strategies, and long-term success. Complete picture of achievement.",
      "duration": "Specific timeline with clear end state and transition to independence",
      "objectives": [
        "Objective 1: DETAILED objective (3-4 sentences) representing culmination of journey",
        "Objective 2: Comprehensive objective showing full transformation",
        "Objective 3: Third detailed objective achieving stated goals",
        "Objective 4: Additional objective for complete success",
        "Objective 5: Extra objective ensuring sustainable outcomes"
      ],
      "actions": [
        "Action 1: SPECIFIC action (3-4 sentences) demonstrating mastery with detailed steps",
        "Action 2: Detailed action scaling or optimizing their system",
        "Action 3: Comprehensive action ensuring sustainability",
        "Action 4: Another thorough action cementing success",
        "Action 5: Detailed action preparing for independence",
        "Action 6: Additional action maximizing outcomes",
        "Action 7: Extra action for complete transformation",
        "Action 8: [Optional] Another step ensuring lasting success",
        "Action 9: [Optional] Additional action for comprehensive completion",
        "Action 10: [Optional] Final action achieving ultimate goals"
      ],
      "milestones": [
        "Milestone 1: Major achievement marking transformation with clear metrics",
        "Milestone 2: Significant milestone demonstrating goal attainment",
        "Milestone 3: Final milestone proving complete success"
      ],
      "successCriteria": [
        "Criteria 1: Ultimate success indicator for their goal",
        "Criteria 2: Another final achievement marker",
        "Criteria 3: Third criterion for complete evaluation"
      ],
      "prerequisites": [
        "Prerequisite 1: What Phase 2 must deliver",
        "Prerequisite 2: Requirements for final phase",
        "Prerequisite 3: [Optional] Additional prerequisites"
      ],
      "expectedOutcomes": [
        "Outcome 1: Ultimate achievement with transformation metrics",
        "Outcome 2: Final tangible result of complete journey",
        "Outcome 3: Long-term sustainable outcome"
      ]
    }
  ],
  "successMetrics": [
    "Metric 1: Overall success KPI (detailed with specific targets and timeline)",
    "Metric 2: Another comprehensive metric tracking total transformation",
    "Metric 3: Third detailed metric measuring achievement",
    "Metric 4: Additional metric for complete evaluation",
    "Metric 5: Extra metric ensuring thorough success tracking"
  ]
}

REMEMBER: This is PROFESSIONAL IMPLEMENTATION PLANNING. Every section must be DETAILED, ACTIONABLE, and SPECIFIC. 3-4 sentences per action/objective minimum. Rich, executable guidance throughout. Show them exactly HOW to succeed.`,
        expectedTokens: 20000
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
