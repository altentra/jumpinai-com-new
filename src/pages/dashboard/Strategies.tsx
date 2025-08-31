import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type Strategy = {
  name: string;
  description: string;
  approach: string;
  category: string;
};

const freeStrategies: Strategy[] = [
  { name: "AI-First Content Strategy", description: "Leverage AI throughout the content lifecycle", approach: "Integrate AI tools at every stage: ideation with GPT-4, creation with specialized tools, optimization with analytics AI, and distribution with automation platforms.", category: "Content Marketing" },
  { name: "Multimodal AI Strategy", description: "Combine text, image, and video AI tools", approach: "Create cohesive campaigns using text AI for copy, image AI for visuals, and video AI for dynamic content, ensuring consistent brand voice across all modalities.", category: "Brand Strategy" },
  { name: "AI-Powered Research Strategy", description: "Systematic approach to AI-enhanced research", approach: "Use AI for data collection, analysis, and synthesis. Combine multiple AI sources for comprehensive insights, always verify with human expertise.", category: "Research Strategy" },
  { name: "Automation-First Operations", description: "Streamline operations with AI automation", approach: "Identify repetitive tasks, implement AI solutions for automation, maintain human oversight for quality control, and continuously optimize processes.", category: "Operations Strategy" },
  { name: "n8n Enterprise Automation Strategy", description: "Comprehensive workflow automation transformation", approach: "Conduct automation readiness assessment, map all business processes for automation potential, design n8n center of excellence, implement governance framework, create training programs, deploy workflows in phases, and establish continuous improvement culture.", category: "Process Automation" },
  { name: "AI-Powered Business Intelligence with n8n", description: "Intelligent data processing and insights generation", approach: "Integrate all data sources into n8n pipelines, implement AI-powered data analysis and pattern recognition, create automated reporting with natural language insights, establish real-time monitoring and alerting, and build predictive analytics capabilities.", category: "Business Intelligence" },
  { name: "n8n Customer Experience Automation", description: "End-to-end customer journey automation", approach: "Map customer touchpoints and interaction points, design personalized automation workflows, implement AI-driven customer segmentation and targeting, create omnichannel experience orchestration, and establish feedback loops for continuous optimization.", category: "Customer Experience" },
];

const proStrategies: Strategy[] = [
  { name: "Enterprise Digital Transformation", description: "Comprehensive digital modernization strategy", approach: "Assess current state, define future vision, develop technology roadmap, implement change management, measure progress through KPIs, and ensure sustainable transformation across all business units.", category: "Digital Transformation" },
  { name: "Market Expansion Strategy", description: "Strategic market entry and growth framework", approach: "Conduct market analysis, assess competitive landscape, develop go-to-market strategy, establish partnerships and distribution channels, create localization plans, and implement performance tracking systems.", category: "Market Strategy" },
  { name: "Innovation Management Strategy", description: "Systematic approach to innovation and R&D", approach: "Establish innovation pipeline, implement stage-gate processes, create innovation metrics, foster innovative culture, manage intellectual property, and balance incremental vs. breakthrough innovations.", category: "Innovation Strategy" },
  { name: "Mergers & Acquisitions Strategy", description: "M&A planning and execution framework", approach: "Define strategic rationale, conduct target screening, perform due diligence, negotiate terms, plan integration, manage cultural alignment, and measure synergy realization throughout the process.", category: "M&A Strategy" },
  { name: "ESG Strategy Implementation", description: "Environmental, Social, Governance strategy", approach: "Conduct materiality assessment, set science-based targets, implement governance frameworks, engage stakeholders, measure impact, ensure regulatory compliance, and communicate progress transparently.", category: "ESG Strategy" },
  { name: "Customer Experience Strategy", description: "Holistic customer experience transformation", approach: "Map customer journeys, identify pain points, design experience improvements, implement omnichannel solutions, measure customer satisfaction, and create feedback loops for continuous improvement.", category: "CX Strategy" },
  { name: "Data Strategy & Analytics", description: "Data-driven organization transformation", approach: "Assess data maturity, design data architecture, implement governance frameworks, build analytics capabilities, create self-service tools, and establish data-driven decision-making processes.", category: "Data Strategy" },
  { name: "Cybersecurity Strategy", description: "Comprehensive cybersecurity framework", approach: "Assess current security posture, identify threats and vulnerabilities, implement defense-in-depth strategy, establish incident response procedures, and create security awareness programs.", category: "Cybersecurity" },
  { name: "Supply Chain Strategy", description: "Supply chain optimization and resilience", approach: "Map supply network, assess risks and vulnerabilities, optimize costs and efficiency, implement technology solutions, establish supplier relationships, and create contingency plans.", category: "Supply Chain" },
  { name: "Talent Strategy", description: "Strategic workforce planning and development", approach: "Analyze workforce needs, develop talent acquisition strategies, create learning and development programs, implement succession planning, and foster inclusive culture and employee engagement.", category: "Talent Strategy" },
  { name: "Financial Strategy", description: "Corporate financial planning and optimization", approach: "Analyze financial performance, optimize capital structure, develop investment strategies, manage risks, plan for growth financing, and implement financial controls and reporting systems.", category: "Financial Strategy" },
  { name: "Brand Strategy", description: "Comprehensive brand development and management", approach: "Conduct brand audit, define brand positioning, develop brand identity, create brand guidelines, implement brand management systems, and measure brand performance and equity.", category: "Brand Strategy" },
  { name: "Operational Excellence Strategy", description: "Continuous improvement and efficiency optimization", approach: "Map value streams, identify waste and inefficiencies, implement lean methodologies, establish performance metrics, create improvement culture, and sustain operational improvements.", category: "Operational Excellence" },
  { name: "International Strategy", description: "Global expansion and market entry strategy", approach: "Analyze international opportunities, assess market entry modes, develop localization strategies, navigate regulatory requirements, establish global operations, and manage cultural differences.", category: "International Strategy" },
  { name: "Sustainability Strategy", description: "Corporate sustainability and responsibility framework", approach: "Set sustainability goals, implement environmental programs, engage stakeholders, measure and report progress, integrate sustainability into business strategy, and drive competitive advantage.", category: "Sustainability" }
];

const allStrategies = [...freeStrategies, ...proStrategies];

export default function Strategies() {
  const { isAuthenticated, subscription } = useAuth();

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
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{strategy.name}</CardTitle>
          <Badge variant="secondary">{strategy.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{strategy.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Approach:</h4>
          <p className="text-sm bg-muted p-3 rounded">
            {strategy.approach}
          </p>
        </div>
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
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your strategies..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Active
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Strategy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Plan and execute your AI transformation
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Strategic planning tools and frameworks</li>
            <li>• Goal tracking and milestone management</li>
            <li>• Performance metrics and ROI analysis</li>
            <li>• Team alignment and collaboration features</li>
            <li>• Expert strategy consultation</li>
          </ul>
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
    </div>
  );
}
