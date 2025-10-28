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
import { toast } from 'sonner';

interface ViewJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
}

const ViewJumpDisplay: React.FC<ViewJumpDisplayProps> = ({
  result, 
  generationTimer 
}) => {
  const navigate = useNavigate();
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
      {/* Content Tabs - Ultra Premium Design */}
      <Tabs defaultValue="overview" className="w-full">
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
                                <li key={idx} className="text-sm flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
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
              <div className="space-y-3">
                {/* Implementation Phases */}
                <div className="space-y-3">
                  {/* Executive Summary */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-accent/8 to-secondary/10 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border/30 hover:border-primary/30 transition-all">
                      <CardContent className="p-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold">Your Transformation Roadmap</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This comprehensive action plan breaks down your transformation into {phases.length} strategic phases. 
                          Each phase builds on the previous one, with clear objectives, actionable steps, and measurable milestones.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {phases.map((phase: any, index: number) => {
                    // Validate each phase
                    if (!phase) {
                      console.warn(`⚠️ Phase ${index} is null/undefined`);
                      return null;
                    }
                    
                    return (
                    <div key={index} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-accent/8 to-secondary/10 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                      <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border/30 hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-3.5 space-y-3">
                          {/* Phase Header */}
                          <div className="flex items-start gap-3 pb-2.5 border-b border-border/20">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg font-bold text-sm flex-shrink-0">
                              {phase.phase_number || index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold mb-1">
                                {phase.title || phase.name}
                              </h3>
                              {phase.description && (
                                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {phase.description}
                                  </ReactMarkdown>
                                </div>
                              )}
                              {phase.duration && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
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
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <h4 className="font-medium text-sm text-green-400">Phase Objectives</h4>
                              </div>
                              <div className="space-y-1.5">
                                {phase.objectives.map((objective: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-background/50 rounded border border-border/30">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                                    <div className="prose prose-sm dark:prose-invert max-w-none flex-1 text-sm text-foreground leading-relaxed">
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
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Play className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                <h4 className="font-medium text-sm text-blue-400">Action Steps</h4>
                              </div>
                              <div className="space-y-1.5">
                                {phase.key_actions.map((action: any, actionIdx: number) => (
                                  <div key={actionIdx} className="p-2.5 bg-background/50 rounded-lg border border-border/30 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className="flex items-center justify-center w-5 h-5 bg-blue-400/20 text-blue-400 rounded-md font-semibold text-xs flex-shrink-0">
                                          {actionIdx + 1}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                              {action.action}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-1.5 flex-shrink-0">
                                        {action.priority && (
                                          <Badge 
                                            variant={action.priority === 'High' ? 'destructive' : action.priority === 'Medium' ? 'default' : 'secondary'}
                                            className="text-xs whitespace-nowrap h-5"
                                          >
                                            {action.priority}
                                          </Badge>
                                        )}
                                        {action.effort_level && (
                                          <Badge variant="outline" className="text-xs whitespace-nowrap h-5">
                                            {action.effort_level}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {action.description && (
                                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed pl-6">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {action.description}
                                        </ReactMarkdown>
                                      </div>
                                    )}
                                    {action.dependencies && action.dependencies.length > 0 && (
                                      <div className="pt-1.5 border-t border-border/20 pl-6">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2 p-2 bg-muted/30 rounded border border-border/30">
                                          <span className="font-semibold">Dependencies:</span> 
                                          <span>{action.dependencies.join(' • ')}</span>
                                        </div>
                                      </div>
                                    )}
                                    {action.tool_references && action.tool_references.length > 0 && (
                                      <div className="pt-1.5 border-t border-border/20 pl-6">
                                        <div className="flex items-center gap-2 flex-wrap p-2 bg-muted/30 rounded border border-border/30">
                                          <span className="text-sm font-semibold flex items-center gap-1">
                                            <Wrench className="w-3 h-3 flex-shrink-0" />
                                            Recommended Tools:
                                          </span>
                                          {action.tool_references.map((toolNum: number) => (
                                            <button
                                              key={toolNum}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const toolPromptTab = document.querySelector('[value="toolPrompts"]');
                                                if (toolPromptTab) {
                                                  (toolPromptTab as HTMLElement).click();
                                                  setTimeout(() => {
                                                    const comboCards = document.querySelectorAll('[data-tool-combo]');
                                                    const targetCard = comboCards[toolNum - 1];
                                                    if (targetCard) {
                                                      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                  }, 300);
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-medium transition-colors"
                                            >
                                              <span>🔧</span> Tool #{toolNum}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Milestones Section */}
                          {phase.milestones && phase.milestones.length > 0 && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Flag className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <h4 className="font-medium text-sm text-green-400">Phase Milestones</h4>
                              </div>
                              <div className="space-y-1.5">
                                {phase.milestones.map((milestone: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-background/50 rounded-lg border border-border/30 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="font-medium text-sm prose prose-sm dark:prose-invert max-w-none flex-1">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {typeof milestone === 'string' ? milestone : milestone.milestone}
                                        </ReactMarkdown>
                                      </div>
                                      {milestone.target_date && (
                                        <Badge variant="outline" className="text-xs whitespace-nowrap h-5 flex items-center border-green-400/30">
                                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0 text-green-400" />
                                          {milestone.target_date}
                                        </Badge>
                                      )}
                                    </div>
                                    {milestone.success_criteria && milestone.success_criteria.length > 0 && (
                                      <div className="pt-1.5 border-t border-border/20">
                                        <p className="text-xs font-medium text-green-400 mb-1">Success Criteria:</p>
                                        <ul className="space-y-1 p-2 bg-muted/30 rounded border border-border/30">
                                          {milestone.success_criteria.map((criteria: string, cIdx: number) => (
                                            <li key={cIdx} className="text-xs text-foreground flex items-center gap-1.5">
                                              <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                                              <div className="prose prose-sm dark:prose-invert max-w-none flex-1 leading-tight">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                  {criteria}
                                                </ReactMarkdown>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                  })}
                
                {/* Success Metrics */}
                {result.structured_plan.successMetrics && result.structured_plan.successMetrics.length > 0 && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-accent/8 to-secondary/10 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border/30 hover:border-primary/30 transition-all">
                      <CardContent className="p-3.5">
                        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                          Success Metrics
                        </h3>
                        <ul className="space-y-1.5">
                          {result.structured_plan.successMetrics.map((metric: string, idx: number) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2 p-2 bg-muted/20 rounded-lg border border-border/20">
                              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 translate-y-[0.125rem]">
                                <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                              </div>
                              <span className="leading-relaxed">{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
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
                <div key={index} data-tool-combo={index + 1} className="animate-fade-in">
                  <ToolPromptComboCard
                    combo={combo}
                    index={index + 1}
                    onClick={() => {/* Detail modal will be added later */}}
                  />
                </div>
              ))
            ) : (
              <div className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl flex items-center justify-center h-32 text-muted-foreground">
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

export default ViewJumpDisplay;