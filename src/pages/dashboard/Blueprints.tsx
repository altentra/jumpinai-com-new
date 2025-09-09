import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import BlueprintDetailModal from "@/components/BlueprintDetailModal";

// Define Blueprint type compatible with existing UI
type Blueprint = {
  name: string;
  description: string;
  category: string;
  objective: string;
  overview: string;
  phases: Array<{
    title: string;
    description: string;
    steps: string[];
    timeline: string;
    deliverables: string[];
  }>;
  keyMetrics: string[];
  resources: string[];
  commonChallenges: string[];
  successTips: string[];
};

// Free blueprints with comprehensive strategic guidance
const freeBlueprints: Blueprint[] = [
  {
    name: "Product Launch Strategy",
    description: "Complete framework for launching successful products to market",
    category: "Marketing",
    objective: "Execute a coordinated product launch that maximizes market penetration, builds brand awareness, and achieves revenue targets within the first 90 days.",
    overview: "A systematic approach to bringing new products to market, covering everything from pre-launch preparation to post-launch optimization. This blueprint ensures all stakeholders are aligned and execution is flawless.",
    phases: [
      {
        title: "Pre-Launch Foundation",
        description: "Establish market understanding and internal readiness",
        timeline: "8-12 weeks before launch",
        steps: [
          "Conduct comprehensive market research and competitive analysis",
          "Define target customer personas and buying journey",
          "Develop unique value proposition and positioning strategy",
          "Create product messaging framework and key talking points",
          "Establish pricing strategy based on value and competition"
        ],
        deliverables: ["Market research report", "Customer persona profiles", "Positioning document", "Pricing strategy"]
      },
      {
        title: "Launch Preparation",
        description: "Build launch infrastructure and marketing assets",
        timeline: "4-8 weeks before launch",
        steps: [
          "Develop comprehensive marketing campaign across all channels",
          "Create sales enablement materials and training programs",
          "Build product demonstration and trial capabilities",
          "Establish customer support and success processes",
          "Coordinate PR and media outreach strategy"
        ],
        deliverables: ["Marketing campaign assets", "Sales training materials", "Demo environment", "Support documentation"]
      },
      {
        title: "Launch Execution",
        description: "Execute coordinated go-to-market activities",
        timeline: "Launch week",
        steps: [
          "Deploy marketing campaigns across all planned channels",
          "Activate sales team with updated materials and training",
          "Execute PR and media outreach plan",
          "Monitor initial market response and customer feedback",
          "Address any immediate issues or concerns"
        ],
        deliverables: ["Live marketing campaigns", "Active sales process", "Media coverage", "Initial metrics report"]
      },
      {
        title: "Post-Launch Optimization",
        description: "Analyze performance and optimize for growth",
        timeline: "30-90 days after launch",
        steps: [
          "Analyze launch metrics and customer acquisition data",
          "Gather customer feedback and satisfaction scores",
          "Optimize marketing campaigns based on performance",
          "Refine sales process and address conversion issues",
          "Plan next phase of growth and expansion"
        ],
        deliverables: ["Performance analysis report", "Customer feedback summary", "Optimization recommendations"]
      }
    ],
    keyMetrics: ["Market penetration rate", "Customer acquisition cost", "Time to first sale", "Customer satisfaction score", "Revenue vs. target"],
    resources: ["Cross-functional launch team", "Marketing budget allocation", "Sales training resources", "Customer support capacity", "Analytics tools"],
    commonChallenges: ["Misaligned expectations across teams", "Insufficient market research", "Poor timing coordination", "Inadequate customer support preparation"],
    successTips: ["Start planning 3-4 months in advance", "Ensure all teams have clear roles and responsibilities", "Test everything before launch day", "Have contingency plans for common issues"]
  },
  {
    name: "Customer Service Excellence Framework",
    description: "Systematic approach to delivering exceptional customer experiences",
    category: "Operations",
    objective: "Build a customer service operation that consistently exceeds expectations, reduces churn, and creates brand advocates through superior support experiences.",
    overview: "A comprehensive framework for establishing and maintaining world-class customer service operations that drive customer satisfaction, loyalty, and business growth.",
    phases: [
      {
        title: "Service Foundation Setup",
        description: "Establish core service infrastructure and standards",
        timeline: "4-6 weeks",
        steps: [
          "Define customer service vision, mission, and core values",
          "Establish service level agreements and response time standards",
          "Set up customer support channels and technology stack",
          "Create customer service policies and escalation procedures",
          "Develop knowledge base and FAQ resources"
        ],
        deliverables: ["Service standards document", "Technology setup", "Policy manual", "Knowledge base"]
      },
      {
        title: "Team Development",
        description: "Build and train exceptional customer service team",
        timeline: "3-4 weeks",
        steps: [
          "Recruit customer service representatives with right attitude and skills",
          "Develop comprehensive training program covering products and soft skills",
          "Implement coaching and mentoring programs",
          "Establish performance measurement and feedback systems",
          "Create career development paths for service team"
        ],
        deliverables: ["Trained service team", "Training materials", "Performance metrics", "Career progression plan"]
      },
      {
        title: "Quality Assurance Implementation",
        description: "Establish systems to maintain consistent service quality",
        timeline: "2-3 weeks",
        steps: [
          "Implement call monitoring and quality scoring systems",
          "Establish customer feedback collection mechanisms",
          "Create regular team meetings and performance reviews",
          "Develop continuous improvement processes",
          "Set up customer satisfaction tracking and reporting"
        ],
        deliverables: ["Quality assurance program", "Feedback systems", "Improvement processes", "Reporting dashboard"]
      },
      {
        title: "Continuous Excellence",
        description: "Maintain and improve service quality over time",
        timeline: "Ongoing",
        steps: [
          "Regular analysis of customer feedback and service metrics",
          "Ongoing training and skill development for team",
          "Proactive identification and resolution of common issues",
          "Innovation in service delivery methods and channels",
          "Recognition and reward programs for exceptional performance"
        ],
        deliverables: ["Monthly performance reports", "Continuous training updates", "Process improvements", "Recognition programs"]
      }
    ],
    keyMetrics: ["Customer satisfaction score (CSAT)", "Net Promoter Score (NPS)", "First call resolution rate", "Average response time", "Customer retention rate"],
    resources: ["Customer service team", "Support technology platform", "Training materials", "Quality assurance tools", "Performance management system"],
    commonChallenges: ["High agent turnover", "Inconsistent service quality", "Lack of proper training", "Insufficient technology tools", "Poor internal communication"],
    successTips: ["Hire for attitude, train for skill", "Empower agents to resolve issues", "Use customer feedback to drive improvements", "Invest in ongoing training and development"]
  },
  {
    name: "Content Marketing Mastery",
    description: "Strategic framework for building audience and driving growth through content",
    category: "Marketing",
    objective: "Create a content marketing engine that attracts, engages, and converts your target audience while establishing thought leadership and brand authority in your industry.",
    overview: "A systematic approach to content marketing that goes beyond random posts to create a strategic, data-driven content machine that drives measurable business results.",
    phases: [
      {
        title: "Content Strategy Foundation",
        description: "Establish strategic framework for all content activities",
        timeline: "3-4 weeks",
        steps: [
          "Define content marketing objectives aligned with business goals",
          "Research and document detailed buyer personas and content preferences",
          "Analyze competitor content strategies and identify opportunities",
          "Develop brand voice, tone, and messaging guidelines",
          "Create content pillars and topic frameworks"
        ],
        deliverables: ["Content strategy document", "Buyer persona profiles", "Competitive analysis", "Brand guidelines", "Content framework"]
      },
      {
        title: "Content Production System",
        description: "Build scalable content creation and management processes",
        timeline: "4-5 weeks",
        steps: [
          "Establish content creation workflows and approval processes",
          "Set up content calendar and planning systems",
          "Create content templates and style guides",
          "Build team of content creators and editors",
          "Implement content management and collaboration tools"
        ],
        deliverables: ["Content workflows", "Editorial calendar", "Content templates", "Production team", "Management tools"]
      },
      {
        title: "Distribution and Promotion",
        description: "Maximize content reach and engagement across channels",
        timeline: "2-3 weeks",
        steps: [
          "Optimize owned channels (website, blog, email) for content distribution",
          "Develop social media content strategy and posting schedules",
          "Create content promotion and amplification strategies",
          "Build relationships with industry influencers and partners",
          "Implement SEO best practices for content discoverability"
        ],
        deliverables: ["Distribution strategy", "Social media plan", "Promotion tactics", "Influencer relationships", "SEO optimization"]
      },
      {
        title: "Performance Optimization",
        description: "Measure, analyze, and improve content performance continuously",
        timeline: "Ongoing",
        steps: [
          "Set up comprehensive content analytics and tracking",
          "Regular analysis of content performance and audience engagement",
          "A/B testing of content formats, headlines, and distribution methods",
          "Content auditing and optimization of existing assets",
          "Strategic adjustments based on performance data and market changes"
        ],
        deliverables: ["Analytics dashboard", "Performance reports", "Testing results", "Content audits", "Strategy updates"]
      }
    ],
    keyMetrics: ["Website traffic growth", "Content engagement rates", "Lead generation from content", "Social media follower growth", "Brand awareness metrics"],
    resources: ["Content creation team", "Content management system", "Analytics tools", "Design and video resources", "Distribution channels"],
    commonChallenges: ["Inconsistent content quality", "Lack of audience engagement", "Difficulty measuring ROI", "Content creation bottlenecks", "Keeping up with content demands"],
    successTips: ["Focus on quality over quantity", "Repurpose content across multiple formats", "Engage with your audience regularly", "Use data to guide content decisions"]
  },
  {
    name: "Team Productivity Optimization",
    description: "Systematic approach to maximizing team efficiency and output quality",
    category: "Operations",
    objective: "Create high-performing teams that consistently deliver exceptional results while maintaining work-life balance and job satisfaction across all team members.",
    overview: "A comprehensive methodology for analyzing current team dynamics, identifying bottlenecks, and implementing proven strategies to enhance productivity, collaboration, and overall team effectiveness.",
    phases: [
      {
        title: "Team Performance Assessment",
        description: "Analyze current team performance and identify improvement opportunities",
        timeline: "2-3 weeks",
        steps: [
          "Conduct comprehensive team productivity audit and baseline measurement",
          "Analyze workflow patterns, communication channels, and collaboration tools",
          "Identify productivity bottlenecks and inefficiency root causes",
          "Survey team members on challenges, obstacles, and improvement suggestions",
          "Benchmark performance against industry standards and best practices"
        ],
        deliverables: ["Performance audit report", "Bottleneck analysis", "Team feedback summary", "Benchmark comparison"]
      },
      {
        title: "Process Optimization and Tool Enhancement",
        description: "Streamline workflows and implement productivity-enhancing tools",
        timeline: "4-6 weeks",
        steps: [
          "Redesign workflows to eliminate redundancies and improve efficiency",
          "Implement or optimize project management and collaboration tools",
          "Create standardized templates and processes for common tasks",
          "Establish clear communication protocols and meeting structures",
          "Set up automated reporting and progress tracking systems"
        ],
        deliverables: ["Optimized workflows", "Tool implementation", "Process templates", "Communication protocols"]
      },
      {
        title: "Team Development and Skills Enhancement",
        description: "Invest in team member growth and capability building",
        timeline: "6-8 weeks",
        steps: [
          "Identify skill gaps and create individual development plans",
          "Implement mentoring and peer learning programs",
          "Provide training on new tools, processes, and methodologies",
          "Foster innovation and creative problem-solving capabilities",
          "Establish knowledge sharing and best practice documentation"
        ],
        deliverables: ["Development plans", "Training programs", "Mentoring system", "Knowledge base"]
      },
      {
        title: "Culture and Engagement Optimization",
        description: "Build positive team culture that sustains high performance",
        timeline: "Ongoing",
        steps: [
          "Create recognition and reward systems for outstanding performance",
          "Implement regular feedback cycles and performance reviews",
          "Foster psychological safety and open communication culture",
          "Establish work-life balance policies and wellness programs",
          "Build team cohesion through team building and social activities"
        ],
        deliverables: ["Recognition programs", "Feedback systems", "Culture initiatives", "Wellness programs"]
      }
    ],
    keyMetrics: ["Team productivity score", "Project completion rate", "Quality metrics", "Employee satisfaction", "Retention rate"],
    resources: ["Team lead training", "Productivity tools", "Performance analytics", "Training budget", "HR support"],
    commonChallenges: ["Resistance to change", "Tool adoption difficulties", "Inconsistent application", "Competing priorities", "Resource constraints"],
    successTips: ["Start with quick wins to build momentum", "Involve team in solution design", "Provide adequate training and support", "Measure and celebrate improvements"]
  },
  {
    name: "Brand Identity Development",
    description: "Complete framework for creating distinctive and memorable brand identity",
    category: "Marketing",
    objective: "Develop a compelling, cohesive brand identity that resonates with target audiences, differentiates from competitors, and drives emotional connection and brand loyalty.",
    overview: "A strategic approach to brand development that goes beyond logos and colors to create a comprehensive brand ecosystem that guides all business communications and customer interactions.",
    phases: [
      {
        title: "Brand Strategy Foundation",
        description: "Establish core brand strategy and positioning",
        timeline: "4-6 weeks",
        steps: [
          "Define brand purpose, mission, vision, and core values",
          "Conduct target audience research and persona development",
          "Analyze competitive landscape and identify positioning opportunities",
          "Develop unique value proposition and brand differentiation strategy",
          "Create brand personality and voice characteristics"
        ],
        deliverables: ["Brand strategy document", "Audience personas", "Competitive analysis", "Brand positioning", "Voice guide"]
      },
      {
        title: "Visual Identity Creation",
        description: "Design visual elements that embody the brand strategy",
        timeline: "6-8 weeks",
        steps: [
          "Create logo concepts that reflect brand personality and values",
          "Develop comprehensive color palette and typography system",
          "Design visual style guide with consistent design principles",
          "Create brand pattern library and graphic elements",
          "Test visual identity with target audience for effectiveness"
        ],
        deliverables: ["Logo suite", "Color system", "Typography guide", "Visual style guide", "Brand elements library"]
      },
      {
        title: "Brand Application System",
        description: "Apply brand identity across all touchpoints and channels",
        timeline: "4-6 weeks",
        steps: [
          "Design business collateral (business cards, letterhead, presentations)",
          "Create digital brand assets (website design, social media templates)",
          "Develop packaging and product design guidelines",
          "Design marketing materials and advertising templates",
          "Create brand application guidelines for consistent usage"
        ],
        deliverables: ["Business collateral", "Digital assets", "Packaging design", "Marketing templates", "Application guidelines"]
      },
      {
        title: "Brand Launch and Integration",
        description: "Successfully launch new brand and integrate across organization",
        timeline: "6-8 weeks",
        steps: [
          "Plan comprehensive brand launch strategy and timeline",
          "Train internal team on brand guidelines and applications",
          "Update all customer-facing materials and communications",
          "Launch external brand announcement and awareness campaign",
          "Monitor brand reception and adjust strategy as needed"
        ],
        deliverables: ["Launch plan", "Team training", "Updated materials", "Launch campaign", "Performance monitoring"]
      }
    ],
    keyMetrics: ["Brand awareness levels", "Brand recall metrics", "Customer perception scores", "Consistency audit results", "Engagement rates"],
    resources: ["Design team or agency", "Brand research tools", "Design software", "Printing and production budget", "Marketing channels"],
    commonChallenges: ["Inconsistent brand application", "Internal resistance to change", "Budget constraints", "Time pressures", "Measuring brand impact"],
    successTips: ["Involve stakeholders in the process", "Test concepts with real customers", "Create comprehensive guidelines", "Plan for long-term brand evolution"]
  },
  {
    name: "Customer Retention Strategy",
    description: "Comprehensive approach to building lasting customer relationships and reducing churn",
    category: "Customer Success",
    objective: "Develop systematic strategies to increase customer lifetime value, reduce churn rates, and transform satisfied customers into brand advocates and referral sources.",
    overview: "A data-driven methodology for understanding customer behavior, identifying retention risks, and implementing proactive strategies to maintain long-term customer relationships.",
    phases: [
      {
        title: "Customer Analysis and Segmentation",
        description: "Understand customer behavior patterns and identify retention risks",
        timeline: "3-4 weeks",
        steps: [
          "Analyze customer data to identify churn patterns and risk indicators",
          "Segment customers based on value, behavior, and retention probability",
          "Conduct customer interviews to understand satisfaction drivers",
          "Map customer journey and identify critical retention touchpoints",
          "Establish baseline metrics for retention and customer health"
        ],
        deliverables: ["Churn analysis report", "Customer segments", "Interview insights", "Journey map", "Baseline metrics"]
      },
      {
        title: "Retention Program Development",
        description: "Create targeted programs to address specific retention challenges",
        timeline: "6-8 weeks",
        steps: [
          "Design personalized onboarding programs for new customers",
          "Create value demonstration and success milestone programs",
          "Develop proactive outreach and engagement strategies",
          "Implement loyalty programs and exclusive customer benefits",
          "Build win-back campaigns for at-risk customers"
        ],
        deliverables: ["Onboarding program", "Success programs", "Engagement strategies", "Loyalty program", "Win-back campaigns"]
      },
      {
        title: "Customer Success Operations",
        description: "Implement systems and processes for proactive customer success",
        timeline: "4-6 weeks",
        steps: [
          "Set up customer health scoring and monitoring systems",
          "Implement automated alerts for at-risk customers",
          "Create customer success playbooks for common scenarios",
          "Train customer success team on retention strategies",
          "Establish regular customer check-in and review processes"
        ],
        deliverables: ["Health scoring system", "Alert systems", "Success playbooks", "Team training", "Review processes"]
      },
      {
        title: "Continuous Optimization",
        description: "Monitor performance and continuously improve retention strategies",
        timeline: "Ongoing",
        steps: [
          "Track retention metrics and program effectiveness regularly",
          "Collect ongoing customer feedback and satisfaction scores",
          "Test and optimize retention program elements",
          "Identify and address new churn risk factors",
          "Scale successful retention strategies across customer base"
        ],
        deliverables: ["Performance dashboards", "Feedback systems", "Optimization tests", "Risk monitoring", "Scaling plans"]
      }
    ],
    keyMetrics: ["Customer retention rate", "Churn rate", "Customer lifetime value", "Net Promoter Score", "Customer health score"],
    resources: ["Customer success team", "CRM and analytics tools", "Customer feedback platforms", "Retention program budget", "Training resources"],
    commonChallenges: ["Identifying churn risks early", "Resource allocation across segments", "Measuring program ROI", "Cross-team coordination", "Scaling personalization"],
    successTips: ["Focus on early warning indicators", "Personalize retention efforts", "Invest in customer success technology", "Create customer-centric culture"]
  },
  {
    name: "Venture Capital Fundraising Strategy",
    description: "Strategic framework for successfully raising venture capital funding",
    category: "Investment",
    objective: "Secure venture capital funding that aligns with business goals, provides strategic value beyond capital, and positions the company for sustainable growth and future funding rounds.",
    overview: "A comprehensive approach to VC fundraising that covers everything from investor research and pitch development to term negotiation and post-funding relationship management.",
    phases: [
      {
        title: "Fundraising Preparation and Strategy",
        description: "Establish fundraising strategy and prepare company for investor scrutiny",
        timeline: "8-12 weeks",
        steps: [
          "Define funding requirements, use of funds, and strategic objectives",
          "Prepare comprehensive business plan and financial projections",
          "Conduct thorough market analysis and competitive positioning",
          "Organize legal, financial, and operational documentation",
          "Develop compelling company narrative and investment thesis"
        ],
        deliverables: ["Funding strategy", "Business plan", "Financial model", "Due diligence package", "Investment thesis"]
      },
      {
        title: "Investor Research and Targeting",
        description: "Identify and prioritize potential venture capital partners",
        timeline: "4-6 weeks",
        steps: [
          "Research venture capital firms aligned with industry and stage",
          "Analyze VC portfolio companies and investment preferences",
          "Identify warm introduction opportunities through network",
          "Create prioritized list of target investors with outreach strategy",
          "Develop investor-specific value propositions and approaches"
        ],
        deliverables: ["VC target list", "Investor research", "Introduction strategy", "Outreach plan", "Value propositions"]
      },
      {
        title: "Pitch Development and Presentation",
        description: "Create compelling pitch materials and presentation strategy",
        timeline: "6-8 weeks",
        steps: [
          "Develop comprehensive pitch deck with compelling storytelling",
          "Create detailed financial model and scenario analysis",
          "Prepare executive summary and one-page investment overview",
          "Practice pitch presentation and Q&A handling",
          "Develop supporting materials and demo capabilities"
        ],
        deliverables: ["Pitch deck", "Financial model", "Executive summary", "Presentation training", "Demo materials"]
      },
      {
        title: "Fundraising Execution and Closing",
        description: "Execute fundraising process and negotiate favorable terms",
        timeline: "12-20 weeks",
        steps: [
          "Initiate outreach to target investors with warm introductions",
          "Conduct initial meetings and pitch presentations",
          "Manage due diligence process and investor communications",
          "Negotiate term sheets and select lead investor",
          "Complete legal documentation and closing process"
        ],
        deliverables: ["Investor meetings", "Due diligence responses", "Term sheet negotiations", "Legal documents", "Funding close"]
      }
    ],
    keyMetrics: ["Funding amount raised", "Valuation achieved", "Time to close", "Investor quality score", "Terms favorability"],
    resources: ["Legal counsel", "Financial advisor", "Pitch coach", "Due diligence team", "Network connections"],
    commonChallenges: ["Valuation expectations", "Market timing", "Investor alignment", "Due diligence complexity", "Term negotiations"],
    successTips: ["Start building relationships before needing funding", "Focus on strategic value beyond capital", "Be prepared for extensive due diligence", "Negotiate terms carefully"]
  },
  {
    name: "Crisis Management Protocol",
    description: "Comprehensive framework for managing business crises and reputation threats",
    category: "Risk Management",
    objective: "Establish systematic crisis management capabilities that protect company reputation, maintain stakeholder confidence, and enable rapid recovery from adverse events.",
    overview: "A proactive approach to crisis preparedness that includes prevention strategies, response protocols, and recovery planning to minimize business impact and maintain organizational resilience.",
    phases: [
      {
        title: "Crisis Preparedness and Planning",
        description: "Develop comprehensive crisis management infrastructure",
        timeline: "6-8 weeks",
        steps: [
          "Identify potential crisis scenarios and risk factors",
          "Establish crisis management team with clear roles and responsibilities",
          "Create crisis communication templates and approval processes",
          "Develop stakeholder contact lists and communication channels",
          "Design crisis escalation procedures and decision-making protocols"
        ],
        deliverables: ["Risk assessment", "Crisis team structure", "Communication templates", "Contact databases", "Escalation procedures"]
      },
      {
        title: "Response Strategy Development",
        description: "Create specific response strategies for different crisis types",
        timeline: "4-6 weeks",
        steps: [
          "Develop response strategies for each identified crisis scenario",
          "Create messaging frameworks for different stakeholder groups",
          "Establish media relations protocols and spokesperson training",
          "Design customer communication and retention strategies",
          "Plan business continuity and operational recovery procedures"
        ],
        deliverables: ["Response strategies", "Messaging frameworks", "Media protocols", "Customer communications", "Continuity plans"]
      },
      {
        title: "Crisis Response Implementation",
        description: "Execute crisis response protocols when adverse events occur",
        timeline: "During crisis",
        steps: [
          "Activate crisis management team and communication protocols",
          "Assess situation severity and implement appropriate response level",
          "Execute internal and external communication strategies",
          "Monitor media coverage and stakeholder reactions",
          "Coordinate operational responses and business continuity measures"
        ],
        deliverables: ["Team activation", "Response execution", "Communications", "Media monitoring", "Operational response"]
      },
      {
        title: "Recovery and Learning",
        description: "Facilitate recovery and extract lessons learned for future improvement",
        timeline: "Post-crisis",
        steps: [
          "Conduct post-crisis analysis and stakeholder feedback collection",
          "Implement reputation recovery and trust rebuilding initiatives",
          "Update crisis management protocols based on lessons learned",
          "Strengthen relationships with key stakeholders and partners",
          "Prepare for long-term recovery and organizational improvement"
        ],
        deliverables: ["Post-crisis analysis", "Recovery initiatives", "Protocol updates", "Stakeholder relations", "Improvement plans"]
      }
    ],
    keyMetrics: ["Response time to crisis", "Stakeholder sentiment", "Media coverage sentiment", "Business impact duration", "Recovery timeline"],
    resources: ["Crisis management team", "Communication specialists", "Legal counsel", "PR agency", "Monitoring tools"],
    commonChallenges: ["Rapid decision making under pressure", "Managing multiple stakeholder groups", "Information accuracy and timing", "Resource allocation during crisis"],
    successTips: ["Prepare extensively before crisis occurs", "Communicate transparently and frequently", "Focus on stakeholder needs and concerns", "Learn and improve from each crisis"]
  }
];

const proBlueprints: Blueprint[] = [
  {
    name: "Executive Leadership Transformation",
    description: "Comprehensive framework for developing high-impact executive leadership",
    category: "Leadership",
    objective: "Transform executive leadership capabilities to drive organizational excellence, inspire teams, and achieve strategic objectives in rapidly changing business environments.",
    overview: "A strategic development program that builds executive leadership skills across vision setting, decision making, team building, and organizational transformation. Designed for senior leaders who want to maximize their impact and drive sustainable business results.",
    phases: [
      {
        title: "Leadership Assessment and Vision",
        description: "Evaluate current leadership effectiveness and define transformation goals",
        timeline: "4-6 weeks",
        steps: [
          "Conduct comprehensive 360-degree leadership assessment",
          "Analyze current leadership strengths, gaps, and development opportunities",
          "Define personal leadership vision and core values",
          "Establish leadership development goals aligned with business objectives",
          "Create personal leadership brand and communication strategy"
        ],
        deliverables: ["Leadership assessment report", "Personal vision statement", "Development plan", "Leadership brand strategy"]
      },
      {
        title: "Strategic Thinking and Decision Making",
        description: "Develop advanced strategic thinking and executive decision-making capabilities",
        timeline: "6-8 weeks",
        steps: [
          "Master strategic analysis frameworks and scenario planning techniques",
          "Develop systems thinking approach to complex business challenges",
          "Learn advanced decision-making models for high-stakes situations",
          "Practice strategic communication and stakeholder management",
          "Build capability for leading through uncertainty and ambiguity"
        ],
        deliverables: ["Strategic thinking toolkit", "Decision-making framework", "Communication templates", "Scenario planning models"]
      },
      {
        title: "Team Leadership and Culture Building",
        description: "Build exceptional team leadership and organizational culture capabilities",
        timeline: "6-8 weeks",
        steps: [
          "Develop high-performance team building and management skills",
          "Learn to create and sustain positive organizational culture",
          "Master change management and transformation leadership",
          "Build coaching and mentoring capabilities for team development",
          "Establish systems for talent development and succession planning"
        ],
        deliverables: ["Team development framework", "Culture building strategy", "Change management toolkit", "Coaching methodology"]
      },
      {
        title: "Executive Presence and Influence",
        description: "Enhance executive presence and stakeholder influence capabilities",
        timeline: "4-6 weeks",
        steps: [
          "Develop compelling executive presence and gravitas",
          "Master stakeholder influence and relationship building strategies",
          "Learn advanced presentation and public speaking techniques",
          "Build media relations and thought leadership capabilities",
          "Create systems for ongoing executive brand development"
        ],
        deliverables: ["Executive presence plan", "Influence strategy", "Speaking toolkit", "Brand development system"]
      }
    ],
    keyMetrics: ["360-degree feedback improvement", "Team engagement scores", "Strategic objective achievement", "Stakeholder confidence ratings", "Organizational culture metrics"],
    resources: ["Executive coach", "Leadership assessment tools", "360-degree feedback system", "Strategic planning resources", "Communication training"],
    commonChallenges: ["Time constraints for development activities", "Resistance to feedback and change", "Balancing day-to-day operations with development", "Measuring soft skill improvements"],
    successTips: ["Commit to consistent practice and application", "Seek regular feedback from trusted advisors", "Apply learnings immediately in real situations", "Build supportive peer learning network"]
  },
  {
    name: "Digital Transformation Strategy",
    description: "Enterprise-wide digital transformation planning and execution framework",
    category: "Technology Strategy",
    objective: "Lead successful digital transformation that modernizes operations, enhances customer experience, and creates sustainable competitive advantages through strategic technology adoption.",
    overview: "A comprehensive approach to digital transformation that goes beyond technology implementation to encompass organizational change, process optimization, and cultural transformation for lasting business impact.",
    phases: [
      {
        title: "Digital Maturity Assessment",
        description: "Evaluate current digital capabilities and transformation readiness",
        timeline: "6-8 weeks",
        steps: [
          "Conduct comprehensive digital maturity assessment across all business functions",
          "Analyze current technology stack, data capabilities, and digital processes",
          "Evaluate organizational change readiness and digital skills gaps",
          "Benchmark against industry leaders and identify transformation opportunities",
          "Define digital transformation vision and strategic objectives"
        ],
        deliverables: ["Digital maturity report", "Technology audit", "Skills gap analysis", "Benchmark study", "Transformation vision"]
      },
      {
        title: "Strategic Technology Roadmap",
        description: "Develop comprehensive technology strategy and implementation roadmap",
        timeline: "8-10 weeks",
        steps: [
          "Design target state technology architecture and platform strategy",
          "Prioritize digital initiatives based on business value and feasibility",
          "Create detailed implementation roadmap with phases and milestones",
          "Develop technology governance and decision-making frameworks",
          "Establish data strategy and analytics capabilities roadmap"
        ],
        deliverables: ["Technology architecture", "Digital roadmap", "Implementation plan", "Governance framework", "Data strategy"]
      },
      {
        title: "Change Management and Culture",
        description: "Build organizational capability for digital transformation success",
        timeline: "12-16 weeks",
        steps: [
          "Develop comprehensive change management strategy and communication plan",
          "Create digital skills development and training programs",
          "Establish digital culture initiatives and behavior change programs",
          "Build internal digital champions and change agent network",
          "Implement performance metrics and incentive alignment for digital adoption"
        ],
        deliverables: ["Change management plan", "Training programs", "Culture initiatives", "Champion network", "Performance metrics"]
      },
      {
        title: "Implementation and Optimization",
        description: "Execute transformation initiatives and optimize for continuous improvement",
        timeline: "18-24 months",
        steps: [
          "Execute digital initiatives according to roadmap priorities",
          "Monitor progress against transformation objectives and KPIs",
          "Continuously optimize processes and technology implementations",
          "Scale successful pilots across the organization",
          "Establish continuous innovation and digital evolution capabilities"
        ],
        deliverables: ["Implementation progress reports", "Performance dashboards", "Process optimizations", "Scaling playbooks", "Innovation framework"]
      }
    ],
    keyMetrics: ["Digital maturity score improvement", "Process efficiency gains", "Customer experience metrics", "Employee digital adoption rates", "Revenue from digital initiatives"],
    resources: ["Digital transformation team", "Technology vendors and partners", "Change management consultants", "Training and development resources", "Analytics and monitoring tools"],
    commonChallenges: ["Resistance to change", "Legacy system integration complexity", "Skills and capability gaps", "Budget and resource constraints", "Maintaining business operations during transformation"],
    successTips: ["Start with quick wins to build momentum", "Invest heavily in change management and communication", "Focus on user experience and adoption", "Measure and celebrate progress regularly"]
  },
  {
    name: "Mergers & Acquisitions Integration",
    description: "Systematic approach to successful M&A integration and value realization",
    category: "Corporate Development",
    objective: "Execute seamless M&A integration that realizes projected synergies, retains key talent, maintains business continuity, and creates lasting value for all stakeholders.",
    overview: "A proven framework for managing complex M&A integrations, covering everything from pre-close planning to post-integration optimization. Designed to maximize success probability and value creation.",
    phases: [
      {
        title: "Pre-Integration Planning",
        description: "Establish integration foundation and readiness before deal closure",
        timeline: "8-12 weeks pre-close",
        steps: [
          "Form integrated management office (IMO) and governance structure",
          "Conduct detailed synergy analysis and value creation planning",
          "Develop comprehensive integration master plan and timeline",
          "Complete cultural assessment and integration strategy",
          "Establish communication strategy and stakeholder management plan"
        ],
        deliverables: ["IMO structure", "Synergy plan", "Integration master plan", "Cultural strategy", "Communication plan"]
      },
      {
        title: "Day One Readiness",
        description: "Ensure seamless transition from deal close to integration execution",
        timeline: "Day 1 - Week 4",
        steps: [
          "Execute Day One operational readiness checklist",
          "Activate integrated leadership team and governance processes",
          "Launch employee communication and engagement programs",
          "Implement immediate operational integration requirements",
          "Begin cultural integration and team building activities"
        ],
        deliverables: ["Day One execution", "Leadership activation", "Communication launch", "Operational integration", "Culture programs"]
      },
      {
        title: "Systems and Process Integration",
        description: "Integrate core business systems, processes, and operations",
        timeline: "Month 2-8",
        steps: [
          "Execute IT systems integration and data migration",
          "Harmonize business processes and operational procedures",
          "Integrate financial reporting and control systems",
          "Consolidate vendor relationships and procurement processes",
          "Optimize organizational structure and eliminate duplications"
        ],
        deliverables: ["Integrated systems", "Harmonized processes", "Financial integration", "Vendor consolidation", "Organization optimization"]
      },
      {
        title: "Value Realization and Optimization",
        description: "Capture synergies and optimize integrated organization performance",
        timeline: "Month 6-18",
        steps: [
          "Track and realize projected cost and revenue synergies",
          "Optimize combined organization for maximum efficiency and effectiveness",
          "Complete talent integration and development programs",
          "Establish unified culture and performance management systems",
          "Measure integration success and implement continuous improvements"
        ],
        deliverables: ["Synergy realization", "Organization optimization", "Talent integration", "Unified culture", "Success metrics"]
      }
    ],
    keyMetrics: ["Synergy realization percentage", "Employee retention rates", "Customer retention rates", "Integration timeline adherence", "Combined organization performance"],
    resources: ["Integration management office", "Project management tools", "Change management resources", "IT integration specialists", "HR and culture consultants"],
    commonChallenges: ["Cultural integration difficulties", "Key talent departure", "Customer disruption and churn", "IT systems complexity", "Communication and coordination issues"],
    successTips: ["Start integration planning during due diligence", "Prioritize cultural integration from day one", "Communicate frequently and transparently", "Focus on customer and employee retention"]
  }
];

const allBlueprints = [...freeBlueprints, ...proBlueprints];

export default function Blueprints() {
  const { isAuthenticated, subscription } = useAuth();
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use cached subscription data - no API call needed!
  const showAllContent = subscription?.subscribed && subscription.subscription_tier === 'JumpinAI Pro';

  const UpgradeSection = ({ message }: { message: string }) => (
    <div className="bg-muted/50 border border-border rounded-lg p-8 text-center mt-8">
      <Lock className="h-8 w-8 text-muted-foreground mb-3 mx-auto" />
      <p className="text-lg font-medium mb-2">{message}</p>
      <p className="text-muted-foreground mb-4">Upgrade to Pro to gain access to all premium content</p>
      <Button 
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname);
          } else {
            window.location.href = '/pricing';
          }
        }}
        className="text-sm"
      >
        {!isAuthenticated ? 'Login to Subscribe' : 'Upgrade to Pro'} - $10/month
      </Button>
    </div>
  );

  const BlueprintCard = ({ blueprint, isBlurred }: { blueprint: Blueprint; isBlurred: boolean }) => (
    <Card 
      className={`h-full cursor-pointer hover:shadow-lg transition-shadow ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}
        onClick={() => {
          if (!isBlurred) {
            setSelectedBlueprint(blueprint);
            setIsModalOpen(true);
          }
        }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{blueprint.name}</CardTitle>
          <Badge variant="secondary">{blueprint.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{blueprint.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template Preview:</h4>
          <pre className="text-xs bg-muted p-2 rounded text-muted-foreground overflow-hidden max-h-16">
            {blueprint.description.substring(0, 120)}...
          </pre>
        </div>
        <Button size="sm" className="mt-4 w-full" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View Full Blueprint
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Blueprints Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Blueprints</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Blueprint
          </Button>
        </div>
        
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-muted-foreground">There will be your blueprints</h3>
        </div>
      </div>

      {/* JumpinAI Blueprints Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Blueprints</h2>
          <p className="text-muted-foreground">Ready-to-use templates for common business scenarios</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAllContent ? allBlueprints : allBlueprints.slice(0, 6)).map((blueprint, index) => (
            <BlueprintCard 
              key={index} 
              blueprint={blueprint} 
              isBlurred={!showAllContent && index >= 4}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional blueprints" />}
      </div>

      <BlueprintDetailModal 
        blueprint={selectedBlueprint}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBlueprint(null);
        }}
      />
    </div>
  );
}
