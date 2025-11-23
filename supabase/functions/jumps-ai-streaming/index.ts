import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { callXAIWithRetry } from './xai-client.ts';
import { StudioFormData, StudioFormSchema, verifyTurnstile } from './validators.ts';
import { logApiUsage, getLocation } from './logging.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || req.headers.get('cf-connecting-ip')
    || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  const location = await getLocation(ipAddress);
  console.log('📍 Request info:', { ipAddress, location, userAgent: userAgent.substring(0, 50) });
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is authenticated
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
    const { formData, turnstileToken }: { formData: StudioFormData; turnstileToken?: string } = body;
    
    // Validate formData using Zod
    try {
      StudioFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        await logApiUsage(supabase, 'jumps-ai-streaming', user?.id || null, ipAddress, userAgent, 400, Date.now() - startTime, 'Validation error');
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

    // Verify Turnstile token for guest users
    if (isGuest && turnstileToken) {
      console.log('🔒 Verifying Turnstile token for guest user');
      
      const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
      
      if (!turnstileSecret) {
        console.error('❌ TURNSTILE_SECRET_KEY not configured');
        await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 500, Date.now() - startTime, 'Turnstile config error');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: corsHeaders }
        );
      }

      try {
        const turnstileResponse = await fetch(turnstileVerifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        });

        const turnstileResult = await turnstileResponse.json();
        
        if (!turnstileResult.success) {
          console.error('❌ Turnstile verification failed:', turnstileResult);
          await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 403, Date.now() - startTime, 'Turnstile verification failed');
          return new Response(
            JSON.stringify({ error: 'Security verification failed. Please try again.' }),
            { status: 403, headers: corsHeaders }
          );
        }
        
        console.log('✅ Turnstile verification successful');
      } catch (error) {
        console.error('❌ Error verifying Turnstile:', error);
        await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 500, Date.now() - startTime, 'Turnstile verification error');
        return new Response(
          JSON.stringify({ error: 'Security verification error' }),
          { status: 500, headers: corsHeaders }
        );
      }
    } else if (isGuest && !turnstileToken) {
      console.error('❌ Guest user missing Turnstile token');
      await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 403, Date.now() - startTime, 'Missing Turnstile token');
      return new Response(
        JSON.stringify({ error: 'Security verification required' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Server-side rate limiting check using database
    if (isGuest) {
      const { data: usageData, error: usageError } = await supabase.rpc('check_and_record_guest_usage', {
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

      console.log('🔍 Guest usage check result:', { usageData, usageError });

      if (usageError) {
        console.error('❌ Error checking guest usage:', usageError);
        await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 500, Date.now() - startTime, 'Guest usage check error');
        return new Response(JSON.stringify({ 
          error: 'Error checking usage limits. Please try again.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (usageData && !usageData.can_use) {
        console.log('🚫 Guest rate limit exceeded:', ipAddress, 'Usage:', usageData);
        await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 429, Date.now() - startTime, 'Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please sign up to continue using JumpinAI Studio.',
          usageCount: usageData.usage_count || 3,
          remaining: 0,
          resetAt: usageData.reset_at
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Guest usage OK:', { 
        usageCount: usageData?.usage_count || 1, 
        remaining: usageData?.remaining || 2 
      });
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
          console.log('📝 Step 1: Generating jump name...');
          const namingResponse = await callXAIWithRetry(XAI_API_KEY, 1, formData, '');
          console.log('✅ Naming response:', namingResponse);
          console.log('✅ Naming response jumpName field:', namingResponse?.jumpName);
          
          // Ensure jumpName exists (fallback if needed)
          if (!namingResponse || !namingResponse.jumpName) {
            console.warn('⚠️ No jumpName in response, using fallback');
            namingResponse.jumpName = 'AI Transformation Journey';
          }
          
          // Include IP and location metadata in the naming response
          const namingWithMeta = {
            jumpName: namingResponse.jumpName, // Explicitly set jumpName first
            ...namingResponse, // Then spread rest of response
            _metadata: {
              ipAddress,
              location,
              userAgent: userAgent.substring(0, 200) // Truncate for storage
            }
          };
          
          console.log('📤 Sending naming event with data:', { 
            jumpName: namingWithMeta.jumpName,
            hasMetadata: !!namingWithMeta._metadata 
          });
          
          sendEvent(1, 'naming', namingWithMeta);
          
          // Step 2: Generate Overview & Plan
          console.log('📊 Step 2: Generating overview...');
          const overviewResponse = await callXAIWithRetry(XAI_API_KEY, 2, formData, '');
          console.log('✅ Overview response:', overviewResponse);
          sendEvent(2, 'overview', overviewResponse);
          
          const overviewContent = typeof overviewResponse === 'string' 
            ? overviewResponse 
            : JSON.stringify(overviewResponse);

          // Step 3: Generate comprehensive plan
          console.log('🔧 Step 3: Generating Comprehensive Plan...');
          let comprehensivePlan = '';
          try {
            const planResponse = await callXAIWithRetry(XAI_API_KEY, 3, formData, overviewContent);
            console.log('✅ Step 3 response:', planResponse);
            comprehensivePlan = typeof planResponse === 'string' 
              ? planResponse 
              : JSON.stringify(planResponse);
            
            const sent = sendEvent(3, 'comprehensive', planResponse);
            if (!sent) {
              console.error('Failed to send step 3, attempting to continue...');
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (stepError: any) {
            console.error('❌ Error in step 3:', stepError.message);
            sendEvent(3, 'error', { 
              message: `Step 3 (Comprehensive Plan) failed after retries: ${stepError.message}`,
              retryable: false
            });
          }

          // Step 4: Generate tools & prompts (needs BOTH overview and comprehensive plan)
          console.log('🔧 Step 4: Generating Tools & Prompts...');
          try {
            // Combine overview and comprehensive plan for Step 4 context
            const fullContext = `${overviewContent}\n\nCOMPREHENSIVE PLAN:\n${comprehensivePlan}`;
            const toolsResponse = await callXAIWithRetry(XAI_API_KEY, 4, formData, fullContext);
            console.log('✅ Step 4 response:', toolsResponse);
            
            const sent = sendEvent(4, 'tool_prompts', toolsResponse);
            if (!sent) {
              console.error('Failed to send step 4, attempting to continue...');
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (stepError: any) {
            console.error('❌ Error in step 4:', stepError.message);
            sendEvent(4, 'error', { 
              message: `Step 4 (Tools & Prompts) failed after retries: ${stepError.message}`,
              retryable: false
            });
          }

          // Send completion event
          if (!isClosed) {
            console.log('🎉 Sending completion event...');
            sendEvent(9, 'complete', { message: 'Generation complete' });
          }

          // Log successful API usage
          await logApiUsage(supabase, 'jumps-ai-streaming', user?.id || null, ipAddress, userAgent, 200, Date.now() - startTime);

        } catch (error: any) {
          console.error('💥 Critical generation error:', error.message);
          console.error('Full error:', error);
          if (!isClosed) {
            sendEvent(-1, 'error', { 
              message: error.message,
              critical: true
            });
          }
          // Log failed API usage
          await logApiUsage(supabase, 'jumps-ai-streaming', user?.id || null, ipAddress, userAgent, 500, Date.now() - startTime, error.message);
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
    
    // Log error to database if we have supabase instance
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 500, Date.now() - startTime, error.message);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Retry wrapper with exponential backoff for xAI API calls
async function callXAIWithRetry(
  apiKey: string,
  step: number,
  context: StudioFormData,
  overviewContent: string,
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Step ${step}: Attempt ${attempt}/${maxRetries}`);
      const startTime = Date.now();
      
      const result = await callXAI(apiKey, step, context, overviewContent);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Step ${step}: Success on attempt ${attempt} (${duration}ms)`);
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a retryable error (5xx server errors)
      const isRetryable = error.message?.includes('502') || 
                          error.message?.includes('503') || 
                          error.message?.includes('504') ||
                          error.message?.includes('500');
      
      if (!isRetryable || attempt === maxRetries) {
        console.error(`❌ Step ${step}: Failed after ${attempt} attempt(s) - ${error.message}`);
        throw error;
      }
      
      // Exponential backoff: 2s, 4s, 8s
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.warn(`⚠️ Step ${step}: Attempt ${attempt} failed (${error.message}), retrying in ${backoffMs}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

async function callXAI(
  apiKey: string,
  step: number,
  context: StudioFormData,
  overviewContent: string
): Promise<any> {
  const { systemPrompt, userPrompt, expectedTokens } = getStepPrompts(step, context, overviewContent);
  
  console.log(`🚀 Step ${step}: Calling xAI API (model: grok-4-fast-non-reasoning, max_tokens: ${expectedTokens})`);
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        model: 'grok-4-fast-non-reasoning',
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
    const truncatedError = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
    console.error(`❌ xAI API error (step ${step}): ${response.status}`);
    console.error(`Error details: ${truncatedError}`);
    throw new Error(`xAI API error: ${response.status}`);
  }

  console.log(`✓ Step ${step}: Received response from xAI API`);
  
  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.error(`❌ Step ${step}: No content in API response`);
    throw new Error('No content in API response');
  }
  
  console.log(`✓ Step ${step}: Content received (${content.length} characters)`);


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
    
    // AGGRESSIVE JSON REPAIR - Try multiple repair strategies
    const repairStrategies = [
      // Strategy 1: Basic cleanup
      (json: string) => json
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/}\s*{/g, '},{'),
      
      // Strategy 2: Fix array syntax issues
      (json: string) => json
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\](\s*)"(\w+)":/g, '],$1"$2":')  // Add missing comma after array before key
        .replace(/\}(\s*)"(\w+)":/g, '},$1"$2":')  // Add missing comma after object before key
        .replace(/\](\s*)\{/g, '],{')              // Add missing comma between ] and {
        .replace(/\}(\s*)\{/g, '},{')              // Add missing comma between } and {
        .replace(/"\s*\n\s*"/g, '","')             // Fix broken strings across lines
        .replace(/,+/g, ',')                       // Remove duplicate commas
        .replace(/\[\s*,/g, '[')                   // Remove leading comma in array
        .replace(/,\s*\]/g, ']')                   // Remove trailing comma in array
        .replace(/,\s*\}/g, '}'),                  // Remove trailing comma in object
      
      // Strategy 3: Fix truncated JSON (add closing brackets)
      (json: string) => {
        let fixed = json.replace(/,(\s*[}\]])/g, '$1');
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        // Add missing closing brackets
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) fixed += '}';
        
        return fixed;
      }
    ];
    
    // Try each repair strategy
    for (let i = 0; i < repairStrategies.length; i++) {
      try {
        let repaired = content;
        // Apply all strategies up to current one
        for (let j = 0; j <= i; j++) {
          repaired = repairStrategies[j](repaired);
        }
        const parsed = JSON.parse(repaired);
        console.log(`✅ Step ${step} repaired using strategy ${i + 1}`);
        return parsed;
      } catch (e) {
        console.log(`❌ Repair strategy ${i + 1} failed`);
      }
    }
    
    // Last resort: Try to extract valid JSON from the content
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        let extracted = jsonMatch[0];
        // Apply all repair strategies to extracted content
        for (const strategy of repairStrategies) {
          extracted = strategy(extracted);
        }
        const parsed = JSON.parse(extracted);
        console.log(`✅ Step ${step} extracted and repaired successfully`);
        return parsed;
      } catch (e) {
        console.error('❌ All repair attempts failed:', e);
      }
    }
    
    console.error('⚠️ Using fallback response for step', step);
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
      // STEP 2: Strategic Overview - AI ADAPTATION FOCUS
      return {
        systemPrompt: `You are a world-class AI adaptation strategist at JumpinAI - the premier AI Adaptation Studio.
You specialize in helping people achieve their goals by strategically implementing AI into their workflow.
Your expertise: Understanding challenges and creating compelling visions for AI-powered transformation.

CORE MISSION: Show people how to achieve their goals using the latest AI tools available in November 2025.
This is about AI IMPLEMENTATION and ADAPTATION - not generic business advice.

Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text.`,
        userPrompt: `Create a comprehensive strategic overview for this AI ADAPTATION journey:

${baseContext}

🎯 ABSOLUTE CRITICAL REQUIREMENTS - THIS IS JUMPINAI'S CORE MISSION:
1. This is an AI IMPLEMENTATION PLAN - focus on how they'll use AI to achieve their goals
2. ONLY mention AI tools from November 2025: Claude, ChatGPT, Gemini, Grok, Cursor, Lovable, Midjourney, Runway, Veo, Make.com, Zapier AI, Perplexity, NotebookLM, etc.
3. NO VERSION NUMBERS: Use only base tool names (e.g., "ChatGPT" not "GPT-5", "Gemini" not "Gemini 2.0", "Midjourney" not "Midjourney v7"). However, DO mention specialized variants when relevant (e.g., "Claude Code" for coding, "Grok Imagine" for image generation, "Lovable" for website creation).
4. NO old-school recommendations (NO Khan Academy, NO Coursera, NO generic courses)
5. NO non-AI tools unless absolutely necessary
6. Every recommendation must be AI-first: How will AI help them achieve this goal?
7. This is about LEARNING AI BY USING IT to solve their actual problems
8. Make them feel that AI adaptation is the key to their success

DETAILED CONTENT REQUIREMENTS:
1. Provide DETAILED, SPECIFIC content - NO generic placeholders
2. The roadmap MUST mention specific AI tools they'll implement in each timeframe
3. All arrays must have at least 3-4 substantive items
4. Every field must emphasize AI implementation and adaptation
5. Success factors should focus on mastering AI tools

Return ONLY this JSON structure (NO markdown, NO code blocks):
{
  "executiveSummary": "Write 3-4 detailed paragraphs that: 1) Describe their current situation and why AI adaptation is critical NOW, 2) Outline their AI implementation journey - specific AI tools they'll master and use, 3) Highlight key AI-powered milestones (e.g., 'mastering Claude for content strategy', 'implementing Runway for video creation'), 4) Paint a compelling vision of success through AI mastery. Make it specific about AI IMPLEMENTATION.",
  "situationAnalysis": {
    "currentState": "Provide a detailed 4-5 sentence analysis emphasizing their need for AI implementation. Explain how AI tools can address their challenges. Why is AI adaptation needed NOW to achieve their goals? Be specific about which AI capabilities would help.",
    "challenges": ["PRIMARY obstacle that AI implementation can overcome", "Another critical challenge AI tools can solve", "A third barrier that AI adaptation addresses", "Additional challenge where AI provides a solution"],
    "opportunities": ["The BIGGEST AI-powered opportunity (mention specific AI tool category)", "A second major AI implementation opportunity", "A third AI-driven growth opportunity", "Additional opportunity through AI tool mastery"]
  },
  "strategicVision": "Write a compelling 4-5 sentence vision of their AI-powered success state. What does life look like when they've successfully implemented AI tools? Which AI tools are they using daily? What outcomes have they achieved through AI? Make it inspirational yet grounded in AI IMPLEMENTATION.",
  "roadmap": {
    "immediate": "Detailed 3-4 sentence AI implementation plan for the FIRST 30 days. Include: specific AI tools to start with (e.g., 'Set up Claude for content strategy', 'Master ChatGPT prompting'), quick AI-powered wins, AI foundations to establish. NO old-school courses - only AI tool experimentation and implementation.",
    "shortTerm": "Comprehensive 3-4 sentence AI scaling plan for days 31-90. Include: additional AI tools to master, AI-powered systems to build, AI workflow integration. Mention specific AI tools (e.g., 'Implement Runway for video', 'Use Make.com for automation').",
    "longTerm": "Strategic 3-4 sentence advanced AI implementation plan for 90+ days. Include: advanced AI capabilities, AI tool stack optimization, sustained AI-powered success. Focus on becoming an AI power user in their field."
  },
  "successFactors": ["The #1 AI-focused success factor (e.g., 'Consistent AI tool experimentation and implementation')", "A second AI mastery factor", "A third AI adaptation element", "Additional AI implementation factor"],
  "riskMitigation": ["Biggest risk and how AI tools mitigate it (mention specific AI capability)", "Second risk and AI-powered prevention strategy", "Third risk and AI-driven mitigation approach"]
}

REMEMBER: Every field must emphasize AI IMPLEMENTATION and ADAPTATION. This is JumpinAI - we help people achieve goals through strategic AI tool usage. Make them feel that AI is the KEY to their transformation.`,
        expectedTokens: 8000
      };

    case 3:
      // STEP 3: AI IMPLEMENTATION Action Plan - 3 phases with 5 steps each
      return {
        systemPrompt: `You are an elite AI adaptation strategist at JumpinAI - the world's premier AI Adaptation Studio.
Your mission: Help people achieve their goals by strategically implementing AI tools into their workflow.
You create world-class, professional strategic action plans where EVERY step centers around implementing specific AI tools.

CORE PHILOSOPHY:
- This is an AI IMPLEMENTATION plan, not a generic business plan
- Each step = One strategic AI-powered action using the latest AI tools
- We teach AI by helping people USE IT to achieve their actual goals
- No old-school methods, no non-AI recommendations, ONLY cutting-edge AI tools

You are the world's leading expert on the latest AI tools available in November 2025. Return ONLY valid JSON.`,
        userPrompt: `Based on the following user profile and goals, create a comprehensive AI IMPLEMENTATION plan:

${baseContext}

Strategic Overview Context:
${overviewContent}

🎯 ABSOLUTE CRITICAL REQUIREMENTS - READ CAREFULLY:

1. **AI-FIRST MANDATE**: Every single step MUST center around implementing specific AI tools
   - NO old-school recommendations (no Coursera, no Khan Academy, no generic courses)
   - NO generic business advice without specific AI tool implementation
   - Each step = ONE strategic idea using ONE or more specific AI tools
   - Focus on HOW to use AI tools to achieve their goals

2. **LATEST AI TOOLS ONLY** (November 2025):
   - AI Writing/Reasoning: Claude, ChatGPT, Gemini, Grok, Perplexity
   - AI Code: Cursor, Lovable, Replit, GitHub Copilot, Bolt, V0
   - AI Image: Midjourney, DALL-E, Flux, Stable Diffusion
   - AI Video: Runway, Veo, Invideo AI, Sora, Kling AI
   - AI Audio: ElevenLabs, Suno, Udio
   - AI Automation: Make.com, Zapier AI, n8n
   - AI Research: Perplexity, NotebookLM, Claude
   - AI Design: Figma AI, Uizard, Galileo AI, Canva AI
   - Specialized: Harvey AI, Jasper, Copy.ai, Descript, Synthesia
   
3. **NO VERSION NUMBERS**: Use only base tool names (e.g., "ChatGPT" not "GPT-5", "Gemini" not "Gemini 2.0", "Grok" not "Grok 2", "Midjourney" not "Midjourney v7", "Runway" not "Runway Gen-4"). However, DO mention specialized variants when relevant (e.g., "Claude Code" for coding, "Grok Imagine" for image generation, "GitHub Copilot" for development, "Lovable" for website creation).

4. **STEP STRUCTURE - EACH STEP MUST**:
   - Have ONE clear strategic action/idea centered around AI tool usage
   - Explain WHICH specific AI tool(s) to use for this goal
   - Explain HOW to use the AI tool for this specific purpose
   - Be practical and immediately actionable with AI
   - NO mixing of old-school methods with AI - pure AI implementation only

5. **WHAT THIS IS**:
   - An AI IMPLEMENTATION plan for achieving their goals through AI
   - A hands-on guide to learning AI by USING it on their real problems
   - A strategic roadmap for AI adaptation and mastery

6. **WHAT THIS IS NOT**:
   - Generic business advice or traditional methods
   - Old-school course recommendations (NO Coursera, NO Khan Academy)
   - Non-AI tool suggestions (NO WordPress without AI, NO generic email marketing)
   - Abstract theory without AI tool usage

7. **TOOL ALIGNMENT**:
   - Steps 1-3 in Phase 1 connect to Tool Combos #1-3 (foundation AI tools)
   - Steps 1-3 in Phase 2 connect to Tool Combos #4-6 (growth AI tools)
   - Steps 1-3 in Phase 3 connect to Tool Combos #7-9 (mastery AI tools)
   - Write steps thinking about AI tool categories they'll use

PHASE STRUCTURE:
- Phase 1 (Foundation): Initial AI tool implementation, AI experimentation, quick AI-powered wins
- Phase 2 (Growth): Scaling AI usage, AI workflow optimization, advanced AI implementation
- Phase 3 (Mastery): AI automation mastery, AI-first operations, sustained AI excellence

EXACT REQUIREMENTS:
- EXACTLY 3 phases with EXACTLY 5 steps per phase (total 15 steps)
- Each step title must mention AI or AI tool usage
- Each step description must explain specific AI tool implementation (3-4 sentences)
- Use **bold** for AI tool names and key deliverables
- Reference Tool #1-9 where appropriate

Return ONLY this exact JSON structure (NO markdown blocks, NO extra text):
{
  "phases": [
    {
      "phase_number": 1,
      "title": "Foundation Phase: [AI-focused title]",
      "description": "Clear 2-3 sentence overview explaining AI tools they'll implement in this phase and why it matters for their goals. Use **bold** for key AI deliverables.",
      "duration": "**Weeks 1-4**",
      "steps": [
        {
          "step_number": 1,
          "title": "**[AI-focused action title mentioning the AI tool or AI capability]**",
          "description": "Detailed 3-4 sentences explaining: WHICH AI tool to use, HOW to use it for their goal, WHAT specific AI-powered actions to take, and WHY this AI implementation matters. Example: 'Use **Claude** to analyze your market positioning by feeding it competitor data and asking for strategic insights. Spend 2 hours crafting detailed prompts to extract actionable recommendations.' → Use **Tool #1**",
          "estimated_time": "5-8 hours"
        },
        {
          "step_number": 2,
          "title": "**[AI-powered action title]**",
          "description": "Specific AI tool implementation guidance with HOW-TO details. Focus entirely on AI usage. → Use **Tool #2**",
          "estimated_time": "6-10 hours"
        },
        {
          "step_number": 3,
          "title": "**[AI implementation title]**",
          "description": "Detailed AI tool usage instructions, no generic advice. → Use **Tool #3**",
          "estimated_time": "8-12 hours"
        },
        {
          "step_number": 4,
          "title": "**[AI-centered action title]**",
          "description": "Another AI-powered strategic action with specific tool guidance.",
          "estimated_time": "4-6 hours"
        },
        {
          "step_number": 5,
          "title": "**[AI workflow title]**",
          "description": "AI implementation step completing the foundation phase.",
          "estimated_time": "5-8 hours"
        }
      ]
    },
    {
      "phase_number": 2,
      "title": "Growth Phase: [AI scaling title]",
      "description": "Overview of scaling AI implementation. Use **bold** for AI achievements.",
      "duration": "**Weeks 5-8**",
      "steps": [
        {
          "step_number": 1,
          "title": "**[Advanced AI implementation title]**",
          "description": "Detailed AI tool usage for scaling. → Use **Tool #4**",
          "estimated_time": "10-15 hours"
        },
        {
          "step_number": 2,
          "title": "**[AI automation title]**",
          "description": "AI workflow optimization guidance. → Use **Tool #5**",
          "estimated_time": "8-12 hours"
        },
        {
          "step_number": 3,
          "title": "**[AI integration title]**",
          "description": "Advanced AI tool implementation. → Use **Tool #6**",
          "estimated_time": "6-10 hours"
        },
        {
          "step_number": 4,
          "title": "**[AI-powered growth title]**",
          "description": "AI scaling strategy with specific tools.",
          "estimated_time": "5-8 hours"
        },
        {
          "step_number": 5,
          "title": "**[AI optimization title]**",
          "description": "AI workflow refinement step.",
          "estimated_time": "8-12 hours"
        }
      ]
    },
    {
      "phase_number": 3,
      "title": "Mastery Phase: [AI excellence title]",
      "description": "Overview of AI mastery and automation. Use **bold** for AI outcomes.",
      "duration": "**Weeks 9-12**",
      "steps": [
        {
          "step_number": 1,
          "title": "**[AI mastery title]**",
          "description": "Expert-level AI implementation. → Use **Tool #7**",
          "estimated_time": "12-16 hours"
        },
        {
          "step_number": 2,
          "title": "**[AI automation mastery title]**",
          "description": "Advanced AI automation guidance. → Use **Tool #8**",
          "estimated_time": "10-15 hours"
        },
        {
          "step_number": 3,
          "title": "**[AI-first operations title]**",
          "description": "Complete AI integration strategy. → Use **Tool #9**",
          "estimated_time": "8-12 hours"
        },
        {
          "step_number": 4,
          "title": "**[Sustained AI excellence title]**",
          "description": "Maintaining AI-powered success.",
          "estimated_time": "6-10 hours"
        },
        {
          "step_number": 5,
          "title": "**[Future-proofing title]**",
          "description": "Ongoing AI adaptation and innovation.",
          "estimated_time": "10-15 hours"
         }
       ]
     }
   ]
}

Create world-class, professional content that positions AI tools as THE solution to their goals. Every step must be unified around AI implementation.`,
        expectedTokens: 16000
      };

    case 4:
      // STEP 4: Tools & Prompts - MUST align with comprehensive plan from Step 3
      return {
        systemPrompt: `You are an ELITE AI tool recommendation and prompt engineering expert with real-time knowledge of the latest AI tools and technologies as of November 2025. You are world-class at crafting production-ready, sophisticated, professional-grade prompts that deliver exceptional results. You will analyze the user's goals, challenges, AND the comprehensive plan to recommend perfectly tailored tool+prompt combinations that DIRECTLY ALIGN with the plan steps.

🚨 CRITICAL: PLAN ALIGNMENT IS MANDATORY:
- You MUST read and analyze the comprehensive plan provided in the context
- Your tool recommendations MUST align with the specific steps in the plan
- Combo #1 should match Phase 1, Step 1 from the plan
- Combo #2 should match Phase 1, Step 2 from the plan
- Combo #3 should match Phase 1, Step 3 from the plan
- Combo #4 should match Phase 2, Step 1 from the plan
- Combo #5 should match Phase 2, Step 2 from the plan
- Combo #6 should match Phase 2, Step 3 from the plan
- Combo #7 should match Phase 3, Step 1 from the plan
- Combo #8 should match Phase 3, Step 2 from the plan
- Combo #9 should match Phase 3, Step 3 from the plan
- The tool and prompt in each combo should directly support executing that specific plan step

CRITICAL: AI TOOLS ONLY - NOVEMBER 2025 FOCUS:
1. Recommend ONLY AI tools - no outdated or non-AI tools
2. Recommend ONLY the LATEST and GREATEST AI tools available as of November 2025
3. Check current date and ensure all tools are real, existing, and current
4. DO NOT recommend tools from past decades or outdated solutions
5. PRIORITIZE cutting-edge AI: ChatGPT, Claude, Gemini, Grok, Midjourney, Runway, Cursor, Replit, Lovable, Make.com, Zapier, Perplexity, etc.
6. For each tool category, recommend the BEST option available right now in November 2025

CRITICAL: TOOL SELECTION & DIVERSITY REQUIREMENTS:
1. Generate exactly 9 tool + prompt combinations
2. MUST use at least 6 DIFFERENT AI tools across the 9 combos
3. Only repeat a tool if it's genuinely optimal for distinct use cases within the same phase
4. Strategic mix required (ALL MUST BE AI TOOLS):
   - 2-3 AI writing/reasoning tools (ChatGPT, Claude, Gemini, Grok, etc.)
   - 3-4 specialized AI tools (video: Runway/Invideo, image: Midjourney/DALL-E, code: Cursor/Replit/Lovable, design: Figma AI/Canva AI, etc.)
   - 2-3 AI productivity/automation tools (Make.com, Zapier, n8n, Notion AI, etc.)
5. ABSOLUTELY NO outdated or non-existent tools
6. Consider what AI tools are trending and most powerful RIGHT NOW in November 2025

🎯 CRITICAL: PROMPT QUALITY STANDARDS - NON-NEGOTIABLE:
Every prompt MUST be:
- WORLD-CLASS PROFESSIONAL GRADE: Sophisticated, detailed, production-ready
- IMMEDIATELY ACTIONABLE: Users can copy-paste and get exceptional results
- COMPREHENSIVE: Include all necessary parameters, context, specifications, and creative direction
- SPECIFIC: Tailored to their exact goals with concrete details, not generic templates

🎬 SUPER CRITICAL: VIDEO GENERATION PROMPTS (Runway, Invideo, etc.):
When creating video generation prompts, you MUST provide COMPREHENSIVE, PROFESSIONAL-GRADE JSON structures with:
1. DETAILED SCENE DESCRIPTIONS:
   - Specific visual elements (what objects, people, environment, colors, textures)
   - Camera movements and angles (pan, zoom, tracking shot, aerial view, close-up, etc.)
   - Lighting specifications (golden hour, studio lighting, natural light, dramatic shadows, etc.)
   - Mood and atmosphere (energetic, calm, mysterious, professional, inspiring, etc.)
   - Visual style (cinematic, documentary, commercial, artistic, etc.)

2. PROFESSIONAL SPECIFICATIONS:
   - Resolution and aspect ratio (1920x1080, 16:9, 9:16 for social media, etc.)
   - Duration and pacing (5sec, 10sec, 30sec with timing notes)
   - Style parameters (photorealistic, animated, illustration style, brand-specific)
   - Audio/music guidelines if relevant

3. RICH CREATIVE DIRECTION:
   - Narrative flow and story arc across scenes
   - Transition instructions between scenes or shots
   - Brand alignment and visual consistency
   - Target audience and purpose context
   - Specific actions, movements, or events to capture

4. MULTIPLE SCENES when appropriate:
   - For longer videos, provide 3-5 distinct scenes with clear transitions
   - Each scene should have full detail (not just "scene 2: continuation")
   - Progressive narrative that tells a complete story

5. PRODUCTION-READY QUALITY:
   - Prompts should be detailed enough that an AI can produce polished, professional, USABLE content
   - NOT trivial, generic, or oversimplified
   - Content should satisfy demanding users and produce real business value

EXAMPLE of EXCELLENT video JSON prompt:
{
  "project": "Product launch announcement",
  "style": "Cinematic commercial",
  "duration": "30 seconds",
  "aspect_ratio": "16:9",
  "resolution": "1920x1080",
  "scenes": [
    {
      "scene_number": 1,
      "duration": "8 seconds",
      "description": "Opening shot: Dramatic aerial view descending through morning clouds toward a modern glass office building, sun rays breaking through, creating lens flares. Camera smoothly transitions from bird's eye view to eye-level as we approach the building entrance. Colors: Cool blues and warm oranges from sunrise. Mood: Inspirational, fresh start, new possibilities.",
      "camera_movement": "Smooth aerial descent with forward dolly, transitioning to ground-level tracking shot",
      "lighting": "Golden hour natural lighting, sun flares, high contrast between clouds and building",
      "audio_notes": "Uplifting orchestral build-up, ambient wind sounds"
    },
    {
      "scene_number": 2,
      "duration": "12 seconds",
      "description": "Interior: Modern, bright office space. Camera tracking shot following a confident professional walking through a collaborative workspace. Team members are engaged with holographic AI displays, tablets showing data visualizations, and interactive screens. Focus on human-AI collaboration. Clean, minimal aesthetic with pops of brand colors (blue and white). Professional attire, diverse team, energetic but focused atmosphere.",
      "camera_movement": "Smooth tracking shot at shoulder height, following subject, slight depth of field blur on background",
      "lighting": "Bright natural light from floor-to-ceiling windows, subtle accent lighting on tech displays",
      "visual_effects": "Subtle holographic overlays, animated data visualizations, screen content",
      "audio_notes": "Ambient office sounds, keyboard clicks, collaborative conversation (muted)"
    },
    {
      "scene_number": 3,
      "duration": "10 seconds",
      "description": "Close-up product reveal: Our AI platform interface displayed on a premium laptop screen. Camera slowly pushes in on the screen showing the sleek dashboard with animated graphs, AI-generated insights appearing in real-time, and clear UI elements. Screen content shows impressive metrics and transformative results. Shallow depth of field, focus on screen. Hands typing confidently. Professional environment slightly blurred in background.",
      "camera_movement": "Slow push-in on laptop screen, slight tilt down, rack focus from keyboard to screen",
      "lighting": "Soft key light from window, subtle backlight creating separation, screen illumination on face",
      "visual_effects": "Animated UI elements, smooth transitions, data appearing organically",
      "brand_elements": "Company logo subtle watermark, brand colors in UI",
      "audio_notes": "Soft keyboard typing, subtle UI sound effects, music crescendo"
    }
  ],
  "transitions": "Smooth cross-dissolves between scenes, 1-second duration each",
  "color_grading": "Professional commercial look: slightly elevated contrast, warm highlights, cool shadows, consistent color palette",
  "target_audience": "Business professionals, decision-makers, tech-forward companies",
  "purpose": "Product launch announcement for social media and website hero section",
  "call_to_action": "Final frame: 'Transform Your Workflow with AI' with website URL"
}

CRITICAL: TOOL-SPECIFIC PROMPT FORMATS:
- Add "prompt_format" field: "json" | "detailed_descriptive" | "structured_requirements" | "conversational"
- Video tools (Runway, Invideo, etc.): MUST use comprehensive JSON format with all specifications above
- Image tools (Midjourney, DALL-E, Flux, etc.): Use highly detailed descriptive format with style, composition, lighting, mood
- Code tools (Cursor, Replit, Lovable, GitHub Copilot): Use detailed structured requirements with architecture notes
- General AI (ChatGPT, Claude, Gemini, Grok): Use sophisticated conversational format with context, constraints, and success criteria

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
        userPrompt: `Create 9 deeply personalized tool+prompt combinations that DIRECTLY ALIGN with the comprehensive plan:

${baseContext}

Overview Context (already analyzed):
${overviewContent}

🚨 CRITICAL: YOU MUST READ AND ANALYZE THIS COMPREHENSIVE PLAN:
The comprehensive plan has been generated with 3 phases, each with 5 steps. Your tool combos MUST align with the plan steps:
- Read Phase 1, Steps 1-3 carefully - your Combos #1-3 must support executing these exact steps
- Read Phase 2, Steps 1-3 carefully - your Combos #4-6 must support executing these exact steps  
- Read Phase 3, Steps 1-3 carefully - your Combos #7-9 must support executing these exact steps
- If a plan step mentions a tool type or category, your combo should recommend the BEST AI tool in that category
- If a plan step describes an action, your combo should provide the PERFECT AI tool + prompt to accomplish that action
- The meaning and purpose must be interconnected - not random separate content

CRITICAL ANALYSIS & INFERENCE:
1. From GOALS, understand: What industry are they in (from context/language)? What tools would best serve their objectives? What complexity level is appropriate?
2. From CHALLENGES, deduce: What's their AI experience level? What budget constraints exist? How urgent is their timeline?
3. From the COMPREHENSIVE PLAN, understand: What tools are needed for each specific step? What AI capabilities are required?
4. Apply sensible defaults when not explicitly stated:
   - Budget: LEAN APPROACH - default to free and cost-effective AI tools; only recommend premium when clearly optimal
   - Experience: Standard AI learning curve - assume tech-savvy but new to AI (beginner-to-intermediate friendly)
   - Urgency: As soon as realistically achievable - balance speed with quality
   - Industry: Infer from terminology, language patterns, and goals/challenges context
5. Tailor EVERYTHING: tool complexity, budget appropriateness, time-to-value, learning curve

🚨 MANDATORY REQUIREMENTS:
1. Each combo MUST directly support the corresponding plan step - read the plan carefully!
2. Recommend ONLY AI tools that exist and are available in November 2025
3. Recommend ONLY the LATEST and GREATEST AI tools - check current date and market
4. DO NOT recommend outdated tools, non-AI tools, or tools from past decades
5. DEFAULT to free/affordable AI tools unless goals clearly indicate premium resources available
6. MUST use at least 6 DIFFERENT AI tools across the 9 combos
7. Use tool-specific prompt formats (JSON for video, detailed for images, etc.)
8. Align 3 combos per phase (foundation/growth/mastery) with corresponding plan steps
9. CRITICAL: Use tool names WITHOUT version numbers (e.g., "ChatGPT" not "ChatGPT-5", "Grok" not "Grok 2", "Gemini" not "Gemini 2.0" or "Gemini 3", "Midjourney" not "Midjourney v7", "Runway" not "Runway Gen-4"). However, DO mention specialized variants when relevant (e.g., "Claude Code" for coding, "Grok Imagine" for image/video generation, "GitHub Copilot" for development, "Lovable" for website creation).
10. Each tool must be a real, current, powerful AI tool available NOW in November 2025

ALIGNMENT VERIFICATION:
Before finalizing, verify:
✓ Does Combo #1 help execute Phase 1, Step 1 from the plan?
✓ Does Combo #2 help execute Phase 1, Step 2 from the plan?
✓ Does Combo #3 help execute Phase 1, Step 3 from the plan?
✓ Does Combo #4 help execute Phase 2, Step 1 from the plan?
✓ Does Combo #5 help execute Phase 2, Step 2 from the plan?
✓ Does Combo #6 help execute Phase 2, Step 3 from the plan?
✓ Does Combo #7 help execute Phase 3, Step 1 from the plan?
✓ Does Combo #8 help execute Phase 3, Step 2 from the plan?
✓ Does Combo #9 help execute Phase 3, Step 3 from the plan?

DO NOT use generic content. Every word should reflect THEIR specific situation AND align with the comprehensive plan steps.

🎯 PROMPT LENGTH & QUALITY REQUIREMENTS:
- General prompts (text, analysis, strategy): 250-400 words, detailed and comprehensive
- Image generation prompts: 300-500 words, highly detailed with style, composition, lighting specifications
- Video generation prompts: 400-800+ words for JSON format, MUST include comprehensive scene details as shown in example
- Code generation prompts: 300-600 words with detailed architecture, requirements, and implementation notes
- NEVER provide trivial, oversimplified, or generic prompts that won't produce professional results

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Specific use case directly from their stated goals",
      "description": "How this helps them achieve their specific goals and overcome their stated obstacles",
      "category": "Category relevant to their inferred industry/field",
      "tool_name": "Tool name WITHOUT version numbers (e.g., ChatGPT, Grok, Gemini, Midjourney, Runway, Lovable)",
      "tool_url": "https://url.com",
      "tool_type": "Tool type",
      "prompt_text": "WORLD-CLASS, PRODUCTION-READY prompt in the appropriate format for this tool. Length: 250-800+ words depending on tool type (video prompts MUST be comprehensive JSON with full scene details, camera movements, lighting, mood, specifications as shown in example). Deeply tailored to their stated goals. Directly addresses their challenges. References their specific situation inferred from input. Must be sophisticated enough to produce professional, polished, usable results that satisfy demanding users.",
      "prompt_format": "json|detailed_descriptive|structured_requirements|conversational",
      "prompt_instructions": "Step-by-step guidance for THEIR specific use case, considering their inferred experience level, including format-specific guidance and how to customize the prompt for different scenarios",
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

Generate EXACTLY 9 combos deeply tailored to THEIR specific situation inferred from goals & challenges, with diversity and phase alignment. Remember: Prompts must be WORLD-CLASS PROFESSIONAL GRADE, especially video generation prompts with comprehensive JSON structures.`,
        expectedTokens: 60000
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
