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
  template: string;
  category: string;
};

// Keep datasets concise and valid
const freeBlueprints: Blueprint[] = [
  { 
    name: "Product Launch Blueprint", 
    description: "Complete template for product launches", 
    template: "# Product Launch Brief\\n## Narrative\\n[Product story and positioning]\\n## ICP Pain Points\\n[Target customer problems]\\n## Key Benefits\\n1. [Benefit 1]\\n2. [Benefit 2]\\n3. [Benefit 3]\\n## Messaging Pillars\\n[Core messages]\\n## Call-to-Action\\n[Clear next steps]", 
    category: "Marketing" 
  },
  { 
    name: "SOP Template", 
    description: "Standard Operating Procedure template", 
    template: "# Standard Operating Procedure\\n## Purpose\\n[Why this SOP exists]\\n## Scope\\n[What this covers]\\n## Responsibilities\\n[Who does what]\\n## Procedure\\n[Step-by-step process]\\n## Quality Controls\\n[Checks and balances]", 
    category: "Operations" 
  },
];

const proBlueprints: Blueprint[] = [
  { 
    name: "Executive Dashboard Blueprint", 
    description: "Template for executive reporting", 
    template: "# Executive Dashboard\\n## Key Metrics\\n[Primary KPIs]\\n## Performance Summary\\n[5 bullet points]\\n## Risks & Opportunities\\n[Assessment]\\n## Recommendations\\n[Action items]\\n## Next Steps\\n[Timeline and owners]", 
    category: "Business Intelligence" 
  },
  { 
    name: "Investment Pitch Deck", 
    description: "Professional investor presentation template", 
    template: "# Investment Pitch Deck\\n## Problem\\n[Market pain]\\n## Solution\\n[Unique value prop]\\n## Market\\n[TAM/SAM/SOM]\\n## Traction\\n[Key metrics]\\n## Business Model\\n[Revenue streams]\\n## Competition\\n[Differentiation]\\n## Team\\n[Expertise]\\n## Financials\\n[Projections]\\n## Ask\\n[Funding/use]", 
    category: "Investment" 
  },
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
            {blueprint.template.substring(0, 120)}...
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
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your blueprints..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Blueprint</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build reusable templates for your projects
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Custom template builder with variables</li>
            <li>• Blueprint versioning and history</li>
            <li>• Team sharing and collaboration</li>
            <li>• Usage analytics and optimization</li>
            <li>• Import/export functionality</li>
          </ul>
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
        blueprint={selectedBlueprint ? {
          ...selectedBlueprint,
          whatItIs: selectedBlueprint.description,
          whatItsFor: `Designed for ${selectedBlueprint.category.toLowerCase()} use cases`,
          desiredOutcome: "Structured template for consistent results",
          topicCategory: "Text" as const
        } : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBlueprint(null);
        }}
      />
    </div>
  );
}
