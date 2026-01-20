import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bot, 
  Check, 
  Zap,
  FileText,
  Clock,
  Workflow,
  Wrench,
  Download,
  ExternalLink,
  Copy,
  Sparkles,
  MoreVertical,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Target,
  Timer,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedAgent {
  id: string;
  title: string;
  description: string | null;
  automation_target: string | null;
  impact_level: string | null;
  complexity_level: string | null;
  estimated_time_saved: string | null;
  required_tools: string[];
  benefits: string[];
  workflow_json: any;
  workflow_filename: string | null;
  detailed_instructions: any;
  platform: string;
  status: string;
  download_count: number;
  created_at: string;
  jump_id: string;
}

interface AgentDetailCardProps {
  agent: SavedAgent;
  onDownload: (workflow: any, filename: string) => void;
  onDelete: () => void;
  getImpactBadgeColor: (level: string | null) => string;
  getComplexityBadgeColor: (level: string | null) => string;
}

const getImpactIcon = (level: string | null) => {
  switch (level) {
    case "high": return <Zap className="w-3.5 h-3.5" />;
    case "medium": return <Target className="w-3.5 h-3.5" />;
    default: return <Timer className="w-3.5 h-3.5" />;
  }
};

// Platform badge component - subtle with indicator dot
function PlatformBadge({ platform }: { platform: string }) {
  const isN8n = platform === 'n8n';
  return (
    <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 bg-background/50 gap-1.5">
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        isN8n ? "bg-amber-500" : "bg-violet-500"
      )} />
      {isN8n ? 'n8n' : 'Make.com'}
    </Badge>
  );
}

// Platform-specific download button component - subtle premium design
function PlatformDownloadButton({ 
  platform, 
  onClick, 
  className 
}: { 
  platform: string; 
  onClick: () => void;
  className?: string;
}) {
  const isN8n = platform === 'n8n';
  
  return (
    <button 
      onClick={onClick}
      className={cn("relative group w-full overflow-hidden", className)}
    >
      {/* Subtle shadow glow - platform colored */}
      <div className={cn(
        "absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition duration-500",
        isN8n ? "bg-amber-500/30" : "bg-violet-500/30"
      )} />
      
      {/* Button body - clean neutral with subtle accent */}
      <div className={cn(
        "relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all duration-300",
        "bg-card border border-border/60 group-hover:border-border",
        "shadow-sm group-hover:shadow-md",
        isN8n 
          ? "group-hover:shadow-amber-500/10" 
          : "group-hover:shadow-violet-500/10"
      )}>
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl" />
        
        <Download className="relative w-5 h-5 text-foreground/80 group-hover:text-foreground transition-colors" />
        <span className="relative font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
          Download {isN8n ? 'n8n' : 'Make.com'} Workflow
        </span>
        {/* Small platform indicator dot */}
        <span className={cn(
          "w-2 h-2 rounded-full",
          isN8n ? "bg-amber-500" : "bg-violet-500"
        )} />
        <ArrowRight className="relative w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all duration-300" />
      </div>
    </button>
  );
}

export function AgentDetailCard({
  agent,
  onDownload,
  onDelete,
  getImpactBadgeColor,
  getComplexityBadgeColor,
}: AgentDetailCardProps) {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const isN8n = agent.platform === 'n8n';

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(JSON.stringify(agent.workflow_json, null, 2));
    setCopied(true);
    toast.success("Workflow JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={cn(
      "relative overflow-hidden",
      "border-border/40",
      "bg-gradient-to-br from-card via-card/95 to-card/90"
    )}>
      {/* Decorative header gradient - subtle with platform accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-border via-muted-foreground/30 to-border" />
      {/* Small platform indicator */}
      <div className={cn(
        "absolute top-0 left-6 w-8 h-1 rounded-b-full",
        isN8n ? "bg-amber-500" : "bg-violet-500"
      )} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          {/* Agent Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className={cn(
              "relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-muted/80 via-muted/50 to-muted/30",
              "border border-border/50",
              isN8n ? "shadow-lg shadow-amber-500/5" : "shadow-lg shadow-violet-500/5"
            )}>
              <Bot className="w-7 h-7 text-foreground/80" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <CardTitle className="text-xl font-bold leading-tight">
                {agent.title}
              </CardTitle>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn(
                  "text-xs font-medium px-2.5 py-0.5 flex items-center gap-1.5",
                  getImpactBadgeColor(agent.impact_level)
                )}>
                  {getImpactIcon(agent.impact_level)}
                  {agent.impact_level} impact
                </Badge>
                <Badge className={cn(
                  "text-xs font-medium px-2.5 py-0.5",
                  getComplexityBadgeColor(agent.complexity_level)
                )}>
                  {agent.complexity_level}
                </Badge>
                <PlatformBadge platform={agent.platform} />
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Created {formatDate(agent.created_at)}</span>
                {agent.download_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{agent.download_count} downloads</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={handleCopyWorkflow} className="cursor-pointer">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Workflow JSON
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        {agent.description && (
          <p className="text-muted-foreground leading-relaxed">
            {agent.description}
          </p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agent.automation_target && (
            <div className={cn(
              "p-4 rounded-xl",
              "bg-gradient-to-br from-background/80 to-background/40",
              "border border-border/40"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-muted">
                  <Workflow className="w-3.5 h-3.5 text-foreground/70" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Automation Target
                </span>
              </div>
              <p className="text-sm font-medium">{agent.automation_target}</p>
            </div>
          )}

          {agent.estimated_time_saved && (
            <div className={cn(
              "p-4 rounded-xl",
              "bg-gradient-to-br from-green-500/10 to-green-500/[0.02]",
              "border border-green-500/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-500/15">
                  <Clock className="w-3.5 h-3.5 text-green-500" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Time Saved
                </span>
              </div>
              <p className="text-sm font-bold text-green-500">
                {agent.estimated_time_saved}
              </p>
            </div>
          )}
        </div>

        {/* Benefits */}
        {agent.benefits && agent.benefits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Benefits
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {agent.benefits.map((benefit, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-medium bg-secondary/50">
                  <Check className="w-3 h-3 mr-1 text-green-500" />
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Required Tools */}
        {agent.required_tools && agent.required_tools.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-muted">
                <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required Tools
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {agent.required_tools.map((tool, i) => (
                <Badge key={i} variant="outline" className="text-xs font-medium bg-background/50">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Download Section - Subtle with platform accent */}
        <div className={cn(
          "p-5 rounded-xl",
          "bg-gradient-to-br from-muted/50 via-muted/30 to-transparent",
          "border border-border/50",
          isN8n ? "shadow-sm shadow-amber-500/5" : "shadow-sm shadow-violet-500/5"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-muted">
              <Download className="w-5 h-5 text-foreground/80" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold block text-foreground">
                  Ready to Download
                </span>
                <PlatformBadge platform={agent.platform} />
              </div>
              <span className="text-xs text-muted-foreground">
                Import this workflow into {isN8n ? 'n8n' : 'Make.com'}
              </span>
            </div>
          </div>
          
          <PlatformDownloadButton 
            platform={agent.platform}
            onClick={() => onDownload(agent.workflow_json, agent.workflow_filename || 'workflow.json')}
          />
          
          <a 
            href={isN8n ? "https://n8n.io" : "https://make.com"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-3"
          >
            Don't have {isN8n ? 'n8n' : 'Make.com'}? Create your free account here
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <Separator />

        {/* Implementation Instructions */}
        <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
          <CollapsibleTrigger asChild>
            <button className={cn(
              "w-full p-4 rounded-xl flex items-center justify-between",
              "bg-muted/30 border border-border/50 hover:border-border",
              "transition-colors"
            )}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <FileText className="w-4 h-4 text-foreground/70" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{isN8n ? 'n8n' : 'Make.com'} Implementation Instructions</span>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isN8n ? "bg-amber-500" : "bg-violet-500"
                  )} />
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 transition-transform text-muted-foreground", showInstructions && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4">
            {agent.detailed_instructions ? (
              <div className="space-y-5 p-5 rounded-xl bg-muted/20 border border-border/40">
                {agent.detailed_instructions.quickStart && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium">{agent.detailed_instructions.quickStart}</p>
                  </div>
                )}

                {agent.detailed_instructions.requirements?.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">!</span>
                      Requirements
                    </h5>
                    <ul className="space-y-2 pl-8">
                      {agent.detailed_instructions.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className={cn("w-4 h-4 shrink-0 mt-0.5", isN8n ? "text-orange-500" : "text-purple-500")} />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {agent.detailed_instructions.steps?.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold">Step-by-Step Guide</h5>
                    <div className="space-y-4">
                      {agent.detailed_instructions.steps.map((step: any, i: number) => (
                        <div key={i} className="flex gap-4 group">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border shadow-sm",
                            isN8n
                              ? "bg-gradient-to-br from-orange-500/30 to-orange-500/10 text-orange-500 border-orange-500/20"
                              : "bg-gradient-to-br from-purple-500/30 to-purple-500/10 text-purple-500 border-purple-500/20"
                          )}>
                            {i + 1}
                          </div>
                          <div className="flex-1 pb-4 border-b border-border/30 last:border-0">
                            <p className="text-sm font-semibold">{step.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                            {step.tips && (
                              <div className={cn(
                                "mt-2 p-2 rounded-lg border",
                                isN8n ? "bg-orange-500/5 border-orange-500/10" : "bg-purple-500/5 border-purple-500/10"
                              )}>
                                <p className={cn("text-xs italic", isN8n ? "text-orange-500/80" : "text-purple-500/80")}>
                                  💡 {Array.isArray(step.tips) ? step.tips.join(' ') : step.tips}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agent.detailed_instructions.testingGuide && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h5 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Testing Guide
                    </h5>
                    <p className="text-sm text-muted-foreground">{agent.detailed_instructions.testingGuide}</p>
                  </div>
                )}

                {agent.detailed_instructions.troubleshooting?.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      Troubleshooting
                    </h5>
                    <ul className="space-y-3 pl-6">
                      {agent.detailed_instructions.troubleshooting.map((tip: any, i: number) => (
                        <li key={i} className="text-sm">
                          {typeof tip === 'string' ? (
                            <span className="flex items-start gap-2 text-muted-foreground">
                              <span className="text-muted-foreground/60">•</span>
                              {tip}
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium text-foreground flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                {tip.problem}
                              </p>
                              <p className="ml-6 text-muted-foreground">{tip.solution}</p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {agent.detailed_instructions._raw && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold">Full Instructions</h5>
                    <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground bg-background/60 border border-border/40 rounded-lg p-4 max-h-64 overflow-y-auto scrollbar-thin">
                      {agent.detailed_instructions._raw}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className={cn(
                "p-5 rounded-xl text-center",
                "bg-gradient-to-br from-muted/30 to-muted/10",
                "border border-border/40"
              )}>
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  This agent was saved without implementation instructions.
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Rebuild this agent from the Analyze tab to generate the full setup guide.
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
