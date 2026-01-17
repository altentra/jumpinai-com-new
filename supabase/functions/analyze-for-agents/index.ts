import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JumpData {
  jumpId: string;
  jumpTitle: string;
  jumpSummary: string | null;
  comprehensivePlan: any;
  structuredPlan: any;
  fullContent: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY not configured');
    }

    const jumpData: JumpData = await req.json();
    console.log('📊 Analyzing jump for agent opportunities:', jumpData.jumpTitle);

    // Construct comprehensive context from all jump data
    const jumpContext = buildJumpContext(jumpData);

    const systemPrompt = `You are an expert AI implementation strategist specializing in identifying automation opportunities and AI agent development. Your role is to analyze business plans and strategic jumps to find the best opportunities for implementing personalized AI agents.

You have deep expertise in:
- Workflow automation and process optimization
- AI agent architectures (autonomous agents, copilots, assistants)
- Integration patterns and API design
- Time and resource optimization
- Business process reengineering with AI

When analyzing a jump, focus on:
1. Repetitive tasks that can be automated
2. Decision-making processes that can be augmented with AI
3. Data processing and analysis workflows
4. Communication and coordination tasks
5. Research and information gathering activities
6. Content creation and document generation
7. Scheduling and calendar management
8. Customer interactions and support

Always provide actionable, specific recommendations with clear implementation paths.`;

    const userPrompt = `Analyze the following strategic jump and identify the TOP 3-5 best opportunities for implementing AI agents to automate tasks, workflows, or processes.

${jumpContext}

For each opportunity you identify, provide:
1. A clear, descriptive title
2. Detailed description of what will be automated
3. Which phase and step this relates to (if applicable)
4. Impact level (high/medium/low) based on time saved and value created
5. Complexity level (simple/moderate/complex) for implementation
6. Estimated time saved (e.g., "5-10 hours per week", "2 hours per task")
7. Required tools and technologies
8. Key benefits (3-4 specific benefits)
9. High-level implementation steps (3-5 steps)

Respond with a JSON object in this exact format:
{
  "summary": "A 2-3 sentence summary of the automation potential in this jump",
  "overallPotential": "A brief statement like 'High automation potential with 3 major opportunities' or 'Moderate potential with focus on research automation'",
  "opportunities": [
    {
      "id": "opp-1",
      "title": "Clear descriptive title",
      "description": "Detailed explanation of what this agent will do and why it's valuable",
      "automationTarget": "Specific task or workflow being automated",
      "phaseNumber": 1,
      "stepNumber": 2,
      "impactLevel": "high",
      "complexityLevel": "moderate",
      "estimatedTimeSaved": "5-8 hours per week",
      "requiredTools": ["Tool 1", "Tool 2"],
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "implementationSteps": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}

Focus on practical, immediately implementable opportunities. Prioritize by impact and feasibility. Return ONLY the JSON object, no additional text.`;

    console.log('🤖 Calling xAI API for analysis...');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'grok-4-fast-non-reasoning',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in xAI response');
    }

    console.log('✅ Received response from xAI');

    // Parse the JSON response
    let analysisResult;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse xAI response as JSON:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse analysis results');
    }

    // Validate the response structure
    if (!analysisResult.opportunities || !Array.isArray(analysisResult.opportunities)) {
      throw new Error('Invalid analysis response structure');
    }

    console.log(`✅ Analysis complete: Found ${analysisResult.opportunities.length} opportunities`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in analyze-for-agents:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildJumpContext(jumpData: JumpData): string {
  const sections: string[] = [];

  sections.push(`=== JUMP TITLE ===\n${jumpData.jumpTitle}`);

  if (jumpData.jumpSummary) {
    sections.push(`=== SUMMARY ===\n${jumpData.jumpSummary}`);
  }

  // Extract comprehensive plan details
  if (jumpData.comprehensivePlan) {
    const cp = jumpData.comprehensivePlan;
    
    // Handle the 4-frame structure
    if (cp.jumpForward) {
      sections.push(`=== STRATEGIC RESPONSE ===\n${cp.jumpForward}`);
    }
    
    if (cp.strategicEdge) {
      let edgeContent = '';
      if (cp.strategicEdge.analysis) {
        edgeContent += `Analysis: ${cp.strategicEdge.analysis}\n`;
      }
      if (Array.isArray(cp.strategicEdge.keyPoints)) {
        edgeContent += `Key Points:\n${cp.strategicEdge.keyPoints.map((p: string) => `- ${p}`).join('\n')}`;
      }
      if (edgeContent) {
        sections.push(`=== STRATEGIC EDGE ===\n${edgeContent}`);
      }
    }
    
    if (cp.flightPath) {
      let pathContent = '';
      if (cp.flightPath.vision) {
        pathContent += `Vision: ${cp.flightPath.vision}\n`;
      }
      if (Array.isArray(cp.flightPath.roadmap)) {
        pathContent += `Roadmap:\n${cp.flightPath.roadmap.map((r: string) => `- ${r}`).join('\n')}`;
      }
      if (pathContent) {
        sections.push(`=== FLIGHT PATH (VISION & ROADMAP) ===\n${pathContent}`);
      }
    }
    
    if (cp.newBaseline) {
      sections.push(`=== NEW BASELINE ===\n${cp.newBaseline}`);
    }

    // Handle action_plan if present in comprehensive_plan
    if (cp.action_plan?.phases) {
      sections.push(formatPhases(cp.action_plan.phases));
    }
  }

  // Extract structured plan (phases and steps)
  if (jumpData.structuredPlan) {
    const sp = jumpData.structuredPlan;
    
    if (sp.phases) {
      sections.push(formatPhases(sp.phases));
    } else if (Array.isArray(sp)) {
      sections.push(formatPhases(sp));
    }
  }

  // Include full content as fallback context
  if (jumpData.fullContent && sections.length < 3) {
    sections.push(`=== FULL CONTENT ===\n${jumpData.fullContent.substring(0, 3000)}...`);
  }

  return sections.join('\n\n');
}

function formatPhases(phases: any[]): string {
  if (!Array.isArray(phases) || phases.length === 0) return '';
  
  let content = '=== ACTION PLAN (PHASES & STEPS) ===\n';
  
  phases.forEach((phase, phaseIdx) => {
    content += `\nPHASE ${phase.phase_number || phaseIdx + 1}: ${phase.title || 'Untitled Phase'}\n`;
    content += `Duration: ${phase.duration || 'Not specified'}\n`;
    if (phase.description) {
      content += `Description: ${phase.description}\n`;
    }
    
    if (Array.isArray(phase.steps)) {
      content += 'Steps:\n';
      phase.steps.forEach((step: any, stepIdx: number) => {
        content += `  ${stepIdx + 1}. ${step.title || step.name || 'Untitled Step'}\n`;
        if (step.description) {
          content += `     Description: ${step.description}\n`;
        }
        if (step.action) {
          content += `     Action: ${step.action}\n`;
        }
        if (step.tools && Array.isArray(step.tools)) {
          content += `     Tools: ${step.tools.join(', ')}\n`;
        }
        
        // Include sub-steps if present
        if (Array.isArray(step.sub_steps) && step.sub_steps.length > 0) {
          content += '     Sub-steps:\n';
          step.sub_steps.forEach((subStep: any, subIdx: number) => {
            content += `       ${stepIdx + 1}.${subIdx + 1}. ${subStep.title || subStep.name || 'Sub-step'}\n`;
          });
        }
      });
    }
  });
  
  return content;
}
