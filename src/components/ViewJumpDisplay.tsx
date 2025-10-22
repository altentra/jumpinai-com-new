import React from 'react';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench, AlertTriangle, Lightbulb, Target, Compass, TrendingUp, Shield, DollarSign, Heart, MapPin, Calendar, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { ToolPromptComboCard } from '@/components/dashboard/ToolPromptComboCard';
import { toast } from 'sonner';

interface ViewJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
}

const ViewJumpDisplay: React.FC<ViewJumpDisplayProps> = ({ 
  result, 
  generationTimer 
}) => {
  const [copiedPrompts, setCopiedPrompts] = React.useState<Set<number>>(new Set());

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
        <div className="glass-dark rounded-xl p-4 border border-white/20">
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
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-2xl blur-xl opacity-40"></div>
        <div className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/60 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/70 dark:to-gray-900/40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 dark:from-primary/3 dark:via-transparent dark:to-secondary/3 rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent"></div>
          
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
                <div className="mb-4 glass backdrop-blur-md bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/40 p-4">
                  <div className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Generation Performance
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {displaySteps.map((step, index) => (
                      <div 
                        key={step.label}
                        className="text-center p-3 glass backdrop-blur-sm bg-background/50 dark:bg-background/30 rounded-lg border border-border/30"
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

      {/* Content Tabs - Ultra Premium Design */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="relative mb-8">
          {/* Mobile: Horizontal scroll container */}
          <div className="sm:hidden overflow-x-auto scrollbar-hide pb-4">
            <TabsList className="inline-flex h-auto w-max min-w-full gap-2 p-3 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
              <TabsTrigger 
                value="overview" 
                className="relative flex items-center gap-2 text-sm font-semibold whitespace-nowrap px-5 py-3 
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
                className="relative flex items-center gap-2 text-sm font-semibold whitespace-nowrap px-5 py-3 
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
                className="relative flex items-center gap-2 text-sm font-semibold whitespace-nowrap px-5 py-3 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
                <span className="tracking-wide">Tools & Prompts ({result.components?.toolPrompts?.length || 0}/6)</span>
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
              <span className="tracking-wide">Tools & Prompts ({result.components?.toolPrompts?.length || 0}/6)</span>
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
                    {['phase1', 'phase2', 'phase3'].map((phaseKey) => {
                      const phase = result.comprehensive_plan.roadmap[phaseKey];
                      if (!phase) return null;
                      return (
                        <div key={phaseKey} className="p-4 rounded-xl border border-border/30 bg-background/50">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold">{phase.name}</h4>
                            <Badge variant="outline" className="text-xs">{phase.timeline}</Badge>
                          </div>
                          {phase.milestones?.length > 0 && (
                            <ul className="space-y-1">
                              {phase.milestones.map((milestone: string, idx: number) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {formatAIText(milestone)}
                                    </ReactMarkdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
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
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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
          {(() => {
            // CRITICAL: Comprehensive error handling and data validation
            console.log('🔍 Plan Tab - Checking structured_plan:', result.structured_plan);
            
            // Check if structured_plan exists
            if (!result.structured_plan) {
              console.warn('⚠️ No structured_plan data');
              return (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Creating implementation plan...
                </div>
              );
            }

            // Get phases array - handle different possible structures
            let phases = null;
            try {
              console.log('🔍 Examining structured_plan:', {
                type: typeof result.structured_plan,
                isArray: Array.isArray(result.structured_plan),
                keys: result.structured_plan ? Object.keys(result.structured_plan) : 'null',
                hasPhases: result.structured_plan?.phases ? 'yes' : 'no',
                hasImplementationPlan: result.structured_plan?.implementationPlan ? 'yes' : 'no'
              });

              // Try direct access first
              if (Array.isArray(result.structured_plan?.phases)) {
                phases = result.structured_plan.phases;
                console.log('✅ Found phases via direct access');
              } 
              // Try if structured_plan itself is the phases array
              else if (Array.isArray(result.structured_plan)) {
                phases = result.structured_plan;
                console.log('✅ structured_plan itself is phases array');
              }
              // Try if it's wrapped in implementationPlan
              else if (result.structured_plan?.implementationPlan?.phases) {
                phases = result.structured_plan.implementationPlan.phases;
                console.log('✅ Found phases via implementationPlan wrapper');
              }
              // Try if the data structure has a phases key anywhere
              else if (result.structured_plan && typeof result.structured_plan === 'object') {
                // Check all keys for phases
                for (const key in result.structured_plan) {
                  if (Array.isArray(result.structured_plan[key]?.phases)) {
                    phases = result.structured_plan[key].phases;
                    console.log(`✅ Found phases via ${key}.phases`);
                    break;
                  }
                }
              }
              
              console.log('📋 Extracted phases:', phases?.length || 0, 'phases');
            } catch (error) {
              console.error('❌ Error extracting phases:', error);
              console.error('structured_plan value:', result.structured_plan);
            }

            // Validate phases
            if (!phases || !Array.isArray(phases) || phases.length === 0) {
              console.warn('⚠️ No valid phases found in structured_plan');
              console.warn('Full structured_plan object:', JSON.stringify(result.structured_plan, null, 2));
              return (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p>Plan data structure mismatch</p>
                    <p className="text-xs mt-1">Check console for detailed structure</p>
                  </div>
                </div>
              );
            }

            // Render phases
            return (
              <div className="space-y-6">
                {/* Implementation Phases */}
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Your Transformation Roadmap</h3>
                    </div>
                    <p className="text-muted-foreground">
                      This comprehensive action plan breaks down your transformation into {phases.length} strategic phases. 
                      Each phase builds on the previous one, with clear objectives, actionable steps, and measurable milestones.
                    </p>
                  </div>

                  {phases.map((phase: any, index: number) => {
                    // Validate each phase
                    if (!phase) {
                      console.warn(`⚠️ Phase ${index} is null/undefined`);
                      return null;
                    }
                    
                    return (
                    <Card key={index} className="glass backdrop-blur-xl border border-border/40 rounded-2xl overflow-hidden">
                      <CardContent className="p-6 space-y-6">
                        {/* Enhanced Phase Header */}
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-xl font-bold text-xl drop-shadow-lg border-2 border-primary/30 flex-shrink-0">
                            {phase.phase_number || index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                              {phase.title || phase.name}
                            </h3>
                            {phase.description && (
                              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed mb-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {phase.description}
                                </ReactMarkdown>
                              </div>
                            )}
                            {phase.duration && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{phase.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Objectives Section - Improved formatting */}
                        {phase.objectives && Array.isArray(phase.objectives) && phase.objectives.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-base">Phase Objectives</h4>
                            </div>
                            <ul className="space-y-2.5 ml-7">
                              {phase.objectives.map((objective: string, idx: number) => (
                                <li key={idx} className="relative pl-6 text-sm leading-relaxed text-foreground/90">
                                  <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {formatAIText(objective)}
                                    </ReactMarkdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key Actions Section - Improved formatting */}
                        {phase.key_actions && Array.isArray(phase.key_actions) && phase.key_actions.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Play className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-base">Key Actions</h4>
                            </div>
                            <div className="grid gap-3 ml-7">
                              {phase.key_actions.map((action: any, idx: number) => {
                                // Handle action as string or object
                                const actionText = typeof action === 'string' ? action : action.action || action.title;
                                const actionSubtasks = typeof action === 'object' ? action.subtasks || action.steps : null;
                                
                                return (
                                  <div key={idx} className="group">
                                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-background/50 hover:bg-accent/30 transition-colors">
                                      <div className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-md text-xs font-bold flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {formatAIText(actionText)}
                                          </ReactMarkdown>
                                        </div>
                                        {actionSubtasks && Array.isArray(actionSubtasks) && actionSubtasks.length > 0 && (
                                          <ul className="space-y-1 mt-2 pl-4 border-l-2 border-primary/20">
                                            {actionSubtasks.map((subtask: string, subIdx: number) => (
                                              <li key={subIdx} className="text-xs text-muted-foreground">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {formatAIText(subtask)}
                                                  </ReactMarkdown>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Milestones Section - Improved formatting */}
                        {phase.milestones && Array.isArray(phase.milestones) && phase.milestones.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-base">Milestones</h4>
                            </div>
                            <div className="space-y-2 ml-7">
                              {phase.milestones.map((milestone: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                  <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {formatAIText(milestone)}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Success Criteria (if available) */}
                        {phase.success_criteria && Array.isArray(phase.success_criteria) && phase.success_criteria.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-base">Success Criteria</h4>
                            </div>
                            <ul className="space-y-2 ml-7">
                              {phase.success_criteria.map((criteria: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">✓</span>
                                  <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {formatAIText(criteria)}
                                    </ReactMarkdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Tools & Prompts Tab */}
        <TabsContent value="toolPrompts" className="mt-0">
          {result.components?.toolPrompts && result.components.toolPrompts.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Wrench className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Your AI Toolkit</h3>
                </div>
                <p className="text-muted-foreground">
                  We've carefully selected {result.components.toolPrompts.length} AI tools and created custom prompts 
                  tailored specifically for your transformation journey.
                </p>
              </div>

              <div className="grid gap-6">
                {result.components.toolPrompts.map((toolPrompt: any, index: number) => (
                  <ToolPromptComboCard
                    key={index}
                    toolPrompt={toolPrompt}
                    index={index}
                    onCopyPrompt={handleCopyPrompt}
                    isCopied={copiedPrompts.has(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Selecting optimal AI tools...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewJumpDisplay;
