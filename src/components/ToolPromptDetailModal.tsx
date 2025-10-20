import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Sparkles, ExternalLink, Clock, CheckCircle, DollarSign, AlertTriangle, Lightbulb } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useJumpInfo } from "@/hooks/useJumpInfo";

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

  const { jumpInfo } = useJumpInfo(toolPrompt.jump_id || undefined);
  
  // Parse content field for additional data
  const content = (toolPrompt.content || {}) as any;
  
  // Extract all data with fallbacks
  const toolName = toolPrompt.tool_name || content.tool_name || content.name || '';
  const toolUrl = toolPrompt.tool_url || content.tool_url || content.url || content.website_url || '';
  const promptText = toolPrompt.prompt_text || content.prompt_text || content.custom_prompt || content.prompt || 'No prompt available';
  const whenToUse = content.when_to_use || '';
  const whyThisTool = content.why_this_tool || content.why_this_combo || '';
  const alternatives = Array.isArray(content.alternatives) ? content.alternatives : (Array.isArray(toolPrompt.limitations) ? toolPrompt.limitations : []);
  const setupTime = toolPrompt.setup_time || content.setup_time || content.implementation_time || '';
  const costEstimate = toolPrompt.cost_estimate || content.cost_estimate || content.cost_model || '';
  const difficultyLevel = toolPrompt.difficulty_level || content.difficulty_level || content.skill_level || '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      toast({ title: "Prompt Copied!", description: "Ready to paste into " + toolName });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-background/95">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {toolPrompt.title}
            </DialogTitle>
            {jumpInfo && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                From Jump: {jumpInfo.title}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {toolPrompt.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {toolPrompt.description}
            </p>
          )}

          {/* Tool Information with Link */}
          {toolName && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Card className="relative border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">AI Tool</p>
                      <p className="font-semibold">{toolName}</p>
                    </div>
                  </div>
                  {toolUrl && (
                    <a
                      href={toolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-2"
                    >
                      Open Tool
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Prompt Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Ready-to-Use Prompt
              </h3>
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Prompt"}
              </Button>
            </div>
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {promptText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          {toolPrompt.prompt_instructions && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-500 mb-2">How to Use</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {toolPrompt.prompt_instructions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* When to Use */}
          {whenToUse && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-500 mb-2">When to Use</h4>
                    <p className="text-sm leading-relaxed">{whenToUse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Why This Combo */}
          {whyThisTool && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-500 mb-2">Why This Combo</h4>
                    <p className="text-sm leading-relaxed">{whyThisTool}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternative Tools */}
          {alternatives.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alternative Tools
                </h4>
                <div className="space-y-2">
                  {alternatives.slice(0, 2).map((alt: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {typeof alt === 'string' ? alt : (alt.tool || alt.name || 'Alternative')}
                        </p>
                        {typeof alt === 'object' && alt.note && (
                          <p className="text-xs text-muted-foreground mt-1">{alt.note}</p>
                        )}
                      </div>
                      {typeof alt === 'object' && (alt.url || alt.tool_url) && (
                        <a
                          href={alt.url || alt.tool_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ml-3"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Information */}
          <div className="flex gap-2 flex-wrap pt-2 border-t">
            {difficultyLevel && (
              <Badge className={getDifficultyColor(difficultyLevel)} variant="outline">
                {difficultyLevel}
              </Badge>
            )}
            {setupTime && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {setupTime}
              </Badge>
            )}
            {costEstimate && (
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="w-3 h-3" />
                {costEstimate}
              </Badge>
            )}
            {toolPrompt.category && (
              <Badge variant="outline">
                {toolPrompt.category}
              </Badge>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
            {toolPrompt.created_at && <p>Created: {new Date(toolPrompt.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
            {toolPrompt.updated_at && <p>Updated: {new Date(toolPrompt.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
