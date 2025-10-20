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

  const { jumpInfo } = useJumpInfo(toolPrompt.jump_id || undefined);

  const copyToClipboard = async () => {
    const text = toolPrompt.prompt_text || 'No prompt available';
    try {
      await navigator.clipboard.writeText(text);
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
            {toolPrompt.title || 'Tool & Prompt'}
          </DialogTitle>
          {jumpInfo && (
            <p className="text-sm text-muted-foreground">
              From Jump: {jumpInfo.title}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {toolPrompt.description && (
            <div>
              <p className="text-sm text-muted-foreground">{toolPrompt.description}</p>
            </div>
          )}

          {/* Tool Information */}
          {toolPrompt.tool_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{toolPrompt.tool_name}</p>
                    {toolPrompt.category && (
                      <Badge variant="outline" className="mt-1">{toolPrompt.category}</Badge>
                    )}
                  </div>
                  {toolPrompt.tool_url && (
                    <a 
                      href={toolPrompt.tool_url} 
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
                  {toolPrompt.prompt_text || 'No prompt available'}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {toolPrompt.prompt_instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{toolPrompt.prompt_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {formatDate(toolPrompt.created_at)}</p>
            <p>Updated: {formatDate(toolPrompt.updated_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
