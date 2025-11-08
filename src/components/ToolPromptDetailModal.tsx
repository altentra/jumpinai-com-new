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
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 border-2 border-primary/20 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl shadow-2xl rounded-3xl animate-scale-in">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none rounded-3xl" />
        
        {/* Glass Effect Border */}
        <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
        
        <div className="relative overflow-y-auto max-h-[92vh] p-8 custom-scrollbar">
          <DialogHeader className="pb-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
              <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5 sm:gap-3 flex-1">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-sm border border-primary/20">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
                  {toolPrompt.title || 'Tool & Prompt'}
                </span>
              </DialogTitle>
              {toolPrompt.category && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-3 py-1 bg-primary/10 border-primary/30 backdrop-blur-sm rounded-full self-start sm:self-auto"
                >
                  {String(toolPrompt.category)}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Description */}
            {toolPrompt.description && (
              <div className="animate-fade-in">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {String(toolPrompt.description)}
                </p>
              </div>
            )}

            {/* Tool Information with Link */}
            {toolPrompt.tool_name && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/70 mb-0.5">AI Tool</p>
                    <span className="text-sm font-semibold truncate">
                      {String(toolPrompt.tool_name)}
                    </span>
                  </div>
                </div>
                {toolPrompt.tool_url && (
                  <a
                    href={String(toolPrompt.tool_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-300 text-sm font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0 border border-primary/20"
                  >
                    Open Tool
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}
              </div>
            )}

            {/* Prompt Display */}
            {toolPrompt.prompt_text && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    Ready-to-Use Prompt
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="gap-2 h-9 px-4 rounded-xl bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "✓ Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative bg-gradient-to-br from-muted/40 via-muted/30 to-muted/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 overflow-hidden">
                    <pre className="text-xs text-muted-foreground/90 whitespace-pre-wrap font-mono leading-relaxed break-words overflow-wrap-anywhere max-h-72 overflow-y-auto custom-scrollbar">
                      {String(toolPrompt.prompt_text)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {toolPrompt.prompt_instructions && (
              <div className="relative group animate-fade-in">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-amber-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                      <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-400 mb-2">How to Use</p>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {String(toolPrompt.prompt_instructions)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* When to Use */}
            {content.when_to_use && (
              <div className="relative group animate-fade-in">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-400 mb-2">When to Use</p>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {String(content.when_to_use)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Why This Combo */}
            {(content.why_this_tool || content.why_this_combo) && (
              <div className="relative group animate-fade-in">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-green-500/10 via-green-500/5 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl hover:border-green-500/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-400 mb-2">Why This Combo</p>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {String(content.why_this_tool || content.why_this_combo)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {Array.isArray(content.alternatives) && content.alternatives.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  Alternative Tools
                </p>
                <div className="space-y-2.5">
                  {content.alternatives.map((alt: any, idx: number) => {
                    const altName = alt?.tool || alt?.name || alt;
                    const altUrl = alt?.url || alt?.tool_url;
                    const altNote = alt?.note || alt?.description;
                    
                    return (
                      <div key={idx} className="group flex items-center justify-between p-3.5 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 text-xs">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{String(altName)}</span>
                          {altNote && (
                            <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed">
                              {String(altNote)}
                            </p>
                          )}
                        </div>
                        {altUrl && (
                          <a
                            href={String(altUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-300 text-primary flex items-center gap-1.5 ml-3 border border-primary/20 group-hover:border-primary/30"
                          >
                            <span className="text-xs font-medium">Visit</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta Information */}
            <div className="flex gap-2.5 flex-wrap pt-4 border-t border-border/50 animate-fade-in">
              {toolPrompt.difficulty_level && (
                <Badge 
                  className={`${getDifficultyColor(String(toolPrompt.difficulty_level))} px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm`}
                  variant="outline"
                >
                  {String(toolPrompt.difficulty_level)}
                </Badge>
              )}
              {toolPrompt.setup_time && (
                <Badge variant="secondary" className="text-xs gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-sm bg-muted/30">
                  <Clock className="w-3.5 h-3.5" />
                  {String(toolPrompt.setup_time)}
                </Badge>
              )}
              {toolPrompt.cost_estimate && (
                <Badge variant="secondary" className="text-xs gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-sm bg-muted/30">
                  <DollarSign className="w-3.5 h-3.5" />
                  {String(toolPrompt.cost_estimate)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
