import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
// NOTE: gemini-client.ts also exists in this folder, but this function implements
// streaming directly to forward token deltas into our own SSE stream.
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

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    // Parse and validate input
    const body = await req.json();
    const { formData, turnstileToken, sttTracking }: { 
      formData: StudioFormData; 
      turnstileToken?: string;
      sttTracking?: {
        sttUsed: boolean;
        inputMethod: 'typed' | 'narrated' | 'mixed';
        goalsSttSeconds: number;
        challengesSttSeconds: number;
      };
    } = body;
    
    // Log STT tracking data
    console.log('🎤 STT tracking data received:', sttTracking);
    
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
      
      // Detect preview/staging environments to use test secret key
      const origin = req.headers.get('origin') || '';
      const isPreviewEnvironment = origin.includes('lovable.app') || 
                                   origin.includes('lovableproject.com') || 
                                   origin.includes('localhost') ||
                                   origin.includes('preview');
      
      // Use Cloudflare's test secret key for preview environments
      // This matches the test site key used on the frontend
      const turnstileSecret = isPreviewEnvironment 
        ? '1x0000000000000000000000000000000AA'  // Cloudflare's always-pass test secret
        : Deno.env.get('TURNSTILE_SECRET_KEY');
      
      console.log(`🔐 Using ${isPreviewEnvironment ? 'TEST' : 'PRODUCTION'} Turnstile secret (origin: ${origin})`);
      
      if (!turnstileSecret) {
        console.error('❌ TURNSTILE_SECRET_KEY not configured');
        await logApiUsage(supabase, 'jumps-ai-streaming', null, ipAddress, userAgent, 500, Date.now() - startTime, 'Turnstile config error');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: corsHeaders }
        );
      }

      const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

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
            return false;
          }
        };
        
        // Helper to send progress updates during generation (simulates streaming feel)
        const sendProgress = (step: number, stepName: string, percent: number, message: string) => {
          if (isClosed) return;
          try {
            const progressMessage = `data: ${JSON.stringify({ step, type: 'progress', data: { stepName, percent, message } })}\n\n`;
            controller.enqueue(encoder.encode(progressMessage));
          } catch (error) {
            console.error('Error sending progress:', error);
          }
        };

        try {
          // Step 1: Generate JUST the name (quick, 3-5 seconds)
          console.log('📝 Step 1: Generating jump name...');
          const namingResponse = await callGeminiWithRetry(GOOGLE_GEMINI_API_KEY, 1, formData, '');
          console.log('✅ Naming response:', namingResponse);
          console.log('✅ Naming response jumpName field:', namingResponse?.jumpName);
          
          // Ensure jumpName exists (fallback if needed)
          if (!namingResponse || !namingResponse.jumpName) {
            console.warn('⚠️ No jumpName in response, using fallback');
            namingResponse.jumpName = 'AI Transformation Journey';
          }
          
          // Create the jump record in database immediately after naming
          let jumpId: string | undefined;
          let jumpTitle: string;
          
          try {
            if (user?.id) {
              // Logged-in user: Create with Jump # format
              // Get next jump number (simple count + 1)
              const { count } = await supabase
                .from('user_jumps')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
              
              const jumpNumber = (count || 0) + 1;
              jumpTitle = `Jump #${jumpNumber}: ${namingResponse.jumpName}`;
              
              const { data: savedJump, error: insertError } = await supabase
                .from('user_jumps')
                .insert({
                  user_id: user.id,
                  title: jumpTitle,
                  summary: `AI Transformation: ${namingResponse.jumpName}`,
                  full_content: JSON.stringify({ jumpName: namingResponse.jumpName }),
                  completion_percentage: 5,
                  status: 'generating',
                  ip_address: ipAddress,
                  location: location,
                  form_goals: formData.goals,
                  form_challenges: formData.challenges || '',
                  // STT tracking fields
                  stt_used: sttTracking?.sttUsed || false,
                  input_method: sttTracking?.inputMethod || 'typed',
                  goals_stt_seconds: sttTracking?.goalsSttSeconds || 0,
                  challenges_stt_seconds: sttTracking?.challengesSttSeconds || 0
                })
                .select()
                .single();
              
              if (insertError) {
                console.error('❌ Error creating user jump:', insertError);
              } else {
                jumpId = savedJump.id;
                console.log('✅ User jump created with ID:', jumpId);
              }
            } else {
              // Guest user: Create with simple title (no Jump #)
              jumpTitle = namingResponse.jumpName;
              
              const { data: savedJump, error: insertError } = await supabase
                .from('user_jumps')
                .insert({
                  user_id: null,
                  title: jumpTitle,
                  summary: `AI Transformation: ${namingResponse.jumpName}`,
                  full_content: JSON.stringify({ jumpName: namingResponse.jumpName }),
                  completion_percentage: 5,
                  status: 'generating',
                  ip_address: ipAddress,
                  location: location,
                  form_goals: formData.goals,
                  form_challenges: formData.challenges || '',
                  // STT tracking fields
                  stt_used: sttTracking?.sttUsed || false,
                  input_method: sttTracking?.inputMethod || 'typed',
                  goals_stt_seconds: sttTracking?.goalsSttSeconds || 0,
                  challenges_stt_seconds: sttTracking?.challengesSttSeconds || 0
                })
                .select()
                .single();
              
              if (insertError) {
                console.error('❌ Error creating guest jump:', insertError);
                console.error('Insert error details:', JSON.stringify(insertError));
              } else {
                jumpId = savedJump.id;
                console.log('✅ Guest jump created with ID:', jumpId, 'Title:', jumpTitle);
              }
            }
          } catch (dbError) {
            console.error('❌ Database error during jump creation:', dbError);
          }
          
          // Include IP, location, and jumpId metadata in the naming response
          const namingWithMeta = {
            jumpName: namingResponse.jumpName,
            ...namingResponse,
            _metadata: {
              ipAddress,
              location,
              userAgent: userAgent.substring(0, 200),
              jumpId, // Include the jumpId so frontend knows it
              jumpTitle
            }
          };
          
          console.log('📤 Sending naming event with data:', { 
            jumpName: namingWithMeta.jumpName,
            jumpId,
            hasMetadata: !!namingWithMeta._metadata 
          });
          
          sendEvent(1, 'naming', namingWithMeta);
          
          // Step 2: Generate Overview & Plan with progress updates
          console.log('📊 Step 2: Generating overview...');
          sendProgress(2, 'overview', 10, 'Analyzing your goals and challenges...');
          await new Promise(r => setTimeout(r, 800)); // Small delay for UI feedback
          sendProgress(2, 'overview', 20, 'Building strategic framework...');
          
           const overviewResponse = await callGeminiWithRetry(
             GOOGLE_GEMINI_API_KEY,
             2,
             formData,
             '',
             3,
             (delta) => {
               // Token-by-token visible streaming in the Overview tab
               sendEvent(2, 'delta', { stepName: 'overview', delta });
             }
           );
          console.log('✅ Overview response:', overviewResponse);
          sendEvent(2, 'overview', overviewResponse);
          
          const overviewContent = typeof overviewResponse === 'string' 
            ? overviewResponse 
            : JSON.stringify(overviewResponse);

          // Step 3: Generate comprehensive plan with progress updates
          console.log('🔧 Step 3: Generating Comprehensive Plan...');
          sendProgress(3, 'plan', 35, 'Designing implementation phases...');
          await new Promise(r => setTimeout(r, 600));
          sendProgress(3, 'plan', 45, 'Creating action milestones...');
          
          let comprehensivePlan = '';
          let planResponse = null;
          try {
             planResponse = await callGeminiWithRetry(
               GOOGLE_GEMINI_API_KEY,
               3,
               formData,
               overviewContent,
               3,
               (delta) => {
                 // Token-by-token visible streaming in the Plan tab
                 sendEvent(3, 'delta', { stepName: 'plan', delta });
               }
             );
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

          // Step 4: Generate tools & prompts with progress updates
          console.log('🔧 Step 4: Generating Tools & Prompts...');
          sendProgress(4, 'tool_prompts', 65, 'Selecting optimal AI tools...');
          await new Promise(r => setTimeout(r, 600));
          sendProgress(4, 'tool_prompts', 75, 'Crafting custom prompts...');
          await new Promise(r => setTimeout(r, 400));
          sendProgress(4, 'tool_prompts', 85, 'Finalizing recommendations...');
          
          let toolsResponse = null;
          try {
            // Combine overview and comprehensive plan for Step 4 context
            const fullContext = `${overviewContent}\n\nCOMPREHENSIVE PLAN:\n${comprehensivePlan}`;
             toolsResponse = await callGeminiWithRetry(
               GOOGLE_GEMINI_API_KEY,
               4,
               formData,
               fullContext,
               3,
               (delta) => {
                 // Token-by-token visible streaming in the Tools & Prompts tab
                 sendEvent(4, 'delta', { stepName: 'tool_prompts', delta });
               }
             );
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

          // CRITICAL: Save ALL generated content to database
          if (jumpId) {
            try {
              // Build comprehensive_plan object with NEW 4-frame structure
              const comprehensivePlanData = {
                // NEW 4-FRAME STRUCTURE (from Step 2 - Overview)
                jumpForward: overviewResponse?.jumpForward || '',
                strategicEdge: overviewResponse?.strategicEdge || { analysis: '', keyPoints: [] },
                flightPath: overviewResponse?.flightPath || { vision: '', roadmap: [] },
                newBaseline: overviewResponse?.newBaseline || '',
                // Action plan from Step 3
                action_plan: planResponse || { phases: [] },
              };
              
              // Build structured_plan (the action plan phases)
              const structuredPlanData = planResponse || { phases: [] };
              
              // Build full_content for search/context
              let fullContent = '';
              if (overviewResponse?.jumpForward) {
                fullContent += `## The Jump Forward\n\n${overviewResponse.jumpForward}\n\n`;
              }
              if (overviewResponse?.strategicEdge?.analysis) {
                fullContent += `## Strategic Edge\n\n${overviewResponse.strategicEdge.analysis}\n\n`;
                if (overviewResponse.strategicEdge.keyPoints?.length) {
                  overviewResponse.strategicEdge.keyPoints.forEach((p: string) => fullContent += `- ${p}\n`);
                  fullContent += '\n';
                }
              }
              if (overviewResponse?.flightPath?.vision) {
                fullContent += `## Flight Path\n\n${overviewResponse.flightPath.vision}\n\n`;
              }
              if (overviewResponse?.newBaseline) {
                fullContent += `## New Baseline\n\n${overviewResponse.newBaseline}\n\n`;
              }
              
              // Add plan content
              if (planResponse?.phases?.length) {
                fullContent += '\n\n=== STRATEGIC ACTION PLAN ===\n';
                planResponse.phases.forEach((phase: any, idx: number) => {
                  fullContent += `\n### Phase ${phase.phase_number || idx + 1}: ${phase.title}\n`;
                  fullContent += `Duration: ${phase.duration || ''}\n`;
                  fullContent += `${phase.description || ''}\n\n`;
                });
              }
              
              console.log('💾 Saving comprehensive_plan and structured_plan to database...');
              console.log('💾 comprehensive_plan preview:', JSON.stringify(comprehensivePlanData).substring(0, 200));
              console.log('💾 structured_plan preview:', JSON.stringify(structuredPlanData).substring(0, 200));
              
              await supabase
                .from('user_jumps')
                .update({
                  completion_percentage: 100,
                  status: 'completed',
                  comprehensive_plan: comprehensivePlanData,
                  structured_plan: structuredPlanData,
                  full_content: fullContent.trim()
                })
                .eq('id', jumpId);
              console.log('✅ Jump marked as completed with all generated content saved:', jumpId);
            } catch (updateError) {
              console.error('❌ Error updating jump with generated content:', updateError);
            }
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
          
          // Update jump status to failed if we created one
          if (jumpId) {
            try {
              await supabase
                .from('user_jumps')
                .update({
                  status: 'failed'
                })
                .eq('id', jumpId);
              console.log('❌ Jump marked as failed:', jumpId);
            } catch (updateError) {
              console.error('❌ Error updating jump status to failed:', updateError);
            }
          }
          
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

// Retry wrapper with exponential backoff for Google Gemini API calls
async function callGeminiWithRetry(
  apiKey: string,
  step: number,
  context: StudioFormData,
  overviewContent: string,
  maxRetries: number = 3,
  onDelta?: (delta: string) => void
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Step ${step}: Attempt ${attempt}/${maxRetries}`);
      const startTime = Date.now();
      
      const result = await callGemini(apiKey, step, context, overviewContent, onDelta);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Step ${step}: Success on attempt ${attempt} (${duration}ms)`);
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a retryable error (5xx server errors or rate limits)
      const isRetryable = error.message?.includes('502') || 
                          error.message?.includes('503') || 
                          error.message?.includes('504') ||
                          error.message?.includes('500') ||
                          error.message?.includes('429');
      
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

async function callGemini(
  apiKey: string,
  step: number,
  context: StudioFormData,
  overviewContent: string,
  onDelta?: (delta: string) => void
): Promise<any> {
  const { systemPrompt, userPrompt, expectedTokens } = getStepPrompts(step, context, overviewContent);
  
  console.log(`🚀 Step ${step}: Calling Google Gemini API (model: gemini-3-flash-preview, maxOutputTokens: ${expectedTokens})`);

  // If a delta callback is provided, use TRUE SSE streaming endpoint and emit deltas.
  // This makes the UI visibly update token-by-token instead of only per step.
  let content = '';
  if (onDelta) {
    const geminiStreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(geminiStreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: expectedTokens,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const truncatedError = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
      console.error(`❌ Gemini streaming API error (step ${step}): ${response.status}`);
      console.error(`Error details: ${truncatedError}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body for streaming');

    const decoder = new TextDecoder();
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      // Parse SSE line-by-line. Each "data: {json}" line may arrive in fragments.
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (!trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
          if (delta) {
            content += delta;
            onDelta(delta);
          }
        } catch {
          // Incomplete JSON; put the line back and wait for more bytes.
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush for any leftover line without trailing newline
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        const trimmed = raw.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (!trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
          if (delta) {
            content += delta;
            onDelta(delta);
          }
        } catch {
          // ignore leftovers
        }
      }
    }
  } else {
    // Non-streaming fallback
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: expectedTokens,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const truncatedError = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
      console.error(`❌ Gemini API error (step ${step}): ${response.status}`);
      console.error(`Error details: ${truncatedError}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error(`❌ Step ${step}: No content in Gemini API response`);
      throw new Error('No content in Gemini API response');
    }
    content = text;
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

// Helper function to get current date dynamically
function getCurrentDate(): { month: string; year: number } {
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return {
    month: months[now.getMonth()],
    year: now.getFullYear()
  };
}

function getStepPrompts(step: number, context: StudioFormData, overviewContent: string) {
  // Get current date dynamically
  const currentDate = getCurrentDate();
  const dateReference = `${currentDate.month} ${currentDate.year}`;
  
  // Build context from user input - unified single input field
  // The user provides everything in one field: goals, challenges, context, vision
  const userInput = context.goals || 'Not specified';
  const baseContext = `
USER'S INPUT (goals, challenges, vision, and context):
${userInput}
  `.trim();

  switch (step) {
    case 1:
      // STEP 1: Quick name generation - extract insights from goals & challenges
      return {
        systemPrompt: `You are a creative naming expert and business analyst. From the user's input, you will intelligently infer their context (industry, role, experience level, urgency, goals, challenges) and create an inspiring journey name.`,
        userPrompt: `Analyze this person's situation deeply from what they've shared:

${baseContext}

Your task:
1. From their INPUT, infer: What industry/field are they in? What's their likely role? What transformation do they seek?
2. Understand: What's blocking them? What goals do they have? What's their experience level? How urgent is this?
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
      // STEP 2: Strategic Overview - NEW 4-FRAME CONCISE STRUCTURE
      return {
        systemPrompt: `You are a world-class AI adaptation strategist at JumpinAI - the premier AI Adaptation Studio.
You create CONCISE, HIGH-IMPACT strategic overviews. No walls of text. Every sentence must earn its place.
Your expertise: Cutting through noise to deliver clear, actionable direction using the latest AI tools.

CORE MISSION: Deliver crystal-clear strategic direction using AI tools available as of ${dateReference}.
This is about CLARITY and ACTION - not lengthy explanations.

Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text.`,
        userPrompt: `Create a CONCISE strategic overview for this AI ADAPTATION journey:

${baseContext}

🎯 CRITICAL: This must be CONCISE and HIGH-IMPACT. No walls of text!

THE NEW 4-FRAME STRUCTURE:

1. **THE JUMP FORWARD** (2-3 sentences MAX)
   - Immediately give THE answer - the proposed solution, the path forward
   - Don't repeat what they told you - give them the STRATEGIC RESPONSE
   - How will they achieve their goals using the best AI tools available TODAY (${dateReference})?
   - Be specific about which AI tool categories will be most impactful

2. **STRATEGIC EDGE** (Concise analytical justification)
   - WHY this is the right move - the senior strategist logic
   - 2-3 short sentences of deep but punchy analysis
   - 3-4 bullet points explaining the "why's"
   - Make it sound analytical, high-level, professional

3. **FLIGHT PATH** (Victory Vision + Roadmap combined)
   - Start with 1-2 sentences: Where they'll land after this journey (the vision)
   - Then the roadmap with APPROPRIATE timeframes based on their goals:
     * Some goals = days/weeks, others = months, others = 90 days+, some even a year+
     * DEEPLY ANALYZE their situation to determine realistic timeframes
     * Don't use rigid "0-30 days" if their goal could be achieved in a week
   - Include specific AI tools they'll implement at each stage
   - Be optimistic but realistic about pace

4. **NEW BASELINE** (1-2 sentences MAX)
   - Powerful, inspiring closing statement
   - The "landing zone" - where they'll be after the jump
   - Beginning of their new journey with AI
   - Make it memorable and motivational

AI TOOL GUIDANCE (${dateReference}):
- AI Writing/Reasoning: Claude, ChatGPT, Gemini, Grok, Perplexity
- AI Code: Cursor, Lovable, Replit, GitHub Copilot, Bolt, V0
- AI Image: Midjourney, DALL-E, Flux, Stable Diffusion
- AI Video: Runway, Veo, Invideo AI, Sora, Kling AI
- AI Audio: ElevenLabs, Suno, Udio
- AI Automation: Make.com, Zapier AI, n8n
- Select the BEST and MOST APPROPRIATE tools for their specific needs

Return ONLY this JSON structure:
{
  "jumpForward": "2-3 sentences MAX. The strategic response - the path forward using AI. Be specific about AI tools. Don't repeat their input - give them the ANSWER.",
  "strategicEdge": {
    "analysis": "2-3 sentences of deep but concise analytical justification. Why THIS is the right strategic move.",
    "keyPoints": ["First key 'why' point", "Second strategic insight", "Third analytical point", "Fourth supporting reason"]
  },
  "flightPath": {
    "vision": "1-2 sentences: The destination - what success looks like when they've implemented AI",
    "roadmap": [
      {
        "phase": "Phase name (e.g., 'Foundation', 'Acceleration', 'Mastery')",
        "timeframe": "Appropriate timeframe based on THEIR specific goals (could be 'Week 1', '2-4 weeks', '1-3 months', etc.)",
        "focus": "1-2 sentences: What they'll accomplish and which AI tools they'll use"
      },
      {
        "phase": "Second phase name",
        "timeframe": "Appropriate next timeframe",
        "focus": "1-2 sentences: Next level achievements with specific AI tools"
      },
      {
        "phase": "Third phase name", 
        "timeframe": "Appropriate final timeframe",
        "focus": "1-2 sentences: Advanced implementation and sustained success"
      }
    ]
  },
  "newBaseline": "1-2 sentences MAX. Powerful, inspiring closing. The new reality after the jump. Make it memorable."
}

CRITICAL: Keep it CONCISE. This overview should be visually appealing and readable - NOT a wall of text. Quality over quantity.`,
        expectedTokens: 3000
      };

    case 3:
      // STEP 3: AI IMPLEMENTATION Action Plan - 3 phases with 5 steps each
      return {
        systemPrompt: `You are an elite AI adaptation strategist at JumpinAI - the world's premier AI Adaptation Studio.
Your mission: Help people achieve their goals by strategically implementing AI tools into their workflow.
You create world-class, professional strategic action plans where EVERY step centers around implementing specific AI tools.

CORE PHILOSOPHY:
- This is an AI IMPLEMENTATION plan, not a generic business plan
- Each step = One strategic AI-powered action using the latest, most powerful AI tools
- We teach AI by helping people USE IT to achieve their actual goals
- No old-school methods, no non-AI recommendations, ONLY cutting-edge AI tools

You have deep expertise in the latest AI tools available as of ${dateReference}. Return ONLY valid JSON.`,
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

2. **LATEST AI TOOLS ONLY** (as of ${dateReference}):
   Recommend from these CATEGORIES (choose the BEST current tools in each):
   - AI Writing/Reasoning: Claude, ChatGPT, Gemini, Grok, Perplexity
   - AI Code: Cursor, Lovable, Replit, GitHub Copilot, Bolt, V0
   - AI Image: Midjourney, DALL-E, Flux, Stable Diffusion
   - AI Video: Runway, Veo, Invideo AI, Sora, Kling AI
   - AI Audio: ElevenLabs, Suno, Udio
   - AI Automation: Make.com, Zapier AI, n8n
   - AI Research: Perplexity, NotebookLM, Claude
   - AI Design: Figma AI, Uizard, Galileo AI, Canva AI
   - Specialized: Harvey AI, Jasper, Copy.ai, Descript, Synthesia
   
   IMPORTANT: These are EXAMPLES of tool categories. Select the BEST and MOST APPROPRIATE tools for the user's specific needs.
   Verify tools are still market leaders and most powerful options available.
   
3. **NO VERSION NUMBERS**: Use base tool names only (e.g., "ChatGPT" not "GPT-5", "Gemini" not "Gemini 2.0", "Grok" not "Grok 2", "Midjourney" not "Midjourney v7", "Runway" not "Runway Gen-4"). However, DO mention specialized variants when relevant (e.g., "Claude Code" for coding, "Grok Imagine" for image generation, "GitHub Copilot" for development, "Lovable" for website creation).

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

⏱️ CRITICAL: TIMEFRAME PHILOSOPHY:
- Be OPTIMISTIC yet REALISTIC about implementation pace
- Acknowledge that people have different learning curves, time availability, and implementation speeds
- Use FLEXIBLE timeframe language: "Early stage", "Building momentum", "Advanced implementation" rather than rigid week numbers
- For time estimates: Use ranges (e.g., "3-10 hours depending on your pace") that acknowledge variance
- Remember: AI is accelerating rapidly - what seemed to take months now takes days/weeks
- Avoid overly long timeframes (12+ weeks) - we're in fast-moving times
- Frame timing as "when ready to advance" not "in week X"
- No one knows their exact pace until they start - be encouraging and flexible

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
      "duration": "**Early Stage** — Begin when ready",
      "steps": [
        {
          "step_number": 1,
          "title": "**[AI-focused action title mentioning the AI tool or AI capability]**",
          "description": "Detailed 3-4 sentences explaining: WHICH AI tool to use, HOW to use it for their goal, WHAT specific AI-powered actions to take, and WHY this AI implementation matters. Example: 'Use **Claude** to analyze your market positioning by feeding it competitor data and asking for strategic insights. Experiment with detailed prompts to extract actionable recommendations.' → Use **Tool #1**",
          "estimated_time": "3-8 hours (varies by pace)"
        },
        {
          "step_number": 2,
          "title": "**[AI-powered action title]**",
          "description": "Specific AI tool implementation guidance with HOW-TO details. Focus entirely on AI usage. → Use **Tool #2**",
          "estimated_time": "4-10 hours (adjust to your schedule)"
        },
        {
          "step_number": 3,
          "title": "**[AI implementation title]**",
          "description": "Detailed AI tool usage instructions, no generic advice. → Use **Tool #3**",
          "estimated_time": "5-12 hours (depending on complexity)"
        },
        {
          "step_number": 4,
          "title": "**[AI-centered action title]**",
          "description": "Another AI-powered strategic action with specific tool guidance.",
          "estimated_time": "3-6 hours (flexible timeline)"
        },
        {
          "step_number": 5,
          "title": "**[AI workflow title]**",
          "description": "AI implementation step completing the foundation phase.",
          "estimated_time": "4-8 hours (progress at your pace)"
        }
      ]
    },
    {
      "phase_number": 2,
      "title": "Growth Phase: [AI scaling title]",
      "description": "Overview of scaling AI implementation. Use **bold** for AI achievements.",
      "duration": "**Building Momentum** — Advance when ready",
      "steps": [
        {
          "step_number": 1,
          "title": "**[Advanced AI implementation title]**",
          "description": "Detailed AI tool usage for scaling. → Use **Tool #4**",
          "estimated_time": "6-15 hours (scales with experience)"
        },
        {
          "step_number": 2,
          "title": "**[AI automation title]**",
          "description": "AI workflow optimization guidance. → Use **Tool #5**",
          "estimated_time": "5-12 hours (adapt as needed)"
        },
        {
          "step_number": 3,
          "title": "**[AI integration title]**",
          "description": "Advanced AI tool implementation. → Use **Tool #6**",
          "estimated_time": "4-10 hours (your timeline)"
        },
        {
          "step_number": 4,
          "title": "**[AI-powered growth title]**",
          "description": "AI scaling strategy with specific tools.",
          "estimated_time": "4-8 hours (flexible approach)"
        },
        {
          "step_number": 5,
          "title": "**[AI optimization title]**",
          "description": "AI workflow refinement step.",
          "estimated_time": "5-12 hours (individual pace)"
        }
      ]
    },
    {
      "phase_number": 3,
      "title": "Mastery Phase: [AI excellence title]",
      "description": "Overview of AI mastery and automation. Use **bold** for AI outcomes.",
      "duration": "**Advanced Implementation** — Progress as you grow",
      "steps": [
        {
          "step_number": 1,
          "title": "**[AI mastery title]**",
          "description": "Expert-level AI implementation. → Use **Tool #7**",
          "estimated_time": "8-16 hours (mastery takes time)"
        },
        {
          "step_number": 2,
          "title": "**[AI automation mastery title]**",
          "description": "Advanced AI automation guidance. → Use **Tool #8**",
          "estimated_time": "6-15 hours (your learning curve)"
        },
        {
          "step_number": 3,
          "title": "**[AI-first operations title]**",
          "description": "Complete AI integration strategy. → Use **Tool #9**",
          "estimated_time": "5-12 hours (sustainable pace)"
        },
        {
          "step_number": 4,
          "title": "**[Sustained AI excellence title]**",
          "description": "Maintaining AI-powered success.",
          "estimated_time": "4-10 hours (ongoing optimization)"
        },
        {
          "step_number": 5,
          "title": "**[Future-proofing title]**",
          "description": "Ongoing AI adaptation and innovation.",
          "estimated_time": "6-15 hours (evolve continuously)"
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
      // KEY IMPROVEMENT: Tool interaction types - different tools need different content
      return {
        systemPrompt: `You are an ELITE AI tool recommendation expert with real-time knowledge of the latest AI tools as of ${dateReference}. You craft production-ready, professional-grade content tailored to HOW each tool actually works.

🚨 CRITICAL CONCEPT: TOOL INTERACTION TYPES
Different AI tools work in fundamentally different ways. You MUST generate the RIGHT TYPE of content for each tool:

**TYPE: "prompt"** — Tools with a text input box where users type/paste prompts
  Examples: ChatGPT, Claude, Gemini, Grok, Perplexity, DALL-E, Stable Diffusion, Flux
  → Generate: A sophisticated, ready-to-use PROMPT the user can paste directly into the tool's input field
  → The "prompt_text" field contains the actual prompt to copy-paste

**TYPE: "workflow"** — Visual automation/workflow builders with NO prompt input field
  Examples: n8n, Make.com, Zapier, Power Automate, IFTTT
  → Generate: Step-by-step WORKFLOW INSTRUCTIONS explaining exactly how to build the automation
  → The "prompt_text" field contains numbered setup steps (1. Create new scenario, 2. Add trigger: ..., 3. Configure action: ...)
  → Include: trigger type, action modules, data mapping, connections needed
  → NEVER say "paste this prompt" — these tools don't have a prompt field!

**TYPE: "project"** — IDE/builder tools where you create projects, not paste prompts
  Examples: Cursor, Lovable, Replit, Bolt, V0, GitHub Copilot
  → Generate: A PROJECT SPECIFICATION or REQUIREMENTS BRIEF the user can provide to the tool
  → The "prompt_text" field contains structured project requirements (features, tech stack, architecture)
  → For Cursor/Copilot: Generate code-context instructions or specific coding tasks
  → For Lovable/Bolt/V0: Generate app specifications and feature descriptions

**TYPE: "command"** — Tools that use specific command syntax (not free-form prompts)
  Examples: Midjourney (Discord /imagine), Suno (song generation parameters)
  → Generate: Properly formatted COMMANDS with the tool's specific syntax
  → The "prompt_text" field contains the actual command (e.g., "/imagine prompt: ...")
  → Include style parameters, aspect ratios, and tool-specific flags

**TYPE: "upload"** — Tools primarily driven by uploading content, not typing prompts
  Examples: NotebookLM (upload documents), Descript (upload media), ElevenLabs (voice cloning)
  → Generate: A PREPARATION & USAGE GUIDE explaining what to prepare and how to use the tool
  → The "prompt_text" field contains: what content/files to prepare, what settings to configure, what to click

**TYPE: "creative_brief"** — AI video/creative tools that need structured briefs
  Examples: Runway, Veo, Sora, Kling AI, Invideo AI, Synthesia
  → Generate: A comprehensive CREATIVE BRIEF with scene descriptions, visual specs, style direction
  → The "prompt_text" field contains detailed creative specifications (scenes, camera, lighting, mood)

🚨 PLAN ALIGNMENT IS MANDATORY:
- Combo #1-3 align with Phase 1, Steps 1-3
- Combo #4-6 align with Phase 2, Steps 1-3
- Combo #7-9 align with Phase 3, Steps 1-3

AI TOOLS (${dateReference}) — Select the BEST for each use case:
- AI Writing/Reasoning: ChatGPT, Claude, Gemini, Grok, Perplexity
- AI Code: Cursor, Lovable, Replit, GitHub Copilot, Bolt, V0
- AI Image: Midjourney, DALL-E, Flux, Stable Diffusion
- AI Video: Runway, Veo, Invideo AI, Sora, Kling AI
- AI Audio: ElevenLabs, Suno, Udio
- AI Automation: Make.com, Zapier AI, n8n
- AI Research: Perplexity, NotebookLM, Claude
- AI Design: Figma AI, Uizard, Galileo AI, Canva AI

TOOL DIVERSITY: Use at least 6 DIFFERENT tools across 9 combos.
NO VERSION NUMBERS: Use base names (e.g., "ChatGPT" not "GPT-5", "Gemini" not "Gemini 3"). Specialized variants OK (e.g., "Claude Code", "GitHub Copilot").

CONTEXT INFERENCE: From user input, infer industry, experience, budget, urgency. Default to free/affordable tools unless premium is clearly warranted.

Return ONLY valid JSON.`,
        userPrompt: `Create 9 deeply personalized tool+action combinations aligned with the comprehensive plan:

${baseContext}

Overview & Plan Context:
${overviewContent}

🚨 READ THE PLAN: Match each combo to the corresponding plan step.

MANDATORY QUALITY STANDARDS:
- "prompt" type tools: 200-400 word sophisticated, production-ready prompts
- "workflow" type tools: Detailed step-by-step build instructions (trigger → actions → output)
- "project" type tools: Comprehensive project specs and requirements
- "command" type tools: Properly formatted tool-specific commands
- "upload" type tools: Preparation guides with what to gather/configure
- "creative_brief" type tools: Rich visual/creative specifications

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Specific use case from their goals",
      "description": "How this helps achieve their specific goals",
      "category": "Relevant category",
      "tool_name": "Tool name (no version numbers)",
      "tool_url": "https://url.com",
      "tool_type": "Tool type",
      "tool_interaction_type": "prompt|workflow|project|command|upload|creative_brief",
      "prompt_text": "CONTENT APPROPRIATE TO THE TOOL TYPE. For prompt tools: ready-to-paste prompt. For workflow tools: step-by-step build instructions. For project tools: project requirements. For command tools: formatted commands. For upload tools: preparation guide. For creative brief tools: detailed creative specifications.",
      "prompt_format": "json|detailed_descriptive|structured_requirements|conversational|workflow_steps|command_syntax|preparation_guide",
      "prompt_instructions": "Step-by-step guidance for using this specific tool. For workflow tools: include screenshots/menu paths. For prompt tools: where exactly to paste and what settings to use.",
      "when_to_use": "When in their journey this applies",
      "why_this_combo": "Why this tool+content is perfect for their situation",
      "expected_output": "What the user should expect to get from following these instructions",
      "alternatives": [
        {"tool": "Alternative", "url": "url", "note": "Why this alternative works too"}
      ],
      "use_cases": ["Specific use case 1", "Specific use case 2"],
      "tags": ["relevant-tags"],
      "difficulty_level": "beginner|intermediate|advanced",
      "setup_time": "Realistic time estimate",
      "cost_estimate": "Free|$X/mo|etc",
      "phase": 1
    }
  ]
}

CRITICAL VERIFICATION before responding:
✓ Is each combo's content type appropriate for the tool? (No "paste this prompt" for n8n/Make/Zapier!)
✓ Does each combo align with the corresponding plan step?
✓ Are all tools real, current, and the best available as of ${dateReference}?
✓ Is the content professional-grade and immediately actionable?
✓ Are at least 6 different tools used across 9 combos?`,
        expectedTokens: 35000
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
