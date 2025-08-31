import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Users, Wrench, AlertTriangle, BookOpen } from "lucide-react";

type Workflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
};

type DetailedWorkflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
  overview: string;
  prerequisites: string[];
  timeEstimate: string;
  difficulty: string;
  tools: string[];
  detailedSteps: {
    title: string;
    description: string;
    actions: string[];
  }[];
  variations: {
    name: string;
    description: string;
  }[];
  troubleshooting: {
    issue: string;
    solution: string;
  }[];
  resources: { name: string; url: string; }[];
};

const workflowDetails: Record<string, DetailedWorkflow> = {
  "Content Creation Workflow": {
    name: "Content Creation Workflow",
    description: "Systematic approach to creating high-quality content",
    steps: ["Define role, audience, constraints, and deliverable length.", "Ask for a structured outline first; iterate on sections.", "Request variations and finalize with style and brand guardrails."],
    category: "Content",
    overview: "This comprehensive workflow transforms ideas into compelling content through systematic AI collaboration. Perfect for marketers, content creators, and business professionals who need consistent, high-quality output.",
    prerequisites: ["Access to AI writing tools (ChatGPT, Claude, etc.)", "Clear understanding of target audience", "Brand guidelines and style preferences", "Content objectives and KPIs"],
    timeEstimate: "30-90 minutes per piece",
    difficulty: "Beginner",
    tools: ["ChatGPT/Claude/Gemini", "Content calendar", "Brand style guide", "Analytics tools"],
    detailedSteps: [
      {
        title: "Step 1: Content Foundation Setup",
        description: "Establish the fundamental parameters that will guide your entire content creation process.",
        actions: [
          "Define your role context: 'Act as a [specific role] with expertise in [domain]'",
          "Identify target audience: demographics, pain points, preferred communication style",
          "Set clear constraints: word count, format requirements, publication timeline",
          "Establish success metrics: engagement goals, conversion targets, brand alignment"
        ]
      },
      {
        title: "Step 2: Strategic Outline Development",
        description: "Create a structured framework that ensures comprehensive coverage and logical flow.",
        actions: [
          "Request a detailed outline with main sections and subsections",
          "Iterate on structure based on audience journey and content objectives",
          "Validate outline against SEO requirements and keyword strategy", 
          "Confirm logical flow and ensure all key points are covered"
        ]
      },
      {
        title: "Step 3: Content Creation & Iteration",
        description: "Generate the actual content with multiple variations and refinements.",
        actions: [
          "Create initial content draft following the approved outline",
          "Generate 2-3 variations of key sections for testing and optimization",
          "Apply brand voice guidelines and style consistency checks",
          "Optimize for readability, engagement, and conversion goals"
        ]
      },
      {
        title: "Step 4: Quality Assurance & Finalization",
        description: "Ensure content meets all requirements and brand standards before publication.",
        actions: [
          "Conduct thorough review for accuracy, tone, and brand alignment",
          "Verify all facts, statistics, and claims with reliable sources",
          "Optimize for SEO with appropriate keywords and meta descriptions",
          "Prepare final version with calls-to-action and distribution strategy"
        ]
      }
    ],
    variations: [
      { name: "Blog Post Variation", description: "Optimized for long-form educational content with SEO focus" },
      { name: "Social Media Variation", description: "Adapted for platform-specific content with engagement optimization" },
      { name: "Email Campaign Variation", description: "Tailored for email marketing with personalization and conversion focus" }
    ],
    troubleshooting: [
      { issue: "Content lacks originality", solution: "Add more specific context about your unique perspective, include personal examples, and request multiple angles on the same topic" },
      { issue: "AI output is too generic", solution: "Provide more detailed audience information, include competitor analysis, and specify exact tone and style requirements" },
      { issue: "Content doesn't match brand voice", solution: "Include 3-5 examples of your existing content, create a detailed brand voice document, and iterate with feedback" }
    ],
    resources: [
      { name: "Content Marketing Guide", url: "#" },
      { name: "Brand Voice Templates", url: "#" },
      { name: "SEO Best Practices", url: "#" }
    ]
  },

  "Document Analysis Workflow": {
    name: "Document Analysis Workflow",
    description: "Process for analyzing and summarizing documents",
    steps: ["Upload/reference source docs; ask for structured SOP.", "Iterate to add owners/SLAs; request ambiguity list.", "Export final SOP with version and change log."],
    category: "Analysis",
    overview: "A systematic approach to transforming complex documents into actionable insights and structured procedures. Essential for legal review, policy analysis, and knowledge extraction.",
    prerequisites: ["Document access and upload capability", "Clear analysis objectives", "Stakeholder identification", "Output format requirements"],
    timeEstimate: "45-120 minutes per document",
    difficulty: "Intermediate",
    tools: ["AI document analysis tools", "OCR software", "Collaboration platforms", "Version control systems"],
    detailedSteps: [
      {
        title: "Step 1: Document Ingestion & Initial Analysis",
        description: "Upload and perform initial assessment of the document structure and content.",
        actions: [
          "Upload or reference source documents with proper security protocols",
          "Perform initial document structure analysis and content mapping",
          "Identify key sections, stakeholders, and decision points",
          "Extract metadata, dates, and version information for tracking"
        ]
      },
      {
        title: "Step 2: Structured Content Extraction",
        description: "Convert document content into organized, actionable information.",
        actions: [
          "Request structured SOP format with clear sections and hierarchy",
          "Extract key processes, procedures, and business rules",
          "Identify dependencies, prerequisites, and success criteria",
          "Create summary sections with executive overview and key takeaways"
        ]
      },
      {
        title: "Step 3: Stakeholder & Accountability Mapping",
        description: "Add ownership structure and service level agreements to extracted content.",
        actions: [
          "Identify and assign process owners for each section or procedure",
          "Define Service Level Agreements (SLAs) and performance metrics",
          "Add approval workflows and escalation procedures",
          "Create responsibility matrices (RACI) for complex processes"
        ]
      },
      {
        title: "Step 4: Quality Assurance & Finalization",
        description: "Ensure accuracy, completeness, and usability of the final output.",
        actions: [
          "Generate comprehensive ambiguity list highlighting unclear areas",
          "Validate extracted information against source documents",
          "Create final SOP with proper versioning and change management",
          "Export in required formats with distribution and maintenance plans"
        ]
      }
    ],
    variations: [
      { name: "Legal Document Analysis", description: "Specialized for contracts, compliance documents, and legal texts" },
      { name: "Technical Documentation Review", description: "Optimized for technical manuals, specifications, and procedures" },
      { name: "Policy Document Extraction", description: "Focused on organizational policies, guidelines, and governance documents" }
    ],
    troubleshooting: [
      { issue: "Poor document quality or formatting", solution: "Use OCR preprocessing, manual cleanup, or request better quality source documents" },
      { issue: "Complex multi-section documents", solution: "Break into smaller sections, analyze incrementally, and maintain cross-references" },
      { issue: "Ambiguous or contradictory content", solution: "Flag all ambiguities, seek clarification from stakeholders, and document assumptions" }
    ],
    resources: [
      { name: "Document Analysis Templates", url: "#" },
      { name: "SOP Creation Guidelines", url: "#" },
      { name: "Process Mapping Tools", url: "#" }
    ]
  },

  "Executive Reporting Workflow": {
    name: "Executive Reporting Workflow", 
    description: "Create executive-ready reports from data",
    steps: ["Provide table/context; request bullet executive summary.", "Probe on anomalies; ask for 3 hypotheses with tests.", "Finalize with risks, opportunities, and next steps."],
    category: "Business Intelligence",
    overview: "Transform raw data and complex analysis into concise, actionable executive reports that drive strategic decision-making and organizational alignment.",
    prerequisites: ["Access to relevant data sources", "Understanding of business context", "Executive audience insights", "Strategic objectives clarity"],
    timeEstimate: "60-180 minutes per report",
    difficulty: "Intermediate",
    tools: ["Business intelligence platforms", "Data visualization tools", "Statistical analysis software", "Executive presentation templates"],
    detailedSteps: [
      {
        title: "Step 1: Data Contextualization & Executive Summary",
        description: "Transform raw data into executive-level insights with proper business context.",
        actions: [
          "Provide comprehensive data tables with proper context and methodology",
          "Request structured executive summary with key findings in bullet format",
          "Highlight the most critical 3-5 insights that require executive attention",
          "Include performance against established KPIs and benchmarks"
        ]
      },
      {
        title: "Step 2: Anomaly Investigation & Hypothesis Development",
        description: "Deep-dive into data anomalies and develop testable hypotheses for unusual patterns.",
        actions: [
          "Identify and probe significant variances, outliers, and unexpected trends",
          "Generate 3 testable hypotheses for each major anomaly or insight",
          "Design verification tests and validation methods for each hypothesis",
          "Prioritize investigations based on potential business impact and feasibility"
        ]
      },
      {
        title: "Step 3: Strategic Risk & Opportunity Assessment",
        description: "Evaluate implications and develop actionable recommendations for executive decision-making.",
        actions: [
          "Conduct comprehensive risk analysis with likelihood and impact assessment",
          "Identify strategic opportunities with market timing and resource requirements",
          "Develop scenario planning with best/worst/most likely case projections",
          "Quantify potential financial impact of identified risks and opportunities"
        ]
      },
      {
        title: "Step 4: Action Planning & Next Steps",
        description: "Create concrete action plan with clear accountability and timeline for implementation.",
        actions: [
          "Define specific next steps with assigned owners and realistic timelines",
          "Establish success metrics and monitoring protocols for recommended actions",
          "Create executive decision framework with clear options and trade-offs", 
          "Schedule follow-up reviews and progress checkpoints"
        ]
      }
    ],
    variations: [
      { name: "Financial Performance Report", description: "Focused on financial metrics, variance analysis, and fiscal performance" },
      { name: "Operational Dashboard Report", description: "Operational KPIs, efficiency metrics, and process performance analysis" },
      { name: "Market Intelligence Report", description: "Competitive analysis, market trends, and strategic positioning insights" }
    ],
    troubleshooting: [
      { issue: "Data quality or completeness issues", solution: "Clearly document data limitations, provide confidence intervals, and recommend data improvement initiatives" },
      { issue: "Too much technical detail for executives", solution: "Use executive summary format, focus on implications rather than methodology, provide technical appendix" },
      { issue: "Conflicting or unclear insights", solution: "Present multiple scenarios, highlight uncertainties, and provide decision frameworks for ambiguous situations" }
    ],
    resources: [
      { name: "Executive Report Templates", url: "#" },
      { name: "Data Visualization Best Practices", url: "#" },
      { name: "Strategic Analysis Frameworks", url: "#" }
    ]
  },

  "Research Workflow": {
    name: "Research Workflow",
    description: "Comprehensive research with citations",
    steps: ["Ask for current, cited sources; set timeframe.", "Request a pros/cons table and action checklist.", "Deliver an executive brief plus 3 tweet‑length summaries."],
    category: "Research",
    overview: "A systematic approach to conducting thorough research that delivers credible, actionable insights with proper attribution and multiple output formats for different audiences.",
    prerequisites: ["Access to research databases and sources", "Clear research objectives", "Target audience definition", "Timeline and scope parameters"],
    timeEstimate: "2-8 hours depending on scope",
    difficulty: "Intermediate",
    tools: ["Academic databases", "Web research tools", "Citation management", "Content synthesis platforms"],
    detailedSteps: [
      {
        title: "Step 1: Research Scoping & Source Identification", 
        description: "Define research parameters and identify current, credible sources with proper citations.",
        actions: [
          "Establish clear research questions and success criteria",
          "Set specific timeframe constraints for source currency (typically 1-3 years)",
          "Identify and access appropriate databases, journals, and expert sources",
          "Create initial source list with proper citation format and credibility assessment"
        ]
      },
      {
        title: "Step 2: Comprehensive Analysis & Synthesis",
        description: "Conduct thorough analysis and create structured comparison frameworks.",
        actions: [
          "Extract key findings, methodologies, and conclusions from each source",
          "Create detailed pros/cons analysis table with weighted criteria",
          "Develop comprehensive action checklist with prioritized recommendations", 
          "Cross-reference findings to identify consensus, conflicts, and gaps"
        ]
      },
      {
        title: "Step 3: Multi-Format Output Creation",
        description: "Transform research into multiple formats optimized for different stakeholder needs.",
        actions: [
          "Develop comprehensive executive brief with methodology and full findings",
          "Create 3 tweet-length summaries highlighting key insights for social sharing",
          "Include complete bibliography with accessible links and source quality ratings",
          "Add visual summaries, infographics, or data visualizations where appropriate"
        ]
      },
      {
        title: "Step 4: Quality Assurance & Distribution Strategy",
        description: "Validate findings and prepare for effective dissemination across channels.",
        actions: [
          "Conduct peer review and fact-checking of all claims and citations",
          "Verify all links, sources, and data accuracy before distribution",
          "Create distribution strategy tailored to different audience segments",
          "Establish update schedule and monitoring for ongoing developments"
        ]
      }
    ],
    variations: [
      { name: "Academic Research Synthesis", description: "Peer-reviewed academic sources with rigorous methodology focus" },
      { name: "Market Research Analysis", description: "Industry reports, market data, and competitive intelligence gathering" },
      { name: "Policy Research Brief", description: "Government sources, policy documents, and regulatory analysis" }
    ],
    troubleshooting: [
      { issue: "Limited access to premium sources", solution: "Utilize institutional access, open-access alternatives, and government/NGO publications" },
      { issue: "Conflicting information across sources", solution: "Document all perspectives, analyze source credibility, and present balanced view with uncertainty noted" },
      { issue: "Information overload or scope creep", solution: "Return to original research questions, create clear inclusion/exclusion criteria, and set firm boundaries" }
    ],
    resources: [
      { name: "Research Methodology Guide", url: "#" },
      { name: "Citation and Source Evaluation", url: "#" },
      { name: "Research Synthesis Templates", url: "#" }
    ]
  },

  "n8n AI Content Generation Pipeline": {
    name: "n8n AI Content Generation Pipeline",
    description: "Enterprise-scale content automation with multiple AI models",
    steps: ["Set up content brief intake via forms or API with validation rules", "Route requests through n8n based on content type and complexity", "Orchestrate multiple AI models (GPT-5, Claude, Gemini) for content creation", "Implement quality control with AI-powered review and human approval", "Distribute content across platforms with analytics tracking", "Create feedback loops for continuous pipeline optimization"],
    category: "AI Content Automation",
    overview: "This advanced automation pipeline revolutionizes content creation by orchestrating multiple AI models through n8n workflows. Perfect for enterprises managing high-volume content production with consistent quality standards.",
    prerequisites: ["n8n Pro subscription with AI integrations", "API access to multiple AI services", "Content management system", "Analytics platform integration", "Content approval workflow"],
    timeEstimate: "2-4 weeks implementation",
    difficulty: "Advanced", 
    tools: ["n8n Pro", "OpenAI API", "Claude API", "Google Gemini", "Content CMS", "Analytics tools"],
    detailedSteps: [
      {
        title: "Step 1: Content Request System Setup",
        description: "Build the intake system that captures content requirements and validates requests.",
        actions: [
          "Create n8n webhook trigger for content requests from forms or API",
          "Set up data validation nodes to ensure required fields are present",
          "Implement content type classification (blog, social, email, etc.)",
          "Add priority scoring based on urgency and content type",
          "Create database storage for request tracking and audit trails"
        ]
      },
      {
        title: "Step 2: AI Model Selection Logic", 
        description: "Implement intelligent routing to the most appropriate AI model based on content requirements.",
        actions: [
          "Build conditional logic for AI model selection based on content type",
          "Configure GPT-4 for creative and long-form content",
          "Route technical content to Claude for accuracy and depth",
          "Use Gemini for data analysis and research-heavy content",
          "Implement fallback logic if primary AI service is unavailable",
          "Add cost optimization rules to balance quality and budget"
        ]
      },
      {
        title: "Step 3: Content Generation Orchestration",
        description: "Execute the content creation process with multiple AI models working in coordination.",
        actions: [
          "Trigger primary AI model with optimized prompts and context",
          "Generate multiple content variations for A/B testing",
          "Implement secondary AI review for quality assessment",
          "Add fact-checking nodes using search APIs or knowledge bases", 
          "Create content enhancement workflows for SEO optimization",
          "Generate metadata, tags, and categorization automatically"
        ]
      },
      {
        title: "Step 4: Quality Control & Approval Workflow",
        description: "Implement automated quality checks and human approval processes.",
        actions: [
          "Run AI-powered quality scoring based on brand guidelines",
          "Check for plagiarism and originality using specialized APIs",
          "Validate SEO requirements and readability scores",
          "Route content through appropriate approval chains",
          "Send notifications to reviewers with editing suggestions",
          "Track approval times and bottlenecks for optimization"
        ]
      },
      {
        title: "Step 5: Multi-Platform Distribution",
        description: "Automatically distribute approved content across multiple channels and platforms.",
        actions: [
          "Format content for different platforms (WordPress, social media, email)",
          "Schedule publication based on optimal timing algorithms",
          "Generate platform-specific variations (Twitter threads, LinkedIn articles)",
          "Add tracking parameters for analytics and attribution",
          "Trigger cross-platform promotion workflows",
          "Update content calendars and stakeholder notifications"
        ]
      },
      {
        title: "Step 6: Performance Analytics & Optimization",
        description: "Continuously monitor content performance and optimize the pipeline.",
        actions: [
          "Collect performance data from all distribution channels",
          "Analyze engagement patterns and content effectiveness",
          "Generate automated reports for content teams and executives",
          "Identify high-performing content patterns for future use",
          "Optimize AI prompts based on performance data",
          "Update model selection algorithms based on success metrics"
        ]
      }
    ],
    variations: [
      { name: "Blog Content Pipeline", description: "Specialized for long-form educational and thought leadership content" },
      { name: "Social Media Content Factory", description: "High-volume social content production with platform optimization" },
      { name: "Email Marketing Automation", description: "Personalized email content generation with segmentation" }
    ],
    troubleshooting: [
      { issue: "AI model selection not optimal", solution: "Analyze content performance by model, adjust selection criteria, implement A/B testing for model performance" },
      { issue: "Quality control bottlenecks", solution: "Implement parallel review processes, add automated pre-screening, optimize approval workflows" },
      { issue: "High API costs", solution: "Implement intelligent caching, optimize prompt efficiency, add cost monitoring and budget controls" }
    ],
    resources: [
      { name: "n8n AI Integrations Guide", url: "#" },
      { name: "Content Automation Best Practices", url: "#" },
      { name: "Multi-AI Orchestration Patterns", url: "#" }
    ]
  }
};

interface WorkflowDetailModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowDetailModal({ workflow, isOpen, onClose }: WorkflowDetailModalProps) {
  if (!workflow) return null;

  const detailedWorkflow = workflowDetails[workflow.name];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {workflow.name}
            <Badge variant="secondary">{workflow.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        {detailedWorkflow ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Workflow Overview</h3>
                <p className="text-muted-foreground leading-relaxed">{detailedWorkflow.overview}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Time Estimate</p>
                    <p className="text-sm text-muted-foreground">{detailedWorkflow.timeEstimate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Difficulty</p>
                    <p className="text-sm text-muted-foreground">{detailedWorkflow.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Primary Tools</p>
                    <p className="text-sm text-muted-foreground">{detailedWorkflow.tools.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prerequisites" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Prerequisites & Requirements</h3>
              <div className="space-y-3">
                {detailedWorkflow.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{prereq}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Required Tools & Platforms</h4>
                <div className="grid grid-cols-2 gap-2">
                  {detailedWorkflow.tools.map((tool, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="text-sm">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="steps" className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold">Detailed Implementation Steps</h3>
              {detailedWorkflow.detailedSteps.map((step, stepIndex) => (
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
            </TabsContent>

            <TabsContent value="variations" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Workflow Variations</h3>
              <div className="grid gap-4">
                {detailedWorkflow.variations.map((variation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{variation.name}</h4>
                    <p className="text-sm text-muted-foreground">{variation.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="troubleshooting" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Common Issues & Solutions</h3>
              <div className="space-y-4">
                {detailedWorkflow.troubleshooting.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-red-700 dark:text-red-400">Issue: {item.issue}</h4>
                        <p className="text-sm text-muted-foreground"><strong>Solution:</strong> {item.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Additional Resources</h3>
              <div className="grid gap-3">
                {detailedWorkflow.resources.map((resource, index) => (
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
              We're working on comprehensive step-by-step guides for this workflow. 
              Check back soon for detailed implementation instructions!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}