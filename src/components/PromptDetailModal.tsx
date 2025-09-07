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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              {prompt.name}
            </DialogTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {prompt.topicCategory}
            </Badge>
            <Badge variant="outline" className="border-muted-foreground/20">
              {prompt.category}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* What It Is */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">What It Is</h3>
            <p className="text-muted-foreground leading-relaxed">{prompt.whatItIs}</p>
          </div>

          {/* What It's For */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">What It's For</h3>
            <p className="text-muted-foreground leading-relaxed">{prompt.whatItsFor}</p>
          </div>

          {/* Desired Outcome */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Desired Outcome</h3>
            <p className="text-muted-foreground leading-relaxed">{prompt.desiredOutcome}</p>
          </div>

          {/* Prompt Template */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Prompt Template</h3>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Prompt"}
              </Button>
            </div>
            <div className="bg-muted/50 border rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {prompt.prompt}
              </pre>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
            <h4 className="font-medium text-primary mb-2">💡 Usage Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Customize the placeholders in [brackets] with your specific content</li>
              <li>• Adjust the tone and style to match your brand voice</li>
              <li>• Test different variations to find what works best for your use case</li>
              <li>• Combine with other prompts for more complex workflows</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}