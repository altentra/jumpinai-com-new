import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, CheckCircle, Target, Info, Lightbulb, X } from "lucide-react";
import { useState } from "react";

type ResourceBlueprint = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  template: string;
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
};

interface ResourceBlueprintModalProps {
  blueprint: ResourceBlueprint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResourceBlueprintModal({ blueprint, isOpen, onClose }: ResourceBlueprintModalProps) {
  const [copied, setCopied] = useState(false);

  if (!blueprint) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
        <DialogHeader className="border-b border-border/50 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {blueprint.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {blueprint.category}
                </Badge>
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  {blueprint.topicCategory}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Resource blueprint information and template preview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Blueprint Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-400">
                  <Info className="h-5 w-5" />
                  What It Is
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{blueprint.whatItIs}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
                  <Lightbulb className="h-5 w-5" />
                  What It's For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{blueprint.whatItsFor}</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-400">
                  <Target className="h-5 w-5" />
                  Desired Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{blueprint.desiredOutcome}</p>
              </CardContent>
            </Card>
          </div>

          {/* Template Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Copy className="h-5 w-5 text-primary" />
                  Blueprint Template
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(blueprint.template)}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Template
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed overflow-x-auto">
                  {blueprint.template}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      How to Use This Template
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Copy the template above and replace the bracketed placeholders with your specific content. 
                      Each section provides guidance on what information to include for maximum effectiveness.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}