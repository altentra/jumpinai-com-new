import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Sparkles, ExternalLink, Clock, CheckCircle, DollarSign, AlertTriangle, MessageSquare, ArrowLeftRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type UserToolPrompt = Database['public']['Tables']['user_tool_prompts']['Row'];

interface ToolPromptDetailModalProps {
  toolPrompt: UserToolPrompt | null;
  isOpen: boolean;
  onClose: () => void;
  index?: number;
}

export function ToolPromptDetailModal({ toolPrompt, isOpen, onClose, index }: ToolPromptDetailModalProps) {
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
      <DialogContent className="max-w-5xl max-h-[92vh] mx-4 sm:mx-auto overflow-hidden p-0 border-2 border-primary/20 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] animate-scale-in">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none rounded-[2rem] sm:rounded-[2.5rem]" />
        
        {/* Glass Effect Border */}
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 pointer-events-none" />
        
        <div className="relative overflow-y-auto max-h-[92vh] p-8 custom-scrollbar">
          <DialogHeader className="pb-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-1">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-sm border border-primary/20">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
                  {index !== undefined && `${index}. `}{toolPrompt.title || 'Tool & Prompt'}
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
                <p className="text-sm text-foreground leading-relaxed">
                  {String(toolPrompt.description)}
                </p>
              </div>
            )}

            {/* Tool Information with Epic Liquid Glass Button */}
            {toolPrompt.tool_name && (
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="text-sm font-semibold text-foreground/90 whitespace-nowrap">Tool:</span>
                {toolPrompt.tool_url ? (
                  <a
                    href={String(toolPrompt.tool_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group/tool"
                  >
                    {/* Liquid glass glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/tool:opacity-60 transition duration-500"></div>
                    
                    {/* Button */}
                    <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/tool:border-primary/50 transition-all duration-300 overflow-hidden">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/tool:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Content */}
                      <span className="relative text-sm sm:text-base font-bold text-foreground group-hover/tool:text-primary transition-colors duration-300 whitespace-nowrap">
                        {String(toolPrompt.tool_name)}
                      </span>
                      
                      {/* Arrow icon */}
                      <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/tool:bg-primary/30 transition-all duration-300">
                        <ExternalLink className="w-4 h-4 text-primary group-hover/tool:translate-x-0.5 group-hover/tool:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="px-5 py-3 bg-muted/20 rounded-[2rem] border border-border">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{String(toolPrompt.tool_name)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Display */}
            {toolPrompt.prompt_text && (
              <div className="space-y-3 animate-fade-in">
                <span className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Ready-to-Use Prompt
                </span>
                <div 
                  onClick={copyToClipboard}
                  className={`bg-muted/30 border border-border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                    copied ? 'border-green-500/50 bg-green-500/10 scale-[1.01]' : 'hover:border-primary/30 hover:bg-muted/40'
                  }`}
                >
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed break-words overflow-wrap-anywhere max-h-72 overflow-y-auto custom-scrollbar">
                    {String(toolPrompt.prompt_text)}
                  </pre>
                </div>
                
                {/* Copy Button with Liquid Glass Design */}
                <button
                  onClick={copyToClipboard}
                  className="relative group/copy"
                >
                  {/* Liquid glass glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/copy:opacity-60 transition duration-500"></div>
                  
                  {/* Button */}
                  <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/copy:border-primary/50 transition-all duration-300 overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/copy:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <span className="relative text-sm font-bold text-foreground group-hover/copy:text-primary transition-colors duration-300 whitespace-nowrap">
                      {copied ? "Copied!" : "Copy Prompt"}
                    </span>
                    
                    {/* Icon */}
                    <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/copy:bg-primary/30 transition-all duration-300">
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-primary group-hover/copy:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                  </div>
                </button>
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
                      <p className="text-xs text-foreground leading-relaxed">
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
                      <p className="text-xs text-foreground leading-relaxed">
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
                      <p className="text-xs text-foreground leading-relaxed">
                        {String(content.why_this_tool || content.why_this_combo)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {Array.isArray(content.alternatives) && content.alternatives.length > 0 && (
              <div className="relative group animate-fade-in">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-red-500/10 backdrop-blur-sm border border-orange-500/20 rounded-2xl hover:border-orange-500/30 transition-all duration-300">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl">
                      <ArrowLeftRight className="w-4 h-4 text-orange-400 shrink-0" />
                    </div>
                    <p className="text-sm font-semibold text-orange-400">Alternative Tools</p>
                  </div>
                  <div className="space-y-3">
                    {content.alternatives.map((alt: any, idx: number) => {
                      const altName = alt?.tool || alt?.name || alt;
                      const altUrl = alt?.url || alt?.tool_url;
                      const altNote = alt?.note || alt?.description;
                      
                      return (
                        <div key={idx} className="space-y-2">
                          {altUrl ? (
                            <a
                              href={String(altUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative group/alt inline-block"
                            >
                              {/* Liquid glass glow effect */}
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover/alt:opacity-60 transition duration-500"></div>
                              
                              {/* Button */}
                              <div className="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover/alt:border-primary/50 transition-all duration-300 overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/alt:translate-x-full transition-transform duration-1000"></div>
                                
                                {/* Content */}
                                <span className="relative text-sm font-bold text-foreground group-hover/alt:text-primary transition-colors duration-300 whitespace-nowrap">
                                  {String(altName)}
                                </span>
                                
                                {/* Arrow icon */}
                                <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover/alt:bg-primary/30 transition-all duration-300">
                                  <ExternalLink className="w-4 h-4 text-primary group-hover/alt:translate-x-0.5 group-hover/alt:-translate-y-0.5 transition-transform duration-300" />
                                </div>
                              </div>
                            </a>
                          ) : (
                            <div className="inline-block px-5 py-3 bg-muted/20 rounded-[2rem] border border-border">
                              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{String(altName)}</span>
                            </div>
                          )}
                          {altNote && <p className="text-xs text-foreground leading-relaxed">{String(altNote)}</p>}
                        </div>
                      );
                    })}
                  </div>
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
