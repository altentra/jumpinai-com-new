import React from 'react';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
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
                <h2 className="text-xl font-semibold text-foreground">{result.title}</h2>
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
                <div className="grid grid-cols-5 gap-2 text-xs">
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

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 p-1 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-inner">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
            Overview
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
            Plan
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.prompts?.length || 0) > 0)}
            Prompts ({result.components?.prompts?.length || 0}/4)
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.workflows?.length || 0) > 0)}
            Workflows ({result.components?.workflows?.length || 0}/4)
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.blueprints?.length || 0) > 0)}
            Blueprints ({result.components?.blueprints?.length || 0}/4)
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.strategies?.length || 0) > 0)}
            Strategies ({result.components?.strategies?.length || 0}/4)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 dark:from-primary/2 dark:via-transparent dark:to-secondary/2 rounded-3xl"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Zap className="w-5 h-5 text-primary" />
                  Strategic Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {result.full_content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="text-foreground"
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h3>,
                      p: ({ children }) => <p className="text-foreground mb-3 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-foreground space-y-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-foreground space-y-2">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed text-foreground">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic text-primary">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 glass backdrop-blur-sm bg-primary/10 rounded-r-xl">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="glass backdrop-blur-sm bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border border-border/30">{children}</code>
                      ),
                    }}
                  >
                    {formatAIText(result.full_content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
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
                <CardTitle className="text-base text-foreground">Implementation Plan</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {result.structured_plan ? (
                <div className="space-y-4">
                  <p className="text-foreground">{result.structured_plan.overview}</p>
                  <div className="grid gap-4">
                    {result.structured_plan.phases?.map((phase: any, index: number) => (
                      <div key={index} className="glass backdrop-blur-sm border border-border/30 rounded-2xl p-4 bg-background/50">
                        <h3 className="font-semibold mb-2 text-foreground">Phase {phase.phase_number}: {phase.title}</h3>
                        <p className="text-sm text-foreground mb-2">Duration: {phase.duration}</p>
                        <p className="text-sm text-foreground">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Creating implementation plan...
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="mt-4">
          <div className="grid gap-3">
            {[...Array(4)].map((_, index) => {
              const prompt = result.components.prompts[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                     <CardHeader className="pb-2">
                       <CardTitle className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2">
                           {getStatusIcon(result.processing_status.isComplete, !!prompt)}
                           {prompt ? prompt.title : `AI Prompt ${index + 1}`}
                         </div>
                         {prompt && (
                           <div className="relative group">
                             <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                             <button
                               onClick={() => handleCopyPrompt(prompt.prompt_text, index)}
                               className="relative px-3 py-1.5 glass backdrop-blur-xl border border-border/30 hover:border-primary/40 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md bg-gradient-to-br from-background/60 to-background/40 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40 hover:scale-105 active:scale-95 group overflow-hidden"
                             >
                               <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 rounded-lg"></div>
                               <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-white/8 dark:from-white/6 dark:via-transparent dark:to-white/6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                               
                               <div className="relative z-10 flex items-center gap-1.5">
                                 {copiedPrompts.has(index) ? (
                                   <>
                                     <Check className="w-3 h-3 text-green-500" />
                                     <span className="text-xs font-medium text-green-500">Copied</span>
                                   </>
                                 ) : (
                                   <>
                                     <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                                     <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Copy</span>
                                   </>
                                 )}
                               </div>
                             </button>
                           </div>
                         )}
                       </CardTitle>
                     </CardHeader>
                    <CardContent className="pt-0">
                    {prompt ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{prompt.description}</p>
                         <div className="glass backdrop-blur-sm bg-background/50 dark:bg-background/30 rounded-xl p-4 border border-border/30">
                           <pre className="text-sm whitespace-pre-wrap text-foreground select-text font-mono leading-relaxed">{prompt.prompt_text}</pre>
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Prompts' && result.components.prompts.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating prompt...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <div className="grid gap-3">
            {[...Array(4)].map((_, index) => {
              const workflow = result.components.workflows[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {getStatusIcon(result.processing_status.isComplete, !!workflow)}
                        {workflow ? workflow.title : `Workflow ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    {workflow ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        <div className="space-y-2">
                          {workflow.workflow_steps?.slice(0, 3).map((step: any, stepIndex: number) => (
                            <div key={stepIndex} className="border-l-2 border-primary/30 pl-4 py-2">
                              <h4 className="font-medium text-sm">Step {step.step}: {step.title}</h4>
                              <p className="text-xs text-muted-foreground">{step.description?.slice(0, 100)}...</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Workflows' && result.components.workflows.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating workflow...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="blueprints" className="mt-4">
          <div className="grid gap-3">
            {[...Array(4)].map((_, index) => {
              const blueprint = result.components.blueprints[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {getStatusIcon(result.processing_status.isComplete, !!blueprint)}
                        {blueprint ? blueprint.title : `Blueprint ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    {blueprint ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{blueprint.description}</p>
                        <div className="bg-muted rounded-lg p-4">
                          <h4 className="font-medium mb-2">Overview</h4>
                          <p className="text-sm">{blueprint.blueprint_content?.overview?.slice(0, 200)}...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Blueprints' && result.components.blueprints.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating blueprint...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="mt-4">
          <div className="grid gap-3">
            {[...Array(4)].map((_, index) => {
              const strategy = result.components.strategies[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {getStatusIcon(result.processing_status.isComplete, !!strategy)}
                        {strategy ? strategy.title : `Strategy ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    {strategy ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        <div className="space-y-2">
                          <div className="border rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-1">Objective</h4>
                            <p className="text-xs text-muted-foreground">{strategy.strategy_framework?.objective}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Strategies' && result.components.strategies.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating strategy...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressiveJumpDisplay;