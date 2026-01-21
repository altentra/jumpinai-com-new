import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Bot,
  Check,
  Zap,
  FileText,
  Clock,
  Workflow,
  Wrench,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Timer,
  Target,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentBuildButton } from "./AgentBuildButton";
import { PlatformSelector, Platform } from "./PlatformSelector";
import { PlatformDownloadButton } from "./PlatformDownloadButton";
import { AutomationTypeSelector, AutomationType } from "./AutomationTypeSelector";

interface AgentOpportunity {
  id: string;
  title: string;
  description: string;
  automationTarget: string;
  phaseNumber?: number;
  stepNumber?: number;
  impactLevel: "high" | "medium" | "low";
  complexityLevel: "simple" | "moderate" | "complex";
  estimatedTimeSaved: string;
  requiredTools: string[];
  benefits: string[];
  implementationSteps: string[];
}

interface SavedAgent {
  id: string;
  title: string;
  description: string | null;
  automation_target: string | null;
  automation_type: string | null;
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

interface GeneratedWorkflowData {
  workflow?: any;
  filename?: string;
  instructions?: any;
  detailedInstructions?: any;
  opportunityId: string;
  agentId?: string;
  platform?: string;
  automationType?: AutomationType;
  workflows?: {
    n8n?: {
      workflow: any;
      filename: string;
      detailedInstructions: any;
      instructions: any;
    };
    make?: {
      workflow: any;
      filename: string;
      detailedInstructions: any;
      instructions: any;
    };
  };
}

interface OpportunityCardProps {
  opportunity: AgentOpportunity;
  index: number;
  isBuilding: boolean;
  generatedWorkflow: GeneratedWorkflowData | null;
  existingAgent: SavedAgent | null;
  selectedPlatform: Platform;
  selectedAutomationType: AutomationType;
  onPlatformChange: (platform: Platform) => void;
  onAutomationTypeChange: (type: AutomationType) => void;
  onBuild: () => void;
  onDownload: (workflow: any, filename: string) => void;
  onClearWorkflow: () => void;
  onViewAgent: (agent: SavedAgent) => void;
  getImpactBadgeColor: (level: string | null) => string;
  getComplexityBadgeColor: (level: string | null) => string;
}

const getImpactIcon = (level: string) => {
  switch (level) {
    case "high":
      return <Zap className="w-3.5 h-3.5" />;
    case "medium":
      return <Target className="w-3.5 h-3.5" />;
    default:
      return <Timer className="w-3.5 h-3.5" />;
  }
};

// Platform badge component - subtle with indicator dot
function PlatformBadge({ platform }: { platform: "n8n" | "make" }) {
  const isN8n = platform === "n8n";
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium px-2.5 py-0.5 bg-background/50 gap-1.5"
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isN8n ? "bg-amber-500" : "bg-violet-500"
        )}
      />
      {isN8n ? "n8n" : "Make.com"}
    </Badge>
  );
}

export function OpportunityCard({
  opportunity,
  index,
  isBuilding,
  generatedWorkflow,
  existingAgent,
  selectedPlatform,
  selectedAutomationType,
  onPlatformChange,
  onAutomationTypeChange,
  onBuild,
  onDownload,
  onClearWorkflow,
  onViewAgent,
  getImpactBadgeColor,
  getComplexityBadgeColor,
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeInstructionsPlatform, setActiveInstructionsPlatform] = useState<'n8n' | 'make'>('n8n');

  // Check if this is a "both" platform build
  const hasBothPlatforms = generatedWorkflow?.workflows?.n8n && generatedWorkflow?.workflows?.make;
  const generatedPlatform = generatedWorkflow?.platform || selectedPlatform;
  
  // Determine what type was built (from existing agent or generated workflow)
  const builtType = existingAgent?.automation_type || generatedWorkflow?.automationType || 'workflow';
  const isAIAgent = builtType === 'ai-agent';

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "border-border/40 hover:border-primary/40",
      "bg-gradient-to-br from-card via-card/95 to-card/90",
      existingAgent && "ring-1 ring-green-500/20"
    )}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      
      {/* Status indicator bar */}
      {existingAgent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500/50 via-green-400/50 to-green-500/50" />
      )}

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Icon + Title */}
          <div className="flex items-start gap-4 flex-1">
            {/* Index badge with gradient */}
            <div className={cn(
              "relative shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5",
              "border border-primary/20 shadow-lg shadow-primary/5"
            )}>
              <span className="text-lg font-bold text-primary">{index + 1}</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border/50">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <CardTitle className="text-lg font-semibold leading-tight">
                {opportunity.title}
              </CardTitle>
              
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn(
                  "text-xs font-medium px-2.5 py-0.5 flex items-center gap-1.5",
                  getImpactBadgeColor(opportunity.impactLevel)
                )}>
                  {getImpactIcon(opportunity.impactLevel)}
                  {opportunity.impactLevel} impact
                </Badge>
                <Badge className={cn(
                  "text-xs font-medium px-2.5 py-0.5",
                  getComplexityBadgeColor(opportunity.complexityLevel)
                )}>
                  {opportunity.complexityLevel}
                </Badge>
                {(opportunity.phaseNumber || opportunity.stepNumber) && (
                  <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 bg-background/50">
                    {opportunity.phaseNumber && `Phase ${opportunity.phaseNumber}`}
                    {opportunity.stepNumber && ` · Step ${opportunity.stepNumber}`}
                  </Badge>
                )}
                {existingAgent && (
                  <Badge className="text-xs font-medium px-2.5 py-0.5 bg-green-500/15 text-green-500 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Built
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 pl-16">
          {opportunity.description}
        </p>
      </CardHeader>

      <CardContent className="relative space-y-5 pt-0">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Automation Target Card */}
          <div className={cn(
            "p-4 rounded-xl",
            "bg-gradient-to-br from-background/80 to-background/40",
            "border border-border/40 hover:border-primary/20 transition-colors"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Workflow className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What Gets Automated
              </span>
            </div>
            <p className="text-sm font-medium">{opportunity.automationTarget}</p>
          </div>

          {/* Time Saved Card */}
          <div className={cn(
            "p-4 rounded-xl",
            "bg-gradient-to-br from-green-500/5 to-green-500/[0.02]",
            "border border-green-500/20 hover:border-green-500/30 transition-colors"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <Clock className="w-3.5 h-3.5 text-green-500" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Time Saved
              </span>
            </div>
            <p className="text-sm font-bold text-green-500">
              {opportunity.estimatedTimeSaved}
            </p>
          </div>
        </div>

        {/* Benefits & Tools - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
              <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
              {isExpanded ? "Hide details" : "Show benefits & tools"}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Benefits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Benefits
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-7">
                {opportunity.benefits.map((benefit, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-medium bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    <Check className="w-3 h-3 mr-1 text-green-500" />
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Required Tools */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-muted">
                  <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tools & Technologies
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-7">
                {opportunity.requiredTools.map((tool, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-medium bg-background/50">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-2" />

        {/* Action Section */}
        {generatedWorkflow ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Success Banner */}
            <div className={cn(
              "p-5 rounded-xl",
              "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent",
              "border border-green-500/20"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <span className="font-semibold text-green-500 block">
                    {isAIAgent ? 'AI Agent' : 'Workflow'} Generated & Saved!
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {hasBothPlatforms 
                      ? `Both n8n and Make.com ${isAIAgent ? 'AI agents' : 'workflows'} are ready to download`
                      : `Ready to download and import into ${generatedPlatform === 'n8n' ? 'n8n' : 'Make.com'}`
                    }
                  </span>
                </div>
              </div>
              
              {/* Download Buttons - Platform specific */}
              {hasBothPlatforms ? (
                <div className="space-y-3">
                  <PlatformDownloadButton 
                    platform="n8n"
                    automationType={builtType as 'workflow' | 'ai-agent'}
                    onClick={() => onDownload(
                      generatedWorkflow.workflows!.n8n!.workflow, 
                      generatedWorkflow.workflows!.n8n!.filename
                    )}
                  />
                  <PlatformDownloadButton 
                    platform="make"
                    automationType={builtType as 'workflow' | 'ai-agent'}
                    onClick={() => onDownload(
                      generatedWorkflow.workflows!.make!.workflow, 
                      generatedWorkflow.workflows!.make!.filename
                    )}
                  />
                </div>
              ) : (
                <PlatformDownloadButton 
                  platform={generatedPlatform === 'make' ? 'make' : 'n8n'}
                  automationType={builtType as 'workflow' | 'ai-agent'}
                  onClick={() => onDownload(generatedWorkflow.workflow, generatedWorkflow.filename || 'workflow.json')}
                />
              )}
              
              <a 
                href={generatedPlatform === 'make' || hasBothPlatforms ? "https://make.com" : "https://n8n.io"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors py-3"
              >
                {hasBothPlatforms 
                  ? "New to automation? Create a free account on n8n or Make.com"
                  : `Don't have ${generatedPlatform === 'make' ? 'Make.com' : 'n8n'}? Create your free account here`
                }
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Instructions Toggle */}
            {(generatedWorkflow.detailedInstructions || generatedWorkflow.instructions || 
              generatedWorkflow.workflows?.n8n?.detailedInstructions || generatedWorkflow.workflows?.make?.detailedInstructions) && (
              <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Implementation Instructions
                    </span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showInstructions && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-4">
                  {hasBothPlatforms ? (
                    <div className="space-y-4">
                      {/* Platform tabs for instructions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveInstructionsPlatform('n8n')}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                            activeInstructionsPlatform === 'n8n'
                              ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          n8n Instructions
                        </button>
                        <button
                          onClick={() => setActiveInstructionsPlatform('make')}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                            activeInstructionsPlatform === 'make'
                              ? "bg-purple-500/15 text-purple-500 border border-purple-500/30"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          Make.com Instructions
                        </button>
                      </div>
                      <InstructionsDisplay 
                        instructions={
                          activeInstructionsPlatform === 'n8n' 
                            ? generatedWorkflow.workflows!.n8n 
                            : generatedWorkflow.workflows!.make
                        }
                        platform={activeInstructionsPlatform}
                      />
                    </div>
                  ) : (
                    <InstructionsDisplay 
                      instructions={generatedWorkflow} 
                      platform={generatedPlatform === 'make' ? 'make' : 'n8n'}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            <Button 
              variant="ghost"
              onClick={onClearWorkflow}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          </div>
        ) : existingAgent ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Existing Agent Banner */}
            <div className={cn(
              "p-5 rounded-xl",
              existingAgent.platform === 'make'
                ? "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20"
                : "bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-full animate-pulse",
                  existingAgent.platform === 'make' ? "bg-purple-500/20" : "bg-orange-500/20"
                )}>
                  <CheckCircle2 className={cn(
                    "w-5 h-5",
                    existingAgent.platform === 'make' ? "text-purple-500" : "text-orange-500"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold block",
                      existingAgent.platform === 'make' ? "text-purple-500" : "text-orange-500"
                    )}>
                      Agent Already Built!
                    </span>
                    <PlatformBadge platform={existingAgent.platform as 'n8n' | 'make'} />
                  </div>
                  <span className="text-xs text-muted-foreground">Download your workflow or view full instructions</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Download Button - Platform specific */}
                <PlatformDownloadButton 
                  platform={existingAgent.platform as 'n8n' | 'make'}
                  onClick={() => onDownload(existingAgent.workflow_json, existingAgent.workflow_filename || 'workflow.json')}
                />
                
                {/* View Instructions Button - Secondary glass morphism */}
                <button 
                  onClick={() => onViewAgent(existingAgent)}
                  className="relative group w-full overflow-hidden"
                >
                  {/* Subtle glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 rounded-3xl blur-md opacity-0 group-hover:opacity-50 transition duration-500" />
                  
                  {/* Button body */}
                  <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-background/80 via-muted/30 to-background/80 backdrop-blur-xl rounded-3xl border border-border/60 group-hover:border-primary/40 transition-all duration-300">
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl" />
                    
                    <Eye className="relative w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="relative font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      View Full Instructions
                    </span>
                  </div>
                </button>
              </div>
              
              <a 
                href={existingAgent.platform === 'make' ? "https://make.com" : "https://n8n.io"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors py-3"
              >
                Don't have {existingAgent.platform === 'make' ? 'Make.com' : 'n8n'}? Create your free account here
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            
            <Button 
              variant="ghost"
              onClick={onBuild}
              disabled={isBuilding}
              className="w-full text-muted-foreground hover:text-foreground"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rebuild Agent
            </Button>
          </div>
        ) : (
          <div className="pt-2 space-y-5">
            {/* Automation Type Selector */}
            <AutomationTypeSelector
              value={selectedAutomationType}
              onChange={onAutomationTypeChange}
              disabled={isBuilding}
            />
            
            <Separator />
            
            {/* Platform Selector */}
            <PlatformSelector
              value={selectedPlatform}
              onChange={onPlatformChange}
              disabled={isBuilding}
            />
            
            {/* Build Button - Dynamic based on selection */}
            <AgentBuildButton 
              isBuilding={isBuilding}
              onBuild={onBuild}
              automationType={selectedAutomationType}
            />
            
            {/* Credits info - Dynamic */}
            <p className="text-xs text-center text-muted-foreground">
              {selectedAutomationType === 'ai-agent' ? (
                selectedPlatform === 'both' 
                  ? "Building AI Agents for both platforms will use 4 credits" 
                  : "Building this AI Agent will use 2 credits"
              ) : (
                selectedPlatform === 'both' 
                  ? "Building Workflows for both platforms will use 2 credits" 
                  : "Building this Workflow will use 1 credit"
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Instructions Display Sub-component
function InstructionsDisplay({ instructions, platform }: { instructions: any; platform: 'n8n' | 'make' }) {
  const isN8n = platform === 'n8n';
  const colorClass = isN8n ? 'orange' : 'purple';
  
  return (
    <div className={cn(
      "space-y-4 p-5 rounded-xl",
      isN8n 
        ? "bg-gradient-to-br from-orange-500/5 via-orange-500/[0.02] to-transparent border border-orange-500/20"
        : "bg-gradient-to-br from-purple-500/5 via-purple-500/[0.02] to-transparent border border-purple-500/20"
    )}>
      <h4 className="font-semibold flex items-center gap-2">
        <FileText className={cn("w-4 h-4", isN8n ? "text-orange-500" : "text-purple-500")} />
        <span>{isN8n ? 'n8n' : 'Make.com'} Setup Instructions</span>
        <PlatformBadge platform={platform} />
      </h4>

      {instructions.detailedInstructions?.quickStart && (
        <div className={cn(
          "p-4 rounded-lg border",
          isN8n ? "bg-orange-500/10 border-orange-500/20" : "bg-purple-500/10 border-purple-500/20"
        )}>
          <p className="text-sm font-medium">{instructions.detailedInstructions.quickStart}</p>
        </div>
      )}

      {instructions.detailedInstructions?.requirements?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">!</span>
            Requirements
          </h5>
          <ul className="space-y-2 pl-7">
            {instructions.detailedInstructions.requirements.map((req: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className={cn("w-4 h-4 shrink-0 mt-0.5", isN8n ? "text-orange-500" : "text-purple-500")} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {instructions.detailedInstructions?.steps?.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium">Step-by-Step Guide</h5>
          <div className="space-y-3 pl-2">
            {instructions.detailedInstructions.steps.map((step: any, i: number) => (
              <div key={i} className="flex gap-3 group">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
                  isN8n 
                    ? "bg-gradient-to-br from-orange-500/30 to-orange-500/10 text-orange-500 border-orange-500/20"
                    : "bg-gradient-to-br from-purple-500/30 to-purple-500/10 text-purple-500 border-purple-500/20"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 pb-3 border-b border-border/30 last:border-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                  {step.tips && (
                    <p className={cn(
                      "text-xs mt-2 italic px-2 py-1 rounded",
                      isN8n ? "text-orange-500/80 bg-orange-500/5" : "text-purple-500/80 bg-purple-500/5"
                    )}>
                      💡 {Array.isArray(step.tips) ? step.tips.join(' ') : step.tips}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {instructions.detailedInstructions?.testingGuide && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <h5 className="text-sm font-medium text-green-500 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Testing Guide
          </h5>
          <p className="text-sm text-muted-foreground">{instructions.detailedInstructions.testingGuide}</p>
        </div>
      )}

      {instructions.detailedInstructions?.troubleshooting?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            Troubleshooting
          </h5>
          <ul className="space-y-2 pl-6">
            {instructions.detailedInstructions.troubleshooting.map((tip: any, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">
                {typeof tip === 'string' ? (
                  <span className="flex items-start gap-2">
                    <span className="text-muted-foreground/60">•</span>
                    {tip}
                  </span>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      {tip.problem}
                    </p>
                    <p className="ml-4 text-muted-foreground">{tip.solution}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {instructions.detailedInstructions?._raw && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Full Instructions</h5>
          <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground bg-background/60 border border-border/40 rounded-lg p-4 max-h-64 overflow-y-auto">
            {instructions.detailedInstructions._raw}
          </pre>
        </div>
      )}

      {instructions.instructions && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Basic Import Steps</h5>
          <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal pl-5">
            {Object.values(instructions.instructions).map((line, i) => (
              <li key={i}>{String(line)}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
