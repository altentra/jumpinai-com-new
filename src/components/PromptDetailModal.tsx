import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type PromptTemplate = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  prompt: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

interface PromptDetailModalProps {
  prompt: PromptTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptDetailModal({ prompt, isOpen, onClose }: PromptDetailModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      toast({
        title: "Prompt Copied!",
        description: "The prompt has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying the text manually.",
        variant: "destructive",
      });
    }
  };

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-modern-lg animate-scale-in">
        <DialogHeader className="pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <DialogTitle className="text-2xl font-display font-bold gradient-text-primary">
              {prompt.name}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary font-medium px-3 py-1">
              {prompt.topicCategory}
            </Badge>
            <Badge variant="outline" className="border-border bg-muted/30 text-muted-foreground font-medium px-3 py-1">
              {prompt.category}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* What It Is */}
          <div className="space-y-3 animate-fade-in-up animate-delay-100">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              What It Is
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-muted-foreground leading-relaxed">{prompt.whatItIs}</p>
            </div>
          </div>

          {/* What It's For */}
          <div className="space-y-3 animate-fade-in-up animate-delay-200">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              What It's For
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-muted-foreground leading-relaxed">{prompt.whatItsFor}</p>
            </div>
          </div>

          {/* Desired Outcome */}
          <div className="space-y-3 animate-fade-in-up animate-delay-300">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Desired Outcome
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-muted-foreground leading-relaxed">{prompt.desiredOutcome}</p>
            </div>
          </div>

          {/* Prompt Template */}
          <div className="space-y-4 animate-fade-in-up animate-delay-400">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Prompt Template
              </h3>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="gap-2 modern-button hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Prompt"}
              </Button>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-modern">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {prompt.prompt}
              </pre>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 shadow-modern animate-fade-in-up animate-delay-500">
            <h4 className="text-lg font-display font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Usage Tips
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>Customize the placeholders in [brackets] with your specific content</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>Adjust the tone and style to match your brand voice</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>Test different variations to find what works best for your use case</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>Combine with other prompts for more complex workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}