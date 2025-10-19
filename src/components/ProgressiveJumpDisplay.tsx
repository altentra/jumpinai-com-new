import React from 'react';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench } from 'lucide-react';
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
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 dark:from-primary/2 dark:via-transparent dark:to-secondary/2 rounded-3xl"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white drop-shadow-sm">
                  <Zap className="w-5 h-5 text-white drop-shadow-sm" />
                  Strategic Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
               {result.full_content ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-white/90 prose-li:text-white/90">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold text-white drop-shadow-sm mb-4 mt-6 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold text-white drop-shadow-sm mb-3 mt-5 first:mt-0 border-b border-white/10 pb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium text-white drop-shadow-sm mb-2 mt-4 first:mt-0">{children}</h3>,
                        p: ({ children }) => <p className="text-white/90 drop-shadow-sm mb-3 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-white/90 drop-shadow-sm space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-white/90 drop-shadow-sm space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed text-white/90 drop-shadow-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-white drop-shadow-sm">{children}</strong>,
                        em: ({ children }) => <em className="italic text-white/80 drop-shadow-sm">{children}</em>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-white/30 pl-4 py-2 my-4 glass backdrop-blur-sm bg-white/10 rounded-r-xl">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="glass backdrop-blur-sm bg-white/10 px-2 py-1 rounded text-sm font-mono text-white/90 border border-white/20">{children}</code>
                        ),
                      }}
                    >
                      {formatAIText(result.full_content)}
                    </ReactMarkdown>
                  </div>
                </div>
               ) : (
                <div className="flex items-center justify-center h-32 text-white/80 drop-shadow-sm">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Generating strategic action plan...
                </div>
              )}
              </CardContent>
            </Card>
          </div>
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