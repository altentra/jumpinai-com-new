import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

type PromptTemplate = {
  name: string;
  description: string;
  prompt: string;
  category: string;
};

const promptTemplates: PromptTemplate[] = [
  { name: "Product Marketing Brief", description: "Create comprehensive product launch briefs", prompt: "Act as a senior product marketer. Create a 500‑word launch brief for a B2B SaaS feature. Include: 1) narrative, 2) ICP pain, 3) 3 key benefits, 4) messaging pillars, 5) CTA. Tone: confident, concise.", category: "Marketing" },
  { name: "Policy Analysis", description: "Analyze and summarize policy documents", prompt: "You are an operations analyst. Summarize this policy PDF into an SOP with steps, owners, and SLAs. Flag ambiguities and propose fixes.", category: "Analysis" },
  { name: "Executive Summary", description: "Create executive summaries from data", prompt: "As a data storyteller, explain these metrics (paste table) to an executive in 5 bullets. Add a final risk/opportunity section.", category: "Business Intelligence" },
  { name: "Trend Analysis", description: "Analyze current trends with citations", prompt: "Act as a trend analyst. Using fresh web sources, outline the 5 biggest AI regulation changes in 2025 with citations and implications for SaaS founders.", category: "Research" },
  { name: "Brand Voice Rewrite", description: "Rewrite content to match brand voice", prompt: "Rewrite this email to match our brand voice (confident, concise, friendly). Keep to 120 words and include CTA to demo.", category: "Content Creation" },
  { name: "Meeting Notes Cleanup", description: "Transform meeting notes into actionable items", prompt: "Clean up these meeting notes into action items by owner and due date. Add a one‑paragraph recap for stakeholders.", category: "Productivity" },
];

export default function Prompts() {
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

  const PromptCard = ({ prompt }: { prompt: PromptTemplate }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{prompt.name}</CardTitle>
          <Badge variant="secondary">{prompt.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{prompt.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template:</h4>
          <p className="text-sm bg-muted p-3 rounded italic">
            {prompt.prompt}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Prompts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Prompts</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your prompts..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Prompt</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your personal prompt library
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Save and organize your favorite prompts</li>
            <li>• AI-powered prompt optimization suggestions</li>
            <li>• Collaboration and sharing features</li>
            <li>• Performance analytics and usage stats</li>
            <li>• Template variations and A/B testing</li>
          </ul>
        </div>
      </div>

      {/* JumpinAI Prompts Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Prompts</h2>
          <p className="text-muted-foreground">Ready-to-use prompt templates for maximum AI effectiveness</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promptTemplates.map((prompt, index) => (
            <PromptCard key={index} prompt={prompt} />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional prompts" />}
      </div>
    </div>
  );
}
