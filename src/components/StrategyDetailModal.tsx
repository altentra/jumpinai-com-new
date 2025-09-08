import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, TrendingUp, Target, AlertTriangle, BookOpen } from "lucide-react";

type Strategy = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  approach: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
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
  // Text Content Strategies
  "Content-First Growth": {
    name: "Content-First Growth",
    description: "Systematic approach to building business growth through valuable content creation",
    approach: "Create valuable, educational content that addresses customer pain points, optimized for search and social sharing, with clear conversion paths to turn readers into leads and customers",
    category: "Growth Marketing",
    overview: "Transform your business growth by positioning content as the primary driver of customer acquisition, engagement, and retention. This strategy focuses on creating high-value content that naturally attracts your ideal customers and guides them through the buyer's journey.",
    objectives: [
      "Increase organic website traffic by 200% through strategic content creation",
      "Generate 50% of qualified leads through content marketing initiatives", 
      "Establish thought leadership positioning in target industry verticals",
      "Reduce customer acquisition cost by 35% through organic content performance",
      "Build a content engine that scales with business growth",
      "Create evergreen content assets that compound value over time"
    ],
    timeline: [
      {
        phase: "Content Foundation & Strategy",
        duration: "Months 1-2",
        deliverables: ["Content audit and competitive analysis", "Buyer persona research and journey mapping", "Content strategy framework", "Editorial calendar and workflow"]
      },
      {
        phase: "Content Production & Optimization",
        duration: "Months 3-6", 
        deliverables: ["High-quality content creation", "SEO optimization implementation", "Content distribution channels", "Performance tracking systems"]
      },
      {
        phase: "Scale & Amplification",
        duration: "Months 7-9",
        deliverables: ["Content repurposing strategies", "Community building initiatives", "Thought leadership campaigns", "Content partnership development"]
      },
      {
        phase: "Optimization & Innovation",
        duration: "Months 10-12",
        deliverables: ["Advanced content personalization", "Interactive content experiences", "Content automation workflows", "ROI optimization framework"]
      }
    ],
    implementationPlan: [
      {
        phase: "Strategic Foundation Development",
        description: "Establish the content strategy foundation with research, planning, and framework development.",
        keyActivities: [
          "Conduct comprehensive content audit and gap analysis",
          "Research target audience needs, pain points, and content preferences",
          "Develop buyer personas and map content to customer journey stages",
          "Create content strategy framework aligned with business objectives",
          "Establish content governance, style guides, and quality standards"
        ],
        successCriteria: [
          "Content audit completed with actionable insights",
          "Detailed buyer personas validated with customer research",
          "Content strategy framework approved by stakeholders",
          "Editorial guidelines and workflows established"
        ]
      },
      {
        phase: "Content Creation & Distribution Systems",
        description: "Implement systematic content creation processes and multi-channel distribution strategies.",
        keyActivities: [
          "Develop content creation workflows and editorial calendars",
          "Create high-value educational and thought leadership content",
          "Optimize content for search engines and user experience",
          "Implement multi-channel distribution and promotion strategies",
          "Establish content performance measurement and analytics"
        ],
        successCriteria: [
          "Consistent content publishing schedule maintained",
          "SEO-optimized content ranking for target keywords",
          "Multi-channel distribution reaching target audiences",
          "Content performance metrics showing positive trends"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Traffic & Visibility",
        metrics: ["Organic website traffic growth", "Search engine rankings", "Brand mention volume", "Content reach and impressions"]
      },
      {
        category: "Engagement & Quality",
        metrics: ["Content engagement rates", "Time on page/session duration", "Social shares and comments", "Content consumption depth"]
      }
    ],
    resources: [
      { name: "Content Strategy Playbook", url: "#" },
      { name: "SEO Optimization Guide", url: "#" },
      { name: "Content Performance Analytics", url: "#" }
    ]
  },

  "SEO-Driven Strategy": {
    name: "SEO-Driven Strategy",
    description: "Long-term strategy for building organic search traffic and brand visibility",
    approach: "Comprehensive keyword research, technical SEO optimization, content cluster creation, and authority building through high-quality backlinks and thought leadership content",
    category: "Search Marketing",
    overview: "Build sustainable organic growth through strategic search engine optimization that targets high-value keywords, creates comprehensive content clusters, and establishes domain authority for long-term competitive advantage.",
    objectives: [
      "Achieve first page rankings for 50+ high-value target keywords",
      "Increase organic search traffic by 300% within 12 months",
      "Build domain authority score above industry benchmarks",
      "Capture 80% of relevant search visibility in target market"
    ],
    timeline: [
      {
        phase: "Technical Foundation & Research",
        duration: "Months 1-2",
        deliverables: ["Technical SEO audit and fixes", "Comprehensive keyword research", "Competitor analysis", "Content gap identification"]
      },
      {
        phase: "Content Strategy & Creation", 
        duration: "Months 3-6",
        deliverables: ["Topic cluster development", "High-quality content creation", "On-page optimization", "Internal linking strategy"]
      }
    ],
    implementationPlan: [
      {
        phase: "Technical SEO Foundation",
        description: "Establish solid technical foundation and conduct comprehensive SEO research.",
        keyActivities: [
          "Perform complete technical SEO audit and implement critical fixes",
          "Conduct extensive keyword research and competitive analysis",
          "Optimize website architecture, speed, and mobile responsiveness"
        ],
        successCriteria: [
          "All technical SEO issues resolved and site performance optimized",
          "Comprehensive keyword strategy with priority targets identified"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Search Performance",
        metrics: ["Keyword ranking positions", "Organic search traffic", "Click-through rates", "Search impression share"]
      }
    ],
    resources: [
      { name: "Technical SEO Checklist", url: "#" },
      { name: "Keyword Research Toolkit", url: "#" }
    ]
  },

  "AI-Powered Content Strategy": {
    name: "AI-Powered Content Strategy",
    description: "Revolutionary approach to content creation using advanced AI tools and automation",
    approach: "Leverage GPT-4, Claude, and specialized AI tools for content ideation, creation, optimization, and distribution with human oversight for quality control",
    category: "AI Content Marketing",
    overview: "Transform content creation through strategic AI integration that amplifies human creativity, accelerates production timelines, and enables personalization at scale while maintaining brand voice and quality standards.",
    objectives: [
      "Increase content production speed by 500% while maintaining quality standards",
      "Achieve personalization at scale for different audience segments",
      "Reduce content creation costs by 60% through AI automation"
    ],
    timeline: [
      {
        phase: "AI Tool Selection & Setup",
        duration: "Months 1-2",
        deliverables: ["AI tool evaluation and selection", "Workflow integration setup", "Team training programs"]
      }
    ],
    implementationPlan: [
      {
        phase: "AI Infrastructure & Team Preparation",
        description: "Set up AI tools and prepare team for AI-enhanced content creation workflows.",
        keyActivities: [
          "Evaluate and select optimal AI tools for different content types and purposes",
          "Integrate AI tools with existing content management and workflow systems"
        ],
        successCriteria: [
          "AI tool stack fully operational and integrated with existing systems"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Production Efficiency",
        metrics: ["Content creation speed improvement", "Cost per content piece reduction"]
      }
    ],
    resources: [
      { name: "AI Content Tools Guide", url: "#" }
    ]
  },

  // Visual/Image Strategies
  "Visual Brand Identity System": {
    name: "Visual Brand Identity System",
    description: "Comprehensive visual branding strategy using AI-powered design tools",
    approach: "Develop brand guidelines, create visual asset libraries using AI tools like Midjourney and DALL-E, establish design systems, and automate visual content production",
    category: "Brand Design",
    overview: "Create a comprehensive visual identity system that ensures brand consistency across all touchpoints while leveraging AI tools to scale visual content production and maintain design excellence.",
    objectives: [
      "Establish consistent visual brand identity across all customer touchpoints",
      "Reduce visual content production time by 70% through AI automation"
    ],
    timeline: [
      {
        phase: "Brand Research & Strategy",
        duration: "Months 1-2",
        deliverables: ["Brand audit and competitive analysis", "Visual identity strategy"]
      }
    ],
    implementationPlan: [
      {
        phase: "Strategic Visual Foundation",
        description: "Research and develop the strategic foundation for visual brand identity.",
        keyActivities: [
          "Conduct comprehensive brand audit and visual competitive analysis",
          "Define brand personality, values, and visual positioning strategy"
        ],
        successCriteria: [
          "Brand audit completed with actionable visual insights"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Brand Recognition",
        metrics: ["Brand awareness lift", "Visual recognition scores"]
      }
    ],
    resources: [
      { name: "AI Design Tools Comparison", url: "#" }
    ]
  },

  "Social Media Visual Strategy": {
    name: "Social Media Visual Strategy", 
    description: "Strategic approach to creating engaging visual content for social media platforms",
    approach: "Platform-specific visual content calendars, AI-assisted graphic design workflows, user-generated content campaigns, and performance-driven visual optimization",
    category: "Social Media Marketing",
    overview: "Develop a comprehensive social media visual strategy that creates platform-optimized content, drives engagement through compelling visuals, and builds strong brand presence across all social channels.",
    objectives: [
      "Increase social media engagement rates by 150% through optimized visual content",
      "Achieve viral content creation with regular high-performing posts"
    ],
    timeline: [
      {
        phase: "Platform Analysis & Strategy",
        duration: "Months 1-2",
        deliverables: ["Social media audit and competitor analysis", "Platform-specific content strategies"]
      }
    ],
    implementationPlan: [
      {
        phase: "Social Media Visual Foundation",
        description: "Analyze current social media presence and develop platform-specific visual strategies.",
        keyActivities: [
          "Conduct comprehensive social media audit and competitive visual analysis",
          "Research platform-specific visual content preferences and algorithm factors"
        ],
        successCriteria: [
          "Social media audit completed with actionable visual insights"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Engagement Performance",
        metrics: ["Post engagement rates", "Share and save rates"]
      }
    ],
    resources: [
      { name: "Platform Visual Guidelines", url: "#" }
    ]
  },

  // Video Strategies
  "AI-Enhanced Video Marketing": {
    name: "AI-Enhanced Video Marketing",
    description: "Comprehensive video content strategy leveraging AI for production, editing, and optimization",
    approach: "Use AI video generation tools, automated editing workflows, synthetic media creation, performance analytics, and multi-platform optimization strategies",
    category: "Video Marketing",
    overview: "Revolutionize video marketing through AI-powered production workflows that enable high-quality video content creation at scale while dramatically reducing production costs and time investment.",
    objectives: [
      "Create professional video content at 10x speed with AI assistance",
      "Reduce video production costs by 75% through automation",
      "Achieve higher engagement rates through AI-optimized content"
    ],
    timeline: [
      {
        phase: "Video Strategy & Tool Setup",
        duration: "Months 1-2",
        deliverables: ["Video content strategy", "AI tool integration", "Production workflow design"]
      }
    ],
    implementationPlan: [
      {
        phase: "AI Video Infrastructure Setup",
        description: "Establish AI-powered video production capabilities and workflows.",
        keyActivities: [
          "Evaluate and integrate AI video generation and editing tools",
          "Develop automated video production workflows"
        ],
        successCriteria: [
          "AI video tools operational and producing quality content"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Production Metrics",
        metrics: ["Video creation speed", "Production cost reduction"]
      }
    ],
    resources: [
      { name: "AI Video Tools Guide", url: "#" }
    ]
  },

  "Educational Video Systems": {
    name: "Educational Video Systems",
    description: "Systematic approach to creating educational and training video content using AI tools",
    approach: "Develop video curricula, implement AI-assisted script writing and video generation, create interactive elements, and establish performance measurement systems",
    category: "Educational Technology",
    overview: "Build comprehensive educational video systems that improve learning outcomes while reducing production complexity through AI-assisted content creation and optimization.",
    objectives: [
      "Create engaging educational content that improves learning outcomes",
      "Reduce video production time by 70% through AI assistance"
    ],
    timeline: [
      {
        phase: "Curriculum Development",
        duration: "Months 1-3",
        deliverables: ["Learning objectives mapping", "Video curriculum design", "AI workflow setup"]
      }
    ],
    implementationPlan: [
      {
        phase: "Educational Content Framework",
        description: "Develop systematic approach to educational video content creation.",
        keyActivities: [
          "Map learning objectives to video content requirements",
          "Design comprehensive curriculum structure"
        ],
        successCriteria: [
          "Educational framework validated with learning outcome metrics"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Learning Effectiveness",
        metrics: ["Knowledge retention rates", "Engagement completion rates"]
      }
    ],
    resources: [
      { name: "Educational Video Best Practices", url: "#" }
    ]
  },

  // Audio Strategies
  "Podcast Empire Strategy": {
    name: "Podcast Empire Strategy",
    description: "Comprehensive podcasting strategy for thought leadership and audience building",
    approach: "Content planning, AI-assisted editing and transcription, multi-platform distribution, audience growth tactics, and revenue optimization strategies",
    category: "Podcast Marketing",
    overview: "Build a powerful podcast presence that establishes thought leadership, grows engaged audiences, and creates multiple revenue streams through strategic content and distribution optimization.",
    objectives: [
      "Launch industry-leading podcast with engaged audience growth",
      "Establish thought leadership positioning through consistent value delivery"
    ],
    timeline: [
      {
        phase: "Podcast Strategy & Setup",
        duration: "Months 1-2",
        deliverables: ["Content strategy", "Production setup", "Distribution plan"]
      }
    ],
    implementationPlan: [
      {
        phase: "Podcast Foundation Development",
        description: "Establish podcast strategy, production capabilities, and distribution framework.",
        keyActivities: [
          "Develop comprehensive podcast content strategy and format",
          "Set up professional audio production and editing workflows"
        ],
        successCriteria: [
          "Podcast strategy validated with target audience research"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Audience Growth",
        metrics: ["Download growth rates", "Subscriber acquisition"]
      }
    ],
    resources: [
      { name: "Podcast Production Guide", url: "#" }
    ]
  },

  "Voice Technology Integration": {
    name: "Voice Technology Integration",
    description: "Strategic implementation of voice AI and audio technologies in business operations",
    approach: "Voice assistant development, audio processing workflows, speech recognition systems, and voice user interface design optimization",
    category: "Voice Technology",
    overview: "Integrate cutting-edge voice technologies into business operations to enhance customer experiences and create innovative voice-powered solutions.",
    objectives: [
      "Implement voice interfaces that improve customer experience",
      "Reduce operational costs through voice automation"
    ],
    timeline: [
      {
        phase: "Voice Strategy Development",
        duration: "Months 1-3",
        deliverables: ["Voice technology assessment", "Implementation roadmap", "Prototype development"]
      }
    ],
    implementationPlan: [
      {
        phase: "Voice Technology Assessment",
        description: "Evaluate voice technology opportunities and develop implementation strategy.",
        keyActivities: [
          "Assess current business processes for voice automation opportunities",
          "Evaluate voice AI platforms and development frameworks"
        ],
        successCriteria: [
          "Voice technology strategy validated with business case development"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Implementation Success",
        metrics: ["Voice interface adoption rates", "User satisfaction scores"]
      }
    ],
    resources: [
      { name: "Voice Technology Platforms", url: "#" }
    ]
  },

  // Web/App Development Strategies
  "Product-Led Growth Strategy": {
    name: "Product-Led Growth Strategy",
    description: "Growth strategy where the product itself drives user acquisition, expansion, and retention",
    approach: "Optimize product for viral sharing, create self-service onboarding, implement usage-based expansion opportunities, and use in-product messaging to drive upgrades and referrals",
    category: "Growth Strategy",
    overview: "Build sustainable growth by making your product the primary driver of customer acquisition, expansion, and retention through strategic product optimization and user experience design.",
    objectives: [
      "Achieve sustainable growth with lower customer acquisition costs",
      "Increase user activation and retention rates through product optimization"
    ],
    timeline: [
      {
        phase: "Product Analysis & Strategy",
        duration: "Months 1-2",
        deliverables: ["Product audit", "Growth strategy framework", "Optimization roadmap"]
      }
    ],
    implementationPlan: [
      {
        phase: "Product Growth Foundation",
        description: "Analyze current product and develop growth-oriented optimization strategy.",
        keyActivities: [
          "Conduct comprehensive product growth audit and user journey analysis",
          "Identify key growth levers and optimization opportunities"
        ],
        successCriteria: [
          "Product growth strategy validated with user research and data analysis"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Growth Performance",
        metrics: ["User activation rates", "Viral coefficient", "Customer lifetime value"]
      }
    ],
    resources: [
      { name: "Product-Led Growth Playbook", url: "#" }
    ]
  },

  "AI-First Development Strategy": {
    name: "AI-First Development Strategy",
    description: "Revolutionary approach to software development integrating AI throughout the entire development lifecycle",
    approach: "Implement AI coding assistants, automated testing frameworks, intelligent deployment pipelines, and AI-powered user experience optimization",
    category: "Development Innovation",
    overview: "Transform software development processes by integrating AI tools and methodologies throughout the entire development lifecycle to accelerate delivery and improve quality.",
    objectives: [
      "Accelerate development cycles by 50% through AI assistance",
      "Improve code quality and reduce bugs through AI-powered testing"
    ],
    timeline: [
      {
        phase: "AI Development Setup",
        duration: "Months 1-3",
        deliverables: ["AI tool integration", "Workflow optimization", "Team training"]
      }
    ],
    implementationPlan: [
      {
        phase: "AI Development Infrastructure",
        description: "Integrate AI tools and establish AI-enhanced development workflows.",
        keyActivities: [
          "Implement AI coding assistants and development tools",
          "Establish automated testing and quality assurance frameworks"
        ],
        successCriteria: [
          "AI development tools operational and improving team productivity"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Development Efficiency",
        metrics: ["Development cycle time", "Code quality scores", "Bug reduction rates"]
      }
    ],
    resources: [
      { name: "AI Development Tools Guide", url: "#" }
    ]
  },

  // Workflow/AI Agents Strategies  
  "Enterprise Automation Transformation": {
    name: "Enterprise Automation Transformation",
    description: "Comprehensive strategy for implementing AI agents and workflow automation across the enterprise",
    approach: "Deploy AI agents for customer service, automate workflow orchestration, implement intelligent decision systems, and create self-improving process optimization",
    category: "Process Automation",
    overview: "Transform enterprise operations through comprehensive automation that reduces manual processes, improves accuracy, and creates intelligent systems that continuously optimize performance.",
    objectives: [
      "Reduce manual processes by 60% through intelligent automation",
      "Improve operational accuracy and reduce human error"
    ],
    timeline: [
      {
        phase: "Automation Assessment",
        duration: "Months 1-3",
        deliverables: ["Process audit", "Automation roadmap", "Technology selection"]
      }
    ],
    implementationPlan: [
      {
        phase: "Enterprise Automation Foundation",
        description: "Assess current processes and develop comprehensive automation strategy.",
        keyActivities: [
          "Conduct enterprise-wide process inventory and automation assessment",
          "Develop prioritized automation roadmap with ROI projections"
        ],
        successCriteria: [
          "Automation strategy approved with clear implementation priorities"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Automation Success",
        metrics: ["Process automation percentage", "Error reduction rates", "ROI on automation investments"]
      }
    ],
    resources: [
      { name: "Enterprise Automation Guide", url: "#" }
    ]
  },

  "AI Agent Ecosystem Strategy": {
    name: "AI Agent Ecosystem Strategy",
    description: "Advanced strategy for building interconnected AI agents that work together to solve complex business challenges",
    approach: "Design multi-agent systems, implement agent communication protocols, create learning and adaptation mechanisms, and establish human-AI collaboration frameworks",
    category: "AI Innovation",
    overview: "Build sophisticated AI agent ecosystems that work collaboratively to solve complex business challenges while continuously learning and adapting to optimize performance.",
    objectives: [
      "Create autonomous business processes through intelligent agent deployment",
      "Establish competitive advantages through advanced AI agent technologies"
    ],
    timeline: [
      {
        phase: "AI Agent Architecture",
        duration: "Months 1-4",
        deliverables: ["Agent system design", "Communication protocols", "Learning framework"]
      }
    ],
    implementationPlan: [
      {
        phase: "Multi-Agent System Design",
        description: "Design and implement sophisticated AI agent ecosystems for business automation.",
        keyActivities: [
          "Design multi-agent system architecture and communication protocols",
          "Implement learning and adaptation mechanisms for continuous improvement"
        ],
        successCriteria: [
          "AI agent ecosystem operational with demonstrated autonomous capabilities"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Agent Performance",
        metrics: ["Autonomous task completion rates", "Agent learning effectiveness", "System reliability scores"]
      }
    ],
    resources: [
      { name: "AI Agent Development Framework", url: "#" }
    ]
  },

  // Missing strategies - adding complete professional content
  "Enterprise Content Orchestration": {
    name: "Enterprise Content Orchestration",
    description: "Advanced multi-channel content strategy with AI-driven personalization at enterprise scale",
    approach: "Implement content management platforms, AI personalization engines, automated translation workflows, and advanced analytics for enterprise-wide content optimization",
    category: "Enterprise Marketing",
    overview: "Transform enterprise content operations through sophisticated orchestration systems that enable unified brand messaging with localized personalization, streamlined global operations, and measurable content ROI across all channels and regions.",
    objectives: [
      "Achieve unified brand messaging across all global markets and channels",
      "Reduce content production costs by 50% through automation and reuse",
      "Improve content engagement rates by 200% through AI personalization",
      "Establish measurable content ROI tracking across all enterprise divisions",
      "Enable real-time content localization for 20+ markets simultaneously",
      "Create self-optimizing content systems that improve performance over time"
    ],
    timeline: [
      {
        phase: "Enterprise Content Audit & Strategy",
        duration: "Months 1-2",
        deliverables: ["Comprehensive content inventory", "Brand consistency analysis", "Technology stack evaluation", "Global content strategy framework"]
      },
      {
        phase: "Platform Integration & Automation",
        duration: "Months 3-5",
        deliverables: ["Content management platform deployment", "AI personalization engine setup", "Automated workflow implementation", "Translation system integration"]
      },
      {
        phase: "Global Rollout & Optimization",
        duration: "Months 6-9",
        deliverables: ["Multi-market content deployment", "Performance monitoring systems", "Optimization protocols", "Team training programs"]
      },
      {
        phase: "Advanced Analytics & Scaling",
        duration: "Months 10-12",
        deliverables: ["Advanced analytics implementation", "ROI measurement systems", "Scaling infrastructure", "Innovation pipeline"]
      }
    ],
    implementationPlan: [
      {
        phase: "Enterprise Content Foundation",
        description: "Establish comprehensive content strategy and technology foundation for enterprise-scale operations.",
        keyActivities: [
          "Conduct enterprise-wide content audit and brand consistency analysis",
          "Evaluate and integrate advanced content management and personalization platforms",
          "Design unified content governance framework with global and local considerations",
          "Establish content performance measurement and ROI tracking systems"
        ],
        successCriteria: [
          "Complete enterprise content inventory with gap analysis completed",
          "Content management platform operational across all divisions",
          "Brand governance framework approved and implemented globally",
          "ROI tracking systems providing actionable insights"
        ]
      },
      {
        phase: "AI-Powered Content Orchestration",
        description: "Deploy advanced AI systems for content personalization, automation, and optimization.",
        keyActivities: [
          "Implement AI-driven content personalization engines for dynamic audience targeting",
          "Deploy automated content creation and optimization workflows",
          "Create real-time content translation and localization systems",
          "Establish predictive content performance analytics and optimization protocols"
        ],
        successCriteria: [
          "AI personalization systems delivering measurable engagement improvements",
          "Automated workflows reducing content production time by 50%",
          "Real-time localization operational in all target markets",
          "Predictive analytics providing accurate performance forecasting"
        ]
      }
    ],
    keyMetrics: [
      {
        category: "Operational Efficiency",
        metrics: ["Content production speed improvement", "Cost per content piece reduction", "Resource utilization optimization", "Workflow automation percentage"]
      },
      {
        category: "Global Performance",
        metrics: ["Multi-market engagement rates", "Brand consistency scores", "Localization accuracy metrics", "Cross-channel performance"]
      },
      {
        category: "Business Impact",
        metrics: ["Content ROI measurement", "Lead generation attribution", "Sales enablement effectiveness", "Customer engagement lift"]
      }
    ],
    resources: [
      { name: "Enterprise Content Management Guide", url: "#" },
      { name: "AI Personalization Platform Comparison", url: "#" },
      { name: "Global Content Governance Framework", url: "#" },
      { name: "Content ROI Analytics Dashboard", url: "#" }
    ]
  }
};

const strategyNameAliases: Record<string, string> = {
  "Content-First Growth Strategy": "Content-First Growth",
  "SEO-Driven Organic Growth": "SEO-Driven Strategy",
  "Visual Storytelling Strategy": "Visual Brand Identity System",
  "Social Visual Engagement": "Social Media Visual Strategy",
  "Video-First Marketing Approach": "AI-Enhanced Video Marketing",
  "Educational Video Series Strategy": "Educational Video Systems",
  "Podcast Authority Building": "Podcast Empire Strategy",
  "Audio Content Repurposing": "Podcast Empire Strategy",
  "User Experience Optimization": "AI-First Development Strategy"
};

export interface StrategyDetailModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

const StrategyDetailModal: React.FC<StrategyDetailModalProps> = ({
  strategy,
  isOpen,
  onClose,
}) => {
  if (!strategy) return null;

  const canonicalName = strategyNameAliases[strategy.name] || strategy.name.replace(/\s*Strategy$/i, '').replace(/\s*Approach$/i, '').trim();
  const detailedStrategy = strategyDetails[canonicalName];

  if (!detailedStrategy) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display gradient-text-primary">
              {strategy.name}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground">
              We're working on detailed content for this strategy. Check back soon!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <DialogTitle className="text-2xl font-display font-bold gradient-text-primary">
              {strategy.name}
            </DialogTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary font-medium px-3 py-1">
              {strategy.category}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50">
            <TabsTrigger value="overview" className="font-medium">Overview</TabsTrigger>
            <TabsTrigger value="timeline" className="font-medium">Timeline</TabsTrigger>
            <TabsTrigger value="implementation" className="font-medium">Implementation</TabsTrigger>
            <TabsTrigger value="metrics" className="font-medium">Metrics</TabsTrigger>
            <TabsTrigger value="resources" className="font-medium">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-muted/30 border border-border p-6 rounded-lg shadow-modern">
                  <h4 className="font-display font-semibold text-primary mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Difficulty Level
                  </h4>
                  <Badge variant="outline" className="bg-primary/10 text-primary">Intermediate</Badge>
                </div>
                <div className="bg-muted/30 border border-border p-6 rounded-lg shadow-modern">
                  <h4 className="font-display font-semibold text-primary mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Category
                  </h4>
                  <p className="text-foreground font-medium">{strategy.category}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 shadow-modern">
                <h4 className="font-display font-semibold text-primary mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategic Overview
                </h4>
                <p className="text-foreground leading-relaxed">{detailedStrategy.overview}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-modern">
              <h4 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Key Objectives
              </h4>
              <div className="grid gap-3">
                {detailedStrategy.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-foreground">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Implementation Timeline
              </h3>
              {detailedStrategy.timeline.map((phase, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-modern">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold text-lg">{phase.phase}</h4>
                    <Badge variant="outline" className="bg-primary/10 text-primary">{phase.duration}</Badge>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Key Deliverables:</h5>
                    <ul className="space-y-1">
                      {phase.deliverables.map((deliverable, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Implementation Plan
              </h3>
              {detailedStrategy.implementationPlan.map((phase, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-modern">
                  <h4 className="font-display font-semibold text-lg mb-2">{phase.phase}</h4>
                  <p className="text-muted-foreground mb-4">{phase.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3 text-primary">Key Activities</h5>
                      <ul className="space-y-2">
                        {phase.keyActivities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3 text-primary">Success Criteria</h5>
                      <ul className="space-y-2">
                        {phase.successCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Key Performance Metrics
              </h3>
              <div className="grid gap-4">
                {detailedStrategy.keyMetrics.map((category, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-modern">
                    <h4 className="font-display font-semibold text-lg mb-4 text-primary">{category.category}</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {category.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Recommended Resources
              </h3>
              <div className="grid gap-4">
                {detailedStrategy.resources.map((resource, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-4 shadow-modern hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{resource.name}</span>
                      <Badge variant="outline">Resource</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyDetailModal;