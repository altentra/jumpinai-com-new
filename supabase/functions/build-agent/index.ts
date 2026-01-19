import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentBuildRequest {
  opportunity: {
    title: string;
    description: string;
    automationTarget?: string;
    impact: string;
    complexity: string;
    estimatedTimeSaved: string;
    requiredTools: string[];
    benefits: string[];
  };
  jump: {
    id: string;
    title: string;
    summary: string;
    goals: string;
    challenges: string;
  };
  analysisId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const xaiApiKey = Deno.env.get('XAI_API_KEY');

    if (!xaiApiKey) {
      throw new Error('XAI_API_KEY not configured');
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { opportunity, jump, analysisId } = await req.json() as AgentBuildRequest;

    console.log('Generating n8n workflow for:', opportunity.title);

    // First, check if user has credits (without deducting)
    const { data: userCredits, error: creditsCheckError } = await supabase
      .from('user_credits')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single();

    if (creditsCheckError || !userCredits || userCredits.credits_balance < 1) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits', 
          message: 'You need at least 1 credit to build an AI agent. Please purchase more credits.' 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User has sufficient credits, proceeding with generation...');


    // Generate n8n workflow using xAI
    const systemPrompt = `You are an expert n8n workflow builder. Your task is to generate complete, valid, importable n8n workflow JSON files.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations, just the JSON
2. Use real n8n node types that exist in n8n
3. Include all required node properties
4. Make sure node positions don't overlap
5. Include proper connections between nodes
6. Use webhook triggers for easy testing

COMMON N8N NODE TYPES:
- n8n-nodes-base.webhook (trigger)
- n8n-nodes-base.httpRequest (API calls)
- n8n-nodes-base.openAi (AI processing)
- n8n-nodes-base.gmail (send emails)
- n8n-nodes-base.slack (send messages)
- n8n-nodes-base.googleSheets (data storage)
- n8n-nodes-base.notion (notes/databases)
- n8n-nodes-base.if (conditional logic)
- n8n-nodes-base.set (set variables)
- n8n-nodes-base.code (custom JavaScript)
- n8n-nodes-base.respondToWebhook (return response)

WORKFLOW STRUCTURE:
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "active": false,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "1",
  "meta": {
    "instanceId": "generated-by-jumpinai"
  }
}`;

    // Second prompt for generating detailed setup instructions
    const instructionsSystemPrompt = `You are a friendly, expert technical writer who specializes in explaining n8n workflows to non-technical users. Your job is to create personalized, step-by-step setup instructions that are:
1. Written in plain English - avoid technical jargon
2. Super specific to the actual workflow being set up
3. Include exact node names and what they do
4. Explain what credentials/API keys are needed and exactly how to get them
5. Include troubleshooting tips for common issues

Format your response as a JSON object with these fields:
{
  "quickStart": "A 1-2 sentence summary of what this workflow does",
  "requirements": ["List of accounts/credentials needed BEFORE starting"],
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed explanation of what to do",
      "tips": ["Optional helpful tips"]
    }
  ],
  "testingGuide": "How to test if the workflow works correctly",
  "troubleshooting": [
    {
      "problem": "Common issue",
      "solution": "How to fix it"
    }
  ]
}`;

    const userPrompt = `Create a complete n8n workflow JSON for this automation:

AGENT TITLE: ${opportunity.title}

DESCRIPTION: ${opportunity.description}

CONTEXT FROM USER'S PROJECT:
- Project: ${jump.title}
- Goals: ${jump.goals}
- Challenges: ${jump.challenges}
- Summary: ${jump.summary}

REQUIRED CAPABILITIES:
${opportunity.requiredTools.map(tool => `- ${tool}`).join('\n')}

EXPECTED BENEFITS:
${opportunity.benefits.map(benefit => `- ${benefit}`).join('\n')}

COMPLEXITY: ${opportunity.complexity}
TIME SAVINGS: ${opportunity.estimatedTimeSaved}

Generate a complete, working n8n workflow that:
1. Starts with a Webhook trigger (so user can easily test it)
2. Includes all necessary nodes to accomplish the automation
3. Uses AI nodes where intelligent processing is needed
4. Ends with appropriate output (webhook response, email, etc.)
5. Has helpful node names and notes

Return ONLY the JSON workflow - no explanations, no markdown code blocks.`;

    const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!xaiResponse.ok) {
      const errorText = await xaiResponse.text();
      console.error('xAI API error:', xaiResponse.status, errorText);
      throw new Error(`AI API error: ${xaiResponse.status}`);
    }

    const xaiData = await xaiResponse.json();
    let workflowJson = xaiData.choices?.[0]?.message?.content || '';

    console.log('Raw AI response length:', workflowJson.length);

    // Clean up the response - remove markdown code blocks if present
    workflowJson = workflowJson.trim();
    if (workflowJson.startsWith('```json')) {
      workflowJson = workflowJson.slice(7);
    } else if (workflowJson.startsWith('```')) {
      workflowJson = workflowJson.slice(3);
    }
    if (workflowJson.endsWith('```')) {
      workflowJson = workflowJson.slice(0, -3);
    }
    workflowJson = workflowJson.trim();

    // Robust JSON parsing with salvage attempts
    const salvageWorkflowJson = (raw: string): any => {
      // First, try direct parse
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.log('Direct parse failed, attempting salvage...');
      }

      // Try to find JSON object boundaries
      const start = raw.indexOf('{');
      if (start < 0) return null;

      // Find the last valid closing brace by trying progressively
      let lastValidEnd = -1;
      let lastValidParsed = null;

      for (let i = raw.length - 1; i > start; i--) {
        if (raw[i] === '}') {
          const attempt = raw.slice(start, i + 1);
          try {
            const parsed = JSON.parse(attempt);
            if (parsed && typeof parsed === 'object') {
              lastValidEnd = i;
              lastValidParsed = parsed;
              break;
            }
          } catch {
            // Continue searching for an earlier valid end
          }
        }
      }

      if (lastValidParsed) {
        console.log(`Salvaged JSON from position ${start} to ${lastValidEnd}`);
        return lastValidParsed;
      }

      // Try to fix common truncation issues - close unclosed structures
      let fixed = raw.slice(start);
      
      // Count unclosed brackets/braces
      let braces = 0, brackets = 0;
      let inString = false;
      let escapeNext = false;
      
      for (const char of fixed) {
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') braces++;
          else if (char === '}') braces--;
          else if (char === '[') brackets++;
          else if (char === ']') brackets--;
        }
      }

      // Close any unclosed strings (if we ended inside a string)
      if (inString) {
        fixed += '"';
      }

      // Close unclosed brackets and braces
      while (brackets > 0) {
        fixed += ']';
        brackets--;
      }
      while (braces > 0) {
        fixed += '}';
        braces--;
      }

      try {
        const parsed = JSON.parse(fixed);
        console.log('Fixed truncated JSON by closing structures');
        return parsed;
      } catch {
        return null;
      }
    };

    let parsedWorkflow = salvageWorkflowJson(workflowJson);
    
    if (!parsedWorkflow) {
      console.error('JSON parse error - all salvage attempts failed');
      console.error('Raw content (first 500 chars):', workflowJson.substring(0, 500));
      console.error('Raw content (last 200 chars):', workflowJson.substring(workflowJson.length - 200));
      throw new Error('Failed to generate valid workflow JSON');
    }
    
    console.log('Successfully parsed workflow JSON');

    // Ensure the workflow has a proper name
    if (!parsedWorkflow.name) {
      parsedWorkflow.name = `JumpinAI: ${opportunity.title}`;
    }

    // Add metadata
    parsedWorkflow.meta = {
      ...parsedWorkflow.meta,
      instanceId: 'generated-by-jumpinai',
      generatedAt: new Date().toISOString(),
      jumpId: jump.id,
      opportunityTitle: opportunity.title,
    };

    const filename = `${opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workflow.json`;

    // Now generate detailed, personalized setup instructions
    console.log('Generating personalized setup instructions...');
    
    const instructionsPrompt = `Generate detailed setup instructions for this n8n workflow:

WORKFLOW NAME: ${parsedWorkflow.name}
WORKFLOW PURPOSE: ${opportunity.description}

NODES IN THIS WORKFLOW:
${parsedWorkflow.nodes?.map((node: any) => `- ${node.name} (${node.type})`).join('\n') || 'Unknown nodes'}

REQUIRED TOOLS MENTIONED:
${opportunity.requiredTools.map(tool => `- ${tool}`).join('\n')}

USER'S PROJECT CONTEXT:
- Project: ${jump.title}
- Goals: ${jump.goals}

Create personalized, beginner-friendly setup instructions. Be VERY specific about:
1. What credentials/accounts the user needs to set up
2. Exactly how to import the JSON file into n8n
3. How to configure each node that needs configuration
4. How to test the workflow
5. Common problems and solutions

Return ONLY the JSON object, no markdown.`;

    const instructionsResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        messages: [
          { role: 'system', content: instructionsSystemPrompt },
          { role: 'user', content: instructionsPrompt }
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    let detailedInstructions: any = null;
    let instructionsContent = '';

    const tryParseJsonObject = (raw: string) => {
      const cleaned = raw.trim();
      try {
        const parsed = JSON.parse(cleaned);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        // Try to salvage JSON if model added extra text
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
          const sliced = cleaned.slice(start, end + 1);
          try {
            const parsed = JSON.parse(sliced);
            return parsed && typeof parsed === 'object' ? parsed : null;
          } catch {
            return null;
          }
        }
        return null;
      }
    };

    if (instructionsResponse.ok) {
      const instructionsData = await instructionsResponse.json();
      instructionsContent = instructionsData.choices?.[0]?.message?.content || '';

      // Clean up the response
      instructionsContent = instructionsContent.trim();
      if (instructionsContent.startsWith('```json')) {
        instructionsContent = instructionsContent.slice(7);
      } else if (instructionsContent.startsWith('```')) {
        instructionsContent = instructionsContent.slice(3);
      }
      if (instructionsContent.endsWith('```')) {
        instructionsContent = instructionsContent.slice(0, -3);
      }
      instructionsContent = instructionsContent.trim();

      detailedInstructions = tryParseJsonObject(instructionsContent);
      if (detailedInstructions) {
        console.log('Successfully parsed detailed instructions');
      } else {
        console.error('Failed to parse instructions JSON; saving raw instructions for UI fallback');
        detailedInstructions = {
          quickStart: `Setup guide for: ${parsedWorkflow.name}`,
          requirements: [],
          steps: [],
          testingGuide: '',
          troubleshooting: [],
          _raw: instructionsContent,
        };
      }
    }

    // Save agent to database
    const { data: savedAgent, error: saveError } = await supabase
      .from('user_agents')
      .insert({
        user_id: user.id,
        jump_id: jump.id,
        analysis_id: analysisId || null,
        title: opportunity.title,
        description: opportunity.description,
        automation_target: opportunity.automationTarget || null,
        impact_level: opportunity.impact,
        complexity_level: opportunity.complexity,
        estimated_time_saved: opportunity.estimatedTimeSaved,
        required_tools: opportunity.requiredTools,
        benefits: opportunity.benefits,
        workflow_json: parsedWorkflow,
        workflow_filename: filename,
        detailed_instructions: detailedInstructions,
        platform: 'n8n',
        status: 'active',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save agent:', saveError);
      // Continue without saving - don't fail the request
    } else {
      console.log('✅ Agent saved to database:', savedAgent.id);
    }

    // NOW deduct credit AFTER successful generation and save
    const { data: creditDeducted, error: creditError } = await supabase
      .rpc('deduct_user_credit', {
        p_user_id: user.id,
        p_description: 'AI Agent build: ' + opportunity.title,
        p_reference_id: savedAgent?.id || `agent_${Date.now()}`
      });

    if (creditError) {
      console.error('Credit deduction error (after success):', creditError);
      // Agent was already built, log the error but don't fail
    } else if (creditDeducted) {
      console.log('✅ Credit deducted successfully after agent build');
    } else {
      console.warn('Credit deduction returned false - user may have run out of credits during build');
    }

    // Log the build
    await supabase.from('api_usage_logs').insert({
      user_id: user.id,
      endpoint: 'build-agent',
      status_code: 200,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify({
        success: true,
        agentId: savedAgent?.id,
        workflow: parsedWorkflow,
        filename: filename,
        detailedInstructions: detailedInstructions,
        creditDeducted: creditDeducted || false,
        // Keep basic instructions as fallback
        instructions: {
          step1: "Download the workflow JSON file",
          step2: "Open your n8n instance (or create free account at n8n.io)",
          step3: "Go to Workflows → Import from File",
          step4: "Select the downloaded JSON file",
          step5: "Review the workflow and update any credentials (API keys, etc.)",
          step6: "Activate the workflow and test it!",
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in build-agent function:', error);
    // No credit was deducted since we deduct AFTER success, so no refund needed
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate workflow',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
