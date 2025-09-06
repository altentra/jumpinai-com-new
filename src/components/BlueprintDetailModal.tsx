import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Clock, Users, Wrench, AlertTriangle, BookOpen } from "lucide-react";
import { useState } from "react";

type Blueprint = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  template: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App';
  category: string;
};

type DetailedBlueprint = {
  name: string;
  description: string;
  template: string;
  category: string;
  overview: string;
  useCase: string;
  benefits: string[];
  customization: string[];
  implementationSteps: {
    title: string;
    description: string;
    actions: string[];
  }[];
  examples: {
    title: string;
    description: string;
    results: string;
  }[];
  bestPractices: string[];
  resources: { name: string; url: string; }[];
};

const blueprintDetails: Record<string, DetailedBlueprint> = {
  "Product Launch Blueprint": {
    name: "Product Launch Blueprint",
    description: "Complete template for product launches",
    template: "# Product Launch Brief\n## Narrative\n[Product story and positioning]\n## ICP Pain Points\n[Target customer problems]\n## Key Benefits\n1. [Benefit 1]\n2. [Benefit 2]\n3. [Benefit 3]\n## Messaging Pillars\n[Core messages]\n## Call-to-Action\n[Clear next steps]",
    category: "Marketing",
    overview: "A comprehensive framework for orchestrating successful product launches from strategy to execution. This blueprint ensures every critical element is addressed while maintaining consistency across all launch activities.",
    useCase: "Perfect for product managers, marketing teams, and startup founders launching new products or features who need a systematic approach to maximize launch impact and market adoption.",
    benefits: [
      "Reduces launch preparation time by 50% with structured workflows",
      "Increases launch success rate through comprehensive planning",
      "Ensures consistent messaging across all channels and stakeholders",
      "Provides clear accountability and timeline management",
      "Includes post-launch optimization and feedback integration"
    ],
    customization: [
      "Adapt timeline based on product complexity and market readiness",
      "Customize messaging for different customer segments and personas",
      "Scale team structure based on organization size and resources",
      "Modify channels based on target audience preferences",
      "Adjust budget allocation for different marketing mix strategies"
    ],
    implementationSteps: [
      {
        title: "Pre-Launch Strategy Development",
        description: "Establish the foundation for your product launch with comprehensive market and competitive analysis.",
        actions: [
          "Conduct thorough market research and competitive landscape analysis",
          "Define target customer personas with detailed pain point mapping",
          "Develop unique value proposition and positioning strategy",
          "Set measurable launch objectives and success metrics",
          "Create detailed project timeline with milestone dependencies"
        ]
      },
      {
        title: "Cross-Functional Team Assembly",
        description: "Build and align your launch team with clear roles and responsibilities.",
        actions: [
          "Identify key stakeholders across product, marketing, sales, and support",
          "Define roles, responsibilities, and accountability frameworks (RACI)",
          "Establish communication protocols and meeting cadence",
          "Set up project management tools and shared documentation",
          "Create escalation procedures for issue resolution"
        ]
      },
      {
        title: "Content & Creative Development", 
        description: "Create compelling marketing materials and sales enablement content.",
        actions: [
          "Develop core messaging framework and brand guidelines",
          "Create website landing pages optimized for conversion",
          "Produce video demos, tutorials, and promotional content",
          "Design marketing collateral and sales presentation materials",
          "Prepare PR materials, press releases, and media kits"
        ]
      },
      {
        title: "Channel Strategy & Partnership Development",
        description: "Establish distribution channels and strategic partnerships for maximum reach.",
        actions: [
          "Identify optimal marketing channels based on customer behavior",
          "Negotiate partnerships with complementary brands or influencers",
          "Set up affiliate or referral programs with tracking systems",
          "Prepare sales team with training and enablement materials",
          "Coordinate with customer success for onboarding preparation"
        ]
      },
      {
        title: "Launch Execution & Monitoring",
        description: "Execute the launch plan while continuously monitoring performance and adapting strategy.",
        actions: [
          "Activate all marketing campaigns across chosen channels simultaneously",
          "Monitor real-time performance metrics and user feedback",
          "Coordinate customer support for increased inquiry volume",
          "Manage PR outreach and media relationship activities",
          "Execute crisis communication plan if issues arise"
        ]
      },
      {
        title: "Post-Launch Optimization & Analysis",
        description: "Analyze launch performance and optimize for sustained growth.",
        actions: [
          "Collect and analyze performance data across all metrics",
          "Conduct customer interviews for qualitative feedback",
          "Identify optimization opportunities in conversion funnel",
          "Document lessons learned and best practices for future launches",
          "Plan ongoing marketing and growth strategies based on insights"
        ]
      }
    ],
    examples: [
      {
        title: "SaaS Platform Launch",
        description: "B2B software company launching a new workflow automation platform",
        results: "Achieved 150% of initial user acquisition targets, secured 12 enterprise partnerships, generated $2M ARR in first 6 months"
      },
      {
        title: "Consumer App Launch", 
        description: "Mobile fitness app targeting health-conscious millennials",
        results: "Reached #3 in App Store Health category, gained 100K downloads in first month, maintained 4.8-star rating"
      },
      {
        title: "Physical Product Launch",
        description: "Eco-friendly home goods company launching sustainable kitchenware line",
        results: "Sold out initial inventory within 48 hours, secured retail partnerships with 5 major chains, 40% customer retention rate"
      }
    ],
    bestPractices: [
      "Start planning 3-6 months before intended launch date",
      "Test all systems and processes in staging environment first",
      "Create backup plans for critical dependencies and potential failures",
      "Maintain consistent communication with all stakeholders throughout process",
      "Focus on customer experience from first touchpoint to post-purchase support",
      "Plan for scale - ensure systems can handle projected demand spikes"
    ],
    resources: [
      { name: "Product Launch Checklist", url: "#" },
      { name: "Marketing Channel Guide", url: "#" },
      { name: "Launch Metrics Dashboard", url: "#" }
    ]
  },

  "SOP Template": {
    name: "SOP Template",
    description: "Standard Operating Procedure template",
    template: "# Standard Operating Procedure\n## Purpose\n[Why this SOP exists]\n## Scope\n[What this covers]\n## Responsibilities\n[Who does what]\n## Procedure\n[Step-by-step process]\n## Quality Controls\n[Checks and balances]",
    category: "Operations",
    overview: "A comprehensive framework for creating, implementing, and maintaining Standard Operating Procedures that ensure consistency, quality, and compliance across all business operations.",
    useCase: "Essential for operations managers, quality assurance teams, and business owners who need to standardize processes, ensure compliance, and maintain operational excellence.",
    benefits: [
      "Ensures consistent execution across teams and locations",
      "Reduces training time for new employees by 60%",
      "Improves quality control and reduces errors significantly", 
      "Facilitates compliance with regulatory requirements",
      "Enables scalable business operations and process improvement"
    ],
    customization: [
      "Adapt complexity level based on process criticality and user expertise",
      "Include industry-specific compliance requirements and standards",
      "Customize approval workflows based on organizational hierarchy",
      "Modify format for different types of procedures (technical, administrative, safety)",
      "Scale documentation detail based on process complexity and risk level"
    ],
    implementationSteps: [
      {
        title: "Process Identification & Scoping",
        description: "Identify which processes need SOPs and define their scope and boundaries.",
        actions: [
          "Conduct process inventory across all business functions",
          "Prioritize processes based on criticality, frequency, and compliance needs",
          "Define clear scope boundaries for each SOP to avoid overlap",
          "Identify process owners and subject matter experts",
          "Establish SOP creation timeline and resource allocation"
        ]
      },
      {
        title: "Process Mapping & Documentation",
        description: "Document current state processes with detailed step-by-step procedures.",
        actions: [
          "Map current process flow with all decision points and alternatives",
          "Document each step with clear, actionable instructions",
          "Identify inputs, outputs, and quality criteria for each step",
          "Include safety considerations and risk mitigation measures",
          "Add visual aids, flowcharts, and screenshots where helpful"
        ]
      },
      {
        title: "Stakeholder Review & Validation",
        description: "Ensure accuracy and completeness through expert review and validation.",
        actions: [
          "Conduct thorough review with process owners and practitioners",
          "Test procedures with new or less experienced team members",
          "Validate against regulatory requirements and industry standards",
          "Incorporate feedback and refine documentation iteratively",
          "Obtain formal approval from relevant authority figures"
        ]
      },
      {
        title: "Training & Implementation",
        description: "Roll out SOPs with proper training and change management support.",
        actions: [
          "Develop training materials and certification programs",
          "Conduct training sessions for all affected personnel",
          "Implement gradual rollout with pilot testing in controlled environments",
          "Provide ongoing support and clarification during transition",
          "Monitor compliance and address implementation challenges promptly"
        ]
      },
      {
        title: "Monitoring & Continuous Improvement",
        description: "Establish systems for ongoing monitoring and regular SOP updates.",
        actions: [
          "Set up regular audit schedules and compliance monitoring",
          "Collect feedback from users and identify improvement opportunities",
          "Track key performance indicators and process efficiency metrics",
          "Update SOPs regularly based on process changes and lessons learned",
          "Maintain version control and ensure all users have current procedures"
        ]
      }
    ],
    examples: [
      {
        title: "Customer Service SOP",
        description: "Standardized customer inquiry handling and escalation procedures",
        results: "Reduced response time by 40%, improved customer satisfaction by 25%, decreased escalation rate by 50%"
      },
      {
        title: "Manufacturing Quality Control SOP",
        description: "Comprehensive quality assurance procedures for production line",
        results: "Achieved 99.8% quality standards compliance, reduced defect rate by 75%, streamlined audit processes"
      },
      {
        title: "Financial Reporting SOP",
        description: "Month-end financial close and reporting procedures",
        results: "Reduced close time from 10 days to 5 days, improved accuracy by 30%, enhanced audit readiness"
      }
    ],
    bestPractices: [
      "Write procedures from the user's perspective with clear, simple language",
      "Include visual aids and flowcharts to enhance understanding",
      "Regular review and update cycles to maintain relevance",
      "Version control and change tracking for audit trails",
      "Training verification and competency assessment for critical procedures",
      "Exception handling and escalation procedures for unusual situations"
    ],
    resources: [
      { name: "SOP Writing Guidelines", url: "#" },
      { name: "Process Mapping Tools", url: "#" },
      { name: "Compliance Frameworks", url: "#" }
    ]
  },

  "n8n Workflow Design Blueprint": {
    name: "n8n Workflow Design Blueprint",
    description: "Complete template for designing enterprise n8n automation workflows",
    template: "# n8n Enterprise Workflow Blueprint\n\n## Executive Summary\n### Business Objective\n[What business problem this workflow solves]\n### Expected ROI\n[Time savings, cost reduction, efficiency gains]\n### Success Metrics\n[KPIs to measure workflow performance]\n\n## Process Analysis\n### Current State\n[Manual process documentation]\n### Pain Points\n[Inefficiencies and bottlenecks]\n### Stakeholders\n[Who is involved in the process]\n### Data Sources\n[Systems and information inputs]\n\n## Workflow Architecture\n### Trigger Configuration\n[Webhook, schedule, manual, or event-based triggers]\n### Node Structure\n[Detailed workflow logic and decision points]\n### Error Handling\n[Retry logic, fallbacks, and exception management]\n### Performance Optimization\n[Rate limiting, batching, and resource management]\n\n## Technical Implementation\n### Required Integrations\n[APIs, databases, and third-party services]\n### Authentication Setup\n[API keys, OAuth, and security credentials]\n### Data Transformation\n[Data mapping, validation, and formatting rules]\n### Output Configuration\n[Where and how results are delivered]\n\n## Quality Assurance\n### Testing Strategy\n[Unit tests, integration tests, and user acceptance]\n### Monitoring Setup\n[Alerts, logging, and performance tracking]\n### Backup and Recovery\n[Data backup and workflow restoration procedures]\n### Documentation\n[User guides, troubleshooting, and maintenance]\n\n## Deployment Plan\n### Environment Setup\n[Development, staging, and production environments]\n### Rollout Strategy\n[Phased deployment and user training]\n### Change Management\n[Communication plan and adoption strategy]\n### Success Validation\n[Performance metrics and user feedback collection]",
    category: "Automation Architecture",
    overview: "This comprehensive blueprint provides a systematic approach to designing, implementing, and deploying enterprise-grade n8n workflows. It ensures your automation projects follow best practices, include proper error handling, and deliver measurable business value.",
    useCase: "Perfect for automation architects, IT leaders, and business analysts who need to create robust, scalable workflow automations that integrate multiple systems and deliver consistent business outcomes.",
    benefits: [
      "Structured approach reduces implementation time by 60%",
      "Built-in error handling and monitoring prevent system failures",
      "Clear documentation improves team collaboration and maintenance",
      "ROI tracking ensures business value measurement",
      "Scalable architecture supports enterprise growth",
      "Quality assurance framework minimizes post-deployment issues"
    ],
    customization: [
      "Adapt complexity based on business process sophistication",
      "Customize integration patterns for specific technology stack",
      "Scale monitoring and alerting based on business criticality",
      "Modify security requirements for industry compliance needs",
      "Adjust documentation detail for team technical proficiency"
    ],
    implementationSteps: [
      {
        title: "Business Process Analysis & Requirements Gathering",
        description: "Thoroughly analyze the current process and define automation requirements.",
        actions: [
          "Document current manual process with all steps, decisions, and exceptions",
          "Identify pain points, bottlenecks, and inefficiencies in existing workflow",
          "Define clear business objectives and expected outcomes from automation",
          "Map all stakeholders, their roles, and interaction points",
          "Catalog all data sources, systems, and integration requirements"
        ]
      },
      {
        title: "Architecture Design & Technical Planning",
        description: "Design the technical architecture and integration strategy for the n8n workflow.",
        actions: [
          "Design workflow trigger strategy (webhook, schedule, event-based)",
          "Plan node structure with proper error handling and decision logic",
          "Define data transformation requirements and validation rules",
          "Plan integration points with APIs, databases, and third-party services",
          "Design scalability and performance optimization strategies"
        ]
      },
      {
        title: "Development Environment Setup",
        description: "Prepare development infrastructure and access to required services.",
        actions: [
          "Set up n8n development environment with proper configuration",
          "Configure access to all required APIs and external services",
          "Establish authentication mechanisms and security credentials",
          "Set up version control and backup procedures for workflow definitions",
          "Create development database and test data sets"
        ]
      },
      {
        title: "Workflow Implementation & Testing",
        description: "Build the workflow with comprehensive testing and validation.",
        actions: [
          "Implement core workflow logic following the designed architecture",
          "Add comprehensive error handling and retry mechanisms",
          "Implement data validation and transformation logic",
          "Create thorough test cases covering all scenarios and edge cases",
          "Perform integration testing with all connected systems"
        ]
      },
      {
        title: "Monitoring & Alerting Setup",
        description: "Implement comprehensive monitoring and alerting systems.",
        actions: [
          "Set up workflow execution monitoring and logging",
          "Configure alerts for failures, performance issues, and anomalies",
          "Implement performance metrics tracking and reporting",
          "Create dashboards for real-time workflow status monitoring",
          "Establish backup and recovery procedures"
        ]
      },
      {
        title: "Production Deployment & Optimization",
        description: "Deploy to production with proper change management and optimization.",
        actions: [
          "Execute phased rollout with pilot user groups",
          "Monitor performance and user feedback during initial deployment",
          "Optimize workflow performance based on production data",
          "Conduct user training and provide comprehensive documentation",
          "Establish ongoing maintenance and improvement processes"
        ]
      }
    ],
    examples: [
      {
        title: "Customer Onboarding Automation",
        description: "Complete customer onboarding workflow from signup to activation",
        results: "Reduced onboarding time from 5 days to 30 minutes, improved customer satisfaction by 40%, decreased support tickets by 60%"
      },
      {
        title: "Invoice Processing Automation",
        description: "End-to-end invoice processing from receipt to payment approval",
        results: "Processed 95% of invoices automatically, reduced processing time by 80%, improved accuracy to 99.5%"
      },
      {
        title: "Lead Qualification Pipeline",
        description: "Automated lead scoring, routing, and nurturing system",
        results: "Increased qualified lead conversion by 35%, reduced sales cycle by 25%, improved lead response time by 90%"
      }
    ],
    bestPractices: [
      "Start with simple workflows and gradually increase complexity",
      "Always implement comprehensive error handling and retry logic",
      "Use descriptive node names and add comments for complex logic",
      "Implement proper logging for troubleshooting and audit trails",
      "Regular testing in staging environment before production deployment",
      "Maintain detailed documentation and runbooks for operations team"
    ],
    resources: [
      { name: "n8n Documentation", url: "#" },
      { name: "Workflow Design Patterns", url: "#" },
      { name: "Integration Templates", url: "#" }
    ]
  },

  "Executive Dashboard Blueprint": {
    name: "Executive Dashboard Blueprint",
    description: "Template for executive reporting",
    template: "# Executive Dashboard\n## Key Metrics\n[Primary KPIs]\n## Performance Summary\n[5 bullet points]\n## Risks & Opportunities\n[Assessment]\n## Recommendations\n[Action items]\n## Next Steps\n[Timeline and owners]",
    category: "Business Intelligence",
    overview: "A comprehensive framework for creating executive-level dashboards that provide strategic insights, performance metrics, and actionable intelligence for senior leadership decision-making.",
    useCase: "Perfect for executives, board members, and senior managers who need at-a-glance visibility into business performance, strategic initiatives, and key decision points.",
    benefits: [
      "Provides real-time visibility into critical business metrics",
      "Enables data-driven decision making at the executive level",
      "Streamlines executive reporting and reduces preparation time by 70%",
      "Identifies risks and opportunities before they impact business",
      "Facilitates strategic alignment across leadership team"
    ],
    customization: [
      "Adapt KPI selection based on industry and business model",
      "Customize visualization types for different executive preferences",
      "Modify update frequency based on business velocity and needs",
      "Scale complexity based on organizational size and structure",
      "Integrate with existing BI tools and data sources"
    ],
    implementationSteps: [
      {
        title: "Strategic Metrics Identification",
        description: "Define the most critical metrics that drive executive decision-making.",
        actions: [
          "Conduct stakeholder interviews to identify key decision factors",
          "Map business objectives to measurable KPIs and success metrics",
          "Prioritize metrics based on impact and actionability",
          "Establish baseline measurements and target benchmarks",
          "Create metric definitions and calculation methodologies"
        ]
      },
      {
        title: "Data Architecture & Integration",
        description: "Build robust data infrastructure to support executive reporting needs.",
        actions: [
          "Identify and catalog all relevant data sources across the organization",
          "Design data integration and ETL processes for real-time updates",
          "Implement data quality controls and validation procedures",
          "Create data governance framework for accuracy and consistency",
          "Establish data security and access control protocols"
        ]
      },
      {
        title: "Dashboard Design & User Experience",
        description: "Create intuitive and visually compelling executive dashboard interfaces.",
        actions: [
          "Design executive-friendly layouts with clear visual hierarchy",
          "Implement interactive elements for drill-down capabilities",
          "Create mobile-responsive designs for executive accessibility",
          "Add contextual alerts and exception reporting features",
          "Build narrative elements that explain data insights and implications"
        ]
      },
      {
        title: "Automated Analysis & Insights",
        description: "Implement intelligent analysis capabilities that generate actionable insights.",
        actions: [
          "Deploy AI-powered trend detection and anomaly identification",
          "Create automated variance analysis and performance commentary",
          "Implement predictive analytics for forecasting and scenario planning",
          "Add comparative analysis against industry benchmarks",
          "Generate automated recommendations based on data patterns"
        ]
      },
      {
        title: "Distribution & Governance",
        description: "Establish systematic distribution and ongoing governance of executive reporting.",
        actions: [
          "Create automated distribution schedules for different stakeholder groups",
          "Implement version control and audit trails for data lineage",
          "Establish review cycles and continuous improvement processes",
          "Add feedback mechanisms for dashboard effectiveness",
          "Create training and adoption programs for executive users"
        ]
      }
    ],
    examples: [
      {
        title: "CEO Performance Dashboard",
        description: "Comprehensive view of company performance across all functions",
        results: "Reduced executive meeting preparation time by 50%, improved strategic decision speed by 40%"
      },
      {
        title: "Board Meeting Dashboard", 
        description: "Board-ready summary of financial, operational, and strategic metrics",
        results: "Enhanced board engagement with data-driven discussions, reduced reporting overhead by 60%"
      },
      {
        title: "Division Head Dashboard",
        description: "Departmental performance tracking with cross-functional dependencies",
        results: "Improved cross-departmental collaboration, increased goal achievement by 35%"
      }
    ],
    bestPractices: [
      "Focus on actionable metrics that drive decisions, not vanity metrics",
      "Use clear visual hierarchy with the most important information prominently displayed",
      "Provide context for all metrics including trends, targets, and benchmarks",
      "Implement real-time or near-real-time data updates for operational metrics",
      "Include narrative insights and recommendations, not just raw data",
      "Design for mobile accessibility since executives often view on mobile devices"
    ],
    resources: [
      { name: "Executive Reporting Best Practices", url: "#" },
      { name: "KPI Selection Framework", url: "#" },
      { name: "Dashboard Design Guidelines", url: "#" }
    ]
  },

  "Brand Voice Guide": {
    name: "Brand Voice Guide",
    description: "Template for maintaining brand consistency",
    template: "# Brand Voice Guide\n## Voice Characteristics\n[Personality traits]\n## Tone Guidelines\n[Situational tones]\n## Do's and Don'ts\n[Examples]\n## Templates\n[Reusable formats]\n## Quality Checks\n[Verification process]",
    category: "Branding",
    overview: "A comprehensive framework for establishing, documenting, and maintaining consistent brand voice across all communication channels and touchpoints. This guide ensures cohesive brand personality and messaging that resonates with target audiences.",
    useCase: "Essential for marketing teams, content creators, customer service representatives, and any team members who communicate on behalf of the brand across various channels and platforms.",
    benefits: [
      "Ensures consistent brand personality across all communications",
      "Reduces content creation time with clear guidelines and templates",
      "Improves brand recognition and customer trust through consistency",
      "Facilitates easier onboarding of new team members and agencies",
      "Enhances customer experience with cohesive messaging"
    ],
    customization: [
      "Adapt voice characteristics to match industry and target audience",
      "Customize tone variations for different communication contexts",
      "Modify examples to reflect specific product or service categories",
      "Scale complexity based on brand maturity and team size",
      "Integrate with existing brand guidelines and style manuals"
    ],
    implementationSteps: [
      {
        title: "Brand Personality Definition",
        description: "Establish core brand personality traits and communication principles.",
        actions: [
          "Conduct brand audit and competitive analysis for positioning",
          "Define 3-5 core personality traits that represent the brand",
          "Create brand persona with detailed character description",
          "Map personality traits to communication behaviors and language",
          "Validate brand personality with key stakeholders and customer research"
        ]
      },
      {
        title: "Voice Characteristics Development",
        description: "Translate brand personality into specific voice and language guidelines.",
        actions: [
          "Define vocabulary preferences and language style (formal/casual, technical/simple)",
          "Establish grammar and punctuation conventions",
          "Create guidelines for industry jargon and technical terminology usage",
          "Develop signature phrases and brand-specific language",
          "Set standards for humor, emotion, and personality expression"
        ]
      },
      {
        title: "Contextual Tone Guidelines",
        description: "Create tone variations for different situations and communication contexts.",
        actions: [
          "Map different communication scenarios (customer service, marketing, crisis)",
          "Define appropriate tone adjustments for each context",
          "Create tone examples for various emotional situations",
          "Establish escalation guidelines for sensitive or difficult communications",
          "Develop cultural and localization considerations for global brands"
        ]
      },
      {
        title: "Practical Application Tools",
        description: "Build templates, examples, and tools for consistent implementation.",
        actions: [
          "Create content templates for common communication types",
          "Develop before/after examples showing voice application",
          "Build decision trees for tone selection in different scenarios",
          "Create voice evaluation checklists and quality control measures",
          "Establish approval processes for brand-critical communications"
        ]
      },
      {
        title: "Training & Governance",
        description: "Implement training programs and ongoing governance for voice consistency.",
        actions: [
          "Develop comprehensive training materials and workshops",
          "Create certification programs for key communicators",
          "Establish regular auditing and feedback processes",
          "Build measurement systems for voice consistency across channels",
          "Create continuous improvement processes based on performance data"
        ]
      }
    ],
    examples: [
      {
        title: "Technology Startup Voice",
        description: "Friendly, innovative, and accessible voice for B2B SaaS company",
        results: "Increased brand recognition by 45%, improved customer satisfaction scores by 30%"
      },
      {
        title: "Financial Services Voice",
        description: "Trustworthy, professional, and empowering voice for financial advisor",
        results: "Enhanced client trust scores by 25%, increased referral rates by 40%"
      },
      {
        title: "E-commerce Retail Voice",
        description: "Energetic, helpful, and trend-aware voice for fashion retailer",
        results: "Boosted customer engagement by 50%, increased repeat purchase rate by 35%"
      }
    ],
    bestPractices: [
      "Start with clear brand strategy and customer personas before defining voice",
      "Use real examples and scenarios rather than abstract descriptions",
      "Regular training and reinforcement across all team members",
      "Consistent application across all touchpoints and channels",
      "Regular auditing and feedback to maintain voice quality",
      "Evolution and refinement based on market feedback and brand growth"
    ],
    resources: [
      { name: "Brand Voice Development Workshop", url: "#" },
      { name: "Content Style Guide Templates", url: "#" },
      { name: "Voice Consistency Audit Tools", url: "#" }
    ]
  }
};

