import React from 'react';
import { CheckCircle, Zap, Timer, Copy, Check, Wrench, Sparkles } from 'lucide-react';
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
    toolPrompts?: any[];
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
    toolPrompts: components?.toolPrompts || []
  };

  console.log('UnifiedJumpDisplay rendering with:', {
    jumpId: jump.id,
    jumpTitle: jump.title,
    componentCounts: {
      toolPrompts: safeComponents.toolPrompts.length
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
        <TabsList className="grid w-full grid-cols-3 p-1 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-inner">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="toolPrompts" className="flex items-center gap-2 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground transition-all duration-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Tools & Prompts ({safeComponents?.toolPrompts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 dark:from-primary/2 dark:via-transparent dark:to-secondary/2 rounded-3xl pointer-events-none"></div>
              
              <CardHeader className="pb-6 pt-8 px-8 border-b border-border/20">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  Strategic Transformation Plan
                </CardTitle>
                <p className="text-muted-foreground mt-3 text-base">Comprehensive roadmap tailored to your unique situation</p>
              </CardHeader>
              
              <CardContent className="pt-8 pb-10 px-8 relative z-10">
                <div className="prose prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="text-foreground space-y-8"
                    components={{
                      h1: ({ children }) => (
                        <div className="mb-8 pb-6 border-b-2 border-primary/20">
                          <h1 className="text-3xl font-bold text-white drop-shadow-sm select-text leading-tight">{children}</h1>
                        </div>
                      ),
                      h2: ({ children }) => (
                        <div className="mt-12 mb-6">
                          <h2 className="text-2xl font-bold text-white drop-shadow-sm select-text flex items-center gap-3 leading-tight">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                            {children}
                          </h2>
                        </div>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-white drop-shadow-sm mb-4 mt-8 select-text leading-snug">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-white/95 drop-shadow-sm mb-5 leading-relaxed text-[15px] select-text">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-none space-y-4 mb-6 text-white/95 drop-shadow-sm select-text ml-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-8 space-y-4 mb-6 text-white/95 drop-shadow-sm select-text">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed text-white/95 drop-shadow-sm select-text relative pl-6 before:content-['→'] before:absolute before:left-0 before:text-primary before:font-bold">
                          <span className="text-[15px]">{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-white drop-shadow-sm select-text">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-primary/90 drop-shadow-sm select-text font-medium">{children}</em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-6 py-4 my-6 glass backdrop-blur-sm bg-primary/10 rounded-r-2xl select-text">
                          <div className="text-white/90 text-base">{children}</div>
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="glass backdrop-blur-sm bg-muted/80 px-3 py-1.5 rounded-lg text-sm font-mono text-foreground border border-border/30 select-text">{children}</code>
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

        <TabsContent value="plan" className="mt-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 dark:from-primary/10 dark:via-accent/8 dark:to-secondary/10 rounded-3xl blur-xl opacity-40"></div>
            <Card className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-gradient-to-br from-background/80 to-background/60 dark:bg-gradient-to-br dark:from-gray-950/80 dark:to-gray-900/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 dark:from-primary/1.5 dark:via-transparent dark:to-secondary/1.5 rounded-3xl pointer-events-none"></div>
              
              <CardHeader className="pb-6 pt-8 px-8 border-b border-border/20">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  Detailed Implementation Roadmap
                </CardTitle>
                <p className="text-muted-foreground mt-3 text-base">Step-by-step action plan with measurable milestones</p>
              </CardHeader>
              
              <CardContent className="pt-8 pb-10 px-8 relative z-10">
                {jump.comprehensive_plan || jump.structured_plan ? (
                  (() => {
                    const planData = jump.structured_plan || jump.comprehensive_plan;
                    const phases = planData?.phases || planData?.action_plan?.phases || [];
                    const overview = planData?.overview || planData?.executive_summary || '';
                    
                    return (
                      <div className="space-y-8">
                        {overview && (
                          <div className="glass backdrop-blur-sm border border-primary/20 rounded-2xl p-6 bg-primary/5">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              Overview
                            </h3>
                            <p className="text-white/95 drop-shadow-sm select-text text-[15px] leading-relaxed">{overview}</p>
                          </div>
                        )}
                        
                        {phases.length > 0 ? (
                          <div className="space-y-8">
                            {phases.map((phase: any, index: number) => (
                              <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                {/* Phase connector line */}
                                {index < phases.length - 1 && (
                                  <div className="absolute left-8 top-full h-8 w-0.5 bg-gradient-to-b from-primary/40 to-transparent z-0"></div>
                                )}
                                
                                <div className="glass backdrop-blur-sm border border-border/40 rounded-3xl p-8 bg-background/60 hover:border-primary/30 transition-all duration-300 group relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  {/* Phase header with number badge */}
                                  <div className="flex items-start gap-5 mb-6 relative z-10">
                                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20 border-2 border-white/10">
                                      {phase.phase_number || index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-2xl font-bold text-white drop-shadow-sm select-text mb-2 leading-tight">
                                        {phase.title || phase.name || 'Unnamed Phase'}
                                      </h3>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-medium">
                                          <Timer className="w-3 h-3 mr-1" />
                                          {phase.duration || phase.timeline || 'Timeline TBD'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Phase description */}
                                  {phase.description && (
                                    <div className="mb-8 relative z-10">
                                      <p className="text-white/95 drop-shadow-sm select-text text-[15px] leading-relaxed bg-muted/5 border-l-4 border-primary/30 pl-6 py-4 rounded-r-xl">{phase.description}</p>
                                    </div>
                                  )}
                                  
                                  <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                    {/* Objectives section */}
                                    {phase.objectives && phase.objectives.length > 0 && (
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                                          Key Objectives
                                        </h4>
                                        <ul className="space-y-3">
                                          {phase.objectives.map((obj: string, idx: number) => (
                                            <li key={idx} className="flex gap-3 group/item">
                                              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                                                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                              </div>
                                              <span className="text-[15px] text-white/95 drop-shadow-sm select-text leading-relaxed flex-1">{obj}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Milestones section */}
                                    {phase.milestones && phase.milestones.length > 0 && (
                                      <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                                          Success Milestones
                                        </h4>
                                        <ul className="space-y-3">
                                          {phase.milestones.map((milestone: string, idx: number) => (
                                            <li key={idx} className="flex gap-3 group/item">
                                              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mt-0.5">
                                                <Zap className="w-3.5 h-3.5 text-accent" />
                                              </div>
                                              <span className="text-[15px] text-white/95 drop-shadow-sm select-text leading-relaxed flex-1">{milestone}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Actions section - full width */}
                                  {phase.actions && phase.actions.length > 0 && (
                                    <div className="mt-8 space-y-4 relative z-10">
                                      <h4 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-5">
                                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                        Action Steps
                                      </h4>
                                      <div className="grid gap-4">
                                        {phase.actions.map((action: string, idx: number) => (
                                          <div key={idx} className="flex gap-4 glass backdrop-blur-sm bg-background/30 border border-border/20 rounded-xl p-5 hover:border-primary/30 hover:bg-background/40 transition-all duration-300 group/action">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 flex items-center justify-center font-bold text-secondary text-sm">
                                              {idx + 1}
                                            </div>
                                            <p className="text-[15px] text-white/95 drop-shadow-sm select-text leading-relaxed flex-1 pt-1">{action}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Additional phase details if available */}
                                  {(phase.successCriteria || phase.prerequisites || phase.expectedOutcomes) && (
                                    <div className="mt-8 pt-6 border-t border-border/20 grid md:grid-cols-3 gap-6 relative z-10">
                                      {phase.successCriteria && phase.successCriteria.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Success Criteria</h5>
                                          <ul className="space-y-2">
                                            {phase.successCriteria.map((criteria: string, idx: number) => (
                                              <li key={idx} className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>{criteria}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {phase.prerequisites && phase.prerequisites.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Prerequisites</h5>
                                          <ul className="space-y-2">
                                            {phase.prerequisites.map((prereq: string, idx: number) => (
                                              <li key={idx} className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
                                                <span className="text-accent mt-1">•</span>
                                                <span>{prereq}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {phase.expectedOutcomes && phase.expectedOutcomes.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Expected Outcomes</h5>
                                          <ul className="space-y-2">
                                            {phase.expectedOutcomes.map((outcome: string, idx: number) => (
                                              <li key={idx} className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
                                                <span className="text-secondary mt-1">•</span>
                                                <span>{outcome}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No implementation phases available.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No implementation plan available for this jump.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="toolPrompts" className="mt-4">
          <div className="grid gap-3">
            {safeComponents?.toolPrompts && safeComponents.toolPrompts.length > 0 ? (
              safeComponents.toolPrompts.map((toolPrompt: any, index: number) => {
                const tool = toolPrompt;
                return (
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
                         <p className="text-sm text-white/90 drop-shadow-sm leading-relaxed select-text">{tool.description}</p>
                         
                         <div className="space-y-3 text-sm">
                           <div className="p-3 bg-muted/20 rounded-lg">
                             <span className="font-medium text-white drop-shadow-sm block mb-1 select-text">When to use:</span>
                             <p className="text-white/90 drop-shadow-sm leading-relaxed select-text">{tool.when_to_use}</p>
                           </div>
                           
                           <div className="p-3 bg-muted/20 rounded-lg">
                             <span className="font-medium text-white drop-shadow-sm block mb-1 select-text">Why this tool:</span>
                             <p className="text-white/90 drop-shadow-sm leading-relaxed select-text">{tool.why_this_tool}</p>
                           </div>
                           
                           <div className="p-3 bg-muted/20 rounded-lg">
                             <span className="font-medium text-white drop-shadow-sm block mb-1 select-text">How to integrate:</span>
                             <p className="text-white/90 drop-shadow-sm leading-relaxed select-text">{tool.how_to_integrate || tool.integration_notes}</p>
                           </div>
                         </div>

                         {tool.alternatives && tool.alternatives.length > 0 && (
                           <div className="text-sm">
                             <span className="font-medium text-white drop-shadow-sm block mb-1 select-text">Alternatives:</span>
                             <p className="text-white/90 drop-shadow-sm select-text">{tool.alternatives.join(', ')}</p>
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
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tools & prompts available for this jump.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedJumpDisplay;