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

interface ProgressiveJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
}

const ProgressiveJumpDisplay: React.FC<ProgressiveJumpDisplayProps> = ({ 
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

  const getStatusIcon = (isComplete: boolean, hasContent: boolean) => {
    if (isComplete && hasContent) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (hasContent) return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
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
            {result.processing_status?.isComplete && result.stepTimes && (
              <div className="mb-4 p-3 glass backdrop-blur-sm bg-background/30 dark:bg-background/20 rounded-xl border border-border/30">
                <div className="text-xs font-medium mb-2 text-muted-foreground">Generation Performance</div>
                <div className="grid grid-cols-6 gap-2 text-xs">
                  {Object.entries(result.stepTimes).map(([step, time]) => (
                    <div key={step} className="text-center p-2 glass backdrop-blur-sm bg-primary/5 rounded-lg border border-primary/20">
                      <div className="font-medium text-foreground">Step {step}</div>
                      <div className="text-primary font-semibold">{time}s</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
            <TabsList className="inline-flex w-max min-w-full gap-2 p-3 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
              <TabsTrigger 
                value="overview" 
                className="relative flex items-center gap-2 text-sm font-semibold whitespace-nowrap px-5 py-3 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
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
                {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
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
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.toolPrompts?.length || 0) > 0)}
                <span className="tracking-wide">Tools & Prompts ({result.components?.toolPrompts?.length || 0}/6)</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout with premium effects */}
          <TabsList className="hidden sm:grid w-full grid-cols-3 gap-2 p-3 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
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
                {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
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
                {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
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
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.toolPrompts?.length || 0) > 0)}
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
              // Try direct access first
              if (Array.isArray(result.structured_plan.phases)) {
                phases = result.structured_plan.phases;
              } 
              // Try if structured_plan itself is the phases array
              else if (Array.isArray(result.structured_plan)) {
                phases = result.structured_plan;
              }
              // Try if it's wrapped in implementationPlan
              else if (result.structured_plan.implementationPlan?.phases) {
                phases = result.structured_plan.implementationPlan.phases;
              }
              
              console.log('📋 Found phases array:', phases?.length || 0, 'phases');
            } catch (error) {
              console.error('❌ Error extracting phases:', error);
            }

            // Validate phases
            if (!phases || !Array.isArray(phases) || phases.length === 0) {
              console.warn('⚠️ No valid phases found in structured_plan');
              return (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p>Plan data structure mismatch</p>
                    <p className="text-xs mt-1">Check console for details</p>
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
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {phase.duration}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Objectives Section */}
                        {phase.objectives && phase.objectives.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg p-5 border border-blue-200/50 dark:border-blue-800/30">
                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              Phase Objectives
                            </h4>
                            <div className="grid gap-3">
                              {phase.objectives.map((objective: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 bg-white/50 dark:bg-background/30 rounded-md p-3 border border-blue-200/30 dark:border-blue-800/20">
                                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {objective}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Actions Section */}
                        {phase.key_actions && phase.key_actions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                              <Play className="h-5 w-5 text-primary" />
                              Action Steps
                            </h4>
                            <div className="space-y-4">
                              {phase.key_actions.map((action: any, actionIdx: number) => (
                                <Card key={actionIdx} className="border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-background to-muted/20">
                                  <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold text-sm flex-shrink-0 border border-primary/20">
                                          {actionIdx + 1}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-semibold text-foreground text-base mb-2 leading-snug prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                              {action.action}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 flex-shrink-0">
                                        {action.priority && (
                                          <Badge 
                                            variant={action.priority === 'High' ? 'destructive' : action.priority === 'Medium' ? 'default' : 'secondary'}
                                            className="text-xs whitespace-nowrap"
                                          >
                                            {action.priority}
                                          </Badge>
                                        )}
                                        {action.effort_level && (
                                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            {action.effort_level}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {action.description && (
                                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed pl-11">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {action.description}
                                        </ReactMarkdown>
                                      </div>
                                    )}
                                    {action.dependencies && action.dependencies.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-border/50 pl-11">
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                          <span className="font-medium text-foreground">Dependencies:</span> 
                                          <span>{action.dependencies.join(' • ')}</span>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Milestones Section */}
                        {phase.milestones && phase.milestones.length > 0 && (
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/20 dark:to-slate-900/10 rounded-lg p-5 border border-slate-200/50 dark:border-slate-800/30">
                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                              <CheckCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                              Phase Milestones
                            </h4>
                            <div className="space-y-3">
                              {phase.milestones.map((milestone: any, idx: number) => (
                                <Card key={idx} className="border-slate-200/30 dark:border-slate-800/20 bg-white/50 dark:bg-background/30">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="font-medium text-foreground prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {typeof milestone === 'string' ? milestone : milestone.milestone}
                                        </ReactMarkdown>
                                      </div>
                                      {milestone.target_date && (
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {milestone.target_date}
                                        </Badge>
                                      )}
                                    </div>
                                    {milestone.success_criteria && milestone.success_criteria.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-slate-200/30 dark:border-slate-800/20">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Success Criteria:</p>
                                        <ul className="space-y-1">
                                          {milestone.success_criteria.map((criteria: string, cIdx: number) => (
                                            <li key={cIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                              <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                  {criteria}
                                                </ReactMarkdown>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                  })}
                  
                  {/* Success Metrics */}
                  {result.structured_plan.successMetrics && result.structured_plan.successMetrics.length > 0 && (
                    <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Success Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.structured_plan.successMetrics.map((metric: string, idx: number) => (
                            <li key={idx} className="text-sm text-foreground/80 flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                              </div>
                              <span>{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="toolPrompts" className="mt-0">
          <div className="grid gap-4">
            {result.components?.toolPrompts && result.components.toolPrompts.length > 0 ? (
              result.components.toolPrompts.map((combo: any, index: number) => (
                <ToolPromptComboCard
                  key={index}
                  combo={combo}
                  onClick={() => {/* Detail modal will be added later */}}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Generating tools & prompts...
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressiveJumpDisplay;