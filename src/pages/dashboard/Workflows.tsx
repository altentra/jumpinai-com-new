import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

type Workflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
};

const workflows: Workflow[] = [
  { name: "Content Creation Workflow", description: "Systematic approach to creating high-quality content", steps: ["Define role, audience, constraints, and deliverable length.", "Ask for a structured outline first; iterate on sections.", "Request variations and finalize with style and brand guardrails."], category: "Content" },
  { name: "Document Analysis Workflow", description: "Process for analyzing and summarizing documents", steps: ["Upload/reference source docs; ask for structured SOP.", "Iterate to add owners/SLAs; request ambiguity list.", "Export final SOP with version and change log."], category: "Analysis" },
  { name: "Executive Reporting Workflow", description: "Create executive-ready reports from data", steps: ["Provide table/context; request bullet executive summary.", "Probe on anomalies; ask for 3 hypotheses with tests.", "Finalize with risks, opportunities, and next steps."], category: "Business Intelligence" },
  { name: "Research Workflow", description: "Comprehensive research with citations", steps: ["Ask for current, cited sources; set timeframe.", "Request a pros/cons table and action checklist.", "Deliver an executive brief plus 3 tweet‑length summaries."], category: "Research" },
  { name: "Brand Management Workflow", description: "Maintain consistent brand voice across content", steps: ["Import brand guidelines and examples.", "Calibrate with few‑shot samples; lock style checks.", "Deploy templates and measure reply rates."], category: "Branding" },
  { name: "Meeting Management Workflow", description: "Transform meetings into actionable outcomes", steps: ["Paste raw notes; ask for action list by owner/date.", "Request concise recap; auto‑link to related pages.", "Share and @mention owners for accountability."], category: "Productivity" },
];

export default function Workflows() {
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

  const WorkflowCard = ({ workflow, isBlurred }: { workflow: Workflow; isBlurred: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workflow.name}</CardTitle>
          <Badge variant="secondary">{workflow.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{workflow.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Steps:</h4>
          <ol className="text-sm space-y-1">
            {workflow.steps.map((step, index) => (
              <li key={index} className="flex">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Workflows Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Workflows</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your workflows..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Active
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Workflow</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Design and automate your AI processes
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Visual workflow builder with drag-and-drop</li>
            <li>• Automation triggers and conditions</li>
            <li>• Performance tracking and optimization</li>
            <li>• Team collaboration and sharing</li>
            <li>• Integration with popular AI tools</li>
          </ul>
        </div>
      </div>

      {/* JumpinAI Workflows Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Workflows</h2>
          <p className="text-muted-foreground">Systematic approaches to AI-powered productivity</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow, index) => (
            <WorkflowCard 
              key={index} 
              workflow={workflow} 
              isBlurred={index >= 4 && !showAllContent}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional workflows" />}
      </div>
    </div>
  );
}
