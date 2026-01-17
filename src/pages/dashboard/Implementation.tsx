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
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export default function Implementation() {
  const { user } = useAuth();
  const { getAuthHeaders } = useAuth0Token();
  const [jumps, setJumps] = useState<UserJump[]>([]);
  const [selectedJump, setSelectedJump] = useState<UserJump | null>(null);
  const [isLoadingJumps, setIsLoadingJumps] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [buildingAgentId, setBuildingAgentId] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<{
    workflow: any;
    filename: string;
    instructions: Record<string, string>;
    detailedInstructions?: {
      quickStart: string;
      requirements: string[];
      steps: Array<{
        title: string;
        description: string;
        tips?: string[];
      }>;
      testingGuide: string;
      troubleshooting: Array<{
        problem: string;
        solution: string;
      }>;
    };
    opportunityId: string;
  } | null>(null);
  useEffect(() => {
    loadJumps();
  }, []);

  const loadJumps = async () => {
    setIsLoadingJumps(true);
    try {
      const userJumps = await getUserJumps();
      // Sort by creation date, newest first
      const sortedJumps = userJumps.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setJumps(sortedJumps);
    } catch (error) {
      console.error("Error loading jumps:", error);
      toast.error("Failed to load your jumps");
    } finally {
      setIsLoadingJumps(false);
    }
  };

  const handleSelectJump = (jump: UserJump) => {
    setSelectedJump(jump);
    setAnalysisResult(null); // Clear previous analysis
  };

  const handleAnalyze = async () => {
    if (!selectedJump) {
      toast.error("Please select a jump first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
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
        toast.success("Analysis complete! Found " + data.opportunities.length + " opportunities");
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
        });
        toast.success("Workflow generated successfully!", {
          description: "Download your n8n workflow JSON below",
        });
      } else {
        throw new Error("No workflow generated");
      }
      
      console.log("Build agent response:", data);
    } catch (error: any) {
      console.error("Build agent error:", error);
      toast.error(error.message || "Failed to generate workflow");
    } finally {
      setBuildingAgentId(null);
    }
  };

  const handleDownloadWorkflow = () => {
    if (!generatedWorkflow) return;
    
    const blob = new Blob([JSON.stringify(generatedWorkflow.workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generatedWorkflow.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Workflow downloaded!", {
      description: "Import this file into your n8n instance",
    });
  };

  const getImpactBadgeColor = (level: string) => {
    switch (level) {
      case "high": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getComplexityBadgeColor = (level: string) => {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
              Discover automation opportunities in your jumps
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Jump Selection */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Select a Jump
              </CardTitle>
              <CardDescription>
                Choose one of your generated jumps to analyze
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJumps ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : jumps.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No jumps found. Create a jump first in the Studio.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/dashboard/studio">Go to Studio</a>
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-3">
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
                            <h4 className="font-medium text-sm truncate">
                              {jump.title}
                            </h4>
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
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Card */}
          <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Agentic Implementation Analysis
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Our AI will analyze your selected jump across all phases and steps to identify 
                the <strong className="text-foreground">best opportunities for automation</strong> using 
                personalized AI agents. We'll find tasks that can be streamlined, workflows that 
                can run autonomously, and steps where intelligent automation can save you significant time.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {selectedJump ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Selected Jump</span>
                    </div>
                    <h3 className="font-semibold text-lg">{selectedJump.title}</h3>
                    {selectedJump.summary && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {selectedJump.summary}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing for Agent Opportunities...
                      </>
                    ) : (
                      <>
                        <Bot className="w-5 h-5 mr-2" />
                        Analyze for Agentic Implementation
                        <Rocket className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
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
                  Top Automation Opportunities
                  <Badge variant="secondary" className="ml-2">
                    {analysisResult.opportunities.length} found
                  </Badge>
                </h3>

                <div className="grid gap-4">
                  {analysisResult.opportunities.map((opportunity, index) => (
                    <Card 
                      key={opportunity.id} 
                      className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
                    >
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
                        <p className="text-sm text-muted-foreground">
                          {opportunity.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Automation Target */}
                          <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Workflow className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                What Gets Automated
                              </span>
                            </div>
                            <p className="text-sm">{opportunity.automationTarget}</p>
                          </div>

                          {/* Time Saved */}
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

                        {/* Benefits */}
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

                        {/* Required Tools */}
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

                        {/* Build Button or Download Section */}
                        {generatedWorkflow?.opportunityId === opportunity.id ? (
                          <div className="space-y-4">
                            {/* Success State - Download Section */}
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Check className="w-5 h-5 text-green-500" />
                                <span className="font-semibold text-green-500">Workflow Generated!</span>
                              </div>
                              
                              <div className="space-y-4">
                                {/* Quick Start Summary */}
                                {generatedWorkflow.detailedInstructions?.quickStart && (
                                  <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                                    <p className="text-sm font-medium text-foreground">
                                      {generatedWorkflow.detailedInstructions.quickStart}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Download Button */}
                                <Button 
                                  onClick={handleDownloadWorkflow}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                  size="lg"
                                >
                                  <Download className="w-5 h-5 mr-2" />
                                  Download Your n8n Workflow
                                </Button>
                                
                                <a 
                                  href="https://n8n.io" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline py-1"
                                >
                                  Don't have n8n? Create your free account here
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                
                                {/* Requirements Section */}
                                {generatedWorkflow.detailedInstructions?.requirements && generatedWorkflow.detailedInstructions.requirements.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs">!</span>
                                      Before You Start - You'll Need:
                                    </h4>
                                    <ul className="space-y-1.5">
                                      {generatedWorkflow.detailedInstructions.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                          <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                          <span>{req}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <Separator />
                                
                                {/* Detailed Steps */}
                                {generatedWorkflow.detailedInstructions?.steps && generatedWorkflow.detailedInstructions.steps.length > 0 ? (
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Step-by-Step Setup Guide:</h4>
                                    <div className="space-y-4">
                                      {generatedWorkflow.detailedInstructions.steps.map((step, i) => (
                                        <div key={i} className="relative pl-8">
                                          <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                            {i + 1}
                                          </div>
                                          <div className="space-y-1.5">
                                            <h5 className="font-medium text-sm">{step.title}</h5>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                            {step.tips && step.tips.length > 0 && (
                                              <div className="mt-2 p-2 rounded bg-muted/50 border border-border/50">
                                                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                                                  <Lightbulb className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                                                  <span><strong>Tip:</strong> {step.tips.join(' ')}</span>
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Quick Setup Guide:</h4>
                                    <div className="space-y-1.5">
                                      {Object.entries(generatedWorkflow.instructions).map(([key, value]) => (
                                        <p key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                            {key.replace('step', '')}
                                          </span>
                                          <span>{value}</span>
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Testing Guide */}
                                {generatedWorkflow.detailedInstructions?.testingGuide && (
                                  <>
                                    <Separator />
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        How to Test Your Workflow
                                      </h4>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {generatedWorkflow.detailedInstructions.testingGuide}
                                      </p>
                                    </div>
                                  </>
                                )}
                                
                                {/* Troubleshooting */}
                                {generatedWorkflow.detailedInstructions?.troubleshooting && generatedWorkflow.detailedInstructions.troubleshooting.length > 0 && (
                                  <>
                                    <Separator />
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-orange-500" />
                                        Common Issues & Solutions
                                      </h4>
                                      <div className="space-y-3">
                                        {generatedWorkflow.detailedInstructions.troubleshooting.map((item, i) => (
                                          <div key={i} className="p-3 rounded-md bg-muted/30 border border-border/50">
                                            <p className="text-sm font-medium text-foreground mb-1">
                                              ❓ {item.problem}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              ✅ {item.solution}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline"
                              onClick={() => setGeneratedWorkflow(null)}
                              className="w-full"
                            >
                              Generate New Workflow
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => handleBuildAgent(opportunity)}
                              disabled={buildingAgentId === opportunity.id}
                              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            >
                              {buildingAgentId === opportunity.id ? (
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
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
