import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudioFormData {
  goals: string;
  challenges: string;
}

// Validation schema
const StudioFormSchema = z.object({
  goals: z.string().trim().min(10, 'Goals must be at least 10 characters').max(2000, 'Goals must be less than 2000 characters'),
  challenges: z.string().trim().min(10, 'Challenges must be at least 10 characters').max(2000, 'Challenges must be less than 2000 characters')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is authenticated (optional)
    // NOTE: Credit deduction is handled on the frontend before calling this function
    // This function just processes the generation request
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let isGuest = true;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        user = authUser;
        isGuest = false;
        console.log('✅ Authenticated user:', user.id);
      } else {
        console.log('⚠️ Invalid auth token, treating as guest');
      }
    } else {
      console.log('👤 Guest user detected (no auth header)');
    }

    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY not configured');
    }

    // Parse and validate input
    const body = await req.json();
    const { formData }: { formData: StudioFormData } = body;
    
    // Validate formData using Zod
    try {
      StudioFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return new Response(JSON.stringify({ 
          error: 'Invalid input',
          details: error.errors 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
    
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
    .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas before } or ]
    .trim();
  
  try {
    const parsed = JSON.parse(content);
    console.log(`Step ${step} parsed successfully:`, JSON.stringify(parsed).substring(0, 200));
    return parsed;
  } catch (parseError) {
    console.error(`JSON parse error for step ${step}:`, parseError);
    console.log('Failed content preview:', content.substring(0, 500));
    
    // Try additional cleanup for common issues
    try {
      // Fix common XAI JSON issues
      let fixed = content
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\n/g, ' ')           // Remove newlines within strings
        .replace(/\r/g, '')            // Remove carriage returns
        .replace(/\t/g, ' ')           // Replace tabs with spaces
        .replace(/\s+/g, ' ')          // Normalize whitespace
        .replace(/"\s*:\s*"/g, '":"')  // Normalize key-value spacing
        .replace(/}\s*{/g, '},{');     // Fix adjacent objects
      
      const parsed = JSON.parse(fixed);
      console.log(`Step ${step} fixed and parsed successfully`);
      return parsed;
    } catch (fixError) {
      console.error('Fixed parsing also failed:', fixError);
    }
    
    // Try to extract JSON object from text
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        let extracted = jsonMatch[0].replace(/,(\s*[}\]])/g, '$1');
        const parsed = JSON.parse(extracted);
        console.log(`Step ${step} extracted and parsed successfully`);
        return parsed;
      } catch (e) {
        console.error('Extraction also failed:', e);
      }
    }
    
    return validateStepResponse(content, step, content);
  }
}

