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
        systemPrompt: `You are a world-class execution strategist and business advisor. Create exceptionally detailed, actionable implementation plans with professional formatting. Use **bold** markdown strategically to highlight critical information. Your plans should inspire confidence and provide crystal-clear guidance.`,
        userPrompt: `Create a comprehensive, world-class action plan for transformation:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL REQUIREMENTS:
1. Use **bold** markdown for ALL key terms, actions, deliverables, and metrics
2. Provide specific, actionable steps with clear outcomes
3. Include realistic timelines and effort estimates
4. Make every action measurable and verifiable
5. Ensure professional, executive-level quality throughout

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
          "action": "**Set up professional AI workspace** with essential tools and systems",
          "description": "Install and configure **ChatGPT Plus**, **Claude Pro**, and **Notion AI**. Create organized workspace with folders for projects, prompts, and learning resources. Establish daily practice routine of **30 minutes** for skill building. Set up tracking system for progress and insights.",
          "priority": "High",
          "effort_level": "2-3 hours",
          "dependencies": []
        },
        {
          "action": "**Complete foundational AI literacy training** through structured learning",
          "description": "Enroll in **AI fundamentals course** covering prompt engineering, tool selection, and best practices. Complete **5 hands-on exercises** building real-world outputs. Document learnings and create personal **AI playbook** with proven prompts and techniques.",
          "priority": "High",
          "effort_level": "5-6 hours",
          "dependencies": ["Set up professional AI workspace"]
        },
        {
          "action": "**Create first AI-powered project** demonstrating core capabilities",
          "description": "Design and build **[specific deliverable]** using AI tools learned so far. Focus on **quality over speed**, iterating prompts for optimal results. Document entire process including prompts used, tools selected, and results achieved. Present finished project to **3 peers or mentors** for feedback.",
          "priority": "High",
          "effort_level": "8-10 hours",
          "dependencies": ["Complete foundational AI literacy training"]
        },
        {
          "action": "**Establish daily AI practice routine** for consistent skill development",
          "description": "Create **30-minute daily practice schedule** focused on one AI skill per week. Build library of **20+ proven prompts** for common tasks. Join **2 AI communities** for support and learning. Track progress with **weekly reflection log** documenting wins and challenges.",
          "priority": "Medium",
          "effort_level": "3-4 hours/week",
          "dependencies": []
        },
        {
          "action": "**Build initial client/project pipeline** to apply new skills",
          "description": "Identify **3-5 potential projects** where AI can add immediate value. Create **compelling portfolio piece** showcasing AI capabilities. Develop **pitch template** explaining AI benefits. Schedule **5 conversations** with potential clients or stakeholders to discuss opportunities.",
          "priority": "Medium",
          "effort_level": "4-5 hours",
          "dependencies": ["Create first AI-powered project"]
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
          "action": "**Launch revenue-generating AI service** with first paying clients",
          "description": "Package **3 core AI services** with clear deliverables and pricing (**$500-2000 per project**). Create **professional service page** with portfolio examples. Execute outreach campaign to **20 qualified prospects**. Deliver first **3 paid projects** with exceptional quality, gathering testimonials and case studies.",
          "priority": "High",
          "effort_level": "15-20 hours",
          "dependencies": ["First AI Project Delivered"]
        },
        {
          "action": "**Master advanced AI techniques** for competitive advantage",
          "description": "Deep-dive into **prompt chaining**, **multi-model workflows**, and **AI automation**. Complete **advanced training program** with hands-on projects. Build **10 sophisticated prompt sequences** for complex tasks. Create **automation workflows** saving **5+ hours per week**.",
          "priority": "High",
          "effort_level": "12-15 hours",
          "dependencies": ["Core AI Competency Achieved"]
        },
        {
          "action": "**Build thought leadership presence** in AI community",
          "description": "Publish **2 high-quality articles** sharing insights and case studies on **LinkedIn** and **Medium**. Create **weekly content** demonstrating expertise (**tips, examples, results**). Engage actively in **3 AI communities** providing valuable input. Speak at **1 virtual event** or host **workshop** for 20+ attendees.",
          "priority": "Medium",
          "effort_level": "6-8 hours",
          "dependencies": ["First AI Project Delivered"]
        },
        {
          "action": "**Develop proprietary AI methodology** as unique competitive advantage",
          "description": "Document proven **AI workflow system** combining best practices from all projects. Create **standardized templates** for common use cases. Build **quality checklist** ensuring consistent excellence. Package methodology into **sellable framework** or **training program**.",
          "priority": "High",
          "effort_level": "10-12 hours",
          "dependencies": ["Master advanced AI techniques"]
        },
        {
          "action": "**Scale operations with systems** for efficiency and growth",
          "description": "Implement **project management system** for client work. Create **automated workflows** for repetitive tasks using **Zapier/Make**. Build **template library** with **30+ proven assets**. Establish **quality assurance process** ensuring consistent output excellence.",
          "priority": "Medium",
          "effort_level": "8-10 hours",
          "dependencies": ["Launch revenue-generating AI service"]
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
          "description": "Achieve **$5,000-10,000 monthly revenue** from AI services. Establish **systematic marketing** generating **10+ qualified leads monthly**. Build **subscription or retainer model** for **3-5 ongoing clients**. Create **referral system** generating **30% of new business**. Document all systems for consistency and scalability.",
          "priority": "High",
          "effort_level": "20-25 hours",
          "dependencies": ["First Revenue Generated", "Market Presence Established"]
        },
        {
          "action": "**Launch signature program or product** leveraging unique expertise",
          "description": "Package methodology into **online course**, **coaching program**, or **SaaS tool**. Create compelling **marketing assets** including **sales page**, **demo videos**, and **case studies**. Execute **strategic launch** to **audience of 500+**. Generate **$3,000-5,000** from initial launch with **recurring revenue potential**.",
          "priority": "High",
          "effort_level": "25-30 hours",
          "dependencies": ["Develop proprietary AI methodology", "Advanced Skills Mastered"]
        },
        {
          "action": "**Build team or automation** for leverage and scaling",
          "description": "Hire **1-2 contractors** or **virtual assistants** for task delegation. Implement **advanced automation** handling **60%+ of routine work**. Create **comprehensive SOPs** for all key processes. Establish **quality control system** maintaining excellence at scale. Reduce personal time to **10-12 hours weekly** while maintaining or growing revenue.",
          "priority": "High",
          "effort_level": "15-20 hours initial setup",
          "dependencies": ["Scale to consistent revenue target"]
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
        expectedTokens: 16000
      };

    case 4:
      // STEP 4: Tools & Prompts
      return {
        systemPrompt: `You are an AI tools specialist. Analyze what the person is trying to achieve to understand their situation, then create tailored tool+prompt combos.`,
        userPrompt: `Create 6 tool+prompt combinations:

${baseContext}

Overview Context:
${overviewContent}

CRITICAL INSTRUCTIONS:
1. Understand their situation from what they're trying to achieve
2. Each combo must solve what's preventing them
3. Fit their budget: ${context.budget}
4. Match AI experience: ${context.aiKnowledge}
5. Work with urgency: ${context.timeCommitment}

DO NOT use generic roles. Tailor to THEIR specific situation.

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
      "prompt_text": "200-300 word ready-to-copy prompt tailored to what they're trying to achieve. Reference what's preventing them. Include industry: ${context.industry}.",
      "prompt_instructions": "Steps for THEIR use case",
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
      "cost_estimate": "Within ${context.budget}"
    }
  ]
}

Generate EXACTLY 6 combos tailored to THEIR input.`,
        expectedTokens: 25000
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
