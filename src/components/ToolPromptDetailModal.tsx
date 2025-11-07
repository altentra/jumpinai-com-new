import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Sparkles, ExternalLink, Clock, CheckCircle, DollarSign, AlertTriangle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type UserToolPrompt = Database['public']['Tables']['user_tool_prompts']['Row'];

interface ToolPromptDetailModalProps {
  toolPrompt: UserToolPrompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolPromptDetailModal({ toolPrompt, isOpen, onClose }: ToolPromptDetailModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  if (!toolPrompt) return null;

  // Safely parse content
  let content: any = {};
  try {
    content = (toolPrompt.content || {}) as any;
  } catch (e) {
    console.error('Error parsing content:', e);
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(toolPrompt.prompt_text || '');
      setCopied(true);
      toast({ title: "Prompt Copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-lg border-border">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {toolPrompt.title || 'Tool & Prompt'}
          </DialogTitle>
          {toolPrompt.category && (
            <Badge variant="outline" className="w-fit text-xs">
              {String(toolPrompt.category)}
            </Badge>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Description */}
          {toolPrompt.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {String(toolPrompt.description)}
            </p>
          )}

          {/* Tool Information with Link */}
          {toolPrompt.tool_name && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center gap-2 min-w-0">
                <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Tool: {String(toolPrompt.tool_name)}
                </span>
              </div>
              {toolPrompt.tool_url && (
                <a
                  href={String(toolPrompt.tool_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors text-sm font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                >
                  Open Tool
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Prompt Display */}
          {toolPrompt.prompt_text && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ready-to-Use Prompt
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="gap-2 h-8 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed break-words overflow-wrap-anywhere max-h-64 overflow-y-auto">
                  {String(toolPrompt.prompt_text)}
                </pre>
              </div>
            </div>
          )}

          {/* Instructions */}
          {toolPrompt.prompt_instructions && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-400 mb-1">How to Use</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {String(toolPrompt.prompt_instructions)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* When to Use */}
          {content.when_to_use && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-400 mb-1">When to Use</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {String(content.when_to_use)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Why This Combo */}
          {(content.why_this_tool || content.why_this_combo) && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-400 mb-1">Why This Combo</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {String(content.why_this_tool || content.why_this_combo)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {Array.isArray(content.alternatives) && content.alternatives.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground/80">Alternative Tools:</p>
              <div className="space-y-2">
                {content.alternatives.map((alt: any, idx: number) => {
                  const altName = alt?.tool || alt?.name || alt;
                  const altUrl = alt?.url || alt?.tool_url;
                  const altNote = alt?.note || alt?.description;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border text-xs">
                      <div className="flex-1">
                        <span className="text-muted-foreground">{String(altName)}</span>
                        {altNote && (
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {String(altNote)}
                          </p>
                        )}
                      </div>
                      {altUrl && (
                        <a
                          href={String(altUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ml-2"
                        >
                          Visit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
            {toolPrompt.difficulty_level && (
              <Badge 
                className={getDifficultyColor(String(toolPrompt.difficulty_level))} 
                variant="outline"
              >
                {String(toolPrompt.difficulty_level)}
              </Badge>
            )}
            {toolPrompt.setup_time && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {String(toolPrompt.setup_time)}
              </Badge>
            )}
            {toolPrompt.cost_estimate && (
              <Badge variant="secondary" className="text-xs gap-1">
                <DollarSign className="w-3 h-3" />
                {String(toolPrompt.cost_estimate)}
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
