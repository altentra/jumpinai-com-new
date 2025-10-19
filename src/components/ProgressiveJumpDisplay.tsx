import React from 'react';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench, AlertTriangle, Lightbulb, Target, Compass, TrendingUp, Shield, DollarSign, Heart, MapPin } from 'lucide-react';
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

      {/* Content Tabs - Mobile Optimized with Horizontal Scroll */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="relative">
          {/* Mobile: Horizontal scroll container */}
          <div className="sm:hidden overflow-x-auto scrollbar-hide pb-2">
            <TabsList className="inline-flex w-max min-w-full gap-2 p-1 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-inner">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
                Overview
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
                Plan
              </TabsTrigger>
              <TabsTrigger value="toolPrompts" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.toolPrompts?.length || 0) > 0)}
                Tools & Prompts ({result.components?.toolPrompts?.length || 0}/6)
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout */}
          <TabsList className="hidden sm:grid w-full grid-cols-3 p-1 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-inner">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
              {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
              Overview
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
              {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
              Plan
            </TabsTrigger>
            <TabsTrigger value="toolPrompts" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
              {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.toolPrompts?.length || 0) > 0)}
              Tools & Prompts ({result.components?.toolPrompts?.length || 0}/6)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          {result.comprehensive_plan ? (
            <div className="space-y-6">
              {/* Executive Summary with TL;DR Box */}
              {result.comprehensive_plan.executiveSummary && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-2xl blur-xl opacity-40"></div>
                  <Card className="relative glass backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl bg-gradient-to-br from-background/80 to-background/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-primary" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* TL;DR Box */}
                      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-l-4 border-amber-500">
                        <div className="flex items-start gap-2">
                          <Zap className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-amber-600 dark:text-amber-400 mb-2">TL;DR</div>
                            <p className="text-sm leading-relaxed">
                              {result.comprehensive_plan.executiveSummary.split('.').slice(0, 2).join('.') + '.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Full Summary */}
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="leading-relaxed whitespace-pre-line">{result.comprehensive_plan.executiveSummary}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Situation Analysis - Challenges & Opportunities in 2-column grid */}
              {result.comprehensive_plan.situationAnalysis && (
                <div className="space-y-4">
                  {/* Current State */}
                  {result.comprehensive_plan.situationAnalysis.currentState && (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-40"></div>
                      <Card className="relative glass backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-xl">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Compass className="w-5 h-5 text-blue-500" />
                            Current Situation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{result.comprehensive_plan.situationAnalysis.currentState}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Challenges & Opportunities Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Challenges */}
                    {result.comprehensive_plan.situationAnalysis.challenges && result.comprehensive_plan.situationAnalysis.challenges.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          Key Challenges
                        </h3>
                        {result.comprehensive_plan.situationAnalysis.challenges.map((challenge: string, idx: number) => (
                          <div key={idx} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative glass backdrop-blur-sm border border-red-500/20 rounded-xl p-3 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm leading-relaxed flex-1">{challenge}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Opportunities */}
                    {result.comprehensive_plan.situationAnalysis.opportunities && result.comprehensive_plan.situationAnalysis.opportunities.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Lightbulb className="w-4 h-4" />
                          Key Opportunities
                        </h3>
                        {result.comprehensive_plan.situationAnalysis.opportunities.map((opportunity: string, idx: number) => (
                          <div key={idx} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative glass backdrop-blur-sm border border-emerald-500/20 rounded-xl p-3 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm leading-relaxed flex-1">{opportunity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Strategic Vision */}
              {result.comprehensive_plan.strategicVision && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-40"></div>
                  <Card className="relative glass backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        Success Vision
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="leading-relaxed whitespace-pre-line">{result.comprehensive_plan.strategicVision}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Roadmap - 3 Phase Cards */}
              {result.comprehensive_plan.roadmap && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Journey Roadmap
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {['phase1', 'phase2', 'phase3'].map((phaseKey, idx) => {
                      const phase = result.comprehensive_plan.roadmap[phaseKey];
                      if (!phase) return null;
                      
                      const colors = [
                        { from: 'blue-500', to: 'cyan-500', text: 'blue-500' },
                        { from: 'purple-500', to: 'pink-500', text: 'purple-500' },
                        { from: 'emerald-500', to: 'green-500', text: 'emerald-500' }
                      ];
                      const color = colors[idx];

                      return (
                        <div key={phaseKey} className="relative group">
                          <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color.from}/20 to-${color.to}/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                          <div className={`relative glass backdrop-blur-sm border border-${color.from}/20 rounded-xl p-4 bg-${color.from}/5`}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-lg bg-${color.from}/10 flex items-center justify-center`}>
                                <span className={`text-${color.text} font-bold`}>{idx + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{phase.name}</h4>
                                <p className={`text-xs text-${color.text}/70`}>{phase.timeline}</p>
                              </div>
                            </div>
                            {phase.milestones && phase.milestones.length > 0 && (
                              <ul className="space-y-2 mt-3">
                                {phase.milestones.map((milestone: string, mIdx: number) => (
                                  <li key={mIdx} className="flex items-start gap-2 text-xs">
                                    <CheckCircle className={`w-3 h-3 text-${color.text} mt-0.5 flex-shrink-0`} />
                                    <span className="leading-relaxed">{milestone}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Objectives & Success Metrics - Side by side */}
              <div className="grid md:grid-cols-2 gap-4">
                {result.comprehensive_plan.keyObjectives && result.comprehensive_plan.keyObjectives.length > 0 && (
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-primary" />
                        Key Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.comprehensive_plan.keyObjectives.map((objective: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                            </div>
                            <span className="leading-relaxed flex-1">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.comprehensive_plan.successMetrics && result.comprehensive_plan.successMetrics.length > 0 && (
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Success Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.comprehensive_plan.successMetrics.map((metric: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed flex-1">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Risk Assessment */}
              {result.comprehensive_plan.riskAssessment && (
                <Card className="glass backdrop-blur-xl border border-amber-500/20 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="w-5 h-5 text-amber-500" />
                      Risk Assessment & Mitigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.comprehensive_plan.riskAssessment.risks && result.comprehensive_plan.riskAssessment.risks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-red-600 dark:text-red-400">Potential Risks</h4>
                          <ul className="space-y-2">
                            {result.comprehensive_plan.riskAssessment.risks.map((risk: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.comprehensive_plan.riskAssessment.mitigations && result.comprehensive_plan.riskAssessment.mitigations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-emerald-600 dark:text-emerald-400">Mitigation Strategies</h4>
                          <ul className="space-y-2">
                            {result.comprehensive_plan.riskAssessment.mitigations.map((mitigation: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <Shield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{mitigation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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

        <TabsContent value="plan" className="mt-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 dark:from-primary/10 dark:via-accent/8 dark:to-secondary/10 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 dark:from-primary/1.5 dark:via-transparent dark:to-secondary/1.5 rounded-3xl"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white drop-shadow-sm">Implementation Plan</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {result.structured_plan ? (
                <div className="space-y-4">
                  {result.structured_plan.phases && result.structured_plan.phases.length > 0 ? (
                    <div className="grid gap-4">
                      {result.structured_plan.phases.map((phase: any, index: number) => (
                        <div key={index} className="glass backdrop-blur-sm border border-border/30 rounded-2xl p-4 bg-background/50">
                          <h3 className="font-semibold mb-2 text-white drop-shadow-sm">
                            Phase {index + 1}: {phase.name}
                          </h3>
                          <p className="text-sm text-white/70 drop-shadow-sm mb-3">
                            Duration: {phase.duration}
                          </p>
                          
                          {phase.objectives && phase.objectives.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-white/80 mb-1">Objectives:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {phase.objectives.map((obj: string, idx: number) => (
                                  <li key={idx} className="text-sm text-white/90 drop-shadow-sm">{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {phase.actions && phase.actions.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-white/80 mb-1">Actions:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {phase.actions.map((action: string, idx: number) => (
                                  <li key={idx} className="text-sm text-white/90 drop-shadow-sm">{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {phase.milestones && phase.milestones.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-white/80 mb-1">Milestones:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {phase.milestones.map((milestone: string, idx: number) => (
                                  <li key={idx} className="text-sm text-white/90 drop-shadow-sm">{milestone}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/80 drop-shadow-sm">No implementation phases available</p>
                  )}
                  
                  {result.structured_plan.successMetrics && result.structured_plan.successMetrics.length > 0 && (
                    <div className="glass backdrop-blur-sm border border-border/30 rounded-2xl p-4 bg-background/50 mt-4">
                      <h3 className="font-semibold mb-2 text-white drop-shadow-sm">Success Metrics</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.structured_plan.successMetrics.map((metric: string, idx: number) => (
                          <li key={idx} className="text-sm text-white/90 drop-shadow-sm">{metric}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-white/80 drop-shadow-sm">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Creating implementation plan...
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="toolPrompts" className="mt-4">
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