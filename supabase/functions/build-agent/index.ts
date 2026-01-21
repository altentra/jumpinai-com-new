import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AutomationType = 'workflow' | 'ai-agent';

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
  platform?: 'n8n' | 'make' | 'both';
  automationType?: AutomationType;
}

// ============ WORKFLOW PROMPTS (Simple Task Automation) ============

const N8N_WORKFLOW_PROMPT = `You are an expert n8n workflow builder. Your task is to generate a SIMPLE, LINEAR workflow for task automation.

WORKFLOW CHARACTERISTICS:
- Sequential, predictable execution
- Fixed logic paths with basic conditionals
- Straightforward data transformations
- Standard integrations and API calls

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
  "settings": { "executionOrder": "v1" },
  "versionId": "1",
  "meta": { "instanceId": "generated-by-jumpinai", "type": "workflow" }
}`;

const MAKE_WORKFLOW_PROMPT = `You are an expert Make.com scenario builder. Your task is to generate a SIMPLE, LINEAR scenario for task automation.

SCENARIO CHARACTERISTICS:
- Sequential, predictable execution
- Fixed logic paths with basic routers
- Straightforward data transformations
- Standard module integrations

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations, just the JSON
2. Use real Make.com module types
3. Include all required module properties
4. Use proper module IDs and flow connections
5. Use webhook triggers for easy testing

COMMON MAKE.COM MODULES:
- gateway:CustomWebHook (webhook trigger)
- http:ActionSendData (HTTP requests)
- google-email:ActionSendEmail (send emails)
- slack:ActionPostMessage (send messages)
- google-sheets:ActionAppendRow (data storage)
- notion:createADatabaseItem (databases)
- builtin:BasicRouter (conditional logic)
- util:SetVariables (set variables)
- builtin:BasicFilter (filters)

SCENARIO STRUCTURE:
{
  "name": "Scenario Name",
  "flow": [...],
  "metadata": { "instant": true, "version": 1, "type": "workflow" }
}`;

// ============ AI AGENT PROMPTS (Autonomous Decision-Making) ============

const N8N_AI_AGENT_PROMPT = `You are an expert AI agent architect for n8n. Your task is to build an AUTONOMOUS AI AGENT that can reason, decide, and adapt.

AI AGENT CHARACTERISTICS:
- Reasoning loops that analyze situations before acting
- Dynamic decision branches based on context
- Memory and context management
- Self-correction and error handling
- Multiple execution paths based on AI analysis
- Feedback loops for continuous improvement

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. MUST include AI/LLM nodes for reasoning (OpenAI, Anthropic, etc.)
3. Use agent-style patterns with loops and decision trees
4. Include error handling and fallback paths
5. Add memory/state management where appropriate

REQUIRED AI AGENT COMPONENTS:
- n8n-nodes-base.openAi or similar for reasoning
- Decision branches based on AI output
- Loops for iterative refinement
- Error handlers for graceful degradation
- Context/memory management nodes

ADVANCED NODE TYPES FOR AGENTS:
- n8n-nodes-base.openAi (AI reasoning/analysis)
- n8n-nodes-base.anthropic (Claude reasoning)
- n8n-nodes-base.if (decision branching)
- n8n-nodes-base.switch (multi-path routing)
- n8n-nodes-base.splitInBatches (iteration)
- n8n-nodes-base.code (custom logic/memory)
- n8n-nodes-base.merge (path convergence)
- n8n-nodes-base.wait (async coordination)

AGENT WORKFLOW STRUCTURE:
{
  "name": "AI Agent: [Name]",
  "nodes": [
    // 1. Input/Trigger
    // 2. Context Gathering
    // 3. AI Analysis/Reasoning (LLM call)
    // 4. Decision Router based on AI output
    // 5. Action branches for different decisions
    // 6. Feedback/Refinement loop
    // 7. Output/Response
  ],
  "connections": {...},
  "active": false,
  "settings": { "executionOrder": "v1" },
  "meta": { "instanceId": "generated-by-jumpinai", "type": "ai-agent" }
}`;

const MAKE_AI_AGENT_PROMPT = `You are an expert AI agent architect for Make.com. Your task is to build an AUTONOMOUS AI AGENT that can reason, decide, and adapt.

AI AGENT CHARACTERISTICS:
- Reasoning modules that analyze situations
- Dynamic routers based on AI decisions
- Context and state management
- Multi-path execution based on analysis
- Error handling and recovery

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. MUST include AI modules (OpenAI, etc.) for reasoning
3. Use routers for dynamic decision paths
4. Include iterators for refinement loops
5. Add error handlers throughout

REQUIRED AI AGENT COMPONENTS:
- openai:CreateCompletion for reasoning
- builtin:BasicRouter for AI-based decisions
- builtin:Repeater for iteration/refinement
- Error handlers for each critical path

ADVANCED MODULES FOR AGENTS:
- openai:CreateCompletion (AI reasoning)
- openai:CreateChatCompletion (conversational AI)
- builtin:BasicRouter (multi-path routing)
- builtin:Repeater (loops/iteration)
- util:SetVariables (memory/state)
- builtin:BasicFilter (conditional filtering)
- tools:SetVariable (context storage)

AGENT SCENARIO STRUCTURE:
{
  "name": "AI Agent: [Name]",
  "flow": [
    // 1. Webhook trigger
    // 2. Context gathering modules
    // 3. AI analysis module
    // 4. Router based on AI decision
    // 5. Multiple action branches
    // 6. Aggregation/feedback
    // 7. Response
  ],
  "metadata": { "instant": true, "version": 1, "type": "ai-agent" }
}`;

// Instructions generation prompts
const N8N_INSTRUCTIONS_PROMPT = `You are a friendly, expert technical writer who specializes in explaining n8n workflows to non-technical users. Your job is to create personalized, step-by-step setup instructions that are:
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

const MAKE_INSTRUCTIONS_PROMPT = `You are a friendly, expert technical writer who specializes in explaining Make.com scenarios to non-technical users. Your job is to create personalized, step-by-step setup instructions that are:
1. Written in plain English - avoid technical jargon
2. Super specific to the actual scenario being set up
3. Include exact module names and what they do
4. Explain what connections/API keys are needed and exactly how to get them
5. Include troubleshooting tips for common issues
6. Reference Make.com specific UI elements (modules, scenarios, connections, webhooks)

Format your response as a JSON object with these fields:
{
  "quickStart": "A 1-2 sentence summary of what this scenario does",
  "requirements": ["List of accounts/connections needed BEFORE starting"],
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed explanation of what to do in Make.com",
      "tips": ["Optional helpful tips"]
    }
  ],
  "testingGuide": "How to test if the scenario works correctly",
  "troubleshooting": [
    {
      "problem": "Common issue",
      "solution": "How to fix it"
    }
  ]
}`;

// Robust JSON parsing with salvage attempts
const salvageJson = (raw: string): any => {
  // First, try direct parse
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.log('Direct parse failed, attempting salvage...');
  }

  // Clean up markdown if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Try to find JSON object boundaries
  const start = cleaned.indexOf('{');
  if (start < 0) return null;

  // Find the last valid closing brace by trying progressively
  let lastValidEnd = -1;
  let lastValidParsed = null;

  for (let i = cleaned.length - 1; i > start; i--) {
    if (cleaned[i] === '}') {
      const attempt = cleaned.slice(start, i + 1);
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
  let fixed = cleaned.slice(start);
  
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

// Generate workflow or AI agent for a specific platform
async function generateWorkflow(
  xaiApiKey: string,
  platform: 'n8n' | 'make',
  opportunity: AgentBuildRequest['opportunity'],
  jump: AgentBuildRequest['jump'],
  automationType: AutomationType = 'workflow'
): Promise<{ workflow: any; filename: string; instructions: any; automationType: AutomationType }> {
  
  const isAIAgent = automationType === 'ai-agent';
  
  // Select the appropriate system prompt based on type
  let systemPrompt: string;
  if (platform === 'n8n') {
    systemPrompt = isAIAgent ? N8N_AI_AGENT_PROMPT : N8N_WORKFLOW_PROMPT;
  } else {
    systemPrompt = isAIAgent ? MAKE_AI_AGENT_PROMPT : MAKE_WORKFLOW_PROMPT;
  }
  
  const instructionsSystemPrompt = platform === 'n8n' ? N8N_INSTRUCTIONS_PROMPT : MAKE_INSTRUCTIONS_PROMPT;
  const platformName = platform === 'n8n' ? 'n8n' : 'Make.com';
  const workflowTerm = platform === 'n8n' ? 'workflow' : 'scenario';
  const buildType = isAIAgent ? 'AI Agent' : 'Workflow';

  // Create different prompts based on automation type
  const userPrompt = isAIAgent 
    ? `Create a complete ${platformName} AI AGENT for autonomous decision-making:

AI AGENT TITLE: ${opportunity.title}

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

Generate a COMPLETE AI AGENT that:
1. Starts with a Webhook trigger for easy testing
2. Includes AI/LLM reasoning nodes that ANALYZE the input and DECIDE what to do
3. Has decision branches based on AI analysis
4. Can handle multiple scenarios and edge cases
5. Includes error handling and fallback paths
6. Has clear logging/debugging output
7. Can adapt based on context

IMPORTANT: This must be a TRUE AI AGENT with reasoning capabilities, NOT a simple linear workflow!
Return ONLY the JSON - no explanations, no markdown code blocks.`
    : `Create a complete ${platformName} ${workflowTerm} JSON for this simple automation:

WORKFLOW TITLE: ${opportunity.title}

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

Generate a complete, working ${platformName} ${workflowTerm} that:
1. Starts with a Webhook trigger (so user can easily test it)
2. Includes all necessary ${platform === 'n8n' ? 'nodes' : 'modules'} to accomplish the automation
3. Follows a LINEAR, PREDICTABLE execution path
4. Ends with appropriate output (webhook response, email, etc.)
5. Has helpful ${platform === 'n8n' ? 'node' : 'module'} names and notes

Return ONLY the JSON ${workflowTerm} - no explanations, no markdown code blocks.`;

  // Generate workflow/agent
  console.log(`Generating ${platformName} ${buildType}...`);
  const workflowResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-4-1-fast-reasoning', // Latest model for best quality workflow/agent generation
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: isAIAgent ? 0.4 : 0.3, // Slightly higher temp for creative agent design
      max_tokens: isAIAgent ? 12000 : 8000, // More tokens for complex agents
    }),
  });

  if (!workflowResponse.ok) {
    const errorText = await workflowResponse.text();
    console.error(`${platformName} API error:`, workflowResponse.status, errorText);
    throw new Error(`AI API error for ${platformName}: ${workflowResponse.status}`);
  }

  const workflowData = await workflowResponse.json();
  let workflowJson = workflowData.choices?.[0]?.message?.content || '';

  console.log(`Raw ${platformName} response length:`, workflowJson.length);

  const parsedWorkflow = salvageJson(workflowJson);
  
  if (!parsedWorkflow) {
    console.error(`${platformName} JSON parse error - all salvage attempts failed`);
    throw new Error(`Failed to generate valid ${platformName} ${workflowTerm} JSON`);
  }
  
  console.log(`Successfully parsed ${platformName} ${workflowTerm} JSON`);

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
    platform: platform,
    automationType: automationType,
  };

  const typePrefix = isAIAgent ? 'ai-agent' : 'workflow';
  const fileExt = 'json';
  const filename = `${opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${platform}-${typePrefix}.${fileExt}`;

  // Generate instructions
  console.log(`Generating ${platformName} setup instructions...`);
  
  const instructionsPrompt = `Generate detailed setup instructions for this ${platformName} ${workflowTerm}:

${platform === 'n8n' ? 'WORKFLOW' : 'SCENARIO'} NAME: ${parsedWorkflow.name}
${platform === 'n8n' ? 'WORKFLOW' : 'SCENARIO'} PURPOSE: ${opportunity.description}

${platform === 'n8n' ? 'NODES' : 'MODULES'} IN THIS ${platform === 'n8n' ? 'WORKFLOW' : 'SCENARIO'}:
${platform === 'n8n' 
  ? (parsedWorkflow.nodes?.map((node: any) => `- ${node.name} (${node.type})`).join('\n') || 'Unknown nodes')
  : (parsedWorkflow.flow?.map((mod: any) => `- ${mod.mapper?.name || mod.module} (${mod.module})`).join('\n') || 'Unknown modules')
}

REQUIRED TOOLS MENTIONED:
${opportunity.requiredTools.map(tool => `- ${tool}`).join('\n')}

USER'S PROJECT CONTEXT:
- Project: ${jump.title}
- Goals: ${jump.goals}

Create personalized, beginner-friendly setup instructions for ${platformName}. Be VERY specific about:
1. What credentials/accounts the user needs to set up
2. Exactly how to import the JSON file into ${platformName}
3. How to configure each ${platform === 'n8n' ? 'node' : 'module'} that needs configuration
4. How to test the ${workflowTerm}
5. Common problems and solutions

Return ONLY the JSON object, no markdown.`;

  const instructionsResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3-fast', // Use faster model for instructions to reduce total time
      messages: [
        { role: 'system', content: instructionsSystemPrompt },
        { role: 'user', content: instructionsPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  let detailedInstructions: any = null;

  if (instructionsResponse.ok) {
    const instructionsData = await instructionsResponse.json();
    const instructionsContent = instructionsData.choices?.[0]?.message?.content || '';
    
    detailedInstructions = salvageJson(instructionsContent);
    
    if (detailedInstructions) {
      console.log(`Successfully parsed ${platformName} detailed instructions`);
    } else {
      console.error(`Failed to parse ${platformName} instructions JSON; saving raw for fallback`);
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

  return {
    workflow: parsedWorkflow,
    filename: filename,
    instructions: detailedInstructions,
    automationType: automationType,
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

    const { opportunity, jump, analysisId, platform = 'n8n', automationType = 'workflow' } = await req.json() as AgentBuildRequest;

    const isAIAgent = automationType === 'ai-agent';
    const buildTypeName = isAIAgent ? 'AI Agent' : 'Workflow';
    console.log(`Generating ${buildTypeName} for platform: ${platform} - Opportunity: ${opportunity.title}`);

    // Determine credits: AI agents cost 2x, platforms multiply
    const baseCredits = isAIAgent ? 2 : 1;
    const creditsNeeded = platform === 'both' ? baseCredits * 2 : baseCredits;

    // Check if user has sufficient credits
    const { data: userCredits, error: creditsCheckError } = await supabase
      .from('user_credits')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single();

    if (creditsCheckError || !userCredits || userCredits.credits_balance < creditsNeeded) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits', 
          message: `You need at least ${creditsNeeded} credit${creditsNeeded > 1 ? 's' : ''} to build this ${buildTypeName}. Please purchase more credits.` 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User has sufficient credits (${userCredits.credits_balance}), proceeding with generation...`);

    // Generate workflow(s) based on platform selection
    const results: {
      n8n?: { workflow: any; filename: string; instructions: any; automationType: AutomationType };
      make?: { workflow: any; filename: string; instructions: any; automationType: AutomationType };
    } = {};

    if (platform === 'n8n' || platform === 'both') {
      results.n8n = await generateWorkflow(xaiApiKey, 'n8n', opportunity, jump, automationType);
    }

    if (platform === 'make' || platform === 'both') {
      results.make = await generateWorkflow(xaiApiKey, 'make', opportunity, jump, automationType);
    }

    // Save agent(s) to database
    const savedAgentIds: string[] = [];

    // Save n8n agent if generated
    if (results.n8n) {
      const { data: savedN8nAgent, error: saveN8nError } = await supabase
        .from('user_agents')
        .insert({
          user_id: user.id,
          jump_id: jump.id,
          analysis_id: analysisId || null,
          title: opportunity.title,
          description: opportunity.description,
          automation_target: opportunity.automationTarget || null,
          automation_type: automationType,
          impact_level: opportunity.impact,
          complexity_level: opportunity.complexity,
          estimated_time_saved: opportunity.estimatedTimeSaved,
          required_tools: opportunity.requiredTools,
          benefits: opportunity.benefits,
          workflow_json: results.n8n.workflow,
          workflow_filename: results.n8n.filename,
          detailed_instructions: results.n8n.instructions,
          platform: 'n8n',
          status: 'active',
        })
        .select()
        .single();

      if (saveN8nError) {
        console.error('Failed to save n8n agent:', saveN8nError);
      } else {
        console.log('✅ n8n Agent saved:', savedN8nAgent.id);
        savedAgentIds.push(savedN8nAgent.id);
      }
    }

    // Save Make.com agent if generated
    if (results.make) {
      const { data: savedMakeAgent, error: saveMakeError } = await supabase
        .from('user_agents')
        .insert({
          user_id: user.id,
          jump_id: jump.id,
          analysis_id: analysisId || null,
          title: opportunity.title + ' (Make.com)',
          description: opportunity.description,
          automation_target: opportunity.automationTarget || null,
          automation_type: automationType,
          impact_level: opportunity.impact,
          complexity_level: opportunity.complexity,
          estimated_time_saved: opportunity.estimatedTimeSaved,
          required_tools: opportunity.requiredTools,
          benefits: opportunity.benefits,
          workflow_json: results.make.workflow,
          workflow_filename: results.make.filename,
          detailed_instructions: results.make.instructions,
          platform: 'make',
          status: 'active',
        })
        .select()
        .single();

      if (saveMakeError) {
        console.error('Failed to save Make.com agent:', saveMakeError);
      } else {
        console.log('✅ Make.com Agent saved:', savedMakeAgent.id);
        savedAgentIds.push(savedMakeAgent.id);
      }
    }

    // Deduct credits AFTER successful generation
    for (let i = 0; i < (platform === 'both' ? 2 : 1); i++) {
      const platformName = i === 0 
        ? (platform === 'both' ? 'n8n' : platform) 
        : 'Make.com';
      
      const buildTypeLabel = automationType === 'ai-agent' ? 'AI Agent' : 'Workflow';
      const { data: creditDeducted, error: creditError } = await supabase
        .rpc('deduct_user_credit', {
          p_user_id: user.id,
          p_description: `${buildTypeLabel} build (${platformName}): ${opportunity.title}`,
          p_reference_id: savedAgentIds[i] || `agent_${platformName}_${Date.now()}`
        });

      if (creditError) {
        console.error(`Credit deduction error for ${platformName}:`, creditError);
      } else if (creditDeducted) {
        console.log(`✅ Credit deducted for ${platformName} agent`);
      }
    }

    // Log the build
    await supabase.from('api_usage_logs').insert({
      user_id: user.id,
      endpoint: 'build-agent',
      status_code: 200,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent'),
    });

    // Prepare response based on what was generated
    const response: any = {
      success: true,
      platform: platform,
      creditsUsed: platform === 'both' ? 2 : 1,
    };

    // For backwards compatibility and single platform requests
    if (platform === 'n8n' && results.n8n) {
      response.agentId = savedAgentIds[0];
      response.workflow = results.n8n.workflow;
      response.filename = results.n8n.filename;
      response.detailedInstructions = results.n8n.instructions;
      response.instructions = {
        step1: "Download the workflow JSON file",
        step2: "Open your n8n instance (or create free account at n8n.io)",
        step3: "Go to Workflows → Import from File",
        step4: "Select the downloaded JSON file",
        step5: "Review the workflow and update any credentials (API keys, etc.)",
        step6: "Activate the workflow and test it!",
      };
    } else if (platform === 'make' && results.make) {
      response.agentId = savedAgentIds[0];
      response.workflow = results.make.workflow;
      response.filename = results.make.filename;
      response.detailedInstructions = results.make.instructions;
      response.instructions = {
        step1: "Download the scenario JSON file",
        step2: "Log in to Make.com (or create free account)",
        step3: "Go to Scenarios → Create a new scenario",
        step4: "Click the three dots menu → Import Blueprint",
        step5: "Upload the downloaded JSON file",
        step6: "Configure connections and test your scenario!",
      };
    } else if (platform === 'both') {
      response.agentIds = savedAgentIds;
      response.workflows = {
        n8n: results.n8n ? {
          workflow: results.n8n.workflow,
          filename: results.n8n.filename,
          detailedInstructions: results.n8n.instructions,
          instructions: {
            step1: "Download the n8n workflow JSON file",
            step2: "Open your n8n instance (or create free account at n8n.io)",
            step3: "Go to Workflows → Import from File",
            step4: "Select the downloaded JSON file",
            step5: "Review and update credentials",
            step6: "Activate and test!",
          },
        } : null,
        make: results.make ? {
          workflow: results.make.workflow,
          filename: results.make.filename,
          detailedInstructions: results.make.instructions,
          instructions: {
            step1: "Download the Make.com scenario JSON file",
            step2: "Log in to Make.com (or create free account)",
            step3: "Go to Scenarios → Create new → Import Blueprint",
            step4: "Upload the downloaded JSON file",
            step5: "Configure connections",
            step6: "Test your scenario!",
          },
        } : null,
      };
    }

    return new Response(
      JSON.stringify(response),
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
