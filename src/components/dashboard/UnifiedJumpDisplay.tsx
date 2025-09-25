import React from 'react';
import { CheckCircle, Zap, Timer, Copy, Check, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserJump } from '@/services/jumpService';
import { toast } from 'sonner';

interface UnifiedJumpDisplayProps {
  jump: UserJump;
  components?: {
    tools?: any[];
    prompts?: any[];
    workflows?: any[];
    blueprints?: any[];
    strategies?: any[];
  };
}

const UnifiedJumpDisplay: React.FC<UnifiedJumpDisplayProps> = ({ jump, components = {} }) => {
  const [copiedPrompts, setCopiedPrompts] = React.useState<Set<number>>(new Set());

  // Safety check for jump data
  if (!jump) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No jump data available</p>
      </div>
    );
  }

  // Ensure components have default values
  const safeComponents = {
    tools: components?.tools || [],
    prompts: components?.prompts || [],
    workflows: components?.workflows || [],
    blueprints: components?.blueprints || [],
    strategies: components?.strategies || []
  };

  console.log('UnifiedJumpDisplay rendering with:', {
    jumpId: jump.id,
    jumpTitle: jump.title,
    componentCounts: {
      tools: safeComponents.tools.length,
      prompts: safeComponents.prompts.length,
      workflows: safeComponents.workflows.length,
      blueprints: safeComponents.blueprints.length,
      strategies: safeComponents.strategies.length
    }
  });

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

  // Parse jump number and name from title
  const jumpNumber = jump?.title?.match(/Jump #(\d+)/)?.[1] || '';
  const jumpName = jump?.title?.replace(/Jump #\d+:\s*/, '') || jump?.title || 'Untitled Jump';

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
                    {jump?.title || 'Untitled Jump'}
                  </h2>
                  {jumpNumber && jumpName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mt-1">
                      <span>Jump #{jumpNumber}</span>
                      <span>•</span>
                      <span>{jumpName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant="default"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  Completed
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7 p-1 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-inner">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Tools ({safeComponents?.tools?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Prompts ({safeComponents?.prompts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Workflows ({safeComponents?.workflows?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Blueprints ({safeComponents?.blueprints?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Strategies ({safeComponents?.strategies?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 dark:from-primary/2 dark:via-transparent dark:to-secondary/2 rounded-3xl pointer-events-none"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Zap className="w-5 h-5 text-primary" />
                  Strategic Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="text-foreground"
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4 select-text">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-6 select-text">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-2 mt-4 select-text">{children}</h3>,
                      p: ({ children }) => <p className="text-foreground mb-3 leading-relaxed select-text">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-foreground space-y-2 select-text">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-foreground space-y-2 select-text">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed text-foreground select-text">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground select-text">{children}</strong>,
                      em: ({ children }) => <em className="italic text-primary select-text">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 glass backdrop-blur-sm bg-primary/10 rounded-r-xl select-text">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="glass backdrop-blur-sm bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border border-border/30 select-text">{children}</code>
                      ),
                    }}
                  >
                    {formatAIText(jump?.full_content || 'No content available')}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 dark:from-primary/10 dark:via-accent/8 dark:to-secondary/10 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 dark:from-primary/1.5 dark:via-transparent dark:to-secondary/1.5 rounded-3xl pointer-events-none"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Implementation Plan</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                 {(jump.comprehensive_plan || jump.structured_plan) ? (
                  <div className="space-y-4">
                    {(jump.comprehensive_plan || jump.structured_plan)?.overview && (
                      <p className="text-foreground select-text">{(jump.comprehensive_plan || jump.structured_plan).overview}</p>
                    )}
                    <div className="grid gap-4">
                     {(jump.comprehensive_plan || jump.structured_plan)?.phases?.map((phase: any, index: number) => (
                        <div key={index} className="glass backdrop-blur-sm border border-border/30 rounded-2xl p-4 bg-background/50">
                          <h3 className="font-semibold mb-2 text-foreground select-text">
                            Phase {phase.phase_number || index + 1}: {phase.title || phase.name || 'Unnamed Phase'}
                          </h3>
                          <p className="text-sm text-foreground mb-2 select-text">
                            Duration: {phase.duration || phase.timeline || 'Not specified'}
                          </p>
                          <p className="text-sm text-foreground select-text">{phase.description || 'No description available'}</p>
                        </div>
                      )) || []}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No implementation plan available for this jump.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <div className="grid gap-3">
            {safeComponents?.tools && safeComponents.tools.length > 0 ? (
              safeComponents.tools.map((tool: any, index: number) => (
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
                            <span className="font-medium text-foreground block mb-1 select-text">Alternatives:</span>
                            <p className="text-muted-foreground select-text">{tool.alternatives.join(', ')}</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <p>No tools available for this jump.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="mt-4">
          <div className="grid gap-3">
            {safeComponents?.prompts && safeComponents.prompts.length > 0 ? (
              safeComponents.prompts.map((prompt: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20 pointer-events-none"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg pointer-events-none"></div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {prompt.title}
                        </div>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"></div>
                          <button
                            onClick={() => handleCopyPrompt(prompt.prompt_text, index)}
                            className="relative px-3 py-1.5 glass backdrop-blur-xl border border-border/30 hover:border-primary/40 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md bg-gradient-to-br from-background/60 to-background/40 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40 hover:scale-105 active:scale-95 group overflow-hidden z-10"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 rounded-lg pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-white/8 dark:from-white/6 dark:via-transparent dark:to-white/6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            
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
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="pt-0 relative z-10">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground select-text">{prompt.description}</p>
                        <div className="p-3 glass backdrop-blur-sm bg-background/30 dark:bg-background/20 rounded-xl border border-border/30 select-text">
                          <p className="text-sm text-foreground font-mono whitespace-pre-wrap select-text">{prompt.prompt_text}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prompt.ai_tools?.map((tool: string, toolIndex: number) => (
                            <Badge key={toolIndex} variant="secondary" className="text-xs">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No prompts available for this jump.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <div className="grid gap-3">
            {safeComponents?.workflows && safeComponents.workflows.length > 0 ? (
              safeComponents.workflows.map((workflow: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20 pointer-events-none"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg pointer-events-none"></div>
                     <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {workflow.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground select-text">{workflow.description}</p>
                        <div className="space-y-1">
                          {workflow.workflow_steps?.slice(0, 3).map((step: any, stepIndex: number) => (
                            <div key={stepIndex} className="text-xs p-2 glass backdrop-blur-sm bg-background/30 dark:bg-background/20 rounded border border-border/20">
                              <span className="font-medium text-foreground select-text">Step {step.step}: </span>
                              <span className="text-muted-foreground select-text">{step.title}</span>
                            </div>
                          ))}
                          {workflow.workflow_steps?.length > 3 && (
                            <div className="text-xs p-2 glass backdrop-blur-sm bg-background/30 dark:bg-background/20 rounded border border-border/20 text-center">
                              <span className="text-muted-foreground select-text">+{workflow.workflow_steps.length - 3} more steps</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{workflow.complexity_level}</Badge>
                          <Badge variant="outline">{workflow.duration_estimate}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No workflows available for this jump.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="blueprints" className="mt-4">
          <div className="grid gap-3">
            {safeComponents?.blueprints && safeComponents.blueprints.length > 0 ? (
              safeComponents.blueprints.map((blueprint: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20 pointer-events-none"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg pointer-events-none"></div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {blueprint.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground select-text">{blueprint.description}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{blueprint.difficulty_level}</Badge>
                          <Badge variant="outline">{blueprint.implementation_time}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No blueprints available for this jump.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="mt-4">
          <div className="grid gap-3">
            {safeComponents?.strategies && safeComponents.strategies.length > 0 ? (
              safeComponents.strategies.map((strategy: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/12 via-accent/8 to-secondary/12 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-lg blur-sm opacity-20 pointer-events-none"></div>
                  <Card className="relative glass-dark border-white/12 dark:border-white/8 backdrop-blur-lg bg-gradient-to-br from-white/4 via-white/2 to-white/1 dark:from-black/10 dark:via-black/5 dark:to-black/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/1.5 via-transparent to-secondary/1.5 dark:from-primary/1 dark:via-transparent dark:to-secondary/1 rounded-lg pointer-events-none"></div>
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {strategy.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground select-text">{strategy.description}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{strategy.priority_level}</Badge>
                          <Badge variant="outline">{strategy.timeline}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No strategies available for this jump.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedJumpDisplay;