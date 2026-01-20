import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits, dispatchCreditsUpdate } from "@/hooks/useCredits";
import { getUserJumps, UserJump } from "@/services/jumpService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Rocket, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Zap, 
  Target, 
  Loader2,
  RefreshCw,
  Package,
  Eye,
  FileText,
  Clock,
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
import { AgentDetailCard } from "@/components/implementation/AgentDetailCard";
import { AnalysisSummaryCard } from "@/components/implementation/AnalysisSummaryCard";
import { AgentListCard } from "@/components/implementation/AgentListCard";
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

interface JumpWithAnalysis extends UserJump {
  hasAnalysis?: boolean;
}

export default function Implementation() {
  const { user } = useAuth();
  const { hasCredits, fetchCredits } = useCredits();
  const { getAuthHeaders } = useAuth0Token();
  const [searchParams] = useSearchParams();
  const [jumps, setJumps] = useState<JumpWithAnalysis[]>([]);
  const [selectedJump, setSelectedJump] = useState<JumpWithAnalysis | null>(null);
  const [isLoadingJumps, setIsLoadingJumps] = useState(true);
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
    workflows?: {
      n8n?: { workflow: any; filename: string; detailedInstructions: any; instructions: any };
      make?: { workflow: any; filename: string; detailedInstructions: any; instructions: any };
    };
  } | null>(null);
  
  // Saved agents state
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<SavedAgent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<SavedAgent | null>(null);
  
  // Read tab from URL params, default to "analyze"
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl === 'agents' ? 'agents' : 'analyze');
  
  // Platform selection state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('n8n');

  useEffect(() => {
    loadJumps();
    loadSavedAgents();
  }, []);

  const loadJumps = async () => {
    setIsLoadingJumps(true);
    try {
      const userJumps = await getUserJumps();
      
      // Check which jumps have existing analysis
      if (user) {
        const { data: analyses } = await supabase
          .from('jump_analysis')
          .select('jump_id')
          .eq('user_id', user.id);
        
        const analysedJumpIds = new Set(analyses?.map(a => a.jump_id) || []);
        
        const jumpsWithAnalysis = userJumps.map(jump => ({
          ...jump,
          hasAnalysis: analysedJumpIds.has(jump.id),
        }));
        
        // Sort by creation date, newest first
        const sortedJumps = jumpsWithAnalysis.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setJumps(sortedJumps);
      } else {
        const sortedJumps = userJumps.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setJumps(sortedJumps);
      }
    } catch (error) {
      console.error("Error loading jumps:", error);
      toast.error("Failed to load your jumps");
    } finally {
      setIsLoadingJumps(false);
    }
  };

  const loadSavedAgents = async () => {
    if (!user) return;
    
    setIsLoadingAgents(true);
    try {
      const { data, error } = await supabase
        .from('user_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedAgents(data || []);
    } catch (error) {
      console.error("Error loading agents:", error);
      toast.error("Failed to load your agents");
    } finally {
      setIsLoadingAgents(false);
    }
  };

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
          toast.success("Loaded cached analysis");
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

    // If we have cached analysis and not forcing refresh, use it
    if (analysisResult?.cached && !forceRefresh) {
      toast.info("Analysis already loaded from cache");
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
        
        // Update jump to show it has analysis
        setJumps(prev => prev.map(j => 
          j.id === selectedJump.id ? { ...j, hasAnalysis: true } : j
        ));
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

  // Credit confirmation state for agent builds
  const [showCreditConfirmDialog, setShowCreditConfirmDialog] = useState(false);
  const [pendingBuildOpportunity, setPendingBuildOpportunity] = useState<AgentOpportunity | null>(null);

  const handleBuildAgent = async (opportunity: AgentOpportunity) => {
    if (!selectedJump || !user) {
      toast.error("Please ensure you're logged in and have selected a jump");
      return;
    }

    // Check if user has credits
    if (!hasCredits()) {
      toast.error("Insufficient credits", {
        description: "You need at least 1 credit to build an AI agent. Please purchase more credits.",
      });
      return;
    }

    // Show confirmation dialog
    setPendingBuildOpportunity(opportunity);
    setShowCreditConfirmDialog(true);
  };

  const confirmBuildAgent = async () => {
    if (!pendingBuildOpportunity || !selectedJump) return;
    
    const opportunity = pendingBuildOpportunity;
    setShowCreditConfirmDialog(false);
    setPendingBuildOpportunity(null);
    
    setBuildingAgentId(opportunity.id);
    setGeneratedWorkflow(null);

    try {
      const creditsNeeded = selectedPlatform === 'both' ? 2 : 1;
      const { data, error } = await supabase.functions.invoke("build-agent", {
        headers: await getAuthHeaders(),
        body: {
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
        }
      });

      if (error) throw error;

      if (data?.workflow || data?.workflows) {
        setGeneratedWorkflow({
          workflow: data.workflow,
          filename: data.filename,
          instructions: data.instructions,
          detailedInstructions: data.detailedInstructions,
          opportunityId: opportunity.id,
          agentId: data.agentId,
          platform: data.platform,
          workflows: data.workflows,
        });
        
        // Refresh the agents list and credits balance, then notify other components
        await Promise.all([loadSavedAgents(), fetchCredits()]);
        dispatchCreditsUpdate(); // Sync sidebar and other credit displays
        
        const creditsUsed = data.creditsUsed || 1;
        toast.success("AI Agent built successfully!", {
          description: `${creditsUsed} credit${creditsUsed > 1 ? 's' : ''} used. Find it in your AI Agents tab.`,
        });
      } else {
        throw new Error("No workflow generated");
      }
    } catch (error: any) {
      console.error("Build agent error:", error);
      // Handle specific error cases
      if (error.message?.includes('Insufficient credits')) {
        toast.error("Insufficient credits", {
          description: "You need at least 1 credit to build an AI agent.",
        });
      } else {
        toast.error(error.message || "Failed to generate workflow");
      }
    } finally {
      setBuildingAgentId(null);
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

  const handleDeleteAgent = async (agent: SavedAgent) => {
    try {
      const { error } = await supabase
        .from('user_agents')
        .delete()
        .eq('id', agent.id);
      
      if (error) throw error;
      
      setSavedAgents(prev => prev.filter(a => a.id !== agent.id));
      setAgentToDelete(null);
      setSelectedAgent(null);
      toast.success("Agent deleted successfully");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
    }
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
    
    // Match by jump_id and similar title
    return savedAgents.find(agent => 
      agent.jump_id === selectedJump.id && 
      (agent.title === opportunity.title || 
       agent.title.toLowerCase().includes(opportunity.title.toLowerCase().slice(0, 30)) ||
       opportunity.title.toLowerCase().includes(agent.title.toLowerCase().slice(0, 30)))
    ) || null;
  };

  // Handle viewing agent from opportunity card
  const handleViewAgentFromOpportunity = (agent: SavedAgent) => {
    setSelectedAgent(agent);
    setActiveTab("agents");
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

      {/* Main Tabs - Premium Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "flex flex-row w-full max-w-lg gap-1.5 sm:gap-2",
          "rounded-xl sm:rounded-2xl",
          "glass border border-border/50",
          "p-1.5 sm:p-2",
          "h-auto",
          "backdrop-blur-xl",
          "bg-gradient-to-r from-background/95 via-background/90 to-background/95",
          "shadow-lg shadow-primary/5"
        )}>
          <TabsTrigger 
            value="analyze" 
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "text-xs sm:text-sm font-semibold",
              "py-3 sm:py-3.5 px-4 sm:px-6",
              "rounded-lg sm:rounded-xl",
              "transition-all duration-300",
              "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              "data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10",
              "data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20",
              "data-[state=active]:border data-[state=active]:border-primary/30"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Jumps</span>
          </TabsTrigger>
          <TabsTrigger 
            value="agents" 
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "text-xs sm:text-sm font-semibold",
              "py-3 sm:py-3.5 px-4 sm:px-6",
              "rounded-lg sm:rounded-xl",
              "transition-all duration-300",
              "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              "data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10",
              "data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20",
              "data-[state=active]:border data-[state=active]:border-primary/30"
            )}
          >
            <Package className="w-4 h-4" />
            <span>AI Agents</span>
            {savedAgents.length > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5",
                  "bg-primary/15 text-primary border-primary/25",
                  "font-semibold"
                )}
              >
                {savedAgents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="mt-6">
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
                          onPlatformChange={setSelectedPlatform}
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
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="agents" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agents List */}
            <div className="lg:col-span-1">
              <AgentListCard
                agents={savedAgents}
                selectedAgent={selectedAgent}
                isLoading={isLoadingAgents}
                onSelectAgent={(agent) => setSelectedAgent(agent as SavedAgent)}
                onSwitchToAnalyze={() => setActiveTab("analyze")}
                getImpactBadgeColor={getImpactBadgeColor}
              />
            </div>

            {/* Agent Details */}
            <div className="lg:col-span-2">
              {selectedAgent ? (
                <AgentDetailCard
                  agent={selectedAgent}
                  onDownload={handleDownloadWorkflow}
                  onDelete={() => setAgentToDelete(selectedAgent)}
                  getImpactBadgeColor={getImpactBadgeColor}
                  getComplexityBadgeColor={getComplexityBadgeColor}
                />
              ) : (
                <Card className={cn(
                  "h-[500px] flex items-center justify-center",
                  "border-border/40",
                  "bg-gradient-to-br from-card via-card/95 to-card/90"
                )}>
                  <div className="text-center space-y-3">
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br from-muted/50 to-muted/20",
                      "border border-border/30"
                    )}>
                      <Eye className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Select an agent to view details
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{agentToDelete?.title}" and its workflow. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credit Confirmation Dialog for Agent Builds */}
      <AlertDialog open={showCreditConfirmDialog} onOpenChange={setShowCreditConfirmDialog}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Confirm AI Agent Build
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Building this AI agent will use <span className="font-semibold text-foreground">1 credit</span>.</p>
              {pendingBuildOpportunity && (
                <p className="text-sm">Agent: <span className="font-medium text-foreground">{pendingBuildOpportunity.title}</span></p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBuildAgent}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Zap className="w-4 h-4 mr-1" />
              Use 1 Credit & Build
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
              {jumps.map((jump, index) => (
                <button
                  key={jump.id}
                  onClick={() => onSelectJump(jump)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all duration-200",
                    "border hover:border-primary/40",
                    "group",
                    selectedJump?.id === jump.id
                      ? "border-primary/50 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 shadow-sm"
                      : "border-border/30 bg-background/30 hover:bg-background/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Index number */}
                    <div className={cn(
                      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                      selectedJump?.id === jump.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                    )}>
                      {jumps.length - index}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-medium text-sm truncate flex-1 transition-colors",
                          selectedJump?.id === jump.id && "text-primary"
                        )}>
                          {jump.title}
                        </h4>
                        {jump.hasAnalysis && (
                          <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            Analyzed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground/60">
                          {formatDate(jump.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedJump?.id === jump.id && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
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
