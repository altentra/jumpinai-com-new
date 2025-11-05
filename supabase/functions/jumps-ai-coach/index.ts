import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const xaiApiKey = Deno.env.get('XAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Declare step variable outside try block for error handling access
  let step = 1;

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Authenticated user:', user.id);

    // Check and deduct credit before processing
    const { data: creditSuccess, error: creditError } = await supabase.rpc('deduct_user_credit', {
      p_user_id: user.id,
      p_description: 'JumpinAI Studio generation - Step ' + (step || 1)
    });

    if (creditError || !creditSuccess) {
      console.error('Credit deduction failed:', creditError);
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Credit deducted for user:', user.id);

    // Validate xAI API key first
    if (!xaiApiKey) {
      console.error('❌ CRITICAL: xAI API key is not set in environment variables');
      return new Response(JSON.stringify({ 
        error: 'xAI API key not configured',
        full_content: 'Service configuration error. Please contact support.',
        components: { tools: [], prompts: [], workflows: [], blueprints: [], strategies: [] }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ xAI API key is available');

    const { goals, challenges, industry, ai_experience, urgency, budget, step: requestStep = 1, overview_content = '' } = await req.json();
    step = requestStep; // Assign to outer scope variable

    console.log('🚀 Generating Jump Step', step, 'with parameters:', { goals, challenges, industry, ai_experience, urgency, budget });

    // Get the appropriate system prompt and user prompt based on step
    const { systemPrompt, userPrompt, expectedTokens } = getStepPrompts(step, {
      goals, challenges, industry, ai_experience, urgency, budget, overview_content
    });

    console.log('📡 Sending Step', step, 'request to xAI Grok-4 API...');

    console.log('🤖 Making xAI API request with model: grok-4-fast for step:', step);
    
    const requestBody = {
      model: 'grok-4-fast',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: expectedTokens, // xAI uses max_tokens
      temperature: 0.7, // Add temperature for better results
    };

    console.log('📋 Request body prepared for step', step, ':', {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      maxTokens: requestBody.max_tokens,
      temperature: requestBody.temperature,
      step: step
    });
    
    // Create AbortController for timeout handling - Grok-4 should be much faster
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`⏰ Step ${step} request timed out after 120 seconds`);
      controller.abort();
    }, 120000); // 120 second timeout for complex generations
    
    console.log('🌐 Initiating fetch to xAI Grok-4...');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    }).catch(fetchError => {
      console.error('🚨 Fetch error occurred:', fetchError.name, fetchError.message);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out - xAI Grok-4 took too long to respond');
      }
      throw new Error(`Network error: ${fetchError.message}`);
    });
    
    clearTimeout(timeoutId);
    console.log(`✅ Step ${step} response received from xAI Grok-4`);

    console.log(`xAI Grok-4 Step ${step} response status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`xAI API error details for Step ${step}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: 'grok-4',
        step: step,
        maxTokens: expectedTokens,
        headers: response.headers,
        url: response.url
      });
      throw new Error(`xAI API error for Step ${step}: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`xAI Grok-4-fast Step ${step} response received successfully:`, {
      usage: data.usage,
      model: data.model,
      finishReason: data.choices?.[0]?.finish_reason,
      hasContent: !!data.choices?.[0]?.message?.content,
      contentLength: data.choices?.[0]?.message?.content?.length || 0,
      step: step
    });

    // Check if we got empty content
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent || rawContent.trim() === '') {
      console.error(`❌ Empty response from xAI API for Step ${step}:`, {
        model: data.model,
        finishReason: data.choices?.[0]?.finish_reason,
        fullResponse: data
      });
      throw new Error(`xAI API returned empty response for Step ${step}. Model may not support this request.`);
    }

    let generatedContent;
    
    try {
      console.log(`Raw xAI Grok-4-fast Step ${step} response length:`, rawContent.length);
      console.log(`Raw xAI Grok-4-fast Step ${step} response preview:`, rawContent.substring(0, 200));
      
      // Simplified parsing - try direct JSON first, then basic cleanup
      try {
        generatedContent = JSON.parse(rawContent);
        console.log(`SUCCESS: Direct JSON parsing worked for Step ${step}`);
      } catch (e) {
        console.log(`Direct parsing failed for Step ${step}, trying basic cleanup...`);
        console.log(`Raw response sample for Step ${step}:`, rawContent.substring(0, 500));
        
        // Basic cleanup: remove markdown code blocks and extract JSON
        let cleanContent = rawContent
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/gi, '')
          .trim();
        
        // Extract JSON between first { and last }
        const startBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');
        
        if (startBrace !== -1 && lastBrace !== -1 && lastBrace > startBrace) {
          cleanContent = cleanContent.substring(startBrace, lastBrace + 1);
          
          // Try fixing common JSON issues
          try {
            generatedContent = JSON.parse(cleanContent);
            console.log(`SUCCESS: Basic cleanup and extraction worked for Step ${step}`);
          } catch (parseError) {
            console.log(`JSON parsing still failed for Step ${step}, trying advanced cleanup...`);
            
            // Advanced cleanup for malformed JSON
            cleanContent = cleanContent
              // Fix trailing commas in arrays and objects
              .replace(/,(\s*[\]}])/g, '$1')
              // Fix missing commas between array elements
              .replace(/}(\s*){/g, '},\n$1{')
              // Fix incomplete array elements
              .replace(/,(\s*)$/, '$1')
              .trim();
              
            // Ensure it ends properly
            if (!cleanContent.endsWith('}')) {
              const openBraces = (cleanContent.match(/{/g) || []).length;
              const closeBraces = (cleanContent.match(/}/g) || []).length;
              const missingBraces = openBraces - closeBraces;
              
              for (let i = 0; i < missingBraces; i++) {
                cleanContent += '}';
              }
            }
            
            generatedContent = JSON.parse(cleanContent);
            console.log(`SUCCESS: Advanced cleanup worked for Step ${step}`);
          }
        } else {
          throw new Error('No valid JSON structure found');
        }
      }
      
      // Step-specific validation
      generatedContent = validateStepResponse(generatedContent, step, rawContent);
      
      console.log(`Parsed Step ${step} content successfully:`, {
        step: step,
        hasFullContent: !!generatedContent.full_content,
        hasStructuredPlan: !!generatedContent.structured_plan,
        hasComprehensivePlan: !!generatedContent.comprehensive_plan,
        componentCounts: generatedContent.components ? {
          tools: generatedContent.components.tools?.length || 0,
          prompts: generatedContent.components.prompts?.length || 0,
          workflows: generatedContent.components.workflows?.length || 0,
          blueprints: generatedContent.components.blueprints?.length || 0,
          strategies: generatedContent.components.strategies?.length || 0
        } : null
      });
      
    } catch (parseError) {
      console.error(`JSON parsing failed for Step ${step}:`, parseError);
      console.error(`Raw response sample for Step ${step}:`, rawContent.substring(0, 500));
      
      // Step-specific fallback response
      generatedContent = getStepFallbackResponse(step, rawContent);
    }

    console.log(`Generated Step ${step} content structure:`, Object.keys(generatedContent));

    return new Response(JSON.stringify({ 
      ...generatedContent,
      step: step,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error in jumps-ai-coach function Step ${step}:`, error);
    
    // Log more details about the error
    if (error.name === 'AbortError') {
      console.error(`Step ${step} request timed out after 90 seconds`);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      errorType: error.name || 'UnknownError',
      step: step,
      success: false,
      full_content: `Sorry, there was an error generating Step ${step} of your Jump in AI plan with xAI Grok-4-fast. Please try again.`,
      structured_plan: null,
      comprehensive_plan: null,
      components: { tools: [], prompts: [], workflows: [], blueprints: [], strategies: [] }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Step-specific prompt generation
function getStepPrompts(step: number, context: any) {
  const { goals, challenges, industry, ai_experience, urgency, budget, overview_content } = context;

  const baseContext = `
**BUSINESS CONTEXT:**
- Goals: ${goals}
- Challenges: ${challenges}
- Industry: ${industry || 'General'}
- AI Experience Level: ${ai_experience || 'Beginner'}
- Timeline Urgency: ${urgency || 'Standard timeline'}
- Budget Constraints: ${budget || 'Moderate'}
`;

  switch (step) {
    case 1: // Overview & Plan
      return {
        systemPrompt: `You are JumpinAI, the world's leading AI transformation consultant. You create comprehensive strategic action plans for AI transformation. Respond ONLY in valid JSON format.`,
        userPrompt: `Create a comprehensive strategic action plan based on these requirements:

${baseContext}

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:
{
  "full_content": "COMPREHENSIVE MARKDOWN-FORMATTED STRATEGIC ACTION PLAN: Create a detailed, well-structured plan with executive summary, implementation phases with specific timelines, success metrics, risk assessment, resource requirements, and change management strategies. Format using markdown headings (##, ###) and sections. DO NOT include word counts or character counts anywhere in the content - focus on valuable, actionable information.",
  "structured_plan": {
    "title": "Professional plan title reflecting the transformation goals",
    "overview": "Comprehensive overview paragraph (150+ words) explaining the transformation approach, key opportunities, and expected outcomes",
    "phases": [
      {
        "phase_number": 1,
        "title": "Detailed phase title with clear objectives",
        "duration": "Specific duration with rationale (e.g., '8-12 weeks for foundation building')",
        "description": "Comprehensive phase description (200+ words) explaining objectives, approach, key activities, and expected outcomes",
        "steps": [
          {
            "step": 1,
            "title": "Specific actionable step title",
            "description": "Detailed step description (100+ words) with specific actions, methods, and considerations",
            "deliverable": "Specific, measurable deliverable with quality criteria",
            "timeline": "Realistic time estimate with dependencies noted"
          }
        ]
      }
    ]
  },
  "comprehensive_plan": {
    "executive_summary": "Professional executive summary (300+ words) with key findings, recommendations, and expected ROI",
    "key_objectives": ["Specific, measurable objective 1 with success criteria", "Detailed objective 2 with timeline and metrics"],
    "success_metrics": ["Quantifiable metric 1 with baseline and target", "Measurable KPI 2 with tracking methodology"],
    "risk_assessment": {
      "high_risks": ["Detailed risk description with probability and impact assessment"],
      "mitigation_strategies": ["Comprehensive mitigation strategy with specific actions and contingencies"]
    },
    "resource_requirements": {
      "budget_breakdown": ["Detailed budget item with rationale and ROI", "Specific cost center with expected returns"],
      "team_roles": ["Detailed role description with skills and responsibilities", "Specific position with qualifications and time commitment"],
      "tools_needed": ["Specific tool with licensing and implementation details", "Platform with integration requirements and costs"]
    }
  }
}`,
        expectedTokens: 8000
      };

    case 2: // Tools
      return {
        systemPrompt: `You are JumpinAI, an expert AI consultant specializing in tool selection and implementation. Create a comprehensive list of AI tools needed for the strategic plan. Generate 2-12+ tools based on complexity. Respond ONLY in valid JSON format.`,
        userPrompt: `Create a comprehensive list of AI tools based on this context:

${baseContext}

${overview_content ? `**STRATEGIC CONTEXT:**\n${overview_content}\n` : ''}

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:
{
  "components": {
    "tools": [
      {
        "id": 1,
        "name": "Specific AI Tool Name",
        "category": "Tool category (e.g., 'Language Models', 'Computer Vision', 'Data Analytics')",
        "description": "Tool overview in 2-3 concise sentences (50-80 words) - describe core functionality and main benefits clearly",
        "website_url": "https://actual-working-website.com (MANDATORY: provide the real, official website URL for this tool - this MUST be a working link users can click)",
        "primary_use_case": "Primary use case within the strategic plan with specific applications",
        "when_to_use": "Clear explanation (4-6 sentences, 60-100 words) of WHEN this tool should be used - be specific about phases and optimal timing",
        "how_to_integrate": "Practical integration guidance (4-6 sentences, 60-100 words) explaining HOW to implement this tool - include key setup steps and workflow positioning",
        "why_this_tool": "Clear rationale (4-6 sentences, 60-100 words) explaining WHY this specific tool was chosen - include main advantages and key benefits",
        "alternatives": ["Alternative tool 1 with working URL and brief comparison", "Alternative tool 2 with working URL and pros/cons"],
        "cost_model": "Pricing structure and cost considerations with specific numbers if possible",
        "skill_level": "Required skill level and learning curve with training recommendations",
        "implementation_timeline": "Realistic implementation timeline with milestones"
      }
    ]
  }
}

IMPORTANT: Generate between 2-12+ tools depending on the complexity of the goals. Simple goals = 2-4 tools. Complex multi-faceted goals involving video, audio, images, apps, etc. = 8-12+ tools. Focus on quality and relevance over quantity.

CRITICAL REQUIREMENTS:
1. WEBSITE URLs: Every tool MUST have a real, working website_url. Examples: ChatGPT = "https://chat.openai.com", Claude = "https://claude.ai", Midjourney = "https://midjourney.com", etc.
2. BALANCED CONTENT: Ensure ALL tools have consistently similar amounts of text in each section. Do not write extensive details for the first few tools and brief content for the later ones.
3. REAL TOOLS: Only suggest actual, existing AI tools with real websites that users can visit immediately.`,
        expectedTokens: 7000
      };

    case 3: // Prompts
      return {
        systemPrompt: `You are JumpinAI, an expert in creating professional AI prompts. Create 4 comprehensive, ready-to-use AI prompts tailored to the business context. Respond ONLY in valid JSON format.`,
        userPrompt: `Create 4 professional AI prompts based on this context:

${baseContext}

${overview_content ? `**STRATEGIC CONTEXT:**\n${overview_content}\n` : ''}

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:
{
  "components": {
    "prompts": [
      {
        "id": 1,
        "title": "Professional prompt title reflecting specific use case",
        "description": "Comprehensive description (150+ words) explaining the prompt's purpose, applications, and expected outcomes",
        "prompt_text": "DETAILED 200-400 WORD PROMPT: Must include specific context, clear instructions, examples, expected format, quality criteria, and optimization guidelines. This should be a complete, professional-grade prompt ready for immediate use.",
        "ai_tools": ["Specific AI tool with version/model recommendations", "Alternative tool with use case scenarios"],
        "use_cases": ["Detailed use case 1 with specific application and expected results", "Comprehensive use case 2 with industry examples"],
        "category": "Specific category with subcategory if applicable",
        "difficulty": "Skill level with prerequisites and learning curve details",
        "estimated_time": "Realistic time estimate with setup and execution phases",
        "instructions": "Step-by-step implementation guide (200+ words) with best practices, troubleshooting, and optimization tips"
      }
    ]
  }
}

Generate exactly 4 prompts with IDs 1, 2, 3, and 4.`,
        expectedTokens: 12000
      };

    case 4: // Workflows
      return {
        systemPrompt: `You are JumpinAI, an expert in creating comprehensive AI workflows. Create 4 detailed, step-by-step workflows tailored to the business context. Respond ONLY in valid JSON format.`,
        userPrompt: `Create 4 comprehensive workflows based on this context:

${baseContext}

${overview_content ? `**STRATEGIC CONTEXT:**\n${overview_content}\n` : ''}

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:
{
  "components": {
    "workflows": [
      {
        "id": 1,
        "title": "Comprehensive workflow title describing the complete process",
        "description": "Detailed workflow description (200+ words) explaining purpose, scope, benefits, and integration possibilities",
        "workflow_steps": [
          {
            "step": 1,
            "title": "Specific step title with clear action",
            "description": "Detailed step description (100+ words) with methods, considerations, and quality checkpoints",
            "tools_required": ["Specific tool with configuration details", "Alternative option with pros/cons"],
            "duration": "Realistic duration with factors affecting timeline",
            "outputs": ["Specific deliverable with quality criteria", "Measurable outcome with validation method"]
          }
        ],
        "ai_tools": ["Primary AI tool with optimal configuration", "Secondary tool for specialized tasks"],
        "duration_estimate": "Total duration with breakdown by phase and dependencies",
        "complexity_level": "Skill level with specific prerequisites and recommended experience",
        "prerequisites": ["Specific requirement with alternatives", "Technical prerequisite with learning resources"],
        "expected_outcomes": ["Quantifiable outcome 1 with measurement method", "Qualitative benefit with assessment criteria"],
        "category": "Specific category with industry relevance",
        "tools_needed": ["Detailed tool requirement with specifications", "Support tool with integration needs"],
        "skill_level": "Required expertise with training recommendations",
        "instructions": "Comprehensive implementation guide (300+ words) with setup, execution, monitoring, and optimization"
      }
    ]
  }
}

Generate exactly 4 workflows with IDs 1, 2, 3, and 4. Each workflow should have 5-8 detailed steps.`,
        expectedTokens: 9000
      };

    case 5: // Blueprints
      return {
        systemPrompt: `You are JumpinAI, an expert in creating strategic AI implementation blueprints. Create 4 comprehensive architectural blueprints tailored to the business context. Respond ONLY in valid JSON format.`,
        userPrompt: `Create 4 strategic blueprints based on this context:

${baseContext}

${overview_content ? `**STRATEGIC CONTEXT:**\n${overview_content}\n` : ''}

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:
{
  "components": {
    "blueprints": [
      {
        "id": 1,
        "title": "Comprehensive blueprint title describing the complete solution architecture",
        "description": "Detailed blueprint description (250+ words) explaining architecture, components, benefits, and implementation approach",
        "blueprint_content": {
          "overview": "Comprehensive overview (200+ words) explaining the solution architecture, key components, and integration strategy",
          "components": ["Detailed component 1 with specifications and requirements", "Component 2 with configuration and dependencies"],
          "architecture": "Detailed architecture description (300+ words) with diagrams, data flow, security considerations, and scalability",
          "implementation_steps": ["Comprehensive step 1 with detailed procedures and checkpoints", "Step 2 with validation and testing requirements"],
          "best_practices": ["Detailed best practice 1 with rationale and examples", "Industry standard practice 2 with implementation guidelines"]
        },
        "ai_tools": ["Primary AI platform with configuration details", "Supporting tool with integration specifications"],
        "implementation_time": "Realistic timeline with phases, dependencies, and resource allocation",
        "difficulty_level": "Complexity assessment with prerequisite skills and recommended team structure",
        "resources_needed": ["Specific resource 1 with quantity and specifications", "Resource 2 with alternatives and cost considerations"],
        "deliverables": ["Comprehensive deliverable 1 with acceptance criteria", "Measurable outcome 2 with quality standards"],
        "category": "Specific category with industry applications",
        "requirements": ["Technical requirement 1 with specifications", "Business requirement 2 with success criteria"],
        "tools_used": ["Primary tool with version and configuration", "Supporting technology with integration details"],
        "implementation": "Detailed implementation methodology (400+ words) with phases, testing, deployment, and maintenance",
        "instructions": "Step-by-step implementation guide (400+ words) with setup, configuration, testing, deployment, and ongoing management"
      }
    ]
  }
}

Generate exactly 4 blueprints with IDs 1, 2, 3, and 4.`,
        expectedTokens: 8000
      };

    case 6: // Strategies
      return {
        systemPrompt: `You are JumpinAI, an expert in creating strategic AI transformation frameworks. Create 4 comprehensive strategic frameworks tailored to the business context. Respond ONLY in valid JSON format.`,
        userPrompt: `Create 4 strategic frameworks based on this context:

${baseContext}

${overview_content ? `**STRATEGIC CONTEXT:**\n${overview_content}\n` : ''}

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:
{
  "components": {
    "strategies": [
      {
        "id": 1,
        "title": "Comprehensive strategy title describing the strategic approach and objectives",
        "description": "Detailed strategy description (250+ words) explaining the strategic framework, methodology, and expected business impact",
        "strategy_framework": {
          "objective": "Specific, measurable strategic objective with success criteria and timeline",
          "approach": "Comprehensive strategic approach (300+ words) with methodology, principles, and implementation philosophy",
          "tactics": ["Detailed tactic 1 with specific actions and expected outcomes", "Tactical approach 2 with implementation timeline and resources"],
          "success_criteria": ["Quantifiable success criterion 1 with measurement methodology", "Qualitative criterion 2 with assessment framework"],
          "timeline": "Detailed timeline with phases, milestones, dependencies, and critical path analysis",
          "resources": ["Specific resource requirement 1 with allocation and management", "Resource 2 with optimization and contingency planning"]
        },
        "ai_tools": ["Strategic AI tool 1 with configuration for optimal results", "Supporting tool 2 with integration and workflow"],
        "timeline": "Comprehensive timeline with phases, dependencies, risk factors, and contingency planning",
        "success_metrics": ["Detailed metric 1 with baseline, target, and tracking methodology", "KPI 2 with measurement frequency and reporting"],
        "key_actions": ["Comprehensive action 1 with detailed implementation plan", "Strategic action 2 with resource allocation and timeline"],
        "potential_challenges": ["Detailed challenge 1 with probability assessment and impact analysis", "Risk factor 2 with early warning indicators"],
        "mitigation_strategies": ["Comprehensive mitigation 1 with specific actions and contingencies", "Risk response 2 with trigger points and escalation"],
        "category": "Strategic category with business function alignment",
        "priority_level": "Priority with rationale and resource allocation implications",
        "resource_requirements": ["Detailed resource 1 with specifications and timeline", "Requirement 2 with alternatives and optimization"],
        "instructions": "Comprehensive implementation guide (400+ words) with strategic planning, execution phases, monitoring, adjustment protocols, and success optimization"
      }
    ]
  }
}

Generate exactly 4 strategies with IDs 1, 2, 3, and 4.`,
        expectedTokens: 8000
      };

    default:
      throw new Error(`Invalid step: ${step}`);
  }
}

// Validate step response based on expected structure
function validateStepResponse(content: any, step: number, rawContent: string): any {
  // Ensure basic structure exists
  if (!content || typeof content !== 'object') {
    return getStepFallbackResponse(step, rawContent);
  }

  switch (step) {
    case 1: // Overview & Plan
      if (!content.full_content) content.full_content = rawContent;
      if (!content.structured_plan) content.structured_plan = null;
      if (!content.comprehensive_plan) content.comprehensive_plan = null;
      break;

    case 2: // Tools
    case 3: // Prompts
    case 4: // Workflows  
    case 5: // Blueprints
    case 6: // Strategies
      if (!content.components) {
        content.components = {};
      }
      
      const componentType = ['', '', 'tools', 'prompts', 'workflows', 'blueprints', 'strategies'][step];
      if (!content.components[componentType]) {
        content.components[componentType] = [];
      }
      break;
  }

  return content;
}

// Get fallback response for failed step
function getStepFallbackResponse(step: number, rawContent: string): any {
  const base = {
    full_content: rawContent,
    structured_plan: null,
    comprehensive_plan: null,
    components: { tools: [], prompts: [], workflows: [], blueprints: [], strategies: [] }
  };

  switch (step) {
    case 1: // Overview & Plan
      return {
        ...base,
        comprehensive_plan: {
          executive_summary: "AI transformation plan generated successfully. Please review the full content for details.",
          key_objectives: ["Implement AI solutions", "Improve efficiency", "Drive innovation"],
          success_metrics: ["Performance improvement", "Cost reduction", "User satisfaction"]
        }
      };

    case 2: // Tools
      return {
        components: {
          tools: [{
            id: 1,
            name: "AI Tool",
            category: "General AI",
            description: "AI tool generated from your requirements.",
            primary_use_case: "Primary use case from your plan",
            when_to_use: "When implementing AI solutions",
            why_this_tool: "Selected based on your specific requirements",
            integration_notes: "Integration guidance based on your context",
            alternatives: ["Alternative tool options"],
            cost_model: "Varies by usage",
            skill_level: "Beginner",
            implementation_time: "1-2 weeks"
          }]
        }
      };

    case 3: // Prompts
      return {
        components: {
          prompts: [{
            id: 1,
            title: "Generated AI Prompt",
            description: "AI prompt generated from your requirements.",
            prompt_text: rawContent.length > 100 ? rawContent.substring(0, 400) : "Please review the generated content for your custom AI prompt.",
            ai_tools: ["ChatGPT", "Claude"],
            use_cases: ["General AI assistance"],
            category: "General",
            difficulty: "Beginner",
            estimated_time: "5-10 minutes",
            instructions: "Use this prompt with your preferred AI tool."
          }]
        }
      };

    case 4: // Workflows
      return {
        components: {
          workflows: [{
            id: 1,
            title: "Generated AI Workflow",
            description: "AI workflow generated from your requirements.",
            workflow_steps: [{
              step: 1,
              title: "Review Generated Content",
              description: "Please review the generated workflow content.",
              tools_required: ["AI Tool"],
              duration: "30 minutes",
              outputs: ["Completed workflow"]
            }],
            ai_tools: ["ChatGPT"],
            duration_estimate: "1-2 hours",
            complexity_level: "Intermediate",
            prerequisites: ["Basic AI knowledge"],
            expected_outcomes: ["Improved efficiency"],
            category: "General",
            tools_needed: ["Computer"],
            skill_level: "Intermediate",
            instructions: "Follow the workflow steps carefully."
          }]
        }
      };

    case 5: // Blueprints
      return {
        components: {
          blueprints: [{
            id: 1,
            title: "Generated AI Blueprint",
            description: "AI blueprint generated from your requirements.",
            blueprint_content: {
              overview: "Please review the generated blueprint content.",
              components: ["AI System"],
              architecture: "Standard AI architecture",
              implementation_steps: ["Setup", "Configure", "Deploy"],
              best_practices: ["Follow AI best practices"]
            },
            ai_tools: ["ChatGPT"],
            implementation_time: "2-4 weeks",
            difficulty_level: "Advanced",
            resources_needed: ["Technical team"],
            deliverables: ["Deployed solution"],
            category: "Architecture",
            requirements: ["Technical requirements"],
            tools_used: ["AI Platform"],
            implementation: "Standard implementation approach",
            instructions: "Follow the blueprint guidelines."
          }]
        }
      };

    case 6: // Strategies
      return {
        components: {
          strategies: [{
            id: 1,
            title: "Generated AI Strategy",
            description: "AI strategy generated from your requirements.",
            strategy_framework: {
              objective: "Implement AI transformation",
              approach: "Systematic approach to AI implementation",
              tactics: ["Training", "Implementation"],
              success_criteria: ["Improved efficiency"],
              timeline: "6-12 months",
              resources: ["Team", "Budget"]
            },
            ai_tools: ["ChatGPT"],
            timeline: "6-12 months",
            success_metrics: ["ROI improvement"],
            key_actions: ["Planning", "Execution"],
            potential_challenges: ["Change management"],
            mitigation_strategies: ["Training and support"],
            category: "Strategic",
            priority_level: "High",
            resource_requirements: ["Budget", "Team"],
            instructions: "Execute strategy systematically."
          }]
        }
      };

    default:
      return base;
  }
}