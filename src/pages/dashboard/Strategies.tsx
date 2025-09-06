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
];

const proStrategies: Strategy[] = [
  { 
    name: "Product-Led Growth Strategy", 
    whatItIs: "Growth strategy where the product itself drives user acquisition, expansion, and retention",
    whatItsFor: "SaaS companies and digital products looking to scale efficiently", 
    desiredOutcome: "Sustainable growth with lower customer acquisition costs and higher lifetime value",
    approach: "Optimize product for viral sharing, create self-service onboarding, implement usage-based expansion opportunities, and use in-product messaging to drive upgrades and referrals", 
    topicCategory: "Web/App Dev",
    category: "Growth Strategy" 
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
