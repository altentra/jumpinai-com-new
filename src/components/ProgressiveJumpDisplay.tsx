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
              <TabsTrigger value="tools" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.tools?.length || 0) > 0)}
                Tools ({result.components?.tools?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.prompts?.length || 0) > 0)}
                Prompts ({result.components?.prompts?.length || 0}/4)
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.workflows?.length || 0) > 0)}
                Workflows ({result.components?.workflows?.length || 0}/4)
              </TabsTrigger>
              <TabsTrigger value="blueprints" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.blueprints?.length || 0) > 0)}
                Blueprints ({result.components?.blueprints?.length || 0}/4)
              </TabsTrigger>
              <TabsTrigger value="strategies" className="flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
                {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.strategies?.length || 0) > 0)}
                Strategies ({result.components?.strategies?.length || 0}/4)
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout */}
          <TabsList className="hidden sm:grid w-full grid-cols-7 p-1 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-inner">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
              {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
              Overview
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
              {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
              Plan
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
              {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.tools?.length || 0) > 0)}
              Tools ({result.components?.tools?.length || 0})
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
                  {(() => {
                    const content = formatAIText(result.full_content)
                      .replace(/\b(word count|character count|estimated reading time|approx\. \d+ words)\b/gi, '')
                      .replace(/\(\s*\d+\s*words?\s*\)/gi, '')
                      .replace(/\[\s*\d+\s*words?\s*\]/gi, '');
                    
                    const sections = content.split(/(?=^##\s)/m).filter(section => section.trim());
                    
                    if (sections.length > 1) {
                      return sections.map((section, index) => {
                        const lines = section.trim().split('\n');
                        const title = lines[0]?.replace(/^##\s*/, '') || `Section ${index + 1}`;
                        const body = lines.slice(1).join('\n').trim();
                        
                        return (
                          <Card key={index} className="glass backdrop-blur-sm border border-white/10 rounded-2xl p-4 bg-white/5">
                            <h3 className="font-semibold mb-3 text-white drop-shadow-sm text-lg">{title}</h3>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ children }) => <h1 className="text-xl font-bold text-white drop-shadow-sm mb-3">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-lg font-semibold text-white drop-shadow-sm mb-2 mt-4">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-base font-medium text-white drop-shadow-sm mb-2 mt-3">{children}</h3>,
                                  p: ({ children }) => <p className="text-white/90 drop-shadow-sm mb-3 leading-relaxed">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-6 mb-3 text-white/90 drop-shadow-sm space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 text-white/90 drop-shadow-sm space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="leading-relaxed text-white/90 drop-shadow-sm">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold text-white drop-shadow-sm">{children}</strong>,
                                  em: ({ children }) => <em className="italic text-white/80 drop-shadow-sm">{children}</em>,
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-white/30 pl-4 py-2 my-3 glass backdrop-blur-sm bg-white/10 rounded-r-xl">
                                      {children}
                                    </blockquote>
                                  ),
                                  code: ({ children }) => (
                                    <code className="glass backdrop-blur-sm bg-white/10 px-2 py-1 rounded text-sm font-mono text-white/90 border border-white/20">{children}</code>
                                  ),
                                }}
                              >
                                {body}
                              </ReactMarkdown>
                            </div>
                          </Card>
                        );
                      });
                    } else {
                      // Fallback for content without clear sections
                      return (
                        <Card className="glass backdrop-blur-sm border border-white/10 rounded-2xl p-4 bg-white/5">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <h1 className="text-xl font-bold text-white drop-shadow-sm mb-3">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold text-white drop-shadow-sm mb-2 mt-4">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-medium text-white drop-shadow-sm mb-2 mt-3">{children}</h3>,
                                p: ({ children }) => <p className="text-white/90 drop-shadow-sm mb-3 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-6 mb-3 text-white/90 drop-shadow-sm space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 text-white/90 drop-shadow-sm space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="leading-relaxed text-white/90 drop-shadow-sm">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-white drop-shadow-sm">{children}</strong>,
                                em: ({ children }) => <em className="italic text-white/80 drop-shadow-sm">{children}</em>,
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-white/30 pl-4 py-2 my-3 glass backdrop-blur-sm bg-white/10 rounded-r-xl">
                                    {children}
                                  </blockquote>
                                ),
                                code: ({ children }) => (
                                  <code className="glass backdrop-blur-sm bg-white/10 px-2 py-1 rounded text-sm font-mono text-white/90 border border-white/20">{children}</code>
                                ),
                              }}
                            >
                              {content}
                            </ReactMarkdown>
                          </div>
                        </Card>
                      );
                    }
                  })()}
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

        <TabsContent value="tools" className="mt-4">
          <div className="grid gap-3">
            {result.components?.tools ? (
              result.components.tools.map((tool: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20 pointer-events-none"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg pointer-events-none"></div>
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Wrench className="w-5 h-5 text-primary" />
                        {(tool.website_url || tool.url || tool.website) ? (
                          <a 
                            href={tool.website_url || tool.url || tool.website || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary transition-all duration-300 font-semibold underline decoration-2 underline-offset-2 decoration-primary/60 hover:decoration-primary hover:text-primary/80 hover:scale-[1.02] cursor-pointer select-text"
                          >
                            {tool.name}
                          </a>
                        ) : (
                          <span className="text-foreground font-semibold select-text">{tool.name}</span>
                        )}
                        <Badge variant="outline" className="ml-auto text-xs">{tool.category}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed select-text">{tool.description}</p>
                        
                          <div className="space-y-3 text-sm">
                          <div className="p-3 bg-muted/20 rounded-lg">
                            <span className="font-medium text-foreground block mb-1 select-text">When to use:</span>
                            <p className="text-muted-foreground leading-relaxed select-text">{tool.when_to_use}</p>
                          </div>
                          
                          <div className="p-3 bg-muted/20 rounded-lg">
                            <span className="font-medium text-foreground block mb-1 select-text">Why this tool:</span>
                            <p className="text-muted-foreground leading-relaxed select-text">{tool.why_this_tool}</p>
                          </div>
                          
                          <div className="p-3 bg-muted/20 rounded-lg">
                            <span className="font-medium text-foreground block mb-1 select-text">How to integrate:</span>
                            <p className="text-muted-foreground leading-relaxed select-text">{tool.how_to_integrate || tool.integration_notes}</p>
                          </div>
                        </div>

                        {tool.alternatives && tool.alternatives.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-foreground block mb-1">Alternatives:</span>
                            <p className="text-muted-foreground">{tool.alternatives.join(', ')}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 text-xs flex-wrap pt-2 border-t border-border/30">
                          <Badge variant="secondary" className="text-xs">{tool.skill_level}</Badge>
                          <Badge variant="outline" className="text-xs">{tool.cost_model}</Badge>
                          <Badge variant="outline" className="text-xs">{tool.implementation_timeline || tool.implementation_time}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Generating AI tools recommendations...
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="mt-4">
          <div className="grid gap-3">
            {[...Array(4)].map((_, index) => {
              const prompt = result.components?.prompts?.[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.processing_status?.isComplete || false, !!prompt)}
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
                        <p className="text-sm text-white/90 drop-shadow-sm">{prompt.description}</p>
                        <div className="p-3 glass backdrop-blur-sm bg-background/30 dark:bg-background/20 rounded-xl border border-border/30 select-text">
                          <p className="text-sm text-foreground font-mono whitespace-pre-wrap select-text">{prompt.prompt_text}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prompt.ai_tools?.map((tool: string, toolIndex: number) => (
                            <Badge key={toolIndex} variant="secondary" className="text-xs">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
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
              const workflow = result.components?.workflows?.[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {getStatusIcon(result.processing_status?.isComplete || false, !!workflow)}
                        {workflow ? workflow.title : `AI Workflow ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    {workflow ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        <div className="space-y-1">
                          {workflow.workflow_steps?.slice(0, 3).map((step: any, stepIndex: number) => (
                            <div key={stepIndex} className="text-xs p-2 glass backdrop-blur-sm bg-background/30 dark:bg-background/20 rounded border border-border/20">
                              <span className="font-medium text-foreground">Step {step.step}: </span>
                              <span className="text-muted-foreground">{step.title}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{workflow.complexity_level}</Badge>
                          <Badge variant="outline">{workflow.duration_estimate}</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
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
              const blueprint = result.components?.blueprints?.[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {getStatusIcon(result.processing_status?.isComplete || false, !!blueprint)}
                        {blueprint ? blueprint.title : `AI Blueprint ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    {blueprint ? (
                      <div className="space-y-2">
                        <p className="text-sm text-white/90 drop-shadow-sm">{blueprint.description}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{blueprint.difficulty_level}</Badge>
                          <Badge variant="outline">{blueprint.implementation_time}</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
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
              const strategy = result.components?.strategies?.[index];
              return (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {getStatusIcon(result.processing_status?.isComplete || false, !!strategy)}
                        {strategy ? strategy.title : `AI Strategy ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                    {strategy ? (
                      <div className="space-y-2">
                        <p className="text-sm text-white/90 drop-shadow-sm">{strategy.description}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{strategy.priority_level}</Badge>
                          <Badge variant="outline">{strategy.timeline}</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
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