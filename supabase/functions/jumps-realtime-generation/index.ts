import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      socket.send(JSON.stringify({ 
        type: 'connected',
        message: 'Connected to realtime generation' 
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'generate') {
          await handleGeneration(data.payload, socket);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process request'
        }));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return response;
  } catch (error) {
    console.error('WebSocket upgrade error:', error);
    return new Response('WebSocket upgrade failed', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

async function handleGeneration(payload: any, socket: WebSocket) {
  const { goals, challenges, industry, ai_experience, urgency, budget, userId } = payload;

  try {
    // Send initial status
    socket.send(JSON.stringify({
      type: 'status',
      phase: 'starting',
      message: 'Starting AI generation...',
      progress: 0
    }));

    // Show empty infrastructure immediately
    socket.send(JSON.stringify({
      type: 'infrastructure_ready',
      data: {
        prompts: [],
        workflows: [],
        blueprints: [],
        strategies: [],
        plan: null
      }
    }));

    // Generate content with OpenAI
    socket.send(JSON.stringify({
      type: 'status',
      phase: 'ai_generation',
      message: 'Requesting comprehensive plan from AI...',
      progress: 10
    }));

    const aiContent = await generateWithOpenAI(goals, challenges, industry, ai_experience, urgency, budget, socket);
    
    if (!aiContent) {
      throw new Error('Failed to generate AI content');
    }

    // Process content in chunks
    await processContentInChunks(aiContent, socket, userId);

  } catch (error) {
    console.error('Generation error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Generation failed: ' + (error instanceof Error ? error.message : String(error))
    }));
  }
}