interface BlueprintDetailModalProps {
  blueprint: Blueprint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlueprintDetailModal({ blueprint, isOpen, onClose }: BlueprintDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!blueprint) return null;

  const detailedBlueprint = blueprintDetails[blueprint.name];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {blueprint.name}
            <Badge variant="secondary">{blueprint.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        {detailedBlueprint ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Blueprint Overview</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{detailedBlueprint.overview}</p>
                
                <div className="bg-muted/30 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">Ideal Use Case</h4>
                  <p className="text-sm text-muted-foreground">{detailedBlueprint.useCase}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Key Benefits</h4>
                <div className="space-y-2">
                  {detailedBlueprint.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Customization Options</h4>
                <div className="space-y-2">
                  {detailedBlueprint.customization.map((option, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Wrench className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold">Implementation Steps</h3>
              {detailedBlueprint.implementationSteps.map((step, stepIndex) => (
                <div key={stepIndex} className="border rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">{step.title}</h4>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">Action Items:</h5>
                    {step.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-start gap-3 ml-4">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Best Practices</h4>
                <div className="space-y-2">
                  {detailedBlueprint.bestPractices.map((practice, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{practice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Real-World Examples</h3>
              <div className="grid gap-6">
                {detailedBlueprint.examples.map((example, index) => (
                  <div key={index} className="border rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-primary">{example.title}</h4>
                    <p className="text-muted-foreground">{example.description}</p>
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Results Achieved:</h5>
                      <p className="text-sm text-green-700 dark:text-green-400">{example.results}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="template" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Blueprint Template</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(detailedBlueprint.template)}
                >
                  {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Template'}
                </Button>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{detailedBlueprint.template}</pre>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to Use This Template:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Replace all bracketed placeholders with your specific information</li>
                  <li>• Customize sections based on your project requirements</li>
                  <li>• Add additional sections as needed for your use case</li>
                  <li>• Review and validate with stakeholders before implementation</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Additional Resources</h3>
              <div className="grid gap-3">
                {detailedBlueprint.resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <a href={resource.url} className="font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                      {resource.name}
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Detailed Guide Coming Soon</h3>
            <p className="text-muted-foreground">
              We're working on comprehensive implementation guides for this blueprint. 
              Check back soon for detailed instructions and examples!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}