import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Sparkles, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ToolPromptComboCardProps {
  combo: any;
  onClick?: () => void;
}

export function ToolPromptComboCard({ combo, onClick }: ToolPromptComboCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(combo.prompt_text || combo.custom_prompt || combo.prompt);
      setCopied(true);
      toast({
        title: "Prompt Copied!",
        description: "Ready to paste into " + (combo.tool_name || combo.name),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting the text manually.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced':
      case 'hard':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const toolUrl = combo.tool_url || combo.url || combo.website_url || combo.website;
  const toolName = combo.tool_name || combo.name;
  const promptText = combo.prompt_text || combo.custom_prompt || combo.prompt;
  const whenToUse = combo.when_to_use;
  const whyCombo = combo.why_this_combo || combo.why_this_tool;
  const alternatives = combo.alternatives || [];

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <Card 
        className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">{combo.title || toolName}</span>
            </CardTitle>
            {combo.category && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {combo.category}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {combo.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tool Information with Link */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Tool: {toolName}</span>
            </div>
            {toolUrl && (
              <a
                href={toolUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium flex items-center gap-1"
              >
                Open Tool
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Prompt Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Ready-to-Use Prompt
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPrompt}
                className="gap-2 h-8 text-xs"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-3 max-h-32 overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {promptText}
              </pre>
            </div>
          </div>

          {/* When to Use */}
          {whenToUse && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-400 mb-1">When to Use</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{whenToUse}</p>
                </div>
              </div>
            </div>
          )}

          {/* Why This Combo */}
          {whyCombo && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">Why This Combo</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{whyCombo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground/80">Alternative Tools:</p>
              <div className="space-y-2">
                {alternatives.map((alt: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border text-xs">
                    <span className="text-muted-foreground">{alt.tool || alt.name}</span>
                    {(alt.url || alt.tool_url) && (
                      <a
                        href={alt.url || alt.tool_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
            {combo.difficulty_level && (
              <Badge className={getDifficultyColor(combo.difficulty_level)} variant="outline">
                {combo.difficulty_level}
              </Badge>
            )}
            {combo.setup_time && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {combo.setup_time}
              </Badge>
            )}
            {combo.cost_estimate && (
              <Badge variant="secondary" className="text-xs gap-1">
                <DollarSign className="w-3 h-3" />
                {combo.cost_estimate}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
