import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileText, Code, Lightbulb, Target, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Blueprint = {
  name: string;
  description: string;
  template: string;
  category: string;
};

type DetailedBlueprint = Blueprint & {
  overview: string;
  useCase: string;
  benefits: string[];
  customization: {
    title: string;
    description: string;
    variables: string[];
  }[];
  implementationSteps: {
    step: string;
    description: string;
    actions: string[];
  }[];
  examples: {
    title: string;
    description: string;
    content: string;
  }[];
  bestPractices: string[];
  resources: { name: string; url: string; }[];
};

const blueprintDetails: Record<string, DetailedBlueprint> = {
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
      {
        title: "Business Objective Customization",
        description: "Adapt the blueprint to your specific business goals and processes",
        variables: [
          "[Business Process Name] - Replace with your specific process",
          "[ROI Metrics] - Define your success measurements",
          "[Stakeholder Groups] - List all affected departments",
          "[Current Pain Points] - Identify specific inefficiencies"
        ]
      },
      {
        title: "Technical Configuration",
        description: "Customize technical aspects based on your infrastructure",
        variables: [
          "[Integration Systems] - List your specific APIs and databases",
          "[Security Requirements] - Define authentication and compliance needs",
          "[Performance Criteria] - Set response time and throughput requirements",
          "[Monitoring Tools] - Specify your alerting and logging systems"
        ]
      },
      {
        title: "Deployment Strategy",
        description: "Tailor deployment approach to your organization's needs",
        variables: [
          "[Environment Names] - Customize dev/test/prod environment labels",
          "[User Groups] - Define access levels and permissions",
          "[Training Requirements] - Specify skill development needs",
          "[Success Metrics] - Set specific KPIs for your use case"
        ]
      }
    ],
    
    implementationSteps: [
      {
        step: "Business Analysis and Planning",
        description: "Thoroughly understand the business need and define success criteria",
        actions: [
          "Interview stakeholders to understand current process pain points",
          "Document the existing manual process with timing and resource requirements",
          "Define specific, measurable success criteria and ROI expectations",
          "Identify all systems and data sources that need integration",
          "Create a project timeline with milestones and deliverables"
        ]
      },
      {
        step: "Technical Architecture Design",
        description: "Design the workflow architecture with scalability and reliability in mind",
        actions: [
          "Map out the complete workflow logic with decision points and branches",
          "Design error handling strategies for each potential failure point",
          "Plan data transformation and validation requirements",
          "Define security and authentication requirements for all integrations",
          "Create performance optimization strategies including rate limiting and batching"
        ]
      },
      {
        step: "Development and Testing",
        description: "Build and thoroughly test the workflow in a controlled environment",
        actions: [
          "Set up development environment with all required integrations",
          "Build the workflow following the designed architecture",
          "Implement comprehensive error handling and logging",
          "Create test cases covering normal operations and edge cases",
          "Perform load testing to validate performance requirements"
        ]
      },
      {
        step: "Quality Assurance and Documentation",
        description: "Ensure the workflow meets quality standards and is properly documented",
        actions: [
          "Conduct thorough testing including integration and user acceptance tests",
          "Create comprehensive documentation including user guides and troubleshooting",
          "Set up monitoring and alerting for production deployment",
          "Validate security and compliance requirements",
          "Prepare training materials for end users"
        ]
      },
      {
        step: "Deployment and Adoption",
        description: "Deploy the workflow and ensure successful adoption by users",
        actions: [
          "Deploy to production environment with proper change management",
          "Conduct user training and provide ongoing support",
          "Monitor performance and user feedback closely",
          "Collect success metrics and validate ROI achievement",
          "Plan for continuous improvement and optimization"
        ]
      }
    ],
    
    examples: [
      {
        title: "Customer Service Automation Example",
        description: "How to apply the blueprint for customer support ticket automation",
        content: `# Customer Service Workflow Implementation

## Business Objective
Automate customer support ticket routing and initial response to reduce response time from 4 hours to 15 minutes and improve customer satisfaction scores by 25%.

## Process Analysis
**Current State:** Manual ticket review, categorization, and assignment taking 3-4 hours
**Pain Points:** Delayed responses, inconsistent categorization, manual workload
**Stakeholders:** Customer service team, IT support, management
**Data Sources:** Support system API, customer database, knowledge base

## Workflow Architecture
**Trigger:** Webhook from support system on new ticket creation
**Logic Flow:** 
1. Extract ticket content and customer information
2. AI-powered categorization and priority scoring
3. Route to appropriate specialist based on category and availability
4. Generate initial response using knowledge base
5. Send notifications to customer and agent

## Expected Outcomes
- 75% reduction in initial response time
- 90% accuracy in ticket categorization
- 40% reduction in manual workload for support agents`
      },
      {
        title: "Sales Lead Processing Example", 
        description: "Blueprint application for automated lead qualification and routing",
        content: `# Sales Lead Automation Implementation

## Business Objective
Automate lead qualification and routing to increase conversion rates by 30% and reduce lead response time to under 5 minutes.

## Process Analysis
**Current State:** Manual lead review and assignment taking 2-3 hours
**Pain Points:** Slow response times, inconsistent follow-up, leads getting lost
**Stakeholders:** Sales team, marketing, sales operations
**Data Sources:** CRM, marketing automation platform, lead scoring system

## Workflow Architecture
**Trigger:** New lead creation in CRM or form submission
**Logic Flow:**
1. Enrich lead data with external sources
2. Score lead based on predefined criteria
3. Route high-value leads to senior sales reps
4. Trigger personalized email sequences
5. Schedule follow-up tasks and reminders

## Expected Outcomes
- 95% of leads contacted within 5 minutes
- 30% increase in qualified lead conversion
- 50% reduction in manual lead processing time`
      }
    ],
    
    bestPractices: [
      "Always include comprehensive error handling with retry logic and graceful degradation",
      "Use environment variables for all sensitive configuration data and API keys",
      "Implement proper logging at each workflow step for debugging and audit trails",
      "Design workflows to be idempotent to prevent duplicate processing",
      "Include monitoring and alerting for critical workflow failures",
      "Use batch processing for high-volume operations to optimize performance",
      "Implement proper data validation at every input and transformation point",
      "Create rollback procedures for workflow changes in production",
      "Document all external dependencies and their failure scenarios",
      "Regular testing of backup and recovery procedures"
    ],
    
    resources: [
      { name: "n8n Documentation", url: "https://docs.n8n.io" },
      { name: "Workflow Best Practices Guide", url: "https://blog.n8n.io/workflow-best-practices" },
      { name: "n8n Community Forum", url: "https://community.n8n.io" },
      { name: "Enterprise Automation Patterns", url: "https://docs.n8n.io/enterprise" }
    ]
  },

  "Product Launch Blueprint": {
    name: "Product Launch Blueprint",
    description: "Complete template for product launches",
    template: "# Product Launch Brief\n## Narrative\n[Product story and positioning]\n## ICP Pain Points\n[Target customer problems]\n## Key Benefits\n1. [Benefit 1]\n2. [Benefit 2]\n3. [Benefit 3]\n## Messaging Pillars\n[Core messages]\n## Call-to-Action\n[Clear next steps]",
    category: "Marketing",
    
    overview: "A comprehensive framework for planning, executing, and measuring successful product launches. This blueprint ensures all critical elements are addressed from pre-launch strategy through post-launch optimization.",
    
    useCase: "Essential for product managers, marketing teams, and startup founders who need to coordinate complex product launches across multiple channels and stakeholder groups.",
    
    benefits: [
      "Structured approach increases launch success rates by 40%",
      "Clear timelines prevent critical tasks from being missed",
      "Coordinated messaging ensures consistent brand communication",
      "Built-in metrics tracking enables data-driven optimization",
      "Risk mitigation strategies prevent common launch failures",
      "Stakeholder alignment reduces internal friction and delays"
    ],
    
    customization: [
      {
        title: "Product and Market Customization",
        description: "Adapt the blueprint to your specific product and target market",
        variables: [
          "[Product Name] - Your specific product or feature name",
          "[Target Market] - Define your ideal customer profile",
          "[Competitive Advantage] - Your unique value proposition",
          "[Price Point] - Your pricing strategy and positioning"
        ]
      },
      {
        title: "Channel and Timeline Customization",
        description: "Customize launch channels and timeline based on your resources",
        variables: [
          "[Launch Channels] - Select your marketing and distribution channels",
          "[Launch Timeline] - Set specific dates and milestones",
          "[Budget Allocation] - Define spending across different activities",
          "[Team Responsibilities] - Assign specific roles and ownership"
        ]
      }
    ],
    
    implementationSteps: [
      {
        step: "Pre-Launch Strategy Development",
        description: "Develop comprehensive launch strategy and positioning",
        actions: [
          "Define product narrative and unique value proposition",
          "Research and validate target customer pain points",
          "Develop key messaging pillars and proof points",
          "Create competitive analysis and differentiation strategy",
          "Set launch goals and success metrics"
        ]
      },
      {
        step: "Go-to-Market Planning",
        description: "Plan all aspects of market entry and customer acquisition",
        actions: [
          "Develop multi-channel marketing strategy",
          "Create content calendar and asset production plan",
          "Plan PR and media outreach strategy",
          "Design customer onboarding and support processes",
          "Coordinate sales enablement and training"
        ]
      },
      {
        step: "Launch Execution",
        description: "Execute coordinated launch across all channels",
        actions: [
          "Deploy marketing campaigns across all selected channels",
          "Activate PR and media outreach campaigns",
          "Launch customer acquisition and onboarding flows",
          "Monitor early performance metrics and feedback",
          "Adjust tactics based on real-time performance data"
        ]
      }
    ],
    
    examples: [
      {
        title: "SaaS Feature Launch Example",
        description: "How to apply the blueprint for launching a new SaaS feature",
        content: `# AI Analytics Feature Launch

## Narrative
Introducing AI-powered analytics that turns your data into actionable insights automatically, helping businesses make faster, smarter decisions without requiring data science expertise.

## ICP Pain Points
- Manual data analysis taking weeks instead of hours
- Lack of data science expertise in-house
- Difficulty identifying actionable insights from complex data
- Delayed decision-making due to analysis bottlenecks

## Key Benefits
1. **Instant Insights**: Get actionable recommendations in minutes, not weeks
2. **No Expertise Required**: AI handles complex analysis automatically
3. **Predictive Capabilities**: Forecast trends and identify opportunities early

## Messaging Pillars
- "Turn any team member into a data analyst"
- "From data to decisions in minutes"
- "AI that speaks business, not just numbers"

## Call-to-Action
Start your 14-day free trial and see your first AI insights in under 5 minutes.`
      }
    ],
    
    bestPractices: [
      "Start planning at least 8-12 weeks before launch date",
      "Test all launch materials with real customers before going live",
      "Create contingency plans for potential technical or market issues",
      "Coordinate timing across all teams and external partners",
      "Monitor competitor activity and adjust positioning if needed",
      "Prepare customer support team for increased volume and new questions",
      "Set up proper analytics tracking before launch to capture all data",
      "Plan post-launch optimization sprints based on initial performance"
    ],
    
    resources: [
      { name: "Product Hunt Launch Guide", url: "https://blog.producthunt.com/how-to-launch-on-product-hunt" },
      { name: "First Round Review Launch Playbook", url: "https://review.firstround.com" },
      { name: "HubSpot Product Launch Kit", url: "https://blog.hubspot.com/marketing/product-launch-kit" }
    ]
  }
  // Add more detailed blueprints here...
};

interface BlueprintDetailModalProps {
  blueprint: Blueprint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlueprintDetailModal({ blueprint, isOpen, onClose }: BlueprintDetailModalProps) {
  const { toast } = useToast();

  if (!blueprint) return null;

  const detailed = blueprintDetails[blueprint.name];
  
  const copyTemplate = () => {
    navigator.clipboard.writeText(blueprint.template);
    toast({
      title: "Template copied!",
      description: "Blueprint template has been copied to your clipboard.",
    });
  };

  if (!detailed) {
    // Fallback for blueprints without detailed information
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {blueprint.name}
              <Badge variant="secondary">{blueprint.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <p className="text-muted-foreground">{blueprint.description}</p>
                <div className="text-center text-muted-foreground">
                  <p>Detailed implementation guide coming soon...</p>
                </div>
              </TabsContent>
              
              <TabsContent value="template" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button onClick={copyTemplate} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  {blueprint.template}
                </pre>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            {detailed.name}
            <Badge variant="secondary">{detailed.category}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh]">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 pr-4">
              {/* Overview */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Blueprint Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{detailed.overview}</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{detailed.useCase}</p>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {detailed.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customization */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customization Options</h3>
                <div className="space-y-4">
                  {detailed.customization.map((custom, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{custom.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{custom.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {custom.variables.map((variable, varIndex) => (
                          <Badge key={varIndex} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6 pr-4">
              <h3 className="font-semibold text-lg mb-4">Implementation Steps</h3>
              <div className="space-y-6">
                {detailed.implementationSteps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">
                      {index + 1}. {step.step}
                    </h4>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6 pr-4">
              <h3 className="font-semibold text-lg mb-4">Real-World Examples</h3>
              <div className="space-y-6">
                {detailed.examples.map((example, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-2">{example.title}</h4>
                    <p className="text-muted-foreground mb-4">{example.description}</p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                      {example.content}
                    </pre>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4 pr-4">
              <div className="flex items-center gap-2 mb-4">
                <Button onClick={copyTemplate} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Template
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {detailed.template}
              </pre>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6 pr-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">Best Practices</h3>
                <ul className="space-y-2">
                  {detailed.bestPractices.map((practice, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">Additional Resources</h3>
                <div className="space-y-2">
                  {detailed.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <span className="text-sm">{resource.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}