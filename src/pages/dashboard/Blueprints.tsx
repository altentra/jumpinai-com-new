import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

type Blueprint = {
  name: string;
  description: string;
  template: string;
  category: string;
};

const blueprints: Blueprint[] = [
  { name: "Product Launch Blueprint", description: "Complete template for product launches", template: "# Product Launch Brief\n## Narrative\n[Product story and positioning]\n## ICP Pain Points\n[Target customer problems]\n## Key Benefits\n1. [Benefit 1]\n2. [Benefit 2]\n3. [Benefit 3]\n## Messaging Pillars\n[Core messages]\n## Call-to-Action\n[Clear next steps]", category: "Marketing" },
  { name: "SOP Template", description: "Standard Operating Procedure template", template: "# Standard Operating Procedure\n## Purpose\n[Why this SOP exists]\n## Scope\n[What this covers]\n## Responsibilities\n[Who does what]\n## Procedure\n[Step-by-step process]\n## Quality Controls\n[Checks and balances]", category: "Operations" },
  { name: "Executive Dashboard Blueprint", description: "Template for executive reporting", template: "# Executive Dashboard\n## Key Metrics\n[Primary KPIs]\n## Performance Summary\n[5 bullet points]\n## Risks & Opportunities\n[Assessment]\n## Recommendations\n[Action items]\n## Next Steps\n[Timeline and owners]", category: "Business Intelligence" },
  { name: "Brand Voice Guide", description: "Template for maintaining brand consistency", template: "# Brand Voice Guide\n## Voice Characteristics\n[Personality traits]\n## Tone Guidelines\n[Situational tones]\n## Do's and Don'ts\n[Examples]\n## Templates\n[Reusable formats]\n## Quality Checks\n[Verification process]", category: "Branding" },
  { name: "Research Brief Template", description: "Structured approach to research projects", template: "# Research Brief\n## Objective\n[What we want to learn]\n## Scope\n[Boundaries and timeframe]\n## Sources\n[Where to look]\n## Deliverables\n[Expected outputs]\n## Success Criteria\n[How to measure quality]", category: "Research" },
  { name: "Meeting Action Template", description: "Transform meetings into results", template: "# Meeting Action Items\n## Meeting Summary\n[One paragraph recap]\n## Action Items\n[Owner | Task | Due Date]\n## Decisions Made\n[Key outcomes]\n## Next Meeting\n[Agenda preview]\n## Stakeholder Communication\n[Who to update]", category: "Productivity" },
];

export default function Blueprints() {
  const { isAuthenticated } = useAuth();
  const showAllContent = false;

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
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{blueprint.name}</CardTitle>
          <Badge variant="secondary">{blueprint.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{blueprint.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template:</h4>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto whitespace-pre-wrap">
            {blueprint.template}
          </pre>
        </div>
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
          {blueprints.map((blueprint, index) => (
            <BlueprintCard 
              key={index} 
              blueprint={blueprint} 
              isBlurred={index >= 4 && !showAllContent}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional blueprints" />}
      </div>
    </div>
  );
}
