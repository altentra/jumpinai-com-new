import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Sparkles, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ToolPromptComboCardProps {
  combo: any;
  onClick?: () => void;
  index?: number; // For numbering (1-9)
}

export function ToolPromptComboCard({ combo, onClick, index }: ToolPromptComboCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Add comprehensive null safety
  if (!combo) {
    console.error('❌ ToolPromptComboCard: combo is null/undefined');
    return (
      <div className="p-6 border border-destructive/30 rounded-lg bg-destructive/5 text-center">
        <p className="text-sm text-muted-foreground">Invalid tool data</p>
      </div>
    );
  }

  console.log('✅ ToolPromptComboCard rendering with data:', combo);

  const copyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const promptToCopy = combo.prompt_text || combo.custom_prompt || combo.prompt;
      if (!promptToCopy) {
        throw new Error('No prompt text available');
      }
      await navigator.clipboard.writeText(promptToCopy);
      setCopied(true);
      toast({
        title: "Prompt Copied!",
        description: "Ready to paste into " + (combo.tool_name || combo.name || 'the tool'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
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

  // Helper to safely convert any value to string for rendering
  const safeString = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // If it's an object, stringify it in a readable way
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // Helper to safely extract string from potentially nested data
  const safeExtract = (obj: any, ...keys: string[]): string => {
    for (const key of keys) {
      const val = obj?.[key];
      if (val) return safeString(val);
    }
    return '';
  };

  const toolUrl = combo.tool_url || combo.url || combo.website_url || combo.website;
  const toolName = safeExtract(combo, 'tool_name', 'name') || 'Unknown Tool';
  const promptText = safeExtract(combo, 'prompt_text', 'custom_prompt', 'prompt');
  const description = safeExtract(combo, 'description');
  const title = safeExtract(combo, 'title') || toolName;
  const category = safeExtract(combo, 'category');
  const whenToUse = safeExtract(combo, 'when_to_use');
  const whyCombo = safeExtract(combo, 'why_this_combo', 'why_this_tool');
  const promptInstructions = safeExtract(combo, 'prompt_instructions', 'instructions');
  const difficultyLevel = safeExtract(combo, 'difficulty_level');
  const setupTime = safeExtract(combo, 'setup_time');
  const costEstimate = safeExtract(combo, 'cost_estimate');
  
  // Safely handle arrays
  const alternatives = Array.isArray(combo.alternatives) ? combo.alternatives : [];

  // Validate essential data - this should never happen with upstream filtering, but just in case
  if (!promptText) {
    console.error('❌ ToolPromptComboCard: Missing prompt text despite filtering. This should not happen!', combo);
    return (
      <div className="p-6 border border-yellow-500/30 rounded-lg bg-yellow-500/5 text-center">
        <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Tool combo is being generated...</p>
      </div>
    );
  }

  return (
    <div id={combo.id || `combo-${index}`} className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <Card 
        className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 mb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-semibold break-words">{index !== undefined && `${index}. `}{title}</span>
            </CardTitle>
            {category && (
              <Badge variant="outline" className="w-fit text-xs self-end">
                {category}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tool Information with Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium truncate">Tool: {toolName}</span>
            </div>
            {toolUrl && (
              <a
                href={toolUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              >
                Open Tool
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Prompt Display */}
          {promptText && (
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
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed break-words overflow-wrap-anywhere">
                  {promptText}
                </pre>
              </div>
            </div>
          )}

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
                {alternatives.map((alt: any, idx: number) => {
                  const altTool = safeExtract(alt, 'tool', 'name') || `Alternative ${idx + 1}`;
                  const altUrl = alt?.url || alt?.tool_url;
                  const altNote = safeExtract(alt, 'note', 'description');
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border text-xs">
                      <div className="flex-1">
                        <span className="text-muted-foreground">{altTool}</span>
                        {altNote && <p className="text-xs text-muted-foreground/70 mt-1">{altNote}</p>}
                      </div>
                      {altUrl && (
                        <a
                          href={altUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
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
            {difficultyLevel && (
              <Badge className={getDifficultyColor(difficultyLevel)} variant="outline">
                {difficultyLevel}
              </Badge>
            )}
            {setupTime && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {setupTime}
              </Badge>
            )}
            {costEstimate && (
              <Badge variant="secondary" className="text-xs gap-1">
                <DollarSign className="w-3 h-3" />
                {costEstimate}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
