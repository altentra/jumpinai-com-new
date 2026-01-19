import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserJumps, UserJump } from "@/services/jumpService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Rocket, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Zap, 
  Target, 
  Lightbulb,
  Loader2,
  FileText,
  Clock,
  TrendingUp,
  Workflow,
  Wrench,
  Download,
  ExternalLink,
  RefreshCw,
  Package,
  Eye,
  Trash2,
  MoreVertical,
  Copy,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { getAuthHeaders } = useAuth0Token();
  const [jumps, setJumps] = useState<JumpWithAnalysis[]>([]);
  const [selectedJump, setSelectedJump] = useState<JumpWithAnalysis | null>(null);
  const [isLoadingJumps, setIsLoadingJumps] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [buildingAgentId, setBuildingAgentId] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<{
    workflow: any;
    filename: string;
    instructions: Record<string, string>;
    detailedInstructions?: any;
    opportunityId: string;
    agentId?: string;
  } | null>(null);
  
  // Saved agents state
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<SavedAgent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<SavedAgent | null>(null);
  const [activeTab, setActiveTab] = useState<string>("analyze");

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

  const handleBuildAgent = async (opportunity: AgentOpportunity) => {
    if (!selectedJump || !user) {
      toast.error("Please ensure you're logged in and have selected a jump");
      return;
    }

    setBuildingAgentId(opportunity.id);
    setGeneratedWorkflow(null);

    try {
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
        }
      });

      if (error) throw error;

      if (data?.workflow) {
        setGeneratedWorkflow({
          workflow: data.workflow,
          filename: data.filename,
          instructions: data.instructions,
          detailedInstructions: data.detailedInstructions,
          opportunityId: opportunity.id,
          agentId: data.agentId,
        });
        
        // Refresh the agents list
        await loadSavedAgents();
        
        toast.success("Workflow generated and saved!", {
          description: "Find it in your AI Agents tab",
        });
      } else {
        throw new Error("No workflow generated");
      }
    } catch (error: any) {
      console.error("Build agent error:", error);
      toast.error(error.message || "Failed to generate workflow");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Agent Implementation
            </h1>
            <p className="text-muted-foreground text-sm">
              Analyze jumps for automation opportunities & manage your AI agents
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Analyze Jumps
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            My AI Agents
            {savedAgents.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
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
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[500px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Select a Jump
                  </CardTitle>
                  <CardDescription>
                    Choose from your {jumps.length} generated jumps
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  {isLoadingJumps ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : jumps.length === 0 ? (
                    <div className="text-center py-8 space-y-3 px-6">
                      <FileText className="w-10 h-10 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        No jumps found. Create a jump first in the Studio.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/dashboard/studio">Go to Studio</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto px-4 pb-4">
                      <div className="space-y-2">
                        {jumps.map((jump, index) => (
                          <button
                            key={jump.id}
                            onClick={() => handleSelectJump(jump)}
                            className={cn(
                              "w-full p-3 rounded-lg text-left transition-all duration-200",
                              "border hover:border-primary/30 hover:bg-primary/5",
                              selectedJump?.id === jump.id
                                ? "border-primary/50 bg-primary/10"
                                : "border-border/30 bg-background/50"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className={cn(
                                "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                selectedJump?.id === jump.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {jumps.length - index}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm truncate flex-1">
                                    {jump.title}
                                  </h4>
                                  {jump.hasAnalysis && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(jump.created_at)}
                                  </span>
                                </div>
                              </div>
                              {selectedJump?.id === jump.id && (
                                <Check className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Analysis Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analysis Card */}
              <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Agentic Implementation Analysis
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Our AI analyzes your jump to identify <strong className="text-foreground">automation opportunities</strong> using personalized AI agents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  {selectedJump ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Selected Jump</span>
                          {analysisResult?.cached && (
                            <Badge variant="secondary" className="text-xs">Cached</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{selectedJump.title}</h3>
                        {selectedJump.summary && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {selectedJump.summary}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAnalyze(false)}
                          disabled={isAnalyzing}
                          size="lg"
                          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : analysisResult ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              View Analysis
                            </>
                          ) : (
                            <>
                              <Bot className="w-5 h-5 mr-2" />
                              Analyze for Agents
                              <Rocket className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                        {analysisResult && (
                          <Button
                            onClick={() => handleAnalyze(true)}
                            disabled={isAnalyzing}
                            variant="outline"
                            size="lg"
                          >
                            <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
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
                <div className="space-y-4">
                  {/* Summary Card */}
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Lightbulb className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Analysis Summary</h3>
                          <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-500">
                              {analysisResult.overallPotential}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Opportunities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Automation Opportunities
                      <Badge variant="secondary" className="ml-2">
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
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[500px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Your AI Agents
                  </CardTitle>
                  <CardDescription>
                    {savedAgents.length} agents built
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  {isLoadingAgents ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : savedAgents.length === 0 ? (
                    <div className="text-center py-8 space-y-3 px-6">
                      <Bot className="w-10 h-10 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        No agents built yet. Analyze a jump and build your first agent!
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab("analyze")}
                      >
                        Start Analyzing
                      </Button>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto px-4 pb-4">
                      <div className="space-y-2">
                        {savedAgents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={cn(
                              "w-full p-3 rounded-lg text-left transition-all duration-200",
                              "border hover:border-primary/30 hover:bg-primary/5",
                              selectedAgent?.id === agent.id
                                ? "border-primary/50 bg-primary/10"
                                : "border-border/30 bg-background/50"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className="p-1.5 rounded-md bg-primary/20 shrink-0">
                                <Bot className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {agent.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={cn("text-xs", getImpactBadgeColor(agent.impact_level))}>
                                    {agent.impact_level}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(agent.created_at)}
                                  </span>
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
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[500px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{agentToDelete?.title}" and its workflow. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Opportunity Card Component
interface OpportunityCardProps {
  opportunity: AgentOpportunity;
  index: number;
  isBuilding: boolean;
  generatedWorkflow: any;
  existingAgent: SavedAgent | null;
  onBuild: () => void;
  onDownload: (workflow: any, filename: string) => void;
  onClearWorkflow: () => void;
  onViewAgent: (agent: SavedAgent) => void;
  getImpactBadgeColor: (level: string | null) => string;
  getComplexityBadgeColor: (level: string | null) => string;
}

function OpportunityCard({
  opportunity,
  index,
  isBuilding,
  generatedWorkflow,
  existingAgent,
  onBuild,
  onDownload,
  onClearWorkflow,
  onViewAgent,
  getImpactBadgeColor,
  getComplexityBadgeColor,
}: OpportunityCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {index + 1}. {opportunity.title}
              </CardTitle>
              {(opportunity.phaseNumber || opportunity.stepNumber) && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {opportunity.phaseNumber && `Phase ${opportunity.phaseNumber}`}
                    {opportunity.stepNumber && ` • Step ${opportunity.stepNumber}`}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Badge className={cn("text-xs", getImpactBadgeColor(opportunity.impactLevel))}>
              {opportunity.impactLevel} impact
            </Badge>
            <Badge className={cn("text-xs", getComplexityBadgeColor(opportunity.complexityLevel))}>
              {opportunity.complexityLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{opportunity.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Workflow className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                What Gets Automated
              </span>
            </div>
            <p className="text-sm">{opportunity.automationTarget}</p>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Estimated Time Saved
              </span>
            </div>
            <p className="text-sm font-semibold text-green-500">
              {opportunity.estimatedTimeSaved}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Key Benefits
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {opportunity.benefits.map((benefit, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tools & Technologies
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {opportunity.requiredTools.map((tool, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        {generatedWorkflow ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-500">Workflow Generated & Saved!</span>
              </div>
              
              <Button 
                onClick={() => onDownload(generatedWorkflow.workflow, generatedWorkflow.filename)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download n8n Workflow
              </Button>
              
              <a 
                href="https://n8n.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline py-2"
              >
                Don't have n8n? Create your free account here
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Detailed Instructions Section */}
            {(generatedWorkflow.detailedInstructions || generatedWorkflow.instructions) && (
              <div className="space-y-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Setup Instructions
                </h4>

                {/* Best-case: structured detailed instructions */}
                {generatedWorkflow.detailedInstructions?.quickStart && (
                  <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium">{generatedWorkflow.detailedInstructions.quickStart}</p>
                  </div>
                )}

                {generatedWorkflow.detailedInstructions?.requirements?.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs">!</span>
                      Requirements
                    </h5>
                    <ul className="space-y-1.5">
                      {generatedWorkflow.detailedInstructions.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedWorkflow.detailedInstructions?.steps?.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">Step-by-Step Guide</h5>
                    <div className="space-y-3">
                      {generatedWorkflow.detailedInstructions.steps.map((step: any, i: number) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                            {step.tips && (
                              <p className="text-xs text-primary/80 mt-1 italic">💡 {Array.isArray(step.tips) ? step.tips.join(' ') : step.tips}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedWorkflow.detailedInstructions?.testingGuide && (
                  <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                    <h5 className="text-sm font-medium text-green-400 mb-1">Testing Guide</h5>
                    <p className="text-sm text-muted-foreground">{generatedWorkflow.detailedInstructions.testingGuide}</p>
                  </div>
                )}

                {generatedWorkflow.detailedInstructions?.troubleshooting?.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      Troubleshooting
                    </h5>
                    <ul className="space-y-2">
                      {generatedWorkflow.detailedInstructions.troubleshooting.map((tip: any, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {typeof tip === 'string' ? (
                            <span>• {tip}</span>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">• {tip.problem}</p>
                              <p className="ml-3 text-muted-foreground">{tip.solution}</p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fallback: raw content if the model output couldn't be parsed */}
                {generatedWorkflow.detailedInstructions?._raw && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Full Instructions (Raw)</h5>
                    <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground bg-background/60 border border-border/40 rounded-md p-3">
                      {generatedWorkflow.detailedInstructions._raw}
                    </pre>
                  </div>
                )}

                {/* Always show basic import steps as a guaranteed minimum */}
                {generatedWorkflow.instructions && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Basic Import Steps</h5>
                    <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal pl-4">
                      {Object.values(generatedWorkflow.instructions).map((line, i) => (
                        <li key={i}>{String(line)}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              variant="outline"
              onClick={onClearWorkflow}
              className="w-full"
            >
              Close
            </Button>
          </div>
        ) : existingAgent ? (
          // Show existing agent
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-500">Agent Already Built!</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => onDownload(existingAgent.workflow_json, existingAgent.workflow_filename || 'workflow.json')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download n8n Workflow
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => onViewAgent(existingAgent)}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Instructions
                </Button>
              </div>
              
              <a 
                href="https://n8n.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline py-2"
              >
                Don't have n8n? Create your free account here
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            
            <Button 
              variant="ghost"
              onClick={onBuild}
              disabled={isBuilding}
              className="w-full text-muted-foreground"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rebuild Agent
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button 
              onClick={onBuild}
              disabled={isBuilding}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Workflow...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Build This Agent
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Agent Detail Card Component
interface AgentDetailCardProps {
  agent: SavedAgent;
  onDownload: (workflow: any, filename: string) => void;
  onDelete: () => void;
  getImpactBadgeColor: (level: string | null) => string;
  getComplexityBadgeColor: (level: string | null) => string;
}

function AgentDetailCard({
  agent,
  onDownload,
  onDelete,
  getImpactBadgeColor,
  getComplexityBadgeColor,
}: AgentDetailCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(JSON.stringify(agent.workflow_json, null, 2));
    setCopied(true);
    toast.success("Workflow JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{agent.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("text-xs", getImpactBadgeColor(agent.impact_level))}>
                  {agent.impact_level} impact
                </Badge>
                <Badge className={cn("text-xs", getComplexityBadgeColor(agent.complexity_level))}>
                  {agent.complexity_level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {agent.platform}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyWorkflow}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Workflow JSON
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {agent.description && (
          <p className="text-muted-foreground">{agent.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {agent.automation_target && (
            <div className="p-3 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Automation Target
                </span>
              </div>
              <p className="text-sm">{agent.automation_target}</p>
            </div>
          )}

          {agent.estimated_time_saved && (
            <div className="p-3 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time Saved
                </span>
              </div>
              <p className="text-sm font-semibold text-green-500">
                {agent.estimated_time_saved}
              </p>
            </div>
          )}
        </div>

        {agent.benefits && agent.benefits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Benefits
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.benefits.map((benefit, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {agent.required_tools && agent.required_tools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Required Tools
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.required_tools.map((tool, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Complete Setup Instructions */}
        <div className="space-y-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
          <h4 className="font-semibold flex items-center gap-2 text-green-500">
            <FileText className="w-4 h-4" />
            Implementation Instructions
          </h4>

          {agent.detailed_instructions ? (
            <>
              {agent.detailed_instructions.quickStart && (
                <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium">{agent.detailed_instructions.quickStart}</p>
                </div>
              )}

              {agent.detailed_instructions.requirements?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs">!</span>
                    Requirements
                  </h5>
                  <ul className="space-y-1.5">
                    {agent.detailed_instructions.requirements.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {agent.detailed_instructions.steps?.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Step-by-Step Guide</h5>
                  <div className="space-y-3">
                    {agent.detailed_instructions.steps.map((step: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                          {step.tips && (
                            <p className="text-xs text-primary/80 mt-1 italic">💡 {Array.isArray(step.tips) ? step.tips.join(' ') : step.tips}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agent.detailed_instructions.testingGuide && (
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                  <h5 className="text-sm font-medium text-green-400 mb-1">Testing Guide</h5>
                  <p className="text-sm text-muted-foreground">{agent.detailed_instructions.testingGuide}</p>
                </div>
              )}

              {agent.detailed_instructions.troubleshooting?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    Troubleshooting
                  </h5>
                  <ul className="space-y-2">
                    {agent.detailed_instructions.troubleshooting.map((tip: any, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {typeof tip === 'string' ? (
                          <span>• {tip}</span>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">• {tip.problem}</p>
                            <p className="ml-3 text-muted-foreground">{tip.solution}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {agent.detailed_instructions._raw && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Full Instructions (Raw)</h5>
                  <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground bg-background/60 border border-border/40 rounded-md p-3">
                    {agent.detailed_instructions._raw}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This agent was saved without implementation instructions. Please rebuild this agent from the Analyze tab to regenerate the full setup guide.
            </p>
          )}
        </div>

        <Separator />

        {/* Download Section */}
        <div className="space-y-3">
          <Button 
            onClick={() => onDownload(agent.workflow_json, agent.workflow_filename || 'workflow.json')}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download n8n Workflow
          </Button>
          
          <a 
            href="https://n8n.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
          >
            Don't have n8n? Create your free account here
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
