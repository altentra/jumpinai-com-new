import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench, AlertTriangle, Lightbulb, Target, Compass, TrendingUp, Shield, DollarSign, Heart, MapPin, Calendar, Play, Flag, LayoutDashboard, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { ToolPromptComboCard } from '@/components/dashboard/ToolPromptComboCard';
import JumpPlanDisplay from '@/components/dashboard/JumpPlanDisplay';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface ProgressiveJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
}

const ProgressiveJumpDisplay: React.FC<ProgressiveJumpDisplayProps> = ({ 
  result, 
  generationTimer 
}) => {
  const navigate = useNavigate();
  const [copiedPrompts, setCopiedPrompts] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState('overview');

  const handleCopyPrompt = async (promptText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompts(prev => new Set([...prev, index]));
      toast.success("Prompt copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedPrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const handleDownload = () => {
    toast.info('Download feature coming soon!');
  };
  
  const handleToolPromptClick = (comboIndex: number, comboId: string) => {
    // Switch to the Tools & Prompts tab
    setActiveTab('toolPrompts');
    
    // Wait for tab to switch, then scroll to the combo
    setTimeout(() => {
      const element = document.getElementById(comboId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 3000);
      }
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (stepName: string, hasContent: boolean) => {
    const currentStep = result.processing_status?.currentStep;
    const isComplete = result.processing_status?.isComplete;
    
    // Determine if this step is complete
    const stepOrder = ['naming', 'overview', 'plan', 'tool_prompts', 'complete'];
    const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;
    const thisStepIndex = stepOrder.indexOf(stepName);
    
    // If generation is complete, all steps get checkmark
    if (isComplete && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    // If current step is past this step and we have content, it's complete
    if (currentStepIndex > thisStepIndex && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    // If this is the current step, show spinning
    if (currentStep === stepName) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    // Otherwise, waiting
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Add null safety checks
  if (!result || !result.processing_status) {
    return (
      <div className="w-full space-y-6">
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Initializing generation system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Compact Glass Progress Header with enhanced glass morphism */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-2xl blur-xl opacity-40"></div>
        <div className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {result.fullTitle || result.title}
                  </h2>
                  {result.jumpNumber && result.jumpName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mt-1">
                      <span>Jump #{result.jumpNumber}</span>
                      <span>•</span>
                      <span>{result.jumpName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs flex items-center gap-1.5 border-border/40 bg-background/50 backdrop-blur-sm">
                  <Timer className="w-3 h-3" />
                  {formatTime(generationTimer)}
                </Badge>
                <Badge 
                  variant={result.processing_status?.isComplete ? "default" : "secondary"}
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {result.processing_status?.stage || 'Initializing...'}
                </Badge>
              </div>
            </div>
            
            {/* Enhanced Generation Timing Summary */}
            {result.processing_status?.isComplete && result.stepTimes && (() => {
              // Map technical step names to user-friendly labels
              const stepLabels: Record<string, string> = {
                naming: 'Name',
                overview: 'Overview',
                comprehensive: 'Plan',
                plan: 'Plan',
                tool_prompts: 'Tools & Prompts',
                tools: 'Tools & Prompts'
              };
              
              // Transform stepTimes into display format, excluding internal steps
              const displaySteps = Object.entries(result.stepTimes)
                .filter(([key]) => key !== 'jump_created' && stepLabels[key]) // Only show mapped steps
                .map(([key, time]) => ({
                  label: stepLabels[key],
                  time
                }))
                .filter((step, index, self) => 
                  // Remove duplicates (e.g., if both 'comprehensive' and 'plan' exist)
                  index === self.findIndex(s => s.label === step.label)
                );
              
              return (
                <div className="mb-4 glass backdrop-blur-md bg-muted/30 rounded-lg border border-border/40 p-4">
                  <div className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Generation Performance
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {displaySteps.map((step, index) => (
                      <div 
                        key={step.label}
                        className="text-center p-3 glass backdrop-blur-sm bg-card/60 rounded-lg border border-border/30"
                      >
                        <div className="font-medium text-sm text-foreground/90 mb-1">{step.label}</div>
                        <div className="text-primary font-semibold text-base">{step.time}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{result.processing_status?.currentTask || 'Starting...'}</span>
                <span className="text-foreground font-semibold">{result.processing_status?.progress || 0}%</span>
              </div>
              <Progress value={result.processing_status?.progress || 0} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {result.processing_status?.isComplete && result.jumpId && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <button
            onClick={() => navigate('/dashboard/jumps')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border/40 bg-background/60 hover:bg-background/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" />
            View My Jumps in My Dashboard
          </button>
          <button
            onClick={() => navigate(`/dashboard/jump/${result.jumpId}`)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 text-primary text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            View this Jump
          </button>
        </div>
      )}

      {/* Content Tabs - Ultra Premium Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative mb-8">
          {/* Mobile: Full width tabs */}
          <div className="sm:hidden pb-4">
            <TabsList className="flex h-auto w-full gap-1.5 p-2 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
              <TabsTrigger 
                value="overview" 
                className="relative flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-3 py-2.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('overview', !!result.full_content)}
                <span className="tracking-wide">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="relative flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-3 py-2.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('plan', !!result.structured_plan)}
                <span className="tracking-wide">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="toolPrompts" 
                className="relative flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-3 py-2.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
                <span className="tracking-wide">Tools & Prompts</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout with premium effects */}
          <TabsList className="hidden sm:grid h-auto w-full grid-cols-3 gap-2 p-3 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
            <TabsTrigger 
              value="overview" 
              className="relative flex items-center justify-center gap-2.5 text-base font-semibold px-6 py-4
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-xl hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('overview', !!result.full_content)}
              </span>
              <span className="tracking-wide">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              className="relative flex items-center justify-center gap-2.5 text-base font-semibold px-6 py-4
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-xl hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('plan', !!result.structured_plan)}
              </span>
              <span className="tracking-wide">Plan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="toolPrompts" 
              className="relative flex items-center justify-center gap-2.5 text-base font-semibold px-6 py-4
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-xl hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
              </span>
              <span className="tracking-wide">Tools & Prompts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          {result.comprehensive_plan ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              {result.comprehensive_plan.executiveSummary && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formatAIText(result.comprehensive_plan.executiveSummary)}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Situation Analysis */}
              {result.comprehensive_plan.situationAnalysis && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Compass className="w-5 h-5 text-primary" />
                      Situation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.comprehensive_plan.situationAnalysis.currentState && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Current State</h4>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.situationAnalysis.currentState)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {result.comprehensive_plan.situationAnalysis.challenges?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            Key Challenges
                          </h4>
                          <ul className="space-y-2">
                            {result.comprehensive_plan.situationAnalysis.challenges.map((challenge: string, idx: number) => (
                              <li key={idx} className="text-sm pl-4 border-l-2 border-destructive/30">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatAIText(challenge)}
                                  </ReactMarkdown>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.comprehensive_plan.situationAnalysis.opportunities?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Opportunities
                          </h4>
                          <ul className="space-y-2">
                            {result.comprehensive_plan.situationAnalysis.opportunities.map((opp: string, idx: number) => (
                              <li key={idx} className="text-sm pl-4 border-l-2 border-primary/30">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatAIText(opp)}
                                  </ReactMarkdown>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strategic Vision */}
              {result.comprehensive_plan.strategicVision && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Strategic Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formatAIText(result.comprehensive_plan.strategicVision)}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Roadmap */}
              {result.comprehensive_plan.roadmap && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Immediate (0-30 days) */}
                    {result.comprehensive_plan.roadmap.immediate && (
                      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-primary flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Immediate Actions
                          </h4>
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">0-30 days</Badge>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.roadmap.immediate)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {/* Short-term (30-90 days) */}
                    {result.comprehensive_plan.roadmap.shortTerm && (
                      <div className="p-4 rounded-xl border border-border/30 bg-background/50">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-foreground" />
                            Short-term Milestones
                          </h4>
                          <Badge variant="outline" className="text-xs">30-90 days</Badge>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.roadmap.shortTerm)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {/* Long-term (90+ days) */}
                    {result.comprehensive_plan.roadmap.longTerm && (
                      <div className="p-4 rounded-xl border border-border/30 bg-background/50">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4 text-foreground" />
                            Long-term Goals
                          </h4>
                          <Badge variant="outline" className="text-xs">90+ days</Badge>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.roadmap.longTerm)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Key Objectives & Success Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                {result.comprehensive_plan.keyObjectives?.length > 0 && (
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Key Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.comprehensive_plan.keyObjectives.map((obj: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {formatAIText(obj)}
                              </ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.comprehensive_plan.successMetrics?.length > 0 && (
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Success Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.comprehensive_plan.successMetrics.map((metric: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {formatAIText(metric)}
                              </ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Risk Assessment */}
              {result.comprehensive_plan.riskAssessment && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    {result.comprehensive_plan.riskAssessment.risks?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          Potential Risks
                        </h4>
                        <ul className="space-y-2">
                          {result.comprehensive_plan.riskAssessment.risks.map((risk: string, idx: number) => (
                            <li key={idx} className="text-sm pl-4 border-l-2 border-destructive/30">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {formatAIText(risk)}
                                </ReactMarkdown>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.comprehensive_plan.riskAssessment.mitigations?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          Mitigation Strategies
                        </h4>
                        <ul className="space-y-2">
                          {result.comprehensive_plan.riskAssessment.mitigations.map((mitigation: string, idx: number) => (
                            <li key={idx} className="text-sm pl-4 border-l-2 border-primary/30">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {formatAIText(mitigation)}
                                </ReactMarkdown>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Generating strategic overview...
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan" className="mt-0">
          {result.structured_plan && result.structured_plan.phases ? (
            <JumpPlanDisplay
              planContent={result.full_content || ''}
              structuredPlan={result.comprehensive_plan}
              onEdit={() => {
                // Scroll to chat to refine
                const chatSection = document.querySelector('[data-chat-section]');
                if (chatSection) {
                  chatSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onDownload={() => handleDownload()}
              jumpId={result.jumpId}
              toolPromptIds={result.components?.toolPrompts?.map((tp: any) => tp?.id || null) || []}
              onToolPromptClick={handleToolPromptClick}
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Creating implementation plan...
            </div>
          )}
        </TabsContent>

        <TabsContent value="toolPrompts" className="mt-0">
          {(() => {
            console.log('🔍 Tools & Prompts Tab - Checking data:', {
              hasComponents: !!result.components,
              hasToolPrompts: !!result.components?.toolPrompts,
              toolPromptsLength: result.components?.toolPrompts?.length,
              toolPromptsData: result.components?.toolPrompts
            });

            if (!result.components?.toolPrompts || result.components.toolPrompts.length === 0) {
              return (
                <div className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl flex items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Generating tools & prompts...
                </div>
              );
            }

            // Validate and map combos with original indices preserved
            const validCombosWithIndices = result.components.toolPrompts
              .map((combo: any, originalIndex: number) => ({ combo, originalIndex }))
              .filter(({ combo, originalIndex }) => {
                const promptText = combo.prompt_text || combo.custom_prompt || combo.prompt;
                const toolName = combo.tool_name || combo.name;
                const hasTitle = combo.title;
                const hasDescription = combo.description;
                
                // More robust validation - check all essential rendering fields
                const isValid = !!(promptText && toolName && hasTitle);
                
                if (!isValid) {
                  console.warn(`⚠️ Combo ${originalIndex + 1} missing required fields:`, {
                    hasPromptText: !!promptText,
                    hasToolName: !!toolName,
                    hasTitle: !!hasTitle,
                    hasDescription: !!hasDescription,
                    combo
                  });
                }
                
                return isValid;
              });

            console.log(`✅ Validated: ${validCombosWithIndices.length} of ${result.components.toolPrompts.length} combos have complete data`);

            // Show loading if we're expecting more combos (target is 9)
            const expectedCount = 9;
            const isGenerating = validCombosWithIndices.length < expectedCount && result.components.toolPrompts.length < expectedCount;

            return (
              <div className="grid gap-4">
                {validCombosWithIndices.map(({ combo, originalIndex }) => {
                  const displayNumber = originalIndex + 1;
                  console.log(`🔧 Rendering valid combo ${displayNumber}:`, {
                    title: combo.title,
                    tool_name: combo.tool_name,
                    hasPrompt: !!(combo.prompt_text || combo.custom_prompt),
                    hasDescription: !!combo.description
                  });
                  return (
                    <ErrorBoundary 
                      key={combo.id || `combo-${originalIndex}`}
                      fallback={
                        <div className="p-6 border border-destructive/30 rounded-lg bg-destructive/5 text-center">
                          <h3 className="text-lg font-semibold mb-2">Error loading tool #{displayNumber}</h3>
                          <p className="text-sm text-muted-foreground">This tool-prompt combo couldn't be displayed.</p>
                        </div>
                      }
                    >
                      <div data-tool-combo={displayNumber} className="animate-fade-in">
                        <ToolPromptComboCard
                          combo={combo}
                          index={displayNumber}
                          onClick={() => {/* Detail modal will be added later */}}
                        />
                      </div>
                    </ErrorBoundary>
                  );
                })}
                
                {/* Show loading indicators for remaining combos */}
                {isGenerating && Array.from({ length: expectedCount - validCombosWithIndices.length }).map((_, idx) => (
                  <div 
                    key={`loading-${idx}`}
                    className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl p-6 flex items-center justify-center h-32 text-muted-foreground animate-pulse"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Generating tool combo #{validCombosWithIndices.length + idx + 1}...
                  </div>
                ))}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressiveJumpDisplay;