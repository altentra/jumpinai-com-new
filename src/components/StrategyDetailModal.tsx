import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, TrendingUp, Target, AlertTriangle, BookOpen } from "lucide-react";

type Strategy = {
  name: string;
  description: string;
  approach: string;
  category: string;
};

type DetailedStrategy = {
  name: string;
  description: string;
  approach: string;
  category: string;
  overview: string;
  objectives: string[];
  timeline: {
    phase: string;
    duration: string;
    deliverables: string[];
  }[];
  implementationPlan: {
    phase: string;
    description: string;
    keyActivities: string[];
    successCriteria: string[];
  }[];
  keyMetrics: {
    category: string;
    metrics: string[];
  }[];
  resources: { name: string; url: string; }[];
};

const strategyDetails: Record<string, DetailedStrategy> = {
  "AI-First Content Strategy": {
    name: "AI-First Content Strategy",
    description: "Leverage AI throughout the content lifecycle",
    approach: "Integrate AI tools at every stage: ideation with GPT-4, creation with specialized tools, optimization with analytics AI, and distribution with automation platforms.",
    category: "Content Marketing",
    overview: "Transform your content marketing by implementing AI-powered workflows that enhance creativity, improve efficiency, and deliver personalized experiences at scale. This strategy positions AI as the central enabler of content excellence.",
    objectives: [
      "Increase content production efficiency by 300% while maintaining quality",
      "Achieve personalization at scale for different audience segments",
      "Reduce content creation costs by 50% through automation",
      "Improve content engagement metrics by 75% through AI optimization",
      "Establish predictive content performance modeling",
      "Create scalable content workflows that support business growth"
    ],
    timeline: [
      {
        phase: "Foundation & Assessment",
        duration: "Months 1-2",
        deliverables: ["Content audit and gap analysis", "AI tool evaluation and selection", "Team skill assessment", "Content strategy framework"]
      },
      {
        phase: "Pilot Implementation",
        duration: "Months 3-4", 
        deliverables: ["AI-powered content workflows", "Initial content campaigns", "Performance measurement system", "Team training programs"]
      },
      {
        phase: "Scale & Optimization",
        duration: "Months 5-8",
        deliverables: ["Full workflow automation", "Advanced personalization", "Predictive analytics", "ROI measurement framework"]
      },
      {
        phase: "Innovation & Expansion",
        duration: "Months 9-12",
        deliverables: ["Advanced AI integration", "Cross-channel orchestration", "Thought leadership content", "Continuous optimization system"]
      }
    ],
    implementationPlan: [
      {
        phase: "Strategic Foundation Development",
        description: "Establish the strategic framework and infrastructure for AI-powered content operations.",
        keyActivities: [
          "Conduct comprehensive content audit and performance analysis",
          "Evaluate and select optimal AI tools for different content types",
          "Develop content strategy aligned with business objectives",
          "Create content governance framework and quality standards",
          "Establish content measurement and analytics infrastructure"
        ],
        successCriteria: [
          "Complete content inventory with performance benchmarks",
          "AI tool stack selected and configured",
          "Content strategy document approved by stakeholders",
          "Governance framework implemented and communicated"
        ]
      },
      {
        phase: "AI Workflow Implementation",
        description: "Deploy AI-powered workflows for content ideation, creation, and optimization.",
        keyActivities: [
          "Implement AI-powered content ideation and planning processes",
          "Deploy content creation workflows with quality control",
          "Set up automated content optimization and A/B testing",
          "Create content distribution and promotion automation",
          "Establish content performance monitoring and reporting"
        ],
        successCriteria: [
          "AI workflows operational for all content types",
          "Quality control processes validated and effective",
          "Automated optimization delivering measurable improvements",
          "Content distribution reaching target audiences efficiently"
        ]
      },
      {
        phase: "Personalization & Scale Optimization",
        description: "Implement advanced personalization and scale content operations efficiently.",
        keyActivities: [
          "Deploy dynamic content personalization systems",
          "Implement predictive content performance modeling",
          "Scale content production workflows across all channels",
          "Optimize resource allocation and cost efficiency",
          "Develop advanced analytics and insights capabilities"
        ],
        successCriteria: [
          "Personalization increasing engagement by target metrics",
          "Predictive models accurately forecasting performance",
          "Content production meeting scale requirements",
          "Cost per content piece reduced by target percentage"
        ]
      },
      {
        phase: "Innovation Integration & Future-Proofing",
        description: "Integrate cutting-edge AI innovations and prepare for future developments.",
        keyActivities: [
          "Implement emerging AI technologies and capabilities",
          "Develop thought leadership content strategy and execution",
          "Create innovation pipeline for continuous improvement",
          "Establish partnerships with AI technology providers",
          "Build organizational AI content expertise and culture"
        ],
        successCriteria: [
          "New AI technologies successfully integrated",
          "Thought leadership positioning achieved in target markets",
          "Innovation pipeline delivering continuous improvements",
          "Team capabilities enhanced and future-ready"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Production Efficiency",
        metrics: ["Content creation time per piece", "Cost per content asset", "Quality score consistency", "Workflow completion rates"]
      },
      {
        category: "Engagement & Performance",
        metrics: ["Content engagement rates", "Conversion attribution", "Social sharing metrics", "Content consumption patterns"]
      },
      {
        category: "Business Impact",
        metrics: ["Lead generation attribution", "Revenue impact from content", "Brand awareness lift", "Customer acquisition cost reduction"]
      },
      {
        category: "Operational Excellence",
        metrics: ["Process automation percentage", "Error reduction rates", "Team productivity improvements", "Technology ROI measurements"]
      }
    ],
    resources: [
      { name: "AI Content Tools Comparison", url: "#" },
      { name: "Content Strategy Frameworks", url: "#" },
      { name: "Performance Analytics Guide", url: "#" }
    ]
  },

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
        deliverables: ["Automation readiness assessment", "Process inventory and prioritization", "n8n infrastructure setup", "Governance framework design"]
      },
      {
        phase: "Center of Excellence Setup",
        duration: "Months 2-4",
        deliverables: ["CoE team establishment", "Training programs", "Best practices documentation", "Initial pilot workflows"]
      },
      {
        phase: "Scaled Implementation", 
        duration: "Months 4-10",
        deliverables: ["Priority workflow automation", "Cross-department integration", "Performance monitoring", "User adoption programs"]
      },
      {
        phase: "Optimization & Innovation",
        duration: "Months 10-12",
        deliverables: ["Advanced integrations", "AI-enhanced workflows", "Continuous improvement", "Cultural transformation"]
      }
    ],
    implementationPlan: [
      {
        phase: "Enterprise Assessment & Strategic Planning",
        description: "Comprehensively assess organizational readiness and create detailed automation strategy.",
        keyActivities: [
          "Conduct enterprise-wide process inventory and automation potential assessment",
          "Analyze current technology landscape and integration requirements",
          "Define automation priorities based on business impact and complexity",
          "Develop governance framework including security, compliance, and risk management",
          "Create detailed implementation roadmap with resource allocation"
        ],
        successCriteria: [
          "Complete process inventory with automation scoring completed",
          "Technology integration assessment and requirements documented",
          "Prioritized automation pipeline with business case validation",
          "Governance framework approved and ready for implementation"
        ]
      },
      {
        phase: "Center of Excellence Establishment",
        description: "Build internal capabilities and infrastructure for sustainable automation success.",
        keyActivities: [
          "Establish n8n Center of Excellence with dedicated team and resources",
          "Implement n8n infrastructure with proper security and scalability",
          "Develop comprehensive training programs for different skill levels",
          "Create automation standards, templates, and best practices documentation",
          "Launch pilot automation projects to validate approach and build expertise"
        ],
        successCriteria: [
          "CoE team operational with defined roles and responsibilities",
          "n8n infrastructure deployed and secured according to enterprise standards",
          "Training programs delivered with certified internal experts",
          "Pilot projects successful and demonstrating value"
        ]
      },
      {
        phase: "Scaled Workflow Deployment",
        description: "Deploy automation workflows across the enterprise with proper change management.",
        keyActivities: [
          "Implement high-priority workflows across all business functions",
          "Integrate workflows with existing enterprise systems and databases",
          "Deploy monitoring and alerting systems for operational excellence",
          "Execute change management and user adoption programs",
          "Establish performance measurement and optimization processes"
        ],
        successCriteria: [
          "Target number of workflows successfully deployed and operational",
          "Integration with enterprise systems completed and stable",
          "Monitoring systems providing comprehensive visibility",
          "User adoption rates meeting target thresholds"
        ]
      },
      {
        phase: "Innovation & Continuous Improvement",
        description: "Establish culture of innovation and continuous improvement in automation.",
        keyActivities: [
          "Implement advanced features including AI integration and predictive analytics",
          "Establish innovation pipeline for emerging automation opportunities",
          "Create community of practice for knowledge sharing and collaboration",
          "Develop automation metrics and ROI reporting frameworks",
          "Plan next phase expansion and capability enhancement"
        ],
        successCriteria: [
          "Advanced automation capabilities successfully deployed",
          "Innovation pipeline generating continuous improvement opportunities",
          "Strong automation community and culture established",
          "ROI metrics demonstrating business value achievement"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Operational Efficiency",
        metrics: ["Process automation percentage", "Manual task reduction time", "Error rate improvements", "Processing speed increases"]
      },
      {
        category: "Business Value",
        metrics: ["Cost savings realized", "Revenue impact from automation", "ROI on automation investments", "Productivity improvements"]
      },
      {
        category: "Technical Performance", 
        metrics: ["Workflow reliability rates", "System integration success", "Performance benchmarks", "Scalability metrics"]
      },
      {
        category: "Organizational Impact",
        metrics: ["User adoption rates", "Training completion rates", "Innovation pipeline value", "Employee satisfaction improvements"]
      }
    ],
    resources: [
      { name: "n8n Enterprise Guide", url: "#" },
      { name: "Automation ROI Calculator", url: "#" },
      { name: "Change Management Toolkit", url: "#" }
    ]
  },

  "Enterprise Digital Transformation": {
    name: "Enterprise Digital Transformation",
    description: "Comprehensive digital modernization strategy",
    approach: "Assess current state, define future vision, develop technology roadmap, implement change management, measure progress through KPIs, and ensure sustainable transformation across all business units.",
    category: "Digital Transformation",
    overview: "Lead enterprise-wide digital transformation that modernizes technology infrastructure, digitizes business processes, and creates competitive advantages through strategic technology adoption and organizational change management.",
    objectives: [
      "Modernize legacy systems and infrastructure within 24 months",
      "Digitize 80% of manual business processes",
      "Improve operational efficiency by 40% through technology adoption",
      "Enhance customer experience scores by 50%",
      "Build digital-first organizational culture and capabilities",
      "Establish data-driven decision-making across all functions"
    ],
    timeline: [
      {
        phase: "Assessment & Vision",
        duration: "Months 1-3",
        deliverables: ["Digital maturity assessment", "Future state vision", "Technology roadmap", "Change strategy"]
      },
      {
        phase: "Foundation Building",
        duration: "Months 4-9", 
        deliverables: ["Infrastructure modernization", "Core system implementations", "Process digitization", "Team capability building"]
      },
      {
        phase: "Transformation Acceleration",
        duration: "Months 10-18",
        deliverables: ["Advanced technology adoption", "Process optimization", "Customer experience enhancement", "Analytics implementation"]
      },
      {
        phase: "Innovation & Optimization",
        duration: "Months 19-24",
        deliverables: ["Emerging technology integration", "Continuous improvement", "Innovation culture", "Sustainability measures"]
      }
    ],
    implementationPlan: [
      {
        phase: "Strategic Assessment & Vision Development",
        description: "Comprehensive evaluation of current digital maturity and development of transformation vision.",
        keyActivities: [
          "Conduct enterprise digital maturity assessment across all functions",
          "Analyze competitive landscape and digital transformation benchmarks",
          "Define future state vision with clear digital transformation objectives",
          "Develop comprehensive technology roadmap with prioritized initiatives",
          "Create change management strategy and communication plan"
        ],
        successCriteria: [
          "Digital maturity baseline established with gap analysis completed",
          "Future state vision validated with stakeholder alignment",
          "Technology roadmap approved with budget and resource allocation",
          "Change management strategy ready for implementation"
        ]
      },
      {
        phase: "Infrastructure & Foundation Modernization",
        description: "Modernize core technology infrastructure and establish foundation for transformation.",
        keyActivities: [
          "Upgrade legacy systems and implement modern infrastructure",
          "Deploy cloud platforms and establish scalable architecture",
          "Implement cybersecurity framework and data governance",
          "Digitize core business processes and workflows",
          "Build internal digital capabilities through training and hiring"
        ],
        successCriteria: [
          "Infrastructure modernization completed on schedule and budget",
          "Core systems operational with improved performance",
          "Security and governance frameworks implemented",
          "Key processes digitized and optimized"
        ]
      },
      {
        phase: "Process Innovation & Customer Experience",
        description: "Transform business processes and enhance customer-facing digital experiences.",
        keyActivities: [
          "Implement advanced analytics and business intelligence platforms",
          "Deploy customer experience technologies and omnichannel platforms",
          "Automate business processes using AI and machine learning",
          "Create digital products and services for competitive advantage",
          "Establish performance monitoring and optimization capabilities"
        ],
        successCriteria: [
          "Analytics platforms delivering actionable insights",
          "Customer experience metrics showing significant improvement",
          "Process automation achieving efficiency targets",
          "Digital products contributing to revenue growth"
        ]
      },
      {
        phase: "Innovation Culture & Continuous Improvement",
        description: "Establish innovation culture and continuous improvement capabilities for sustained transformation.",
        keyActivities: [
          "Implement emerging technologies and innovation platforms",
          "Create center of excellence for continuous digital innovation",
          "Establish partnerships with technology vendors and startups",
          "Build organizational learning and adaptation capabilities",
          "Measure and communicate transformation success and ROI"
        ],
        successCriteria: [
          "Innovation culture established with measurable outcomes",
          "Emerging technologies successfully piloted and scaled",
          "Partnerships delivering value and competitive advantage",
          "Transformation ROI meeting or exceeding targets"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Technology Performance",
        metrics: ["System uptime and reliability", "Application performance", "Infrastructure scalability", "Security incident rates"]
      },
      {
        category: "Business Process Efficiency",
        metrics: ["Process automation percentage", "Cycle time reduction", "Error rate improvement", "Cost per transaction"]
      },
      {
        category: "Customer Experience",
        metrics: ["Customer satisfaction scores", "Digital engagement rates", "Self-service adoption", "Resolution time improvement"]
      },
      {
        category: "Organizational Change", 
        metrics: ["Digital skill advancement", "Change adoption rates", "Innovation pipeline value", "Employee engagement scores"]
      }
    ],
    resources: [
      { name: "Digital Transformation Framework", url: "#" },
      { name: "Technology Assessment Tools", url: "#" },
      { name: "Change Management Guide", url: "#" }
    ]
  }
};

interface StrategyDetailModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyDetailModal({ strategy, isOpen, onClose }: StrategyDetailModalProps) {
  if (!strategy) return null;

  const detailedStrategy = strategyDetails[strategy.name];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {strategy.name}
            <Badge variant="secondary">{strategy.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        {detailedStrategy ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Strategy Overview</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{detailedStrategy.overview}</p>
                
                <div className="bg-muted/30 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">Strategic Approach</h4>
                  <p className="text-sm text-muted-foreground">{detailedStrategy.approach}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Strategic Objectives</h4>
                <div className="space-y-3">
                  {detailedStrategy.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Implementation Timeline</h3>
              <div className="space-y-6">
                {detailedStrategy.timeline.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{phase.phase}</h4>
                        <p className="text-sm text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Key Deliverables:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {phase.deliverables.map((deliverable, delivIndex) => (
                          <div key={delivIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold">Detailed Implementation Plan</h3>
              {detailedStrategy.implementationPlan.map((phase, phaseIndex) => (
                <div key={phaseIndex} className="border rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">{phase.phase}</h4>
                    <p className="text-muted-foreground mb-4">{phase.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Key Activities:</h5>
                      <div className="space-y-2">
                        {phase.keyActivities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3">Success Criteria:</h5>
                      <div className="space-y-2">
                        {phase.successCriteria.map((criteria, critIndex) => (
                          <div key={critIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{criteria}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="metrics" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Key Performance Metrics</h3>
              <div className="grid gap-6">
                {detailedStrategy.keyMetrics.map((metricCategory, index) => (
                  <div key={index} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{metricCategory.category}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metricCategory.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-sm">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Strategic Resources</h3>
              <div className="grid gap-3">
                {detailedStrategy.resources.map((resource, index) => (
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
            <h3 className="text-lg font-semibold mb-2">Detailed Strategy Guide Coming Soon</h3>
            <p className="text-muted-foreground">
              We're developing comprehensive strategic implementation guides for this framework. 
              Check back soon for detailed planning and execution instructions!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}