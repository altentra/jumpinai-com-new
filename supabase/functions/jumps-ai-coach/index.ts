import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goals, challenges, industry, ai_experience, urgency, budget, generate_components } = await req.json();

    console.log('Generating Jump with parameters:', { goals, challenges, industry, ai_experience, urgency, budget });

    const systemPrompt = `You are JumpinAI, the world's leading AI transformation consultant with expertise across all industries. You create comprehensive, detailed, professional-grade AI transformation plans called "Jumps" that serve as complete business transformation guides.

CRITICAL RESPONSE REQUIREMENTS:
- You MUST respond with ONLY valid JSON format
- NO markdown formatting, code blocks, or extra text
- Every section must be COMPREHENSIVE and DETAILED (minimum 200-500 words per major section)
- This is a PREMIUM professional service - deliver world-class, consultancy-grade content

CONTENT QUALITY STANDARDS:
- Full strategic action plan: Detailed multi-phase implementation roadmap with specific timelines, milestones, and success metrics
- Professional AI Prompts: Each prompt must be 150-300 words, expertly crafted with clear instructions, context, and expected outputs
- Comprehensive Workflows: Step-by-step processes with detailed descriptions, tool requirements, time estimates, and deliverables
- Strategic Blueprints: Complete architectural guides with implementation details, best practices, and technical specifications
- Strategic Frameworks: Professional frameworks with detailed methodologies, assessment criteria, and implementation guidance

You are creating a premium AI transformation package worth $10,000+ in consulting value. Every component must reflect this level of quality and depth.`;

    const userPrompt = `Create a COMPREHENSIVE, PROFESSIONAL-GRADE "Jump in AI" transformation plan based on these requirements:

**BUSINESS CONTEXT:**
- Goals: ${goals}
- Challenges: ${challenges}
- Industry: ${industry || 'General'}
- AI Experience Level: ${ai_experience || 'Beginner'}
- Timeline Urgency: ${urgency || 'Standard timeline'}
- Budget Constraints: ${budget || 'Moderate'}

**DELIVERABLE REQUIREMENTS - PREMIUM CONSULTING GRADE:**

**FULL STRATEGIC PLAN:** Provide a comprehensive 1000+ word strategic action plan with:
- Executive summary with key transformation opportunities
- Detailed phase-by-phase implementation roadmap (3-6 phases)
- Specific timelines, milestones, and success metrics for each phase
- Risk assessment and mitigation strategies
- Resource allocation and budget planning
- Change management and team preparation strategies

**PROFESSIONAL AI PROMPTS (4 required):** Each prompt must be 200-400 words including:
- Detailed context and background information
- Specific, actionable instructions with examples
- Expected output format and quality standards
- Multiple use case scenarios and applications
- Best practices for optimal results
- Troubleshooting and optimization tips

**COMPREHENSIVE WORKFLOWS (4 required):** Each workflow must include:
- 8-15 detailed step-by-step processes
- Specific tools, technologies, and platforms required
- Time estimates and resource requirements for each step
- Quality checkpoints and validation criteria
- Expected deliverables and success metrics
- Integration points with existing systems
- Scalability and optimization recommendations

**STRATEGIC BLUEPRINTS (4 required):** Each blueprint must contain:
- Complete architectural overview and system design
- Detailed technical specifications and requirements
- Implementation methodology with best practices
- Integration guidelines and compatibility considerations
- Performance optimization strategies
- Security and compliance requirements
- Maintenance and support procedures

**STRATEGIC FRAMEWORKS (4 required):** Each framework must provide:
- Comprehensive methodology and approach
- Detailed assessment criteria and evaluation metrics
- Step-by-step implementation guidelines
- Success measurement and KPI tracking
- Risk management and contingency planning
- Continuous improvement and optimization strategies
- Industry-specific adaptations and considerations

RESPONSE FORMAT - EXACT JSON STRUCTURE REQUIRED:

{
  "full_content": "COMPREHENSIVE MARKDOWN-FORMATTED STRATEGIC ACTION PLAN (1000+ words): Must include executive summary, detailed implementation phases with specific timelines, success metrics, risk assessment, resource requirements, and change management strategies. This should read like a professional consulting report with actionable insights and specific recommendations.",
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
  },
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
    ],
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
    ],
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
    ],
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

Make sure all content is practical, actionable, and tailored to the specific goals and challenges provided. Each component should be distinct and valuable on its own.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    let generatedContent;
    const rawContent = data.choices[0].message.content;
    
    try {
      console.log('Raw OpenAI response length:', rawContent.length);
      console.log('Raw OpenAI response preview:', rawContent.substring(0, 300));
      
      // Multiple parsing attempts with different strategies
      let content = rawContent;
      let parsed = false;
      
      // Strategy 1: Direct JSON parsing
      try {
        generatedContent = JSON.parse(content);
        parsed = true;
        console.log('SUCCESS: Direct JSON parsing worked');
      } catch (e) {
        console.log('Direct parsing failed, trying cleanup...');
      }
      
      if (!parsed) {
        // Strategy 2: Remove markdown code blocks
        content = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
        try {
          generatedContent = JSON.parse(content);
          parsed = true;
          console.log('SUCCESS: Markdown cleanup worked');
        } catch (e) {
          console.log('Markdown cleanup failed, trying brace extraction...');
        }
      }
      
      if (!parsed) {
        // Strategy 3: Extract JSON between braces
        const startBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        
        if (startBrace !== -1 && lastBrace !== -1 && lastBrace > startBrace) {
          content = content.substring(startBrace, lastBrace + 1);
          try {
            generatedContent = JSON.parse(content);
            parsed = true;
            console.log('SUCCESS: Brace extraction worked');
          } catch (e) {
            console.log('Brace extraction failed, trying regex cleanup...');
          }
        }
      }
      
      if (!parsed) {
        // Strategy 4: More aggressive cleaning
        content = rawContent
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .replace(/`+/g, '')
          .replace(/^\s*[\w\s]*?{/, '{') // Remove any text before first brace
          .replace(/}\s*[\w\s]*?$/, '}'); // Remove any text after last brace
        
        try {
          generatedContent = JSON.parse(content);
          parsed = true;
          console.log('SUCCESS: Aggressive cleanup worked');
        } catch (e) {
          console.log('Aggressive cleanup failed');
        }
      }
      
      if (parsed) {
        // Validate the structure
        console.log('Parsed content structure:', {
          hasFullContent: !!generatedContent.full_content,
          hasStructuredPlan: !!generatedContent.structured_plan,
          hasComprehensivePlan: !!generatedContent.comprehensive_plan,
          hasComponents: !!generatedContent.components,
          componentsStructure: generatedContent.components ? {
            prompts: generatedContent.components.prompts?.length || 0,
            workflows: generatedContent.components.workflows?.length || 0,
            blueprints: generatedContent.components.blueprints?.length || 0,
            strategies: generatedContent.components.strategies?.length || 0
          } : 'NO COMPONENTS'
        });
        
        // Ensure all required fields exist
        if (!generatedContent.full_content) {
          generatedContent.full_content = rawContent;
        }
        if (!generatedContent.components) {
          generatedContent.components = { prompts: [], workflows: [], blueprints: [], strategies: [] };
        }
      } else {
        throw new Error('All parsing strategies failed');
      }
      
    } catch (parseError) {
      console.error('CRITICAL: All JSON parsing attempts failed:', parseError);
      console.error('Raw response sample:', rawContent.substring(0, 1000));
      
      // Try to extract any JSON-like content as a last resort
      const jsonMatch = rawContent.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          generatedContent = JSON.parse(jsonMatch[0]);
          console.log('RECOVERY: Regex extraction succeeded');
        } catch (e) {
          console.error('RECOVERY: Regex extraction also failed');
          generatedContent = createFallbackResponse(rawContent);
        }
      } else {
        console.error('RECOVERY: No JSON structure found');
        generatedContent = createFallbackResponse(rawContent);
      }
    }

    // Helper function for fallback response
    function createFallbackResponse(content: string) {
      console.log('Creating fallback response');
      return {
        full_content: content,
        structured_plan: null,
        comprehensive_plan: {
          executive_summary: "AI transformation plan generated successfully. Please review the full content for details.",
          key_objectives: ["Implement AI solutions", "Improve efficiency", "Drive innovation"],
          success_metrics: ["Performance improvement", "Cost reduction", "User satisfaction"]
        },
        components: {
          prompts: [],
          workflows: [],
          blueprints: [],
          strategies: []
        }
      };
    }

    console.log('Generated content structure:', Object.keys(generatedContent));

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error in jumps-ai-coach function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      full_content: 'Sorry, there was an error generating your Jump in AI plan. Please try again.',
      structured_plan: null,
      comprehensive_plan: null,
      components: { prompts: [], workflows: [], blueprints: [], strategies: [] }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});