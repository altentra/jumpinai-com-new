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
  user: {
    id: string;
    email: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nWebhook = Deno.env.get('N8N_BUILD_AGENT_WEBHOOK');

    if (!n8nWebhook) {
      throw new Error('N8N_BUILD_AGENT_WEBHOOK not configured');
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

    // Parse request body
    const { opportunity, jump } = await req.json() as AgentBuildRequest;

    console.log('Building agent for opportunity:', opportunity.title);
    console.log('Jump context:', jump.title);

    // Prepare comprehensive payload for n8n
    const n8nPayload = {
      // Opportunity details
      agentTitle: opportunity.title,
      agentDescription: opportunity.description,
      impact: opportunity.impact,
      complexity: opportunity.complexity,
      estimatedTimeSaved: opportunity.estimatedTimeSaved,
      requiredTools: opportunity.requiredTools,
      benefits: opportunity.benefits,
      
      // Jump context
      jumpId: jump.id,
      jumpTitle: jump.title,
      jumpSummary: jump.summary,
      jumpGoals: jump.goals,
      jumpChallenges: jump.challenges,
      
      // User context
      userId: user.id,
      userEmail: user.email,
      
      // Metadata
      timestamp: new Date().toISOString(),
      source: 'jumpinai-implementation',
      
      // Detailed agent building instructions
      buildInstructions: `
        Create an AI Agent with the following specifications:
        
        AGENT NAME: ${opportunity.title}
        
        PURPOSE: ${opportunity.description}
        
        CONTEXT FROM USER'S JUMP:
        - Project: ${jump.title}
        - Goals: ${jump.goals}
        - Challenges: ${jump.challenges}
        - Summary: ${jump.summary}
        
        REQUIRED CAPABILITIES:
        ${opportunity.requiredTools.map(tool => `- ${tool}`).join('\n')}
        
        EXPECTED BENEFITS:
        ${opportunity.benefits.map(benefit => `- ${benefit}`).join('\n')}
        
        COMPLEXITY LEVEL: ${opportunity.complexity}
        EXPECTED TIME SAVINGS: ${opportunity.estimatedTimeSaved}
        
        Please build this agent and provide a shareable link when complete.
      `.trim()
    };

    console.log('Sending payload to n8n webhook...');

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    console.log('n8n response status:', n8nResponse.status);

    // Try to get response from n8n
    let responseData;
    const responseText = await n8nResponse.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // n8n might return non-JSON, which is fine for webhooks
      responseData = { 
        status: 'submitted',
        message: 'Agent build request submitted to n8n',
        rawResponse: responseText 
      };
    }

    // Log the build request
    await supabase.from('api_usage_logs').insert({
      user_id: user.id,
      endpoint: 'build-agent',
      status_code: n8nResponse.status,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Agent build request submitted successfully',
        data: responseData,
        opportunity: opportunity.title,
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
        error: 'Failed to submit agent build request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
