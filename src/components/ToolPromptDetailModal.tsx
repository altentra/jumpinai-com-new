import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, Settings, AlertTriangle, CheckCircle, Tag, Rocket, Copy, Sparkles, ExternalLink } from "lucide-react";
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

  console.log('🎯 Modal opening with toolPrompt:', toolPrompt);
  console.log('🎯 Jump ID:', toolPrompt.jump_id);

  const { jumpInfo } = useJumpInfo(toolPrompt.jump_id || undefined);
  
  console.log('🎯 Jump Info:', jumpInfo);
  
  const content = toolPrompt.content as any;
  const displayItem = {
    title: toolPrompt.title || 'Untitled',
    description: content?.description || toolPrompt.description || '',
    category: content?.category || toolPrompt.category || '',
    tool_name: content?.tool_name || toolPrompt.tool_name || '',
    tool_url: content?.tool_url || content?.url || toolPrompt.tool_url || '',
    tool_type: content?.tool_type || toolPrompt.tool_type || '',
    prompt_text: content?.prompt_text || content?.custom_prompt || content?.prompt || toolPrompt.prompt_text || 'No prompt available',
    prompt_instructions: content?.prompt_instructions || content?.instructions || toolPrompt.prompt_instructions || '',
    use_cases: Array.isArray(content?.use_cases) ? content.use_cases : (Array.isArray(toolPrompt.use_cases) ? toolPrompt.use_cases : []),
    tags: Array.isArray(content?.tags) ? content.tags : (Array.isArray(toolPrompt.tags) ? toolPrompt.tags : []),
    difficulty_level: content?.difficulty_level || content?.difficulty || toolPrompt.difficulty_level || '',
    setup_time: content?.setup_time || toolPrompt.setup_time || '',
    cost_estimate: content?.cost_estimate || content?.cost || toolPrompt.cost_estimate || '',
    integration_complexity: content?.integration_complexity || toolPrompt.integration_complexity || '',
    features: Array.isArray(content?.features) ? content.features : (Array.isArray(toolPrompt.features) ? toolPrompt.features : []),
    limitations: Array.isArray(content?.limitations) ? content.limitations : (Array.isArray(toolPrompt.limitations) ? toolPrompt.limitations : []),
    ai_tools: Array.isArray(content?.ai_tools) ? content.ai_tools : (Array.isArray(toolPrompt.ai_tools) ? toolPrompt.ai_tools : []),
    why_this_tool: content?.why_this_tool || content?.why_this_combo || '',
    when_to_use: content?.when_to_use || '',
    alternatives: Array.isArray(content?.alternatives) ? content.alternatives : [],
    best_practices: Array.isArray(content?.best_practices) ? content.best_practices : [],
    examples: Array.isArray(content?.examples) ? content.examples : []
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayItem.prompt_text);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {displayItem.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {displayItem.description}
              </DialogDescription>
              {jumpInfo && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Rocket className="h-4 w-4" />
                  <span>From Jump: {jumpInfo.title}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {displayItem.tool_name && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {displayItem.tool_name}
              </Badge>
            )}
            {displayItem.category && (
              <Badge variant="outline">{displayItem.category}</Badge>
            )}
            {displayItem.difficulty_level && (
              <Badge className={getDifficultyColor(displayItem.difficulty_level)}>
                {displayItem.difficulty_level}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Information */}
          {displayItem.tool_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  AI Tool Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Tool Name</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{displayItem.tool_name}</p>
                    {displayItem.tool_url && (
                      <a 
                        href={displayItem.tool_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit
                      </a>
                    )}
                  </div>
                </div>
                {displayItem.tool_type && (
                  <div>
                    <p className="text-sm font-medium mb-1">Tool Type</p>
                    <p className="text-sm text-muted-foreground">{displayItem.tool_type}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Prompt Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Custom Prompt
                </CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {displayItem.prompt_text}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Instructions */}
          {displayItem.prompt_instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  How to Use This Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayItem.prompt_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Why This Tool */}
          {displayItem.why_this_tool && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Why This Tool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{displayItem.why_this_tool}</p>
              </CardContent>
            </Card>
          )}

          {/* When to Use */}
          {displayItem.when_to_use && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  When to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{displayItem.when_to_use}</p>
              </CardContent>
            </Card>
          )}

          {/* Alternative Tools */}
          {displayItem.alternatives && displayItem.alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Alternative Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayItem.alternatives.map((alt: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg border flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{alt?.tool || alt?.name || 'Alternative Tool'}</p>
                        {alt?.note && (
                          <p className="text-xs text-muted-foreground">{alt.note}</p>
                        )}
                      </div>
                      {(alt?.url || alt?.tool_url) && (
                        <a 
                          href={alt.url || alt.tool_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Information Grid */}
          {(displayItem.setup_time || displayItem.cost_estimate || displayItem.integration_complexity) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayItem.setup_time && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Setup Time</p>
                      <p className="text-sm text-muted-foreground">{displayItem.setup_time}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {displayItem.cost_estimate && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Cost</p>
                      <p className="text-sm text-muted-foreground">{displayItem.cost_estimate}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {displayItem.integration_complexity && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Complexity</p>
                      <p className="text-sm text-muted-foreground">{displayItem.integration_complexity}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Use Cases */}
          {displayItem.use_cases && displayItem.use_cases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayItem.use_cases.map((useCase, index) => (
                    <li key={index} className="text-sm">{useCase}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {displayItem.features && displayItem.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayItem.features.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Best Practices */}
          {displayItem.best_practices && displayItem.best_practices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayItem.best_practices.map((practice, index) => (
                    <li key={index} className="text-sm">{practice}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Examples */}
          {displayItem.examples && displayItem.examples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayItem.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm">{example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limitations */}
          {displayItem.limitations && displayItem.limitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Limitations & Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayItem.limitations.map((limitation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{limitation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {displayItem.tags && displayItem.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {displayItem.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />
          
          <div className="text-sm text-muted-foreground">
            <p>Created: {formatDate(toolPrompt.created_at)}</p>
            <p>Updated: {formatDate(toolPrompt.updated_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
