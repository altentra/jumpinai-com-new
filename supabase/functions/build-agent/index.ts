import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentBuildRequest {
  opportunity: {
    title: string;
    description: string;
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

    const { opportunity, jump } = await req.json() as AgentBuildRequest;

    console.log('Generating n8n workflow for:', opportunity.title);

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

    // Validate it's proper JSON
    let parsedWorkflow;
    try {
      parsedWorkflow = JSON.parse(workflowJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', workflowJson.substring(0, 500));
      throw new Error('Failed to generate valid workflow JSON');
    }

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
        workflow: parsedWorkflow,
        filename: `${opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workflow.json`,
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
