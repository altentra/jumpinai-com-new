import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudioFormData {
  currentRole: string;
  industry: string;
  experienceLevel: string;
  aiKnowledge: string;
  goals: string;
  challenges: string;
  timeCommitment: string;
  budget: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY not configured');
    }

    // CRITICAL FIX: Frontend sends { formData: {...} }, so we need to destructure
    const { formData }: { formData: StudioFormData } = await req.json();
    console.log('Starting streaming generation for:', { formData });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        
        // Helper to safely send SSE event
        const sendEvent = (step: number, type: string, data: any) => {
          if (isClosed) {
            console.log(`Skipping event (stream closed): step ${step}, type ${type}`);
            return false;
          }
          try {
            const message = `data: ${JSON.stringify({ step, type, data })}\n\n`;
            controller.enqueue(encoder.encode(message));
            console.log(`✓ Sent event: step ${step}, type ${type}`);
            return true;
          } catch (error) {
            console.error('Error sending event:', error);
            // Don't mark as closed - this might be a temporary issue
            return false;
          }
        };

        try {
          // Step 1: Generate JUST the name (quick, 3-5 seconds)
          console.log('Step 1: Generating jump name...');
          const namingResponse = await callXAI(XAI_API_KEY, 1, formData, '');
          console.log('Naming response:', namingResponse);
          sendEvent(1, 'naming', namingResponse);
          
          // Step 2: Generate Overview & Plan
          console.log('Step 2: Generating overview...');
          const overviewResponse = await callXAI(XAI_API_KEY, 2, formData, '');
          console.log('Overview response:', overviewResponse);
          sendEvent(2, 'overview', overviewResponse);
          
          const overviewContent = typeof overviewResponse === 'string' 
            ? overviewResponse 
            : JSON.stringify(overviewResponse);

          // Remaining steps (3 and 4 only - naming and overview already done)
          const remainingSteps = [
            { step: 3, type: 'comprehensive', name: 'Comprehensive Plan' },
            { step: 4, type: 'tool_prompts', name: 'Tools & Prompts' }
          ];

          for (const { step, type, name } of remainingSteps) {
            try {
              console.log(`Step ${step}: Generating ${name}...`);
              const response = await callXAI(XAI_API_KEY, step, formData, overviewContent);
              console.log(`Step ${step} response:`, response);
              
              // Try to send the event
              const sent = sendEvent(step, type, response);
              if (!sent) {
                console.error(`Failed to send step ${step}, attempting to continue...`);
                // Wait a bit and try to continue anyway
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (stepError) {
              console.error(`Error in step ${step}:`, stepError);
              // Try to send error event, then continue
              sendEvent(step, 'error', { message: `Step ${step} failed: ${stepError.message}` });
            }
          }

          // Send completion event
          if (!isClosed) {
            console.log('Sending completion event...');
            sendEvent(9, 'complete', { message: 'Generation complete' });
          }

        } catch (error) {
          console.error('Generation error:', error);
          if (!isClosed) {
            sendEvent(-1, 'error', { message: error.message });
          }
        } finally {
          // Always close the stream at the end
          if (!isClosed) {
            try {
              controller.close();
              isClosed = true;
            } catch (e) {
              console.error('Error closing stream:', e);
            }
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function callXAI(
  apiKey: string,
  step: number,
  context: StudioFormData,
  overviewContent: string
): Promise<any> {
  const { systemPrompt, userPrompt, expectedTokens } = getStepPrompts(step, context, overviewContent);
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: expectedTokens,
        stream: false, // Ensure non-streaming for simpler response handling
      }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`xAI API error (step ${step}):`, response.status, errorText);
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in API response');
  }

  // Clean and parse JSON more aggressively
  content = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^[^{[]*/, '') // Remove any text before first { or [
    .replace(/[^}\]]*$/, '') // Remove any text after last } or ]
    .trim();
  
  try {
    const parsed = JSON.parse(content);
    console.log(`Step ${step} parsed successfully:`, JSON.stringify(parsed).substring(0, 200));
    return parsed;
  } catch (parseError) {
    console.error(`JSON parse error for step ${step}:`, parseError);
    console.log('Failed content preview:', content.substring(0, 500));
    
    // Try to extract JSON object from text
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        console.log(`Step ${step} extracted and parsed successfully`);
        return extracted;
      } catch (e) {
        console.error('Extraction also failed:', e);
      }
    }
    
    return validateStepResponse(content, step, content);
  }
}