async function generateWithOpenAI(goals: string, challenges: string, industry: string, ai_experience: string, urgency: string, budget: string, socket: WebSocket) {
  const systemPrompt = `You are JumpinAI, the world's leading AI transformation consultant. Create comprehensive AI transformation plans called "Jumps".

CRITICAL: You MUST respond with ONLY valid JSON format. NO markdown, code blocks, or extra text.

CONTENT REQUIREMENTS:
- Comprehensive strategic action plan (1000+ words)
- 4 detailed AI prompts (200-400 words each)
- 4 comprehensive workflows (8-15 steps each)
- 4 strategic blueprints (detailed implementation guides)
- 4 strategic frameworks (complete methodologies)

This is premium consulting content worth $10,000+. Deliver world-class quality.`;

  const userPrompt = `Create a comprehensive "Jump in AI" transformation plan:

BUSINESS CONTEXT:
- Goals: ${goals}
- Challenges: ${challenges}
- Industry: ${industry || 'General'}
- AI Experience: ${ai_experience || 'Beginner'}
- Timeline: ${urgency || 'Standard'}
- Budget: ${budget || 'Moderate'}

REQUIRED JSON STRUCTURE:
{
  "full_content": "COMPREHENSIVE STRATEGIC ACTION PLAN (1000+ words in markdown format)",
  "structured_plan": {
    "title": "Plan title",
    "overview": "Comprehensive overview (150+ words)",
    "phases": [
      {
        "phase_number": 1,
        "title": "Phase title",
        "duration": "Duration with rationale",
        "description": "Comprehensive description (200+ words)",
        "steps": [
          {
            "step": 1,
            "title": "Step title",
            "description": "Detailed description (100+ words)",
            "deliverable": "Specific deliverable",
            "timeline": "Time estimate"
          }
        ]
      }
    ]
  },
  "comprehensive_plan": {
    "executive_summary": "Executive summary (300+ words)",
    "key_objectives": ["Specific objective 1", "Detailed objective 2"],
    "success_metrics": ["Metric 1 with measurement", "KPI 2 with tracking"],
    "risk_assessment": {
      "high_risks": ["Risk with assessment"],
      "mitigation_strategies": ["Strategy with actions"]
    },
    "resource_requirements": {
      "budget_breakdown": ["Budget item with ROI"],
      "team_roles": ["Role with responsibilities"],
      "tools_needed": ["Tool with requirements"]
    }
  },
  "components": {
    "prompts": [
      {
        "id": 1,
        "title": "Professional prompt title",
        "description": "Comprehensive description (150+ words)",
        "prompt_text": "DETAILED 200-400 WORD PROMPT with context, instructions, examples",
        "ai_tools": ["Tool 1", "Tool 2"],
        "use_cases": ["Use case 1", "Use case 2"],
        "category": "Category",
        "difficulty": "Skill level",
        "estimated_time": "Time estimate",
        "instructions": "Implementation guide (200+ words)"
      }
    ],
    "workflows": [
      {
        "id": 1,
        "title": "Comprehensive workflow title",
        "description": "Detailed description (200+ words)",
        "workflow_steps": [
          {
            "step": 1,
            "title": "Step title",
            "description": "Detailed description (100+ words)",
            "tools_required": ["Tool 1", "Tool 2"],
            "duration": "Duration",
            "outputs": ["Output 1", "Output 2"]
          }
        ],
        "ai_tools": ["Primary tool", "Secondary tool"],
        "duration_estimate": "Total duration",
        "complexity_level": "Skill level",
        "prerequisites": ["Requirement 1", "Requirement 2"],
        "expected_outcomes": ["Outcome 1", "Outcome 2"],
        "category": "Category",
        "tools_needed": ["Tool requirement"],
        "skill_level": "Required expertise",
        "instructions": "Implementation guide (300+ words)"
      }
    ],
    "blueprints": [
      {
        "id": 1,
        "title": "Blueprint title",
        "description": "Description (250+ words)",
        "blueprint_content": {
          "overview": "Overview (200+ words)",
          "components": ["Component 1", "Component 2"],
          "architecture": "Architecture description (300+ words)",
          "implementation_steps": ["Step 1", "Step 2"],
          "best_practices": ["Practice 1", "Practice 2"]
        },
        "ai_tools": ["Primary tool", "Supporting tool"],
        "implementation_time": "Timeline",
        "difficulty_level": "Complexity level",
        "resources_needed": ["Resource 1", "Resource 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "category": "Category",
        "requirements": ["Requirement 1", "Requirement 2"],
        "tools_used": ["Tool 1", "Tool 2"],
        "implementation": "Implementation methodology (400+ words)",
        "instructions": "Implementation guide (400+ words)"
      }
    ],
    "strategies": [
      {
        "id": 1,
        "title": "Strategy title",
        "description": "Description (250+ words)",
        "strategy_framework": {
          "objective": "Strategic objective",
          "approach": "Strategic approach (300+ words)",
          "tactics": ["Tactic 1", "Tactic 2"],
          "success_criteria": ["Criterion 1", "Criterion 2"],
          "timeline": "Detailed timeline",
          "resources": ["Resource 1", "Resource 2"]
        },
        "ai_tools": ["Strategic tool 1", "Supporting tool 2"],
        "timeline": "Timeline with phases",
        "success_metrics": ["Metric 1", "KPI 2"],
        "key_actions": ["Action 1", "Action 2"],
        "potential_challenges": ["Challenge 1", "Risk 2"],
        "mitigation_strategies": ["Mitigation 1", "Response 2"],
        "category": "Strategic category",
        "priority_level": "Priority with rationale",
        "resource_requirements": ["Resource 1", "Requirement 2"],
        "instructions": "Implementation guide (400+ words)"
      }
    ]
  }
}`;

  try {
    socket.send(JSON.stringify({
      type: 'status',
      phase: 'ai_processing',
      message: `Generating comprehensive AI transformation plan...`,
      progress: 15
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 30000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    socket.send(JSON.stringify({
      type: 'status',
      phase: 'ai_complete',
      message: `AI generated ${data.usage?.total_tokens || 'large'} tokens. Processing content...`,
      progress: 40
    }));

    // Parse the JSON content
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch {
      // Basic cleanup if direct parsing fails
      let cleanContent = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      
      const startBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      
      if (startBrace !== -1 && lastBrace !== -1) {
        cleanContent = cleanContent.substring(startBrace, lastBrace + 1);
        parsedContent = JSON.parse(cleanContent);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return parsedContent;

  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw error;
  }
}

async function processContentInChunks(content: any, socket: WebSocket, userId?: string) {
  try {
    // Process main plan first
    socket.send(JSON.stringify({
      type: 'status',
      phase: 'processing_plan',
      message: 'Processing strategic action plan...',
      progress: 50
    }));

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time

    socket.send(JSON.stringify({
      type: 'plan_ready',
      data: {
        full_content: content.full_content,
        structured_plan: content.structured_plan,
        comprehensive_plan: content.comprehensive_plan
      }
    }));

    // Process components in chunks
    const components = content.components || {};
    let processedCount = 0;
    const totalComponents = 
      (components.prompts?.length || 0) +
      (components.workflows?.length || 0) +
      (components.blueprints?.length || 0) +
      (components.strategies?.length || 0);

    // Process prompts
    if (components.prompts) {
      for (const prompt of components.prompts) {
        processedCount++;
        socket.send(JSON.stringify({
          type: 'status',
          phase: 'processing_components',
          message: `Processing AI Prompt ${processedCount}/${totalComponents}: ${prompt.title}`,
          progress: 50 + (processedCount / totalComponents) * 30
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        socket.send(JSON.stringify({
          type: 'component_ready',
          componentType: 'prompts',
          data: prompt
        }));
      }
    }

    // Process workflows
    if (components.workflows) {
      for (const workflow of components.workflows) {
        processedCount++;
        socket.send(JSON.stringify({
          type: 'status',
          phase: 'processing_components',
          message: `Processing Workflow ${processedCount}/${totalComponents}: ${workflow.title}`,
          progress: 50 + (processedCount / totalComponents) * 30
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        socket.send(JSON.stringify({
          type: 'component_ready',
          componentType: 'workflows',
          data: workflow
        }));
      }
    }

    // Process blueprints
    if (components.blueprints) {
      for (const blueprint of components.blueprints) {
        processedCount++;
        socket.send(JSON.stringify({
          type: 'status',
          phase: 'processing_components',
          message: `Processing Blueprint ${processedCount}/${totalComponents}: ${blueprint.title}`,
          progress: 50 + (processedCount / totalComponents) * 30
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        socket.send(JSON.stringify({
          type: 'component_ready',
          componentType: 'blueprints',
          data: blueprint
        }));
      }
    }

    // Process strategies
    if (components.strategies) {
      for (const strategy of components.strategies) {
        processedCount++;
        socket.send(JSON.stringify({
          type: 'status',
          phase: 'processing_components',
          message: `Processing Strategy ${processedCount}/${totalComponents}: ${strategy.title}`,
          progress: 50 + (processedCount / totalComponents) * 30
        }));

        await new Promise(resolve => setTimeout(resolve, 500));

        socket.send(JSON.stringify({
          type: 'component_ready',
          componentType: 'strategies',
          data: strategy
        }));
      }
    }

    // Save to database if user is authenticated
    if (userId) {
      socket.send(JSON.stringify({
        type: 'status',
        phase: 'saving',
        message: 'Saving your Jump to dashboard...',
        progress: 85
      }));

      const jumpId = await saveToDatabase(content, userId);

      socket.send(JSON.stringify({
        type: 'status',
        phase: 'saved',
        message: 'Jump saved to your dashboard!',
        progress: 95
      }));

      socket.send(JSON.stringify({
        type: 'jump_saved',
        jumpId: jumpId
      }));
    }

    // Complete
    socket.send(JSON.stringify({
      type: 'status',
      phase: 'complete',
      message: 'Your Jump in AI is ready!',
      progress: 100
    }));

    socket.send(JSON.stringify({
      type: 'generation_complete',
      message: 'Generation completed successfully'
    }));

  } catch (error) {
    console.error('Processing error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process content: ' + (error instanceof Error ? error.message : String(error))
    }));
  }
}

async function saveToDatabase(content: any, userId: string) {
  try {
    // Save the main jump
    const { data: jumpData, error: jumpError } = await supabase
      .from('jumps')
      .insert({
        user_id: userId,
        title: content.structured_plan?.title || 'My Jump in AI',
        full_content: content.full_content,
        structured_plan: content.structured_plan,
        comprehensive_plan: content.comprehensive_plan,
        status: 'completed'
      })
      .select()
      .single();

    if (jumpError) throw jumpError;

    const jumpId = jumpData.id;

    // Save components
    const components = content.components || {};

    // Save prompts
    if (components.prompts) {
      for (const prompt of components.prompts) {
        await supabase.from('prompts').insert({
          user_id: userId,
          jump_id: jumpId,
          title: prompt.title,
          description: prompt.description,
          prompt_text: prompt.prompt_text,
          ai_tools: prompt.ai_tools,
          use_cases: prompt.use_cases,
          category: prompt.category,
          difficulty: prompt.difficulty,
          estimated_time: prompt.estimated_time,
          instructions: prompt.instructions
        });
      }
    }

    // Save workflows
    if (components.workflows) {
      for (const workflow of components.workflows) {
        await supabase.from('workflows').insert({
          user_id: userId,
          jump_id: jumpId,
          title: workflow.title,
          description: workflow.description,
          workflow_steps: workflow.workflow_steps,
          ai_tools: workflow.ai_tools,
          duration_estimate: workflow.duration_estimate,
          complexity_level: workflow.complexity_level,
          prerequisites: workflow.prerequisites,
          expected_outcomes: workflow.expected_outcomes,
          category: workflow.category,
          tools_needed: workflow.tools_needed,
          skill_level: workflow.skill_level,
          instructions: workflow.instructions
        });
      }
    }

    // Save blueprints
    if (components.blueprints) {
      for (const blueprint of components.blueprints) {
        await supabase.from('blueprints').insert({
          user_id: userId,
          jump_id: jumpId,
          title: blueprint.title,
          description: blueprint.description,
          blueprint_content: blueprint.blueprint_content,
          ai_tools: blueprint.ai_tools,
          implementation_time: blueprint.implementation_time,
          difficulty_level: blueprint.difficulty_level,
          resources_needed: blueprint.resources_needed,
          deliverables: blueprint.deliverables,
          category: blueprint.category,
          requirements: blueprint.requirements,
          tools_used: blueprint.tools_used,
          implementation: blueprint.implementation,
          instructions: blueprint.instructions
        });
      }
    }

    // Save strategies
    if (components.strategies) {
      for (const strategy of components.strategies) {
        await supabase.from('strategies').insert({
          user_id: userId,
          jump_id: jumpId,
          title: strategy.title,
          description: strategy.description,
          strategy_framework: strategy.strategy_framework,
          ai_tools: strategy.ai_tools,
          timeline: strategy.timeline,
          success_metrics: strategy.success_metrics,
          key_actions: strategy.key_actions,
          potential_challenges: strategy.potential_challenges,
          mitigation_strategies: strategy.mitigation_strategies,
          category: strategy.category,
          priority_level: strategy.priority_level,
          resource_requirements: strategy.resource_requirements,
          instructions: strategy.instructions
        });
      }
    }

    return jumpId;

  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}