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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {toolPrompt.title || 'Tool & Prompt'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {toolPrompt.description && (
            <p className="text-sm text-muted-foreground">{String(toolPrompt.description)}</p>
          )}

          {/* Tool Info */}
          {toolPrompt.tool_name && (
            <Card className="border-primary/20">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">AI Tool</p>
                  <p className="font-semibold">{String(toolPrompt.tool_name)}</p>
                </div>
                {toolPrompt.tool_url && (
                  <a
                    href={String(toolPrompt.tool_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 flex items-center gap-2"
                  >
                    Open Tool
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Prompt */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Ready-to-Use Prompt
              </h3>
              <Button onClick={copyToClipboard} size="sm" variant="outline" className="gap-2">
                <Copy className="w-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {String(toolPrompt.prompt_text || 'No prompt available')}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          {toolPrompt.prompt_instructions && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-500 mb-2">How to Use</h4>
                <p className="text-sm">{String(toolPrompt.prompt_instructions)}</p>
              </CardContent>
            </Card>
          )}

          {/* When to Use */}
          {content.when_to_use && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-500 mb-2">When to Use</h4>
                  <p className="text-sm">{String(content.when_to_use)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Why This Combo */}
          {(content.why_this_tool || content.why_this_combo) && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-500 mb-2">Why This Combo</h4>
                  <p className="text-sm">{String(content.why_this_tool || content.why_this_combo)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternatives */}
          {Array.isArray(content.alternatives) && content.alternatives.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alternative Tools (Top 2)
                </h4>
                {content.alternatives.slice(0, 2).map((alt: any, idx: number) => {
                  const altName = alt?.tool || alt?.name || alt;
                  const altUrl = alt?.url || alt?.tool_url;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded border">
                      <span className="text-sm font-medium">{String(altName)}</span>
                      {altUrl && (
                        <a
                          href={String(altUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit
                        </a>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <div className="flex gap-2 flex-wrap border-t pt-4">
            {toolPrompt.difficulty_level && (
              <Badge variant="outline">{String(toolPrompt.difficulty_level)}</Badge>
            )}
            {toolPrompt.setup_time && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {String(toolPrompt.setup_time)}
              </Badge>
            )}
            {toolPrompt.cost_estimate && (
              <Badge variant="secondary" className="gap-1">
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
