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

    const systemPrompt = `You are JumpinAI, an expert AI transformation consultant. You create comprehensive, actionable AI transformation plans called "Jumps" that help individuals and businesses achieve their goals using AI.

CRITICAL: You MUST respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or extra text.

Your task is to analyze the user's goals, challenges, and context to generate a complete "Jump in AI" package that includes:
1. A detailed strategic action plan
2. Required AI tools and technologies  
3. 4 professional AI prompts for implementation
4. 4 detailed workflows
5. 4 comprehensive blueprints
6. 4 strategic frameworks

IMPORTANT: Return ONLY the JSON object with no additional formatting or explanation.`;

    const userPrompt = `Based on the following information, create a comprehensive "Jump in AI" transformation plan:

**Goals:** ${goals}
**Challenges:** ${challenges}
**Industry:** ${industry || 'General'}
**AI Experience:** ${ai_experience || 'Beginner'}
**Urgency:** ${urgency || 'Standard timeline'}
**Budget:** ${budget || 'Moderate'}

Please provide a response in the following exact JSON structure:

{
  "full_content": "A comprehensive markdown-formatted strategic action plan with detailed steps, timeline, and implementation guidance",
  "structured_plan": {
    "title": "Plan title",
    "overview": "Brief overview",
    "phases": [
      {
        "phase_number": 1,
        "title": "Phase title",
        "duration": "Duration estimate",
        "description": "Detailed description",
        "steps": [
          {
            "step": 1,
            "title": "Step title",
            "description": "Step description",
            "deliverable": "Expected deliverable",
            "timeline": "Time estimate"
          }
        ]
      }
    ]
  },
  "comprehensive_plan": {
    "executive_summary": "Executive summary",
    "key_objectives": ["Objective 1", "Objective 2"],
    "success_metrics": ["Metric 1", "Metric 2"],
    "risk_assessment": {
      "high_risks": ["Risk 1"],
      "mitigation_strategies": ["Strategy 1"]
    },
    "resource_requirements": {
      "budget_breakdown": ["Item 1", "Item 2"],
      "team_roles": ["Role 1", "Role 2"],
      "tools_needed": ["Tool 1", "Tool 2"]
    }
  },
  "components": {
    "prompts": [
      {
        "id": 1,
        "title": "Prompt title",
        "description": "Prompt description",
        "prompt_text": "The actual prompt text",
        "ai_tools": ["ChatGPT", "Claude"],
        "use_cases": ["Use case 1", "Use case 2"],
        "category": "Category",
        "difficulty": "Beginner/Intermediate/Advanced",
        "estimated_time": "Time estimate",
        "instructions": "How to use this prompt effectively"
      }
    ],
    "workflows": [
      {
        "id": 1,
        "title": "Workflow title",
        "description": "Workflow description",
        "workflow_steps": [
          {
            "step": 1,
            "title": "Step title",
            "description": "Step description",
            "tools_required": ["Tool 1"],
            "duration": "Duration",
            "outputs": ["Output 1"]
          }
        ],
        "ai_tools": ["Tool 1", "Tool 2"],
        "duration_estimate": "Total duration",
        "complexity_level": "Beginner/Intermediate/Advanced",
        "prerequisites": ["Prerequisite 1"],
        "expected_outcomes": ["Outcome 1"],
        "category": "Category",
        "tools_needed": ["Tool 1"],
        "skill_level": "Beginner/Intermediate/Advanced",
        "instructions": "Implementation instructions"
      }
    ],
    "blueprints": [
      {
        "id": 1,
        "title": "Blueprint title",
        "description": "Blueprint description",
        "blueprint_content": {
          "overview": "Overview text",
          "components": ["Component 1", "Component 2"],
          "architecture": "Architecture description",
          "implementation_steps": ["Step 1", "Step 2"],
          "best_practices": ["Practice 1", "Practice 2"]
        },
        "ai_tools": ["Tool 1", "Tool 2"],
        "implementation_time": "Implementation time",
        "difficulty_level": "Beginner/Intermediate/Advanced",
        "resources_needed": ["Resource 1"],
        "deliverables": ["Deliverable 1"],
        "category": "Category",
        "requirements": ["Requirement 1"],
        "tools_used": ["Tool 1"],
        "implementation": "Implementation guide",
        "instructions": "Step-by-step instructions"
      }
    ],
    "strategies": [
      {
        "id": 1,
        "title": "Strategy title",
        "description": "Strategy description",
        "strategy_framework": {
          "objective": "Main objective",
          "approach": "Strategic approach",
          "tactics": ["Tactic 1", "Tactic 2"],
          "success_criteria": ["Criteria 1"],
          "timeline": "Timeline",
          "resources": ["Resource 1"]
        },
        "ai_tools": ["Tool 1", "Tool 2"],
        "timeline": "Timeline",
        "success_metrics": ["Metric 1"],
        "key_actions": ["Action 1"],
        "potential_challenges": ["Challenge 1"],
        "mitigation_strategies": ["Mitigation 1"],
        "category": "Category",
        "priority_level": "High/Medium/Low",
        "resource_requirements": ["Requirement 1"],
        "instructions": "Implementation instructions"
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
        max_tokens: 8000,
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