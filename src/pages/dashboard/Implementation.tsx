import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits, dispatchCreditsUpdate } from "@/hooks/useCredits";
import { useJumpsWithAnalysis, JumpWithAnalysis } from "@/hooks/useJumpsWithAnalysis";
import { useAutomations, SavedAgent } from "@/hooks/useAutomations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Rocket, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Target, 
  Loader2,
  FileText,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OpportunityCard } from "@/components/implementation/OpportunityCard";
import { AnalysisSummaryCard } from "@/components/implementation/AnalysisSummaryCard";
import { AnalyzeButton } from "@/components/implementation/AnalyzeButton";
import { Platform } from "@/components/implementation/PlatformSelector";
import { AutomationType } from "@/components/implementation/AutomationTypeSelector";

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

interface AnalysisResult {
  summary: string;
  opportunities: AgentOpportunity[];
  overallPotential: string;
  analysisId?: string;
  cached?: boolean;
}

// SavedAgent type imported from useAutomations hook

export default function Implementation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasCredits, fetchCredits } = useCredits();
  const { getAuthHeaders } = useAuth0Token();
  
  // Use cached hooks for fast loading
  const { jumps, isLoading: isLoadingJumps, invalidateCache: invalidateJumpsCache } = useJumpsWithAnalysis();
  const { automations: savedAgents, addToCache: addAgentToCache } = useAutomations();
  
  const [selectedJump, setSelectedJump] = useState<JumpWithAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [buildingAgentId, setBuildingAgentId] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<{
    workflow?: any;
    filename?: string;
    instructions?: Record<string, string>;
    detailedInstructions?: any;
    opportunityId: string;
    agentId?: string;
    platform?: string;
    automationType?: AutomationType;
    workflows?: {
      n8n?: { workflow: any; filename: string; detailedInstructions: any; instructions: any };
      make?: { workflow: any; filename: string; detailedInstructions: any; instructions: any };
    };
  } | null>(null);
  
  
  // Platform and automation type selection state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('n8n');
  const [selectedAutomationType, setSelectedAutomationType] = useState<AutomationType>('workflow');

  // Credit confirmation state for agent builds
  const [showCreditConfirmDialog, setShowCreditConfirmDialog] = useState(false);
  const [isConfirmingBuild, setIsConfirmingBuild] = useState(false);
  const [pendingBuildOpportunity, setPendingBuildOpportunity] = useState<AgentOpportunity | null>(null);

  // Auto-select the most recent jump when data loads
  useEffect(() => {
    if (jumps.length > 0 && !selectedJump) {
      handleSelectJump(jumps[0]);
    }
  }, [jumps]);

  const handleSelectJump = async (jump: JumpWithAnalysis) => {
    setSelectedJump(jump);
    setAnalysisResult(null);
    setGeneratedWorkflow(null);
    
    // If jump has cached analysis, fetch it
    if (jump.hasAnalysis && user) {
      try {
        const { data } = await supabase
          .from('jump_analysis')
          .select('*')
          .eq('user_id', user.id)
          .eq('jump_id', jump.id)
          .single();
        
        if (data) {
          setAnalysisResult({
            summary: data.summary,
            overallPotential: data.overall_potential || '',
            opportunities: data.opportunities as unknown as AgentOpportunity[],
            analysisId: data.id,
            cached: true,
          });
          // Silently load cached analysis - no notification needed
        }
      } catch (error) {
        console.error("Error loading cached analysis:", error);
      }
    }
  };

  const handleAnalyze = async (forceRefresh = false) => {
    if (!selectedJump) {
      toast.error("Please select a jump first");
      return;
    }

    // If we have cached analysis and not forcing refresh, silently use it
    if (analysisResult?.cached && !forceRefresh) {
      return;
    }

    setIsAnalyzing(true);
    if (forceRefresh) {
      setAnalysisResult(null);
    }

    try {
      // If forcing refresh, delete existing analysis first
      if (forceRefresh && user && selectedJump.hasAnalysis) {
        await supabase
          .from('jump_analysis')
          .delete()
          .eq('user_id', user.id)
          .eq('jump_id', selectedJump.id);
      }

      const { data, error } = await supabase.functions.invoke("analyze-for-agents", {
        headers: await getAuthHeaders(),
        body: {
          jumpId: selectedJump.id,
          jumpTitle: selectedJump.title,
          jumpSummary: selectedJump.summary,
          comprehensivePlan: selectedJump.comprehensive_plan,
          structuredPlan: selectedJump.structured_plan,
          fullContent: selectedJump.full_content
        }
      });

      if (error) throw error;

      if (data?.opportunities) {
        setAnalysisResult(data);
        
        // Invalidate jumps cache to reflect new analysis
        invalidateJumpsCache();
        setSelectedJump(prev => prev ? { ...prev, hasAnalysis: true } : null);
        
        const message = data.cached 
          ? "Loaded " + data.opportunities.length + " opportunities from cache"
          : "Analysis complete! Found " + data.opportunities.length + " opportunities";
        toast.success(message);
      } else {
        throw new Error("Invalid response from analysis");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze jump for agent opportunities");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBuildAgent = async (opportunity: AgentOpportunity) => {
    if (!selectedJump || !user) {
      toast.error("Please ensure you're logged in and have selected a jump");
      return;
    }

    // Check if user has credits
    if (!hasCredits()) {
      toast.error("Insufficient credits", {
        description: "You need at least 1 credit to build an automation. Please purchase more credits.",
      });
      return;
    }

    // Show confirmation dialog
    setPendingBuildOpportunity(opportunity);
    setShowCreditConfirmDialog(true);
  };

  const confirmBuildAgent = async () => {
    // Guard against double-click
    if (!pendingBuildOpportunity || !selectedJump || isConfirmingBuild || buildingAgentId) return;
    
    setIsConfirmingBuild(true);
    
    const opportunity = pendingBuildOpportunity;
    setShowCreditConfirmDialog(false);
    setPendingBuildOpportunity(null);
    
    setBuildingAgentId(opportunity.id);
    setGeneratedWorkflow(null);
    
    // Notify user that generation is starting
    const buildType = selectedAutomationType === 'ai-agent' ? 'AI Agent' : 'Workflow';
    toast.info(`Building ${buildType}...`, {
      description: selectedAutomationType === 'ai-agent' 
        ? "This may take 45-90 seconds. The AI is designing a reasoning architecture for you."
        : "This may take 30-60 seconds. The AI is generating your automation workflow.",
      duration: 8000,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      
      const authHeaders = await getAuthHeaders();
      const supabaseUrl = "https://cieczaajcgkgdgenfdzi.supabase.co";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU";
      
      let data: any = null;
      
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/build-agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            ...authHeaders,
          },
          body: JSON.stringify({
            opportunity: {
              title: opportunity.title,
              description: opportunity.description,
              automationTarget: opportunity.automationTarget,
              impact: opportunity.impactLevel,
              complexity: opportunity.complexityLevel,
              estimatedTimeSaved: opportunity.estimatedTimeSaved,
              requiredTools: opportunity.requiredTools,
              benefits: opportunity.benefits,
            },
            jump: {
              id: selectedJump.id,
              title: selectedJump.title,
              summary: selectedJump.summary || "",
              goals: selectedJump.comprehensive_plan?.overview?.goals?.join(", ") || "",
              challenges: selectedJump.comprehensive_plan?.overview?.challenges?.join(", ") || "",
            },
            analysisId: analysisResult?.analysisId,
            platform: selectedPlatform,
            automationType: selectedAutomationType,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
        }
        
        data = await response.json();
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Generation timed out. The AI is still working - please check your Automations page in 1-2 minutes.');
        }
        throw err;
      }

      if (data?.workflow || data?.workflows) {
        setGeneratedWorkflow({
          workflow: data.workflow,
          filename: data.filename,
          instructions: data.instructions,
          detailedInstructions: data.detailedInstructions,
          opportunityId: opportunity.id,
          agentId: data.agentId,
          platform: data.platform,
          automationType: data.automationType,
          workflows: data.workflows,
        });
        
        // Refresh credits (agents list is handled by cache hook)
        await fetchCredits();
        dispatchCreditsUpdate();
        
        const creditsUsed = data.creditsUsed || 1;
        toast.success(`${buildType} built successfully!`, {
          description: `${creditsUsed} credit${creditsUsed > 1 ? 's' : ''} used. View it in your Automations page.`,
        });
      } else {
        throw new Error("No workflow generated");
      }
    } catch (error: any) {
      console.error("Build agent error:", error);
      if (error.message?.includes('Insufficient credits')) {
        toast.error("Insufficient credits", {
          description: "You need more credits to build this. Please purchase more credits.",
        });
      } else {
        toast.error(error.message || "Failed to generate");
      }
    } finally {
      setBuildingAgentId(null);
      setIsConfirmingBuild(false);
    }
  };

  const handleDownloadWorkflow = (workflow: any, filename: string) => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Workflow downloaded!");
  };

  const getImpactBadgeColor = (level: string | null) => {
    switch (level) {
      case "high": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getComplexityBadgeColor = (level: string | null) => {
    switch (level) {
      case "simple": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "moderate": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "complex": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Find existing agent for an opportunity based on title match
  const findExistingAgentForOpportunity = (opportunity: AgentOpportunity): SavedAgent | null => {
    if (!selectedJump) return null;
    
    return savedAgents.find(agent => 
      agent.jump_id === selectedJump.id && 
      (agent.title === opportunity.title || 
       agent.title.toLowerCase().includes(opportunity.title.toLowerCase().slice(0, 30)) ||
       opportunity.title.toLowerCase().includes(agent.title.toLowerCase().slice(0, 30)))
    ) || null;
  };

  // Handle viewing agent - navigate to Automation page
  const handleViewAgentFromOpportunity = (agent: SavedAgent) => {
    navigate('/dashboard/automation');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-2xl",
            "bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5",
            "border border-primary/20 shadow-lg shadow-primary/10"
          )}>
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Jump Implementation
            </h1>
            <p className="text-muted-foreground text-sm">
              Analyze your jumps for automation opportunities & build AI agents
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Jump Selection */}
        <div className="lg:col-span-1">
          <JumpSelectionList
            jumps={jumps}
            selectedJump={selectedJump}
            isLoading={isLoadingJumps}
            onSelectJump={handleSelectJump}
          />
        </div>

        {/* Right Column - Analysis Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Card */}
          <Card className={cn(
            "relative overflow-hidden",
            "border-border/40",
            "bg-gradient-to-br from-card via-card/95 to-card/90"
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Agentic Implementation Analysis
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Our AI analyzes your jump to identify <strong className="text-foreground">automation opportunities</strong> using personalized AI agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {selectedJump ? (
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-xl",
                    "bg-gradient-to-br from-background/80 to-background/40",
                    "border border-border/40"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Selected Jump</span>
                      {analysisResult?.cached && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">Cached</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{selectedJump.title}</h3>
                    {selectedJump.summary && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {selectedJump.summary}
                      </p>
                    )}
                  </div>
                  
                  <AnalyzeButton
                    isAnalyzing={isAnalyzing}
                    hasAnalysis={!!analysisResult}
                    onAnalyze={handleAnalyze}
                    disabled={!selectedJump}
                  />
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br from-muted/50 to-muted/20",
                    "border border-border/30"
                  )}>
                    <ChevronRight className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Select a jump from the list to start analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {analysisResult && (
            <div className="space-y-5">
              {/* Summary Card */}
              <AnalysisSummaryCard
                summary={analysisResult.summary}
                overallPotential={analysisResult.overallPotential}
                opportunitiesCount={analysisResult.opportunities.length}
              />

              {/* Opportunities */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  Automation Opportunities
                  <Badge variant="secondary" className="ml-2 font-medium">
                    {analysisResult.opportunities.length} found
                  </Badge>
                </h3>

                <div className="space-y-4">
                  {analysisResult.opportunities.map((opportunity, index) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      index={index}
                      isBuilding={buildingAgentId === opportunity.id}
                      generatedWorkflow={generatedWorkflow?.opportunityId === opportunity.id ? generatedWorkflow : null}
                      existingAgent={findExistingAgentForOpportunity(opportunity)}
                      selectedPlatform={selectedPlatform}
                      selectedAutomationType={selectedAutomationType}
                      onPlatformChange={setSelectedPlatform}
                      onAutomationTypeChange={setSelectedAutomationType}
                      onBuild={() => handleBuildAgent(opportunity)}
                      onDownload={handleDownloadWorkflow}
                      onClearWorkflow={() => setGeneratedWorkflow(null)}
                      onViewAgent={handleViewAgentFromOpportunity}
                      getImpactBadgeColor={getImpactBadgeColor}
                      getComplexityBadgeColor={getComplexityBadgeColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credit Confirmation Dialog for Agent Builds */}
      <AlertDialog open={showCreditConfirmDialog} onOpenChange={setShowCreditConfirmDialog}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Confirm {selectedAutomationType === 'ai-agent' ? 'AI Agent' : 'Workflow'} Build
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {(() => {
                  const baseCredits = selectedAutomationType === 'ai-agent' ? 2 : 1;
                  const totalCredits = selectedPlatform === 'both' ? baseCredits * 2 : baseCredits;
                  const platformLabel = selectedPlatform === 'both' 
                    ? 'n8n + Make.com' 
                    : selectedPlatform === 'n8n' ? 'n8n' : 'Make.com';
                  const typeLabel = selectedAutomationType === 'ai-agent' ? 'AI Agent' : 'Workflow';
                  
                  return (
                    <>
                      <p>
                        Building a <span className="font-semibold text-foreground">{platformLabel} {typeLabel}</span> will use{' '}
                        <span className={cn(
                          "font-bold",
                          totalCredits >= 3 ? "text-yellow-500" : "text-foreground"
                        )}>
                          {totalCredits} credit{totalCredits > 1 ? 's' : ''}
                        </span>.
                      </p>
                      {selectedAutomationType === 'ai-agent' && (
                        <p className="text-xs text-muted-foreground">
                          AI Agents require 2 credits (autonomous reasoning architecture).
                        </p>
                      )}
                      {selectedPlatform === 'both' && (
                        <p className="text-xs text-muted-foreground">
                          Generating for both platforms doubles the credit cost.
                        </p>
                      )}
                      {totalCredits >= 3 && (
                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-xs text-yellow-500 font-medium">
                            ⚡ High credit usage - consider building for one platform first
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
                {pendingBuildOpportunity && (
                  <p className="text-sm">
                    {selectedAutomationType === 'ai-agent' ? 'Agent' : 'Workflow'}: <span className="font-medium text-foreground">{pendingBuildOpportunity.title}</span>
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBuildAgent}
              disabled={isConfirmingBuild}
              className={cn(
                "text-primary-foreground hover:opacity-90",
                selectedAutomationType === 'ai-agent' 
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500" 
                  : "bg-primary",
                isConfirmingBuild && "opacity-50 cursor-not-allowed"
              )}
            >
              {isConfirmingBuild ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-1" />
                  Use {(() => {
                    const baseCredits = selectedAutomationType === 'ai-agent' ? 2 : 1;
                    return selectedPlatform === 'both' ? baseCredits * 2 : baseCredits;
                  })()} Credit{(() => {
                    const baseCredits = selectedAutomationType === 'ai-agent' ? 2 : 1;
                    return (selectedPlatform === 'both' ? baseCredits * 2 : baseCredits) > 1 ? 's' : '';
                  })()} & Build
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Jump Selection List Component
interface JumpSelectionListProps {
  jumps: JumpWithAnalysis[];
  selectedJump: JumpWithAnalysis | null;
  isLoading: boolean;
  onSelectJump: (jump: JumpWithAnalysis) => void;
}

function JumpSelectionList({
  jumps,
  selectedJump,
  isLoading,
  onSelectJump,
}: JumpSelectionListProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn(
      "h-[280px] lg:h-[500px] flex flex-col",
      "border-border/40",
      "bg-gradient-to-br from-card via-card/95 to-card/90"
    )}>
      <CardHeader className="pb-3 flex-shrink-0 space-y-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          Select a Jump
        </CardTitle>
        <CardDescription className="text-xs">
          Choose from your {jumps.length} generated jumps
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading jumps...</p>
            </div>
          </div>
        ) : jumps.length === 0 ? (
          <div className="text-center py-12 space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                No jumps found
              </p>
              <p className="text-xs text-muted-foreground/70">
                Create a jump first in the Studio
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href="/dashboard/studio">
                <Rocket className="w-4 h-4" />
                Go to Studio
              </a>
            </Button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-3 pb-4 scrollbar-thin">
            <div className="space-y-2">
              {jumps.map((jump) => (
                <button
                  key={jump.id}
                  onClick={() => onSelectJump(jump)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all duration-200",
                    "border hover:border-primary/40",
                    "group",
                    selectedJump?.id === jump.id
                      ? "border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm"
                      : "border-border/30 bg-background/30 hover:bg-background/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                      selectedJump?.id === jump.id
                        ? "bg-primary/15"
                        : "bg-muted/50 group-hover:bg-muted"
                    )}>
                      <FileText className={cn(
                        "w-4 h-4 transition-colors",
                        selectedJump?.id === jump.id ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium text-sm truncate transition-colors",
                        selectedJump?.id === jump.id && "text-foreground"
                      )}>
                        {jump.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDateTime(jump.created_at)}
                        </span>
                        {jump.hasAnalysis && (
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-500 border-green-500/20"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                            Analyzed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