function getStepPrompts(step: number, context: StudioFormData, overviewContent: string) {
  // Build context from user input - extract ALL insights from the 2 main fields
  const baseContext = `
USER'S GOALS AND ASPIRATIONS:
${context.goals || 'Not specified'}

USER'S CHALLENGES AND OBSTACLES:
${context.challenges || 'Not specified'}
  `.trim();

  switch (step) {
    case 1:
      // STEP 1: Quick name generation - extract insights from goals & challenges
      return {
        systemPrompt: `You are a creative naming expert and business analyst. From the user's goals and challenges, you will intelligently infer their context (industry, role, experience level, urgency) and create an inspiring journey name.`,
        userPrompt: `Analyze this person's situation deeply from what they've shared:

${baseContext}

Your task:
1. From their GOALS, infer: What industry/field are they in? What's their likely role? What transformation do they seek?
2. From their CHALLENGES, understand: What's blocking them? What's their experience level? How urgent is this?
3. Create an inspiring, specific 3-5 word name that captures their unique transformation journey

Return ONLY valid JSON:
{
  "jumpName": "3-5 word name reflecting THEIR specific transformation journey"
}

Examples of good names:
- "AI-Powered Content Creator Launch"
- "Corporate to Consultant Transition"
- "Scale Agency with AI Automation"`,
        expectedTokens: 500
      };
    
    case 2:
      // STEP 2: Strategic Overview - ORIGINAL working format
      return {
        systemPrompt: `You are a strategic consultant creating comprehensive transformation plans. Analyze the user's goals and challenges deeply, then provide a detailed strategic overview. Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text.`,
        userPrompt: `Create a comprehensive strategic overview for this transformation:

${baseContext}

CRITICAL REQUIREMENTS:
1. Provide DETAILED, SPECIFIC content - NO generic placeholders
2. The roadmap MUST contain concrete, actionable plans for each timeframe
3. All arrays must have at least 3-4 substantive items
4. Every field must be filled with meaningful, personalized content

Return ONLY this JSON structure (NO markdown, NO code blocks):
{
  "executiveSummary": "Write 3-4 detailed paragraphs that: 1) Describe their current situation based on their goals and challenges, 2) Outline the transformation journey ahead, 3) Highlight key milestones and expected outcomes, 4) Paint a compelling vision of success. Make it specific to THEIR situation.",
  "situationAnalysis": {
    "currentState": "Provide a detailed 4-5 sentence analysis of where they are now based on their stated challenges. Be specific about their pain points, current limitations, and why transformation is needed NOW.",
    "challenges": ["Identify the PRIMARY obstacle blocking their progress", "Another critical challenge inferred from their input", "A third significant barrier they must overcome", "An additional challenge that could impact success"],
    "opportunities": ["The BIGGEST opportunity unlocked by this transformation", "A second major opportunity aligned with their goals", "A third significant opportunity for growth", "An additional opportunity they can leverage"]
  },
  "strategicVision": "Write a compelling 4-5 sentence vision of their success state. What does life look like after this transformation? Be specific about outcomes, capabilities gained, and impact achieved. Make it inspirational yet grounded in their stated goals.",
  "roadmap": {
    "immediate": "Detailed 3-4 sentence plan for the FIRST 30 days. Include: specific actions to take, quick wins to achieve, foundations to establish. Example: 'Complete initial tool research and setup by week 1. Create first 3 test workflows in weeks 2-3. Achieve first measurable result by day 30.'",
    "shortTerm": "Comprehensive 3-4 sentence plan for days 31-90. Include: major milestones to hit, systems to implement, skills to develop. Be specific about what gets built and accomplished in this phase.",
    "longTerm": "Strategic 3-4 sentence plan for 90+ days. Include: advanced capabilities, scale targets, transformation completion markers. Paint the picture of full implementation and sustained success."
  },
  "successFactors": ["The #1 most critical factor for their success", "A second essential success factor", "A third key element needed", "An additional important factor"],
  "riskMitigation": ["Biggest risk they'll face and how to mitigate it", "Second major risk and prevention strategy", "Third risk and mitigation approach"]
}

REMEMBER: Every field must be deeply personalized to THEIR specific goals and challenges. NO generic content allowed.`,
        expectedTokens: 8000
      };

    case 3:
      // STEP 3: Action Plan - 3 phases with 5 steps each
      return {
        systemPrompt: `You are a world-class strategic execution expert. Create clear, actionable implementation plans organized into 3 phases with 5 steps each. Use **bold** markdown strategically for emphasis. Every step must be concrete, measurable, and directly tied to the user's specific goals and challenges. Return ONLY valid JSON.`,
        userPrompt: `Create a world-class strategic action plan for this transformation:

${baseContext}

Strategic Overview Context:
${overviewContent}

CRITICAL REQUIREMENTS:
1. EXACTLY 3 phases with EXACTLY 5 steps per phase (total 15 steps)
2. Each step must be SPECIFIC and ACTIONABLE - no vague advice
3. Steps must build logically from foundation to mastery
4. Use **bold** markdown for key terms, deliverables, and tool references
5. Reference Tool #1-9 where appropriate (Tools 1-3 in Phase 1, Tools 4-6 in Phase 2, Tools 7-9 in Phase 3)
6. Each step title should be action-oriented and inspiring
7. Each step description should be 3-4 sentences with specific guidance

PHASE STRUCTURE:
- Phase 1 (Foundation): Setup, research, initial implementation, quick wins
- Phase 2 (Growth): Scaling, optimization, system building, expansion  
- Phase 3 (Mastery): Advanced features, automation, sustained excellence, future-proofing

Return ONLY this exact JSON structure (NO markdown blocks, NO extra text):
{
  "phases": [
    {
      "phase_number": 1,
      "title": "Foundation Phase: [Compelling title]",
      "description": "Clear 2-3 sentence overview explaining what will be achieved in this phase and why it's important. Use **bold** for key deliverables.",
      "duration": "**Weeks 1-4**",
      "steps": [
        {
          "step_number": 1,
          "title": "**[Clear action-oriented title]**",
          "description": "Detailed 3-4 sentence description of this step. Explain WHAT to do, HOW to do it, and WHY it matters. Include specific actions, tools, and expected outcomes. Use **bold** for key terms. Can mention → Use **Tool #1** if relevant.",
          "estimated_time": "5-8 hours"
        },
        {
          "step_number": 2,
          "title": "**[Next action-oriented title]**",
          "description": "Detailed description with specific actions and outcomes. → Use **Tool #2** if relevant.",
          "estimated_time": "6-10 hours"
        },
        {
          "step_number": 3,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #3** if relevant.",
          "estimated_time": "8-12 hours"
        },
        {
          "step_number": 4,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description.",
          "estimated_time": "4-6 hours"
        },
        {
          "step_number": 5,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description.",
          "estimated_time": "5-8 hours"
        }
      ]
    },
    {
      "phase_number": 2,
      "title": "Growth Phase: [Dynamic title]",
      "description": "Clear overview building on Phase 1. Use **bold** for achievements.",
      "duration": "**Weeks 5-8**",
      "steps": [
        {
          "step_number": 1,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #4** if relevant.",
          "estimated_time": "10-15 hours"
        },
        {
          "step_number": 2,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #5** if relevant.",
          "estimated_time": "8-12 hours"
        },
        {
          "step_number": 3,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #6** if relevant.",
          "estimated_time": "6-10 hours"
        },
        {
          "step_number": 4,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description.",
          "estimated_time": "5-8 hours"
        },
        {
          "step_number": 5,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description.",
          "estimated_time": "8-12 hours"
        }
      ]
    },
    {
      "phase_number": 3,
      "title": "Mastery Phase: [Aspirational title]",
      "description": "Clear overview of final transformation. Use **bold** for outcomes.",
      "duration": "**Weeks 9-12**",
      "steps": [
        {
          "step_number": 1,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #7** if relevant.",
          "estimated_time": "12-16 hours"
        },
        {
          "step_number": 2,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #8** if relevant.",
          "estimated_time": "10-15 hours"
        },
        {
          "step_number": 3,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description. → Use **Tool #9** if relevant.",
          "estimated_time": "8-12 hours"
        },
        {
          "step_number": 4,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description.",
          "estimated_time": "6-10 hours"
        },
        {
          "step_number": 5,
          "title": "**[Action-oriented title]**",
          "description": "Detailed description.",
          "estimated_time": "10-15 hours"
         }
       ]
     }
   ]
}

Create world-class, executive-level content that inspires action and provides crystal-clear guidance. Every element must be specific, measurable, and actionable.`,
        expectedTokens: 16000
      };

    case 4:
      // STEP 4: Tools & Prompts - infer all context from goals & challenges
      return {
        systemPrompt: `You are an AI tool recommendation and prompt engineering expert with real-time knowledge of the latest AI tools and technologies as of October 24, 2025. You will analyze the user's goals and challenges to intelligently infer their industry, experience level, budget constraints, and urgency to recommend perfectly tailored tool+prompt combinations.

CRITICAL: TOOL SELECTION & DIVERSITY REQUIREMENTS:
1. Generate exactly 9 tool + prompt combinations
2. MUST use at least 6 DIFFERENT tools across the 9 combos
3. Only repeat a tool if it's genuinely optimal for distinct use cases
4. Strategic mix required:
   - 2-3 AI writing/reasoning tools (ChatGPT, Claude, Gemini, etc.)
   - 3-4 specialized tools (video: Veo3/InVideo, image: Midjourney/DALL-E, code: Cursor/Replit, etc.)
   - 2-3 productivity/workflow tools (Notion, Make.com, Zapier, etc.)
5. PRIORITIZE latest and greatest tools as of October 2025
6. Consider cutting-edge releases and trending tools in the market RIGHT NOW

CRITICAL: TOOL-SPECIFIC PROMPT FORMATS:
- Add "prompt_format" field: "json" | "detailed_descriptive" | "structured_requirements" | "conversational"
- Video tools (Veo3, InVideo, Runway): Use JSON format with structured parameters
- Image tools (Midjourney, DALL-E, Stable Diffusion): Use detailed descriptive format
- Code tools (Cursor, Replit, GitHub Copilot): Use structured requirements format
- General AI (ChatGPT, Claude, Gemini): Use conversational but detailed format

CRITICAL: PHASE ALIGNMENT:
- Add "phase" field: 1, 2, or 3
- Phase 1 (Combos 1-3): Foundation tools - research, planning, initial setup
- Phase 2 (Combos 4-6): Growth tools - content creation, automation, scaling
- Phase 3 (Combos 7-9): Mastery tools - optimization, analytics, advanced features

CRITICAL: CONTEXT INFERENCE & DEFAULTS:
- From GOALS: Infer their industry (from language/context), desired tools/capabilities, complexity needs
- From CHALLENGES: Deduce their experience level, budget sensitivity, time constraints
- Apply smart defaults when unclear:
  * Experience: Standard AI learning curve (tech-savvy but new to AI)
  * Budget: Lean approach - prioritize free/affordable tools, only premium when truly optimal
  * Urgency: As soon as realistically achievable given transformation scope
  * Industry: Determine from terminology, language patterns, and context clues`,
        userPrompt: `Create 9 deeply personalized tool+prompt combinations with diversity and phase alignment:

${baseContext}

Overview Context (already analyzed):
${overviewContent}

CRITICAL ANALYSIS & INFERENCE:
1. From GOALS, understand: What industry are they in (from context/language)? What tools would best serve their objectives? What complexity level is appropriate?
2. From CHALLENGES, deduce: What's their AI experience level? What budget constraints exist? How urgent is their timeline?
3. Apply sensible defaults when not explicitly stated:
   - Budget: LEAN APPROACH - default to free and cost-effective tools; only recommend premium when clearly optimal for their goals
   - Experience: Standard AI learning curve - assume tech-savvy but new to AI implementation (beginner-to-intermediate friendly)
   - Urgency: As soon as realistically achievable - balance speed with quality
   - Industry: Infer from terminology, language patterns, and goals/challenges context
4. Tailor EVERYTHING: tool complexity, budget appropriateness, time-to-value, learning curve

REQUIREMENTS:
1. Each combo must directly address their goals and overcome their challenges
2. DEFAULT to free/affordable tools unless goals clearly indicate premium resources available
3. Match complexity to standard learning curve - beginner-friendly with growth path, unless clear sophistication indicators
4. Assume reasonable urgency - quick wins balanced with sustainable progress
5. MUST use at least 6 DIFFERENT tools across the 9 combos
6. Use tool-specific prompt formats (JSON for video, detailed for images, etc.)
7. Align 3 combos per phase (foundation/growth/mastery)
8. Recommend latest October 2025 tools when appropriate

DO NOT use generic content. Every word should reflect THEIR specific situation inferred from their input.

EXAMPLE of proper format-specific prompts:
- JSON (for video tools): {"scene": "sunset over mountains", "duration": 5, "style": "cinematic", "mood": "peaceful"}
- Detailed descriptive (for image): "A photorealistic sunset over mountains, golden hour lighting, 8K resolution, cinematic composition"
- Structured requirements (for code): "Requirements: 1) Create React component 2) Use TypeScript 3) Include error handling"
- Conversational detailed (for general AI): "I need help creating a comprehensive strategy. Please analyze my situation and provide..."

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Specific use case directly from their stated goals",
      "description": "How this helps them achieve their specific goals and overcome their stated obstacles",
      "category": "Category relevant to their inferred industry/field",
      "tool_name": "Specific tool appropriate to their inferred budget and experience",
      "tool_url": "https://url.com",
      "tool_type": "Tool type",
      "prompt_text": "200-300 word ready-to-copy prompt in the appropriate format for this tool. Deeply tailored to their stated goals. Directly addresses their challenges. References their specific situation inferred from input.",
      "prompt_format": "json|detailed_descriptive|structured_requirements|conversational",
      "prompt_instructions": "Step-by-step guidance for THEIR specific use case, considering their inferred experience level, including format-specific guidance",
      "when_to_use": "When in their specific transformation journey based on their goals",
      "why_this_combo": "Why perfect for their unique situation, goals, and challenges",
      "alternatives": [
        {"tool": "Alternative", "url": "url", "note": "Why appropriate for their context and constraints"},
        {"tool": "Alternative", "url": "url", "note": "Why fits their budget/experience/urgency"}
      ],
      "use_cases": ["For their specific goal #1", "For their goal #2", "To overcome their challenge"],
      "tags": ["tags-relevant-to-their-inferred-industry"],
      "difficulty_level": "Appropriate to their inferred AI experience",
      "setup_time": "Realistic for their inferred time constraints and urgency",
      "cost_estimate": "Appropriate to their inferred budget constraints",
      "phase": 1|2|3
    }
  ]
}

Generate EXACTLY 9 combos deeply tailored to THEIR specific situation inferred from goals & challenges, with diversity and phase alignment.`,
        expectedTokens: 50000
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
