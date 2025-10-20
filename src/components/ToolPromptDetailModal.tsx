import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Sparkles, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useJumpInfo } from "@/hooks/useJumpInfo";
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

  // Safely extract string values
  const safeString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    return String(val);
  };

  const title = safeString(toolPrompt.title) || 'Tool & Prompt';
  const description = safeString(toolPrompt.description);
  const toolName = safeString(toolPrompt.tool_name);
  const category = safeString(toolPrompt.category);
  const toolUrl = safeString(toolPrompt.tool_url);
  const promptText = safeString(toolPrompt.prompt_text) || 'No prompt available';
  const promptInstructions = safeString(toolPrompt.prompt_instructions);

  const { jumpInfo } = useJumpInfo(toolPrompt.jump_id || undefined);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {title}
          </DialogTitle>
          {jumpInfo && (
            <p className="text-sm text-muted-foreground">
              From Jump: {jumpInfo.title}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {description && (
            <div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}

          {/* Tool Information */}
          {toolName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{toolName}</p>
                    {category && (
                      <Badge variant="outline" className="mt-1">{category}</Badge>
                    )}
                  </div>
                  {toolUrl && (
                    <a 
                      href={toolUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Custom Prompt</CardTitle>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {promptText}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {promptInstructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{promptInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            {toolPrompt.created_at && <p>Created: {formatDate(toolPrompt.created_at)}</p>}
            {toolPrompt.updated_at && <p>Updated: {formatDate(toolPrompt.updated_at)}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
