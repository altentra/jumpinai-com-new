import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// XAI API client with retry logic
async function callXAIWithRetry(
  prompt: string,
  apiKey: string,
  model: string = 'grok-4-fast-non-reasoning',
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} calling xAI API...`);
      const result = await callXAI(prompt, apiKey, model);
      console.log(`✅ xAI API call succeeded on attempt ${attempt}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const statusCode = error.status || error.statusCode;
      
      // Retry on 5xx errors (server errors)
      if (statusCode >= 500 && statusCode < 600 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`⚠️ xAI API error ${statusCode} on attempt ${attempt}. Retrying in ${delay}ms...`, {
          error: error.message,
          attempt,
          maxRetries
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry on 4xx errors (client errors) or if max retries reached
      console.error(`❌ xAI API call failed definitively:`, {
        statusCode,
        error: error.message,
        attempt,
        willRetry: false
      });
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

async function callXAI(prompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specialized in creating action plans and providing practical tools and resources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: model,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ xAI API error response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    const error: any = new Error(`xAI API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.response = errorText;
    throw error;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      jumpId,
      jumpOverview, 
      phaseTitle,
      phaseNumber,
      stepTitle,
      stepDescription,
      stepNumber,
      existingComboCount = 9 // How many combos already exist for this jump
    } = await req.json();

    console.log('🛠️ Equip Step Request:', {
      jumpId,
      phaseTitle,
      phaseNumber,
      stepTitle,
      stepNumber,
      existingComboCount
    });

    // Get XAI API key
    const xaiApiKey = Deno.env.get('XAI_API_KEY');
    if (!xaiApiKey) {
      throw new Error('XAI_API_KEY not configured');
    }

    // Get Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build the prompt for generating a single tool/prompt combo
    const systemPrompt = `You are an expert AI strategy consultant generating a customized tool & prompt combination for a specific implementation step.

CRITICAL REQUIREMENTS:
1. Generate ONE highly specific, deeply personalized tool+prompt combo
2. Recommend ONLY AI tools that exist and are available in November 2025
3. Recommend ONLY the LATEST and GREATEST AI tools - NO outdated tools
4. The combo MUST directly support executing the specific step provided
5. Use tool names WITHOUT version numbers (e.g., "ChatGPT" not "ChatGPT-5", "Gemini" not "Gemini 2.0", "Midjourney" not "Midjourney v7")
6. DO mention specialized variants when relevant (e.g., "Claude Code", "Grok Imagine", "GitHub Copilot", "Lovable")

PROMPT LENGTH & SOPHISTICATION REQUIREMENTS:

**TEXT/WRITING/STRATEGY PROMPTS** (ChatGPT, Claude, Gemini, Grok):
- TARGET: 200-350 words of comprehensive, professional instructions
- Include: Clear context, tone requirements, audience focus, format specs, key success criteria

**IMAGE GENERATION PROMPTS** (Midjourney, DALL-E, Stable Diffusion, Flux):
- TARGET: 180-300 words of detailed visual specifications
- Include: Composition, color palette, lighting, style references, technical specs

**VIDEO GENERATION PROMPTS** (Runway, Veo, Luma AI, Pika, Invideo):
- TARGET: 500-900 words in comprehensive JSON format
- Include: 2-3 key scenes, professional specs, camera movements, lighting, creative direction
- EXAMPLE JSON structure for video prompts:
{
  "project": "Project name",
  "style": "Visual style",
  "duration": "30 seconds",
  "aspect_ratio": "16:9",
  "resolution": "1920x1080",
  "scenes": [
    {
      "scene_number": 1,
      "duration": "8 seconds",
      "description": "Detailed scene description with visual elements, mood, colors, actions",
      "camera_movement": "Camera movement details",
      "lighting": "Lighting setup and mood",
      "audio_notes": "Audio/music guidance"
    }
  ],
  "transitions": "Transition details",
  "color_grading": "Color grading notes",
  "target_audience": "Audience description",
  "purpose": "Purpose of the video"
}

**AUTOMATION/WORKFLOW PROMPTS** (Zapier, Make, n8n):
- TARGET: 250-450 words of step-by-step implementation
- Include: Trigger conditions, action sequences, data mapping, error handling

**CODE GENERATION PROMPTS** (Cursor, Replit, Lovable, GitHub Copilot):
- TARGET: 200-350 words of technical requirements
- Include: Architecture overview, tech stack, key features, code structure, best practices

**RESEARCH/ANALYSIS PROMPTS** (Perplexity, Claude, ChatGPT):
- TARGET: 200-350 words of research parameters
- Include: Research questions, key data sources, analysis approach, output format

⚠️ ABSOLUTE RULE: Every prompt must be PROFESSIONAL, PRODUCTION-READY, and sophisticated enough to produce real business value. Keep it concise yet comprehensive.`;

    const userPrompt = `Generate ONE deeply personalized tool+prompt combination that directly supports executing this specific step:

JUMP OVERVIEW:
${jumpOverview}

PHASE CONTEXT:
Phase ${phaseNumber}: ${phaseTitle}

SPECIFIC STEP TO SUPPORT:
Step ${stepNumber}: ${stepTitle}
Description: ${stepDescription}

🚨 CRITICAL: This combo must be specifically designed to help execute this exact step. The tool and prompt should be perfectly aligned to accomplish what this step requires.

Return ONLY valid JSON:
{
  "title": "Specific use case for this exact step",
  "description": "How this helps execute this specific step",
  "category": "Relevant category",
  "tool_name": "Tool name WITHOUT version numbers",
  "tool_url": "https://url.com",
  "tool_type": "Tool type",
  "prompt_text": "PROFESSIONAL, PRODUCTION-READY prompt. TARGET LENGTH based on tool type. Must be detailed, deeply tailored to this specific step, and sophisticated enough to produce professional results. Keep it concise yet comprehensive.",
  "prompt_format": "json|detailed_descriptive|structured_requirements|conversational",
  "prompt_instructions": "Step-by-step guidance for this specific step, including how to use and customize the prompt",
  "when_to_use": "When executing this specific step in the journey",
  "why_this_combo": "Why perfect for accomplishing this exact step",
  "alternatives": [
    {"tool": "Alternative", "url": "url", "note": "Why appropriate"},
    {"tool": "Alternative", "url": "url", "note": "Why fits constraints"}
  ],
  "use_cases": ["Primary use for this step", "Secondary application", "Alternative scenario"],
  "tags": ["relevant-tags"],
  "difficulty_level": "Beginner|Intermediate|Advanced",
  "setup_time": "Realistic estimate",
  "cost_estimate": "Free|Freemium|$X/month"
}

Generate ONE combo deeply tailored to executing this specific step. The combo must be PROFESSIONAL GRADE yet CONCISE.`;

    console.log('📤 Calling XAI to generate combo...');
    
    const response = await callXAIWithRetry(
      `${systemPrompt}\n\n${userPrompt}`,
      xaiApiKey,
      'grok-4-fast-non-reasoning',
      3
    );

    console.log('📥 XAI Response received');

    // Extract JSON from markdown code blocks if present
    let cleanedResponse = response.trim();
    
    // Check if response is wrapped in markdown code blocks
    const jsonBlockMatch = cleanedResponse.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      cleanedResponse = jsonBlockMatch[1].trim();
      console.log('📋 Extracted JSON from markdown code block');
    }
    
    // Remove any leading/trailing text before/after JSON
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    // CRITICAL: Escape control characters inside string values
    // This prevents JSON parse errors from literal newlines/tabs in descriptions
    cleanedResponse = cleanedResponse.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
      return match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        .replace(/\b/g, '\\b');
    });

    // Parse the response
    let comboData: any;
    try {
      comboData = JSON.parse(cleanedResponse);
      console.log('✅ Successfully parsed combo data');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.log('Raw response:', response);
      console.log('Cleaned response:', cleanedResponse);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('✅ Parsed combo data:', comboData);

    // Calculate the next combo number
    const comboNumber = existingComboCount + 1;

    // Prepare the tool prompt record for database insertion
    const toolPromptRecord = {
      user_id: user.id,
      jump_id: jumpId,
      title: comboData.title || `Combo ${comboNumber}`,
      description: comboData.description || 'No description available',
      tool_name: comboData.tool_name || 'AI Tool',
      tool_url: comboData.tool_url || '',
      tool_type: comboData.tool_type || comboData.category || 'General',
      category: comboData.category || 'General',
      prompt_text: comboData.prompt_text || '',
      prompt_instructions: comboData.prompt_instructions || '',
      difficulty_level: comboData.difficulty_level || 'Beginner',
      setup_time: comboData.setup_time || '',
      cost_estimate: comboData.cost_estimate || '',
      integration_complexity: 'Medium',
      use_cases: Array.isArray(comboData.use_cases) ? comboData.use_cases : [],
      ai_tools: [comboData.tool_name || 'AI Tool'],
      features: [],
      limitations: [],
      tags: ['ADDED', ...(Array.isArray(comboData.tags) ? comboData.tags : [])],
      content: {
        title: comboData.title,
        name: comboData.tool_name,
        description: comboData.description,
        tool_name: comboData.tool_name,
        tool_url: comboData.tool_url,
        tool_type: comboData.tool_type,
        category: comboData.category,
        prompt_text: comboData.prompt_text,
        prompt_instructions: comboData.prompt_instructions,
        prompt_format: comboData.prompt_format,
        when_to_use: comboData.when_to_use || '',
        why_this_combo: comboData.why_this_combo || '',
        alternatives: Array.isArray(comboData.alternatives) ? comboData.alternatives : [],
        use_cases: Array.isArray(comboData.use_cases) ? comboData.use_cases : [],
        features: [],
        limitations: [],
        tags: ['ADDED', ...(Array.isArray(comboData.tags) ? comboData.tags : [])],
        difficulty_level: comboData.difficulty_level,
        setup_time: comboData.setup_time,
        cost_estimate: comboData.cost_estimate,
        combo_number: comboNumber
      }
    };

    console.log('💾 Saving combo to database...');

    // Insert into database
    const { data: savedCombo, error: dbError } = await supabase
      .from('user_tool_prompts')
      .insert(toolPromptRecord)
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log('✅ Combo saved successfully:', savedCombo.id);

    // Return the saved combo with its assigned number
    return new Response(
      JSON.stringify({
        success: true,
        combo: {
          ...savedCombo,
          combo_number: comboNumber
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in equip-step function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate combo',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