function getStepPrompts(step: number, context: StudioFormData, overviewContent: string) {
  // Build context from user input - NO hardcoded role
  const baseContext = `
What they're working toward: ${context.goals || 'Not specified'}
What's keeping them from getting there: ${context.challenges || 'Not specified'}
Industry: ${context.industry || 'Not specified'}
AI Experience: ${context.aiKnowledge || 'Not specified'}
Urgency: ${context.timeCommitment || 'Not specified'}
Budget: ${context.budget || 'Not specified'}
  `.trim();

  switch (step) {
    case 1:
      // STEP 1: Quick name generation
      return {
        systemPrompt: `You are a creative naming expert. First ANALYZE what the person is trying to achieve to understand their situation, then create an inspiring journey name.`,
        userPrompt: `Read what this person is trying to achieve and understand their situation:

${baseContext}

Steps:
1. Analyze their goals to understand their current role/situation
2. Identify what transformation they're seeking
3. Create an inspiring 3-5 word name that captures their journey

Return ONLY valid JSON:
{
  "jumpName": "3-5 word name reflecting THEIR specific transformation"
}`,
        expectedTokens: 500
      };
    
    case 2:
      // STEP 2: Strategic Overview - HIGH QUALITY, WELL-FORMATTED
      return {
        systemPrompt: `You are a senior strategy consultant. Provide clear, actionable insights with excellent structure and formatting. Use markdown formatting for emphasis and clarity. Be professional yet concise.`,
        userPrompt: `Analyze this transformation journey comprehensively:

${baseContext}

FORMATTING REQUIREMENTS:
- Use **bold** for key terms, numbers, and metrics
- Use bullet points for lists
- Use clear section headers
- Keep paragraphs 2-4 sentences max
- Make it scannable and easy to read

Return ONLY valid JSON:
{
  "executiveSummary": "Write 3-4 well-structured paragraphs. Para 1: Current situation and transformation goal. Para 2: Core challenges. Para 3: Strategic approach. Para 4: Expected outcomes with timeline: ${context.timeCommitment} and budget: ${context.budget}. Use markdown for emphasis.",
  
  "situationAnalysis": {
    "currentState": "3-4 sentences analyzing their current position, what's driving change, and key constraints. Use **bold** for critical points.",
    "challenges": [
      "Challenge 1: Clear description with impact (1-2 sentences)",
      "Challenge 2: Clear description with impact (1-2 sentences)",
      "Challenge 3: Clear description with impact (1-2 sentences)",
      "Challenge 4: Additional challenge if relevant (1-2 sentences)"
    ],
    "opportunities": [
      "Opportunity 1: What they can leverage and why (1-2 sentences)",
      "Opportunity 2: Key advantage with context (1-2 sentences)",
      "Opportunity 3: Strategic opportunity (1-2 sentences)",
      "Opportunity 4: Additional opportunity if relevant (1-2 sentences)"
    ]
  },
  
  "strategicVision": "3-4 paragraphs painting a clear picture of success. Include specific outcomes, lifestyle changes, measurable impact, and transformation milestones. Use **bold** for key achievements and metrics. DO NOT include word counts.",
  
  "roadmap": {
    "phase1": {
      "name": "Clear name for foundation phase",
      "timeline": "Specific timeline (e.g., 'Weeks 1-4')",
      "milestones": [
        "**Milestone 1**: Clear, measurable achievement",
        "**Milestone 2**: Clear, measurable achievement",
        "**Milestone 3**: Clear, measurable achievement"
      ]
    },
    "phase2": {
      "name": "Clear name for growth phase",
      "timeline": "Specific timeline",
      "milestones": [
        "**Milestone 1**: Clear, measurable achievement",
        "**Milestone 2**: Clear, measurable achievement",
        "**Milestone 3**: Clear, measurable achievement"
      ]
    },
    "phase3": {
      "name": "Clear name for mastery phase",
      "timeline": "Specific timeline",
      "milestones": [
        "**Milestone 1**: Major achievement with metric",
        "**Milestone 2**: Major achievement with metric",
        "**Milestone 3**: Final success proof"
      ]
    }
  },
  
  "keyObjectives": [
    "**Objective 1**: Primary goal with clear outcome and timeline",
    "**Objective 2**: Second key objective with specifics",
    "**Objective 3**: Third strategic objective",
    "**Objective 4**: Fourth important goal"
  ],
  
  "successMetrics": [
    "**KPI 1**: Specific metric with target (e.g., '**Generate $5K/month** by month 3')",
    "**KPI 2**: Another measurable goal with timeline",
    "**KPI 3**: Third quantifiable metric with clear benchmark",
    "**KPI 4**: Fourth success indicator with measurement method"
  ],
  
  "riskAssessment": {
    "risks": [
      "**Risk 1**: Description with potential impact",
      "**Risk 2**: Description with potential impact",
      "**Risk 3**: Description with potential impact"
    ],
    "mitigations": [
      "**Mitigation 1**: Strategy to address risk 1 with action steps",
      "**Mitigation 2**: Strategy to address risk 2 with action steps",
      "**Mitigation 3**: Strategy to address risk 3 with action steps"
    ]
  }
}

Focus on clarity, professional formatting, and actionable content.`,
        expectedTokens: 8000
      };

    case 3:
      // STEP 3: Action Plan - WORLD-CLASS DETAILED EXECUTION ROADMAP
      return {
        systemPrompt: `You are a world-class execution strategist and AI transformation advisor specializing in strategic adaptation to the era of AI. You create exceptionally detailed, actionable implementation plans that demonstrate exactly HOW artificial intelligence accelerates achievement and enables superior outcomes. Your expertise combines strategic thinking, tactical precision, and visionary guidance. Use **bold** markdown strategically to highlight critical information, especially AI-powered capabilities and competitive advantages.`,
        userPrompt: `Create a comprehensive, world-class strategic action plan for AI-powered transformation:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL REQUIREMENTS - STRATEGIC AI ADAPTATION FOCUS:
1. **PRIMARY FOCUS**: Demonstrate exactly HOW AI tools and capabilities enable them to achieve their goals FASTER, BETTER, and MORE EFFICIENTLY than traditional methods
2. Every key action MUST explicitly show the AI-powered advantage - what becomes possible with AI that wasn't before, or what becomes 10x faster/better
3. Emphasize STRATEGIC ADAPTATION: This is not just about achieving goals, but about adapting to the era of AI and leveraging it for competitive advantage
4. Use **bold** markdown for ALL AI capabilities, tools, efficiency gains, time savings, quality improvements, and competitive advantages
5. Include realistic timelines showing AI-accelerated speed vs traditional approaches where relevant
6. Make every action measurable with clear AI-powered outcomes (e.g., "Generate in 2 hours what traditionally took 2 weeks")
7. Show tactical precision: specific AI tools, specific prompts approaches, specific efficiency multipliers
8. Demonstrate visionary thinking: how AI creates new possibilities and strategic positioning
9. Address their challenges specifically with AI-powered solutions
10. **IMPORTANT**: Include tool references in key_actions - reference "Tool #1-3" for Phase 1 actions, "Tool #4-6" for Phase 2 actions, and "Tool #7-9" for Phase 3 actions where relevant. These will link to the AI tool+prompt combos generated later.

Return ONLY valid JSON in this EXACT structure:
{
  "phases": [
    {
      "phase_number": 1,
      "title": "Foundation Phase: [Compelling title that captures the phase essence]",
      "description": "Comprehensive 3-4 sentence overview explaining: what will be achieved, why this is the crucial first step, key deliverables, and expected transformation outcomes. Use **bold** for all key deliverables and metrics.",
      "duration": "**Weeks 1-4** (10-15 hours/week)",
      "objectives": [
        "**Master [specific skill]** through hands-on practice with [specific tools/methods]",
        "**Build [specific deliverable]** that demonstrates [measurable outcome]",
        "**Establish [specific system/process]** for [clear purpose with metric]",
        "**Achieve [quantifiable milestone]** by completing [specific actions]",
        "**Develop [capability]** to [specific outcome with measurement]"
      ],
      "key_actions": [
        {
          "action": "**Set up AI-powered transformation workspace** with cutting-edge tools and systems",
          "description": "Install and configure essential AI platforms: **ChatGPT Plus**, **Claude Pro**, and **Gemini Advanced** for reasoning and content generation. Create organized digital workspace with AI-enhanced project management (**Notion AI**) for tracking and documentation. Establish **30-minute daily AI practice routine** that builds exponential capabilities. Set up AI-powered analytics to track efficiency gains and progress. **AI ADVANTAGE**: Complete setup that traditionally took 2-3 days of research and configuration now done in 3-4 hours with AI guidance. → Use **Tool #1** for optimized setup guidance.",
          "priority": "High",
          "effort_level": "2-3 hours (vs 2-3 days traditional)",
          "dependencies": [],
          "tool_references": [1]
        },
        {
          "action": "**Master AI literacy through accelerated learning** with AI-powered education",
          "description": "Complete **AI fundamentals training** leveraging AI tutors for personalized learning paths. Use **AI-powered practice exercises** that adapt to your skill level and provide instant feedback. Build personal **AI capability portfolio** with 10+ real outputs demonstrating mastery. Document proven prompt patterns and AI workflows. **AI ADVANTAGE**: Achieve in 5-6 focused hours what traditionally required 40+ hours of trial-and-error learning. AI tutors provide personalized feedback 24/7, eliminating learning delays. → Use **Tool #2** for accelerated skill acquisition.",
          "priority": "High",
          "effort_level": "5-6 hours (10x faster than traditional 50+ hours)",
          "dependencies": ["Set up AI-powered transformation workspace"],
          "tool_references": [2]
        },
        {
          "action": "**Create breakthrough first project** leveraging AI for professional-quality output",
          "description": "Design and execute **portfolio-worthy deliverable** using AI tools to achieve professional results immediately. Use AI for research (minutes vs hours), content creation (instant iterations vs days of drafts), design (professional quality without design skills), and quality assurance (AI-powered editing and refinement). Document the **efficiency multiplier** achieved. **AI ADVANTAGE**: Produce in 8-10 hours what would traditionally require 40-60 hours and multiple specialist skills. Quality matches or exceeds traditional expert output. → Use **Tool #3** for project execution excellence.",
          "priority": "High",
          "effort_level": "8-10 hours (produces 40-60 hours of traditional work)",
          "dependencies": ["Master AI literacy through accelerated learning"],
          "tool_references": [3]
        },
        {
          "action": "**Build AI-powered daily practice system** for continuous compound growth",
          "description": "Establish **30-minute daily AI capability building** with AI-generated personalized exercises. Use AI to analyze your progress and suggest optimal focus areas. Build library of **30+ battle-tested prompts** for your specific use cases. Leverage AI communities enhanced with AI-powered search and synthesis. **AI ADVANTAGE**: AI personalizes your learning path and accelerates skill building 5x through targeted practice vs generic training.",
          "priority": "Medium",
          "effort_level": "3-4 hours/week (with 5x effectiveness multiplier)",
          "dependencies": []
        },
        {
          "action": "**Generate initial opportunities** using AI-powered market research and positioning",
          "description": "Use AI to identify and analyze **5-10 high-potential opportunities** in hours vs weeks of manual research. Generate **compelling portfolio materials** with AI assistance for professional presentation. Create **personalized outreach messages** at scale using AI while maintaining authenticity. Leverage AI for competitive analysis and positioning strategy. **AI ADVANTAGE**: Complete market research and positioning in 4-5 hours that traditionally took 2-3 weeks.",
          "priority": "Medium",
          "effort_level": "4-5 hours (replaces 2-3 weeks traditional research)",
          "dependencies": ["Create breakthrough first project"]
        }
      ],
      "milestones": [
        {
          "milestone": "**AI Workspace Operational** - All essential tools configured and actively used",
          "target_date": "End of Week 1",
          "success_criteria": [
            "**3+ AI tools** installed and configured with premium accounts",
            "Organized workspace created with **project folders and tracking system**",
            "**Daily practice routine** established with first 5 sessions completed",
            "Personal **AI playbook started** with initial 10 proven prompts documented"
          ]
        },
        {
          "milestone": "**Core AI Competency Achieved** - Demonstrated ability to create quality outputs",
          "target_date": "End of Week 2",
          "success_criteria": [
            "Foundational training completed with **90%+ comprehension**",
            "**5 hands-on exercises** completed successfully",
            "**15+ proven prompts** documented in personal playbook",
            "Able to independently create **professional-quality AI outputs**"
          ]
        },
        {
          "milestone": "**First AI Project Delivered** - Tangible proof of new capabilities",
          "target_date": "End of Week 4",
          "success_criteria": [
            "Complete **portfolio-quality project** finished and documented",
            "**Positive feedback** received from 3+ reviewers",
            "**Full process documentation** created including prompts and learnings",
            "**3-5 project opportunities** identified for immediate application"
          ]
        }
      ]
    },
    {
      "phase_number": 2,
      "title": "Growth Phase: [Dynamic title showing advancement]",
      "description": "Powerful 3-4 sentence description building on Phase 1 success. Explain how this phase scales capabilities, introduces advanced techniques, generates tangible results, and positions for mastery. Use **bold** for all achievements and metrics.",
      "duration": "**Weeks 5-8** (12-18 hours/week)",
      "objectives": [
        "**Scale [capability from Phase 1]** to handle [more complex scenarios]",
        "**Generate [specific revenue/results]** through [concrete method]",
        "**Master [advanced technique]** enabling [new possibilities]",
        "**Build [sophisticated system]** that [delivers measurable value]",
        "**Establish [reputation/presence]** as [credible expert] in [specific area]"
      ],
      "key_actions": [
        {
          "action": "**Launch AI-powered service offering** generating immediate revenue",
          "description": "Package **3 AI-enhanced service offerings** with clear deliverables and premium pricing (**$500-2000 per project**). Use AI to create **professional service materials** (landing page, proposals, case studies) in hours vs weeks. Deploy AI-powered outreach to **20 qualified prospects** with personalized messaging at scale. Deliver first **3 projects** with AI acceleration showing 3-5x faster delivery than competitors. **AI ADVANTAGE**: Launch complete service business in 15-20 hours vs traditional 6-8 weeks. AI handles marketing materials, client research, and execution support. → Use **Tool #4** for rapid service design and launch.",
          "priority": "High",
          "effort_level": "15-20 hours (replaces 6-8 weeks traditional setup)",
          "dependencies": ["First AI Project Delivered"],
          "tool_references": [4]
        },
        {
          "action": "**Master advanced AI capabilities** for competitive dominance",
          "description": "Deep-dive into **cutting-edge AI techniques**: multi-agent workflows, AI automation chains, advanced prompt engineering, and AI tool integration. Build **10 sophisticated AI workflow systems** automating complex processes. Create **AI automation stack** saving **10-15 hours weekly** on routine tasks. Develop proprietary AI methodologies competitors can't match. **AI ADVANTAGE**: Achieve in 12-15 hours what traditionally required months of technical learning. AI-powered learning accelerators provide instant practice environments and feedback. → Use **Tool #5** for advanced capability mastery.",
          "priority": "High",
          "effort_level": "12-15 hours (traditional: 3-6 months of experimentation)",
          "dependencies": ["Core AI Competency Achieved"],
          "tool_references": [5]
        },
        {
          "action": "**Build AI-accelerated thought leadership** establishing market authority",
          "description": "Use AI to research trending topics and generate **2 high-impact articles** weekly on **LinkedIn** and **Medium**. Deploy AI for content ideation, drafting, editing, and optimization. Create **daily micro-content** (tips, insights, examples) using AI assistance. Engage strategically in **3 AI communities** with AI-enhanced responses providing exceptional value. Leverage AI to prepare and deliver **compelling presentations** or workshops. **AI ADVANTAGE**: Produce professional thought leadership content in 6-8 hours weekly that traditionally required 20-30 hours plus creative expertise. → Use **Tool #6** for content excellence.",
          "priority": "Medium",
          "effort_level": "6-8 hours/week (vs 20-30 traditional hours)",
          "dependencies": ["First AI Project Delivered"],
          "tool_references": [6]
        },
        {
          "action": "**Create proprietary AI-powered methodology** as unfair advantage",
          "description": "Document your unique **AI-enhanced workflow system** combining best practices from all projects. Use AI to analyze patterns and optimize processes. Build **comprehensive template library** and **quality frameworks** powered by AI validation. Package methodology into **sellable intellectual property** (course, certification, licensing). **AI ADVANTAGE**: AI helps codify and systematize knowledge in 10-12 hours vs months of manual documentation. Creates defensible competitive moat.",
          "priority": "High",
          "effort_level": "10-12 hours (with AI vs 2-3 months manual)",
          "dependencies": ["Master advanced AI capabilities"]
        },
        {
          "action": "**Deploy intelligent automation systems** for exponential scaling",
          "description": "Implement **AI-powered project management** with smart workflows and predictive analytics. Build **automation chains** using AI tools + **Zapier/Make** handling 60-70% of routine work. Create **AI-enhanced template library** with **50+ production-ready assets**. Establish **AI-assisted quality assurance** ensuring consistent excellence. **AI ADVANTAGE**: Automate in 8-10 hours what traditionally required months of systems building and significant technical expertise.",
          "priority": "Medium",
          "effort_level": "8-10 hours (vs months of technical setup)",
          "dependencies": ["Launch AI-powered service offering"]
        }
      ],
      "milestones": [
        {
          "milestone": "**First Revenue Generated** - Validated business model with paying clients",
          "target_date": "End of Week 6",
          "success_criteria": [
            "**$1,500-3,000** in revenue generated from initial projects",
            "**3+ satisfied clients** with documented testimonials",
            "**Proven service delivery system** established and documented",
            "**Active pipeline** of 5+ qualified opportunities"
          ]
        },
        {
          "milestone": "**Advanced Skills Mastered** - Competitive differentiation achieved",
          "target_date": "End of Week 7",
          "success_criteria": [
            "**10+ advanced techniques** mastered and applied in projects",
            "**Automation workflows** saving 5+ hours weekly",
            "**Proprietary methodology** documented and tested",
            "Demonstrable **speed and quality improvements** over Phase 1"
          ]
        },
        {
          "milestone": "**Market Presence Established** - Recognized as credible AI expert",
          "target_date": "End of Week 8",
          "success_criteria": [
            "**2+ published articles** with 500+ combined views",
            "**Growing social media presence** with engaged followers",
            "**Speaking engagement** completed with positive feedback",
            "**Inbound inquiries** from content marketing efforts"
          ]
        }
      ]
    },
    {
      "phase_number": 3,
      "title": "Mastery Phase: [Aspirational title reflecting ultimate achievement]",
      "description": "Inspiring 3-4 sentence vision of ultimate achievement. Describe how this phase achieves the original transformation goal, establishes sustainable success, creates lasting impact, and positions for continued growth. Use **bold** for all final outcomes and long-term metrics.",
      "duration": "**Weeks 9-12+** (15-20 hours/week, then sustainable ongoing)",
      "objectives": [
        "**Achieve [original transformation goal]** with [measurable validation]",
        "**Generate [target income/impact level]** consistently and sustainably",
        "**Establish [market position/brand]** as recognized [authority/leader]",
        "**Build [sustainable system]** requiring [reduced time] while delivering [maintained/increased results]",
        "**Create [legacy/impact]** through [specific contribution] benefiting [target audience]"
      ],
      "key_actions": [
        {
          "action": "**Scale to consistent revenue target** with predictable client pipeline",
          "description": "Achieve **$5,000-10,000 monthly revenue** from AI services. Establish **systematic marketing** generating **10+ qualified leads monthly**. Build **subscription or retainer model** for **3-5 ongoing clients**. Create **referral system** generating **30% of new business**. Document all systems for consistency and scalability. → Use **Tool #7** for scaling strategy.",
          "priority": "High",
          "effort_level": "20-25 hours",
          "dependencies": ["First Revenue Generated", "Market Presence Established"],
          "tool_references": [7]
        },
        {
          "action": "**Launch signature program or product** leveraging unique expertise",
          "description": "Package methodology into **online course**, **coaching program**, or **SaaS tool**. Create compelling **marketing assets** including **sales page**, **demo videos**, and **case studies**. Execute **strategic launch** to **audience of 500+**. Generate **$3,000-5,000** from initial launch with **recurring revenue potential**. → Use **Tool #8** for product development.",
          "priority": "High",
          "effort_level": "25-30 hours",
          "dependencies": ["Develop proprietary AI methodology", "Advanced Skills Mastered"],
          "tool_references": [8]
        },</invoke>
<invoke name="lov-line-replace">
<parameter name="replace">        {
          "action": "**Build team or automation** for leverage and scaling",
          "description": "Hire **1-2 contractors** or **virtual assistants** for task delegation. Implement **advanced automation** handling **60%+ of routine work**. Create **comprehensive SOPs** for all key processes. Establish **quality control system** maintaining excellence at scale. Reduce personal time to **10-12 hours weekly** while maintaining or growing revenue. → Use **Tool #9** for automation setup.",
          "priority": "High",
          "effort_level": "15-20 hours initial setup",
          "dependencies": ["Scale to consistent revenue target"],
          "tool_references": [9]
        },
        {
          "action": "**Establish industry authority** through strategic visibility",
          "description": "Publish **comprehensive guide or mini-book** on AI transformation. Secure **podcast interviews** on **5+ relevant shows**. Present at **2+ industry conferences** or major virtual events. Build **email list of 1,000+ subscribers**. Create **weekly newsletter** with **40%+ open rates**.",
          "priority": "Medium",
          "effort_level": "12-15 hours",
          "dependencies": ["Market Presence Established"]
        },
        {
          "action": "**Create sustainable long-term system** for continued success",
          "description": "Develop **5-year vision** with **quarterly milestones**. Implement **continuous learning routine** staying ahead of AI trends. Build **strategic partnerships** with **complementary service providers**. Establish **financial systems** for **business health tracking**. Create **succession or scaling plan** for future growth options.",
          "priority": "Medium",
          "effort_level": "10-12 hours",
          "dependencies": ["Build team or automation"]
        }
      ],
      "milestones": [
        {
          "milestone": "**Revenue Target Achieved** - Sustainable income from AI transformation",
          "target_date": "End of Week 12",
          "success_criteria": [
            "**$5,000-10,000 monthly recurring revenue** established",
            "**10+ active clients** or **3-5 retainer relationships**",
            "**Consistent 10+ lead flow** from marketing systems",
            "**80%+ client satisfaction** with strong retention and referrals"
          ]
        },
        {
          "milestone": "**Signature Offering Launched** - Scalable product beyond services",
          "target_date": "End of Month 4",
          "success_criteria": [
            "**Program/product launched** with complete marketing funnel",
            "**$3,000-5,000** generated from initial launch",
            "**20+ customers/students** enrolled with positive feedback",
            "**Recurring revenue model** established for long-term growth"
          ]
        },
        {
          "milestone": "**Transformation Complete** - Original goal achieved and sustainable",
          "target_date": "End of Month 6",
          "success_criteria": [
            "**Original transformation goal** achieved with measurable validation",
            "**Sustainable systems** operating with **reduced time commitment**",
            "**Recognized authority** with growing influence and opportunities",
            "**Clear path forward** with **documented playbook** for continued success",
            "**Meaningful impact** created for clients/community with testimonials and case studies"
          ]
        }
      ]
    }
  ]
}

Create world-class, executive-level content that inspires action and provides crystal-clear guidance. Every element must be specific, measurable, and actionable.`,
        expectedTokens: 21000
      };

    case 4:
      // STEP 4: Tools & Prompts
      return {
        systemPrompt: `You are an AI tool recommendation and prompt engineering expert with real-time knowledge of the latest AI tools and technologies as of October 24, 2025.

CRITICAL: TOOL SELECTION & DIVERSITY REQUIREMENTS:
1. Generate exactly 9 tool + prompt combinations (increased from 6)
2. MUST use at least 6 DIFFERENT tools across the 9 combos
3. Only repeat a tool if it's genuinely optimal for distinct use cases
4. Strategic mix required:
   - 2-3 AI writing/reasoning tools (ChatGPT, Claude, Gemini, etc.)
   - 3-4 specialized tools (video: Veo3/InVideo, image: Midjourney/DALL-E, code: Cursor/Replit, etc.)
   - 2-3 productivity/workflow tools (Notion, Make.com, Zapier, etc.)
5. PRIORITIZE latest and greatest tools as of October 2025
6. Consider cutting-edge releases and trending tools in the market RIGHT NOW

CRITICAL: TOOL-SPECIFIC PROMPT FORMATS:
- Add "prompt_format" field: "json" | "detailed_descriptive" | "structured_requirements" | "conversational"
- Video tools (Veo3, InVideo, Runway): Use JSON format with structured parameters
- Image tools (Midjourney, DALL-E, Stable Diffusion): Use detailed descriptive format
- Code tools (Cursor, Replit, GitHub Copilot): Use structured requirements format
- General AI (ChatGPT, Claude, Gemini): Use conversational but detailed format

CRITICAL: PHASE ALIGNMENT:
- Add "phase" field: 1, 2, or 3
- Phase 1 (Combos 1-3): Foundation tools - research, planning, initial setup
- Phase 2 (Combos 4-6): Growth tools - content creation, automation, scaling
- Phase 3 (Combos 7-9): Mastery tools - optimization, analytics, advanced features

Analyze what the person is trying to achieve to understand their situation, then create tailored tool+prompt combos.`,
        userPrompt: `Create 9 tool+prompt combinations with diversity and phase alignment:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL INSTRUCTIONS:
1. Understand their situation from what they're trying to achieve
2. Each combo must solve what's preventing them
3. Fit their budget: ${context.budget}
4. Match AI experience: ${context.aiKnowledge}
5. Work with urgency: ${context.timeCommitment}
6. MUST use at least 6 DIFFERENT tools across the 9 combos
7. Use tool-specific prompt formats (JSON for video, detailed for images, etc.)
8. Align 3 combos per phase (foundation/growth/mastery)
9. Recommend latest October 2025 tools when appropriate

DO NOT use generic roles. Tailor to THEIR specific situation.

EXAMPLE of proper format-specific prompts:
- JSON (for video tools): {"scene": "sunset over mountains", "duration": 5, "style": "cinematic", "mood": "peaceful"}
- Detailed descriptive (for image): "A photorealistic sunset over mountains, golden hour lighting, 8K resolution, cinematic composition"
- Structured requirements (for code): "Requirements: 1) Create React component 2) Use TypeScript 3) Include error handling"
- Conversational detailed (for general AI): "I need help creating a comprehensive strategy. Please analyze my situation and provide..."

Return ONLY valid JSON:
{
  "tool_prompts": [
    {
      "title": "Use case for their situation",
      "description": "How this helps them achieve their goals and overcome obstacles",
      "category": "Relevant category",
      "tool_name": "Specific tool",
      "tool_url": "https://url.com",
      "tool_type": "Tool type",
      "prompt_text": "200-300 word ready-to-copy prompt in the appropriate format for this tool. Tailored to what they're trying to achieve. Reference what's preventing them. Include industry: ${context.industry}.",
      "prompt_format": "json|detailed_descriptive|structured_requirements|conversational",
      "prompt_instructions": "Steps for THEIR use case, including format-specific guidance",
      "when_to_use": "When in their journey",
      "why_this_combo": "Why perfect for their situation",
      "alternatives": [
        {"tool": "Alt", "url": "url", "note": "Why for them"},
        {"tool": "Alt", "url": "url", "note": "Why for them"}
      ],
      "use_cases": ["For their situation", "For their goal", "For their challenge"],
      "tags": ["relevant-tags"],
      "difficulty_level": "${context.aiKnowledge}",
      "setup_time": "Fits ${context.timeCommitment}",
      "cost_estimate": "Within ${context.budget}",
      "phase": 1|2|3
    }
  ]
}

Generate EXACTLY 9 combos tailored to THEIR input with diversity and phase alignment.`,
        expectedTokens: 50000
      };

    default:
      throw new Error(`Invalid step: ${step}`);
  }
}

function validateStepResponse(content: any, step: number, rawContent: string): any {
  // If content is already an object, return it
  if (typeof content === 'object' && content !== null) {
    return content;
  }

  // Fallback responses
  const fallbacks: Record<number, any> = {
    1: { jumpName: "AI Transformation Journey" },
    2: {
      executiveSummary: rawContent.slice(0, 500),
      situationAnalysis: { currentState: "Starting AI journey", challenges: [], opportunities: [] },
      strategicVision: "Success through AI",
      roadmap: {},
      successFactors: [],
      riskMitigation: []
    },
    3: { structuredPlan: {} },
    4: { tools: [] }
  };

  return fallbacks[step] || {};
}
