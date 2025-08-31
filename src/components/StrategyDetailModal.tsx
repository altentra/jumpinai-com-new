import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Users, Calendar, CheckCircle, AlertCircle, Lightbulb, BarChart } from "lucide-react";

type Strategy = {
  name: string;
  description: string;
  approach: string;
  category: string;
};

type DetailedStrategy = Strategy & {
  overview: string;
  objectives: string[];
  timeline: {
    phase: string;
    duration: string;
    activities: string[];
    deliverables: string[];
  }[];
  keyMetrics: {
    metric: string;
    target: string;
    measurement: string;
  }[];
  implementation: {
    step: string;
    description: string;
    actions: string[];
    risks: string[];
    mitigation: string[];
  }[];
  successFactors: string[];
  challenges: { challenge: string; solution: string; }[];
  resources: { name: string; url: string; }[];
  caseStudy?: {
    company: string;
    situation: string;
    implementation: string;
    results: string;
  };
};

const strategyDetails: Record<string, DetailedStrategy> = {
  "n8n Enterprise Automation Strategy": {
    name: "n8n Enterprise Automation Strategy",
    description: "Comprehensive workflow automation transformation",
    approach: "Conduct automation readiness assessment, map all business processes for automation potential, design n8n center of excellence, implement governance framework, create training programs, deploy workflows in phases, and establish continuous improvement culture.",
    category: "Process Automation",
    
    overview: "Transform your organization into an automation-first enterprise using n8n as the central platform. This strategy provides a systematic approach to identifying, prioritizing, and implementing workflow automations that deliver measurable business value while building internal capabilities and governance.",
    
    objectives: [
      "Reduce manual processing time by 70% across key business processes",
      "Establish n8n center of excellence with certified internal experts",
      "Implement 50+ automated workflows within first 12 months",
      "Achieve ROI of 300% on automation investments within 18 months",
      "Create governance framework ensuring security and compliance",
      "Build automation-first culture with continuous improvement mindset"
    ],
    
    timeline: [
      {
        phase: "Foundation & Assessment",
        duration: "Months 1-2",
        activities: [
          "Conduct comprehensive process audit across all departments",
          "Assess current technology stack and integration capabilities",
          "Identify quick wins and high-impact automation opportunities",
          "Define success metrics and ROI measurement framework",
          "Establish governance structure and approval processes"
        ],
        deliverables: [
          "Process automation opportunity matrix",
          "Technology integration assessment",
          "Governance framework document",
          "ROI calculation methodology",
          "Executive sponsorship and budget approval"
        ]
      },
      {
        phase: "Center of Excellence Setup",
        duration: "Months 2-3",
        activities: [
          "Set up n8n infrastructure (cloud or self-hosted)",
          "Configure development, testing, and production environments",
          "Establish security protocols and access controls",
          "Create standard templates and reusable components",
          "Train initial team of automation specialists"
        ],
        deliverables: [
          "Fully configured n8n platform",
          "Security and compliance documentation",
          "Standard operating procedures",
          "Template library and best practices guide",
          "Certified automation team (3-5 specialists)"
        ]
      },
      {
        phase: "Pilot Implementation",
        duration: "Months 3-5",
        activities: [
          "Implement 5-10 high-impact pilot workflows",
          "Gather user feedback and optimize workflows",
          "Measure performance and ROI of pilot projects",
          "Refine governance and approval processes",
          "Create case studies and success stories"
        ],
        deliverables: [
          "10 fully deployed and optimized workflows",
          "Performance metrics and ROI documentation",
          "User feedback and satisfaction surveys",
          "Refined governance framework",
          "Internal case studies and testimonials"
        ]
      },
      {
        phase: "Scaled Deployment",
        duration: "Months 6-12",
        activities: [
          "Deploy workflows across all identified use cases",
          "Train department champions and power users",
          "Implement monitoring and maintenance processes",
          "Establish continuous improvement protocols",
          "Create self-service capabilities for simple automations"
        ],
        deliverables: [
          "50+ production workflows deployed",
          "Trained user community (20+ champions)",
          "Monitoring and alerting systems",
          "Self-service automation portal",
          "Comprehensive training materials and documentation"
        ]
      },
      {
        phase: "Optimization & Growth",
        duration: "Ongoing",
        activities: [
          "Continuously identify new automation opportunities",
          "Optimize existing workflows based on performance data",
          "Expand integration capabilities and use cases",
          "Share knowledge and best practices across organization",
          "Evaluate and implement new n8n features and capabilities"
        ],
        deliverables: [
          "Quarterly automation opportunity assessments",
          "Optimization reports and performance improvements",
          "Expanded integration ecosystem",
          "Knowledge sharing sessions and documentation",
          "Annual technology roadmap updates"
        ]
      }
    ],
    
    keyMetrics: [
      {
        metric: "Process Automation Coverage",
        target: "70% of repetitive tasks automated",
        measurement: "Percentage of identified manual processes successfully automated"
      },
      {
        metric: "Time Savings",
        target: "500+ hours saved per month",
        measurement: "Total hours saved across all automated workflows"
      },
      {
        metric: "Error Reduction",
        target: "90% reduction in process errors",
        measurement: "Comparison of error rates before and after automation"
      },
      {
        metric: "ROI Achievement",
        target: "300% ROI within 18 months",
        measurement: "Total savings and value created vs. total investment"
      },
      {
        metric: "User Adoption",
        target: "80% user satisfaction score",
        measurement: "Regular user surveys and feedback collection"
      },
      {
        metric: "Workflow Reliability",
        target: "99.5% uptime for critical workflows",
        measurement: "Monitoring and alerting system metrics"
      }
    ],
    
    implementation: [
      {
        step: "Automation Readiness Assessment",
        description: "Comprehensive evaluation of organizational readiness for large-scale automation",
        actions: [
          "Conduct stakeholder interviews across all departments",
          "Map existing business processes and identify bottlenecks",
          "Assess current technology infrastructure and integration points",
          "Evaluate team capabilities and training needs",
          "Define automation criteria and prioritization framework"
        ],
        risks: [
          "Resistance to change from existing staff",
          "Incomplete process documentation",
          "Technical integration challenges"
        ],
        mitigation: [
          "Early stakeholder engagement and communication",
          "Dedicated process documentation sprints",
          "Technical proof-of-concepts for complex integrations"
        ]
      },
      {
        step: "Governance Framework Development",
        description: "Establish comprehensive governance to ensure secure, compliant, and scalable automation",
        actions: [
          "Create automation request and approval workflow",
          "Define security and compliance requirements",
          "Establish development and deployment standards",
          "Create monitoring and maintenance protocols",
          "Define roles and responsibilities for automation team"
        ],
        risks: [
          "Overly complex approval processes slowing adoption",
          "Security vulnerabilities in automated workflows",
          "Lack of proper change management"
        ],
        mitigation: [
          "Streamlined approval for low-risk automations",
          "Comprehensive security review checklist",
          "Robust testing and deployment procedures"
        ]
      },
      {
        step: "Platform Implementation and Configuration",
        description: "Set up robust n8n infrastructure with proper environments and security",
        actions: [
          "Deploy n8n in chosen environment (cloud/self-hosted)",
          "Configure multiple environments (dev/test/prod)",
          "Implement security controls and access management",
          "Set up monitoring, logging, and alerting systems",
          "Create backup and disaster recovery procedures"
        ],
        risks: [
          "Performance issues with high-volume workflows",
          "Security breaches due to misconfigurations",
          "Data loss or corruption"
        ],
        mitigation: [
          "Load testing and performance optimization",
          "Security audit and penetration testing",
          "Regular backups and recovery testing"
        ]
      },
      {
        step: "Team Training and Capability Building",
        description: "Build internal expertise and create sustainable automation capabilities",
        actions: [
          "Train core team on n8n development and best practices",
          "Create certification program for automation specialists",
          "Develop internal training materials and documentation",
          "Establish mentorship and knowledge sharing programs",
          "Build community of practice for continuous learning"
        ],
        risks: [
          "Key team members leaving the organization",
          "Inconsistent skill levels across team members",
          "Lack of advanced expertise for complex use cases"
        ],
        mitigation: [
          "Cross-training and knowledge documentation",
          "Structured training programs with assessments",
          "Partnerships with n8n experts and consultants"
        ]
      },
      {
        step: "Phased Workflow Deployment",
        description: "Strategic rollout of automated workflows prioritizing high-impact, low-risk opportunities",
        actions: [
          "Start with simple, high-value workflows for quick wins",
          "Gradually increase complexity and scope of automations",
          "Gather user feedback and optimize workflows continuously",
          "Scale successful patterns across similar use cases",
          "Build library of reusable components and templates"
        ],
        risks: [
          "User resistance to workflow changes",
          "Performance issues with complex workflows",
          "Integration failures with external systems"
        ],
        mitigation: [
          "User training and change management support",
          "Thorough testing and gradual rollout",
          "Robust error handling and fallback procedures"
        ]
      }
    ],
    
    successFactors: [
      "Strong executive sponsorship and visible leadership support",
      "Clear communication of benefits and ROI to all stakeholders",
      "Investment in proper training and skill development",
      "Robust governance framework balancing speed and control",
      "Focus on user experience and change management",
      "Continuous measurement and optimization of results",
      "Building automation-first mindset across the organization",
      "Proper technical infrastructure and support systems"
    ],
    
    challenges: [
      {
        challenge: "Resistance to change from existing staff",
        solution: "Implement comprehensive change management program with clear communication of benefits, training, and support for affected employees"
      },
      {
        challenge: "Complex integration requirements with legacy systems",
        solution: "Phase integration approach starting with API-enabled systems, develop custom connectors where needed, consider middleware solutions"
      },
      {
        challenge: "Maintaining security and compliance in automated workflows",
        solution: "Implement security-by-design principles, regular audits, compliance checkpoints, and automated security testing"
      },
      {
        challenge: "Scaling automation capabilities across large organization",
        solution: "Create center of excellence model, train departmental champions, develop self-service capabilities, and standardize approaches"
      }
    ],
    
    resources: [
      { name: "n8n Documentation", url: "https://docs.n8n.io" },
      { name: "Process Automation Best Practices", url: "https://blog.n8n.io/automation-best-practices" },
      { name: "Enterprise Automation Guide", url: "https://n8n.io/enterprise" },
      { name: "Automation ROI Calculator", url: "https://tools.n8n.io/roi-calculator" }
    ],
    
    caseStudy: {
      company: "TechCorp Inc.",
      situation: "A 500-employee technology company struggling with manual processes consuming 40% of employee time, leading to delayed customer responses and operational inefficiencies.",
      implementation: "Implemented comprehensive n8n automation strategy over 12 months, starting with customer service and sales processes, then expanding to HR, finance, and operations. Built internal team of 5 certified automation specialists.",
      results: "Achieved 65% reduction in manual processing time, 300% ROI within 15 months, improved customer satisfaction by 35%, and reduced operational errors by 80%. Successfully automated 45 business processes."
    }
  },

  "AI-First Content Strategy": {
    name: "AI-First Content Strategy",
    description: "Leverage AI throughout the content lifecycle",
    approach: "Integrate AI tools at every stage: ideation with GPT-4, creation with specialized tools, optimization with analytics AI, and distribution with automation platforms.",
    category: "Content Marketing",
    
    overview: "Transform your content marketing by embedding AI at every stage of the content lifecycle. This strategy maximizes efficiency, consistency, and performance while maintaining human creativity and strategic oversight.",
    
    objectives: [
      "Increase content production capacity by 300% without additional headcount",
      "Improve content performance metrics by 40% through AI optimization",
      "Reduce content creation time from weeks to days",
      "Achieve consistent brand voice across all content channels",
      "Scale personalization capabilities for different audience segments",
      "Establish data-driven content optimization processes"
    ],
    
    timeline: [
      {
        phase: "Strategy Foundation",
        duration: "Month 1",
        activities: [
          "Audit current content processes and performance",
          "Define AI integration points and tool requirements",
          "Establish content quality standards and brand guidelines",
          "Set up measurement framework and success metrics",
          "Train team on AI tools and workflows"
        ],
        deliverables: [
          "Content audit report",
          "AI tool stack selection",
          "Brand voice and style guide",
          "Performance measurement dashboard",
          "Team training program"
        ]
      },
      {
        phase: "Implementation & Testing",
        duration: "Months 2-3",
        activities: [
          "Implement AI-assisted content ideation processes",
          "Deploy content creation workflows with AI tools",
          "Set up automated optimization and A/B testing",
          "Create content distribution automation",
          "Test and refine all workflows"
        ],
        deliverables: [
          "AI-powered content calendar",
          "Automated content creation workflows",
          "Performance optimization system",
          "Distribution automation setup",
          "Workflow documentation and SOPs"
        ]
      },
      {
        phase: "Scale & Optimize",
        duration: "Months 4-6",
        activities: [
          "Scale content production across all channels",
          "Implement advanced personalization capabilities",
          "Optimize workflows based on performance data",
          "Expand AI capabilities and integrations",
          "Build content performance analytics"
        ],
        deliverables: [
          "Scaled content production system",
          "Personalization engine",
          "Optimized workflows and processes",
          "Advanced AI integrations",
          "Comprehensive analytics dashboard"
        ]
      }
    ],
    
    keyMetrics: [
      {
        metric: "Content Volume",
        target: "300% increase in published content",
        measurement: "Number of pieces published per month"
      },
      {
        metric: "Engagement Rate",
        target: "40% improvement in average engagement",
        measurement: "Likes, shares, comments across all channels"
      },
      {
        metric: "Production Speed",
        target: "75% reduction in time-to-publish",
        measurement: "Days from ideation to publication"
      },
      {
        metric: "Content Performance",
        target: "50% increase in conversion rates",
        measurement: "Content-driven leads and sales"
      }
    ],
    
    implementation: [
      {
        step: "AI-Powered Content Ideation",
        description: "Use AI to generate content ideas based on trends, audience data, and business objectives",
        actions: [
          "Set up trend monitoring with AI analysis",
          "Create audience persona-based content suggestions",
          "Implement competitive content gap analysis",
          "Generate content calendar with AI recommendations",
          "Establish content scoring and prioritization"
        ],
        risks: [
          "AI-generated ideas lacking creativity or relevance",
          "Over-reliance on trending topics"
        ],
        mitigation: [
          "Human review and creativity overlay",
          "Balance trending with evergreen content"
        ]
      }
    ],
    
    successFactors: [
      "Clear brand guidelines for AI content generation",
      "Human oversight and creative direction",
      "Continuous testing and optimization",
      "Integration with existing content workflows",
      "Team training and adoption support"
    ],
    
    challenges: [
      {
        challenge: "Maintaining brand voice consistency with AI",
        solution: "Develop detailed brand voice prompts and regular quality reviews"
      },
      {
        challenge: "Balancing AI efficiency with human creativity",
        solution: "Use AI for research and drafts, humans for strategy and refinement"
      }
    ],
    
    resources: [
      { name: "Content Marketing Institute", url: "https://contentmarketinginstitute.com" },
      { name: "AI Content Strategy Guide", url: "https://blog.hubspot.com/marketing/ai-content" }
    ]
  }
  // Add more detailed strategies here...
};

interface StrategyDetailModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyDetailModal({ strategy, isOpen, onClose }: StrategyDetailModalProps) {
  if (!strategy) return null;

  const detailed = strategyDetails[strategy.name];
  
  if (!detailed) {
    // Fallback for strategies without detailed information
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {strategy.name}
              <Badge variant="secondary">{strategy.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              <p className="text-muted-foreground">{strategy.description}</p>
              
              <div>
                <h3 className="font-semibold mb-3">Strategic Approach:</h3>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{strategy.approach}</p>
              </div>
              
              <div className="text-center text-muted-foreground">
                <p>Detailed implementation guide coming soon...</p>
              </div>
            </div>
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
            <Target className="h-6 w-6" />
            {detailed.name}
            <Badge variant="secondary">{detailed.category}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh]">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 pr-4">
              {/* Strategic Overview */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Strategic Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed">{detailed.overview}</p>
              </div>

              {/* Strategic Objectives */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Strategic Objectives</h3>
                <ul className="space-y-2">
                  {detailed.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Success Factors */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Critical Success Factors</h3>
                <ul className="space-y-2">
                  {detailed.successFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Case Study */}
              {detailed.caseStudy && (
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">Success Story: {detailed.caseStudy.company}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Situation:</h4>
                      <p className="text-sm text-muted-foreground">{detailed.caseStudy.situation}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Implementation:</h4>
                      <p className="text-sm text-muted-foreground">{detailed.caseStudy.implementation}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Results:</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">{detailed.caseStudy.results}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 pr-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Implementation Timeline
              </h3>
              <div className="space-y-6">
                {detailed.timeline.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg text-primary">{phase.phase}</h4>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Key Activities:</h5>
                        <ul className="space-y-1">
                          {phase.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Deliverables:</h5>
                        <ul className="space-y-1">
                          {phase.deliverables.map((deliverable, delIndex) => (
                            <li key={delIndex} className="flex items-start gap-2">
                              <Target className="h-3 w-3 text-blue-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm">{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6 pr-4">
              <h3 className="font-semibold text-lg mb-4">Detailed Implementation Guide</h3>
              <div className="space-y-8">
                {detailed.implementation.map((step, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">
                      {index + 1}. {step.step}
                    </h4>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Actions:</h5>
                        <ul className="space-y-2">
                          {step.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Risks:</h5>
                        <ul className="space-y-2">
                          {step.risks.map((risk, riskIndex) => (
                            <li key={riskIndex} className="flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-red-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Mitigation:</h5>
                        <ul className="space-y-2">
                          {step.mitigation.map((mitigation, mitIndex) => (
                            <li key={mitIndex} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm">{mitigation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Challenges and Solutions */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Common Challenges & Solutions</h3>
                <div className="space-y-4">
                  {detailed.challenges.map((item, index) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-4">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200">{item.challenge}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{item.solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6 pr-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Key Performance Metrics
              </h3>
              <div className="space-y-6">
                {detailed.keyMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{metric.metric}</h4>
                      <Badge variant="outline">{metric.target}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{metric.measurement}</p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress Tracking</span>
                        <span>Target: {metric.target}</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6 pr-4">
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
                      <TrendingUp className="h-4 w-4" />
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