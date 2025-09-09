import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import StrategyDetailModal from "@/components/StrategyDetailModal";

type Strategy = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  approach: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

const freeStrategies: Strategy[] = [
  // Text Content Strategies
  { 
    name: "Content-First Growth", 
    whatItIs: "Systematic approach to building business growth through valuable content creation",
    whatItsFor: "Companies looking to establish thought leadership and drive organic growth", 
    desiredOutcome: "Sustainable growth through content that attracts, engages, and converts ideal customers",
    approach: "Create valuable, educational content that addresses customer pain points, optimized for search and social sharing, with clear conversion paths to turn readers into leads and customers", 
    topicCategory: "Text",
    category: "Growth Marketing" 
  },
  { 
    name: "SEO-Driven Strategy", 
    whatItIs: "Long-term strategy for building organic search traffic and brand visibility",
    whatItsFor: "Businesses wanting to reduce paid advertising dependency and build sustainable traffic", 
    desiredOutcome: "Dominant search rankings for key terms driving qualified traffic and conversions",
    approach: "Comprehensive keyword research, technical SEO optimization, content cluster creation, and authority building through high-quality backlinks and thought leadership content", 
    topicCategory: "Text",
    category: "Search Marketing" 
  },
  { 
    name: "AI-Powered Content Strategy", 
    whatItIs: "Revolutionary approach to content creation using advanced AI tools and automation",
    whatItsFor: "Content teams looking to scale production while maintaining quality and personalization", 
    desiredOutcome: "10x content output with personalized messaging at scale and improved engagement rates",
    approach: "Leverage GPT-4, Claude, and specialized AI tools for content ideation, creation, optimization, and distribution with human oversight for quality control", 
    topicCategory: "Text",
    category: "AI Content Marketing" 
  },

  // Image/Visual Strategies
  { 
    name: "Visual Brand Identity System", 
    whatItIs: "Comprehensive visual branding strategy using AI-powered design tools",
    whatItsFor: "Businesses needing consistent, professional visual identity across all touchpoints", 
    desiredOutcome: "Strong brand recognition, visual consistency, and improved customer engagement through compelling imagery",
    approach: "Develop brand guidelines, create visual asset libraries using AI tools like Midjourney and DALL-E, establish design systems, and automate visual content production", 
    topicCategory: "Image",
    category: "Brand Design" 
  },
  { 
    name: "Social Media Visual Strategy", 
    whatItIs: "Strategic approach to creating engaging visual content for social media platforms",
    whatItsFor: "Brands wanting to increase social media engagement and build visual storytelling capabilities", 
    desiredOutcome: "Higher engagement rates, viral content creation, and stronger brand presence on visual platforms",
    approach: "Platform-specific visual content calendars, AI-assisted graphic design workflows, user-generated content campaigns, and performance-driven visual optimization", 
    topicCategory: "Image",
    category: "Social Media Marketing" 
  },
];

const proStrategies: Strategy[] = [
  // Advanced Text Strategies
  { 
    name: "Enterprise Content Orchestration", 
    whatItIs: "Advanced multi-channel content strategy with AI-driven personalization at enterprise scale",
    whatItsFor: "Large organizations needing coordinated content across multiple brands, regions, and channels", 
    desiredOutcome: "Unified brand messaging with localized personalization, improved content ROI, and streamlined global operations",
    approach: "Implement content management platforms, AI personalization engines, automated translation workflows, and advanced analytics for enterprise-wide content optimization", 
    topicCategory: "Text",
    category: "Enterprise Marketing" 
  },

  // Video Content Strategies
  { 
    name: "AI-Enhanced Video Marketing", 
    whatItIs: "Comprehensive video content strategy leveraging AI for production, editing, and optimization",
    whatItsFor: "Businesses wanting to dominate video marketing without massive production costs", 
    desiredOutcome: "Professional video content at scale, improved engagement metrics, and significant production cost reduction",
    approach: "Use AI video generation tools, automated editing workflows, synthetic media creation, performance analytics, and multi-platform optimization strategies", 
    topicCategory: "Video",
    category: "Video Marketing" 
  },
  { 
    name: "Educational Video Systems", 
    whatItIs: "Systematic approach to creating educational and training video content using AI tools",
    whatItsFor: "Educational institutions, corporate training departments, and online course creators", 
    desiredOutcome: "Engaging educational content that improves learning outcomes and reduces production time by 70%",
    approach: "Develop video curricula, implement AI-assisted script writing and video generation, create interactive elements, and establish performance measurement systems", 
    topicCategory: "Video",
    category: "Educational Technology" 
  },

  // Audio Content Strategies
  { 
    name: "Podcast Empire Strategy", 
    whatItIs: "Comprehensive podcasting strategy for thought leadership and audience building",
    whatItsFor: "Executives, experts, and businesses wanting to build authority through audio content", 
    desiredOutcome: "Industry-leading podcast with engaged audience, monetization opportunities, and thought leadership positioning",
    approach: "Content planning, AI-assisted editing and transcription, multi-platform distribution, audience growth tactics, and revenue optimization strategies", 
    topicCategory: "Audio",
    category: "Podcast Marketing" 
  },
  { 
    name: "Voice Technology Integration", 
    whatItIs: "Strategic implementation of voice AI and audio technologies in business operations",
    whatItsFor: "Companies looking to leverage voice interfaces and audio AI for competitive advantage", 
    desiredOutcome: "Enhanced customer experiences, operational efficiency gains, and innovative voice-powered solutions",
    approach: "Voice assistant development, audio processing workflows, speech recognition systems, and voice user interface design optimization", 
    topicCategory: "Audio",
    category: "Voice Technology" 
  },

  // Web/App Development Strategies
  { 
    name: "Product-Led Growth Strategy", 
    whatItIs: "Growth strategy where the product itself drives user acquisition, expansion, and retention",
    whatItsFor: "SaaS companies and digital products looking to scale efficiently", 
    desiredOutcome: "Sustainable growth with lower customer acquisition costs and higher lifetime value",
    approach: "Optimize product for viral sharing, create self-service onboarding, implement usage-based expansion opportunities, and use in-product messaging to drive upgrades and referrals", 
    topicCategory: "Web/App Dev",
    category: "Growth Strategy" 
  },
  { 
    name: "AI-First Development Strategy", 
    whatItIs: "Revolutionary approach to software development integrating AI throughout the entire development lifecycle",
    whatItsFor: "Development teams wanting to accelerate delivery while improving code quality and user experience", 
    desiredOutcome: "50% faster development cycles, improved code quality, and AI-enhanced user experiences",
    approach: "Implement AI coding assistants, automated testing frameworks, intelligent deployment pipelines, and AI-powered user experience optimization", 
    topicCategory: "Web/App Dev",
    category: "Development Innovation" 
  },

  // Workflow/AI Agents Strategies
  { 
    name: "Enterprise Automation Transformation", 
    whatItIs: "Comprehensive strategy for implementing AI agents and workflow automation across the enterprise",
    whatItsFor: "Large organizations seeking to automate complex business processes and reduce operational overhead", 
    desiredOutcome: "60% reduction in manual processes, improved accuracy, and significant cost savings through intelligent automation",
    approach: "Deploy AI agents for customer service, automate workflow orchestration, implement intelligent decision systems, and create self-improving process optimization", 
    topicCategory: "Workflow/AI Agents",
    category: "Process Automation" 
  },
  { 
    name: "AI Agent Ecosystem Strategy", 
    whatItIs: "Advanced strategy for building interconnected AI agents that work together to solve complex business challenges",
    whatItsFor: "Innovation-focused companies wanting to leverage cutting-edge AI agent technologies", 
    desiredOutcome: "Autonomous business processes, intelligent decision-making systems, and competitive advantages through AI agent deployment",
    approach: "Design multi-agent systems, implement agent communication protocols, create learning and adaptation mechanisms, and establish human-AI collaboration frameworks", 
    topicCategory: "Workflow/AI Agents",
    category: "AI Innovation" 
  },
];

const allStrategies = [...freeStrategies, ...proStrategies];

export default function Strategies() {
  const { isAuthenticated, subscription } = useAuth();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
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

  const StrategyCard = ({ strategy, isBlurred }: { strategy: Strategy; isBlurred: boolean }) => (
    <Card 
      className={`h-full cursor-pointer hover:shadow-lg transition-shadow ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}
      onClick={() => {
        if (!isBlurred) {
          setSelectedStrategy(strategy);
          setIsModalOpen(true);
        }
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{strategy.name}</CardTitle>
          <Badge variant="secondary">{strategy.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{strategy.whatItIs}</p>
        <div>
          <h4 className="font-semibold mb-2">Strategic Approach:</h4>
          <p className="text-sm bg-muted p-3 rounded line-clamp-3">
            {strategy.approach.length > 150 ? strategy.approach.substring(0, 150) + '...' : strategy.approach}
          </p>
        </div>
        <Button size="sm" className="mt-4 w-full" variant="outline">
          <Target className="h-4 w-4 mr-2" />
          View Strategic Framework
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Strategies Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Strategies</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </Button>
        </div>
        
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-muted-foreground">There will be your strategies</h3>
        </div>
      </div>

      {/* JumpinAI Strategies Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Strategies</h2>
          <p className="text-muted-foreground">Proven strategies for AI implementation and optimization</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAllContent ? allStrategies : allStrategies.slice(0, 6)).map((strategy, index) => (
            <StrategyCard 
              key={index} 
              strategy={strategy} 
              isBlurred={!showAllContent && index >= 4}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional strategies" />}
      </div>

      <StrategyDetailModal 
        strategy={selectedStrategy}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStrategy(null);
        }}
      />
    </div>
  );
}
