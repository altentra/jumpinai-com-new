import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Target, AlertTriangle, ExternalLink, Rocket, RefreshCw, Trash2 } from "lucide-react";
import { strategiesService, UserStrategy } from "@/services/strategiesService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";

export default function Strategies() {
  const [strategies, setStrategies] = useState<UserStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<UserStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get jump information for all strategies
  const jumpIds = strategies.map(strategy => strategy.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    loadStrategies();
  }, []);

  // Add visibility change listener to refresh data when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isLoading) {
        loadStrategies();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading]);

  const loadStrategies = async () => {
    try {
      const data = await strategiesService.getUserStrategies();
      setStrategies(data);
    } catch (error) {
      console.error('Error loading strategies:', error);
      toast({
        title: "Error",
        description: "Failed to load strategies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (strategyId: string) => {
    try {
      setDeletingId(strategyId);
      await strategiesService.deleteStrategy(strategyId);
      setStrategies(strategies.filter(s => s.id !== strategyId));
      toast({
        title: "Deleted",
        description: "Strategy deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast({
        title: "Error",
        description: "Failed to delete strategy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Loading your strategies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 px-2 sm:px-0">
      {/* Header - Mobile Optimized */}
      <div className="glass rounded-xl p-3 sm:p-4 shadow-modern">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold">My Strategies</h2>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadStrategies()}
              disabled={isLoading}
              className="shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant="secondary" className="text-xs">{strategies.length} strategies</Badge>
          </div>
        </div>
      </div>

      {strategies.length === 0 ? (
        <Card className="glass text-center py-8 sm:py-12 rounded-xl shadow-modern">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-muted-foreground">
                No strategies yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate your personalized AI transformation plan in JumpinAI Studio to get custom strategies
              </p>
              <Button 
                variant="outline" 
                className="text-sm" 
                onClick={() => window.location.href = '/jumpinai-studio'}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Visit JumpinAI Studio
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Group strategies by Jump */}
          {Object.entries(
            strategies.reduce((groups, strategy) => {
              const jumpId = strategy.jump_id || 'unassigned';
              if (!groups[jumpId]) groups[jumpId] = [];
              groups[jumpId].push(strategy);
              return groups;
            }, {} as Record<string, UserStrategy[]>)
          )
            .sort(([jumpIdA], [jumpIdB]) => {
              // Sort by jump number descending (latest first), with unassigned last
              if (jumpIdA === 'unassigned') return 1;
              if (jumpIdB === 'unassigned') return -1;
              const jumpA = jumpIdA && jumpsInfo[jumpIdA];
              const jumpB = jumpIdB && jumpsInfo[jumpIdB];
              return (jumpB?.jumpNumber || 0) - (jumpA?.jumpNumber || 0);
            })
            .map(([jumpId, jumpStrategies]) => (
            <div key={jumpId} className="glass border rounded-xl p-5 bg-card shadow-modern">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Rocket className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">
                  {jumpId === 'unassigned' 
                    ? 'Unassigned Strategies' 
                    : jumpsInfo[jumpId] 
                      ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                      : 'Loading Jump Info...'}
                </h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {jumpStrategies.length} strateg{jumpStrategies.length !== 1 ? 'ies' : 'y'}
                </Badge>
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {jumpStrategies.map((strategy) => (
                  <Card 
                    key={strategy.id} 
                    className="group cursor-pointer hover:shadow-modern-lg transition-shadow relative rounded-lg"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-2 font-semibold">{strategy.title}</CardTitle>
                          {strategy.description && (
                            <CardDescription className="mt-1 line-clamp-3 text-xs">
                              {strategy.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {strategy.category && (
                            <Badge variant="outline" className="text-xs">
                              {strategy.category}
                            </Badge>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-destructive/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{strategy.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(strategy.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deletingId === strategy.id}
                                >
                                  {deletingId === strategy.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {strategy.timeline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">{strategy.timeline}</span>
                            </div>
                          )}
                        </div>
                        
                        {strategy.key_actions && strategy.key_actions.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span className="text-xs">{strategy.key_actions.length} action{strategy.key_actions.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        {strategy.ai_tools && strategy.ai_tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {strategy.ai_tools.slice(0, 3).map((tool, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {strategy.ai_tools.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{strategy.ai_tools.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedStrategy?.title}
              {selectedStrategy?.timeline && (
                <Badge variant="outline">
                  {selectedStrategy.timeline}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStrategy && (
            <div className="space-y-6">
              {selectedStrategy.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedStrategy.description}</p>
                </div>
              )}

              {selectedStrategy.strategy_framework && (
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    🎯 Strategy Framework
                  </h4>
                  
                  {/* Approach Section */}
                  {selectedStrategy.strategy_framework.approach && (
                    <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        💡 Strategic Approach
                      </h5>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{selectedStrategy.strategy_framework.approach}</p>
                    </div>
                  )}

                  {/* Objective Section */}
                  {selectedStrategy.strategy_framework.objective && (
                    <div className="bg-muted/50 border rounded-lg p-4">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        🎯 Primary Objective
                      </h5>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{selectedStrategy.strategy_framework.objective}</p>
                    </div>
                  )}

                  {/* Timeline Section */}
                  {selectedStrategy.strategy_framework.timeline && (
                    <div className="bg-background border rounded-lg p-4">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        📅 Implementation Timeline
                      </h5>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{selectedStrategy.strategy_framework.timeline}</p>
                    </div>
                  )}

                  {/* Resources Section */}
                  {selectedStrategy.strategy_framework.resources && Array.isArray(selectedStrategy.strategy_framework.resources) && selectedStrategy.strategy_framework.resources.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        🛠️ Required Resources
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedStrategy.strategy_framework.resources.map((resource: string, index: number) => (
                          <div key={index} className="bg-muted/30 border rounded-lg p-3 flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <p className="text-sm text-muted-foreground flex-1">{resource}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Criteria Section */}
                  {selectedStrategy.strategy_framework.success_criteria && Array.isArray(selectedStrategy.strategy_framework.success_criteria) && selectedStrategy.strategy_framework.success_criteria.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        ✅ Success Criteria
                      </h5>
                      <div className="space-y-2">
                        {selectedStrategy.strategy_framework.success_criteria.map((criteria: string, index: number) => (
                          <div key={index} className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400">✓</span>
                            <p className="text-sm text-muted-foreground flex-1">{criteria}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tactics Section */}
                  {selectedStrategy.strategy_framework.tactics && Array.isArray(selectedStrategy.strategy_framework.tactics) && selectedStrategy.strategy_framework.tactics.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        ⚡ Tactical Actions
                      </h5>
                      <div className="space-y-3">
                        {selectedStrategy.strategy_framework.tactics.map((tactic: string, index: number) => (
                          <div key={index} className="bg-background border-l-4 border-accent rounded-r-lg p-4">
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="shrink-0 mt-0.5">{index + 1}</Badge>
                              <p className="text-sm text-muted-foreground flex-1 leading-relaxed whitespace-pre-wrap">{tactic}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vision Section (for newer data format) */}
                  {selectedStrategy.strategy_framework.vision && (
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <h5 className="font-medium mb-2 text-primary">Strategic Vision</h5>
                      <p className="text-muted-foreground text-sm">{selectedStrategy.strategy_framework.vision}</p>
                    </div>
                  )}

                  {/* Objectives Section (for newer data format) */}
                  {selectedStrategy.strategy_framework.objectives && Array.isArray(selectedStrategy.strategy_framework.objectives) && (
                    <div>
                      <h5 className="font-medium mb-2">Strategic Objectives</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedStrategy.strategy_framework.objectives.map((objective: string, index: number) => (
                          <li key={index} className="text-muted-foreground text-sm">{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Initiatives Section (for newer data format) */}
                  {selectedStrategy.strategy_framework.initiatives && Array.isArray(selectedStrategy.strategy_framework.initiatives) && (
                    <div>
                      <h5 className="font-medium mb-3">Strategic Initiatives</h5>
                      <div className="space-y-3">
                        {selectedStrategy.strategy_framework.initiatives.map((initiative: any, index: number) => (
                          <div key={index} className="border border-border rounded-lg p-3 bg-background">
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="font-semibold">{initiative.name}</h6>
                              <Badge variant="outline" className="text-xs">{initiative.timeline}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{initiative.description}</p>
                            {initiative.kpis && Array.isArray(initiative.kpis) && initiative.kpis.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Key Performance Indicators:</p>
                                <div className="flex flex-wrap gap-1">
                                  {initiative.kpis.map((kpi: string, kpiIndex: number) => (
                                    <Badge key={kpiIndex} variant="secondary" className="text-xs">
                                      {kpi}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedStrategy.key_actions && selectedStrategy.key_actions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Key Actions
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedStrategy.key_actions.map((action, index) => (
                      <li key={index} className="text-muted-foreground">{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedStrategy.success_metrics && selectedStrategy.success_metrics.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Success Metrics</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedStrategy.success_metrics.map((metric, index) => (
                      <li key={index} className="text-muted-foreground">{metric}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedStrategy.potential_challenges && selectedStrategy.potential_challenges.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Potential Challenges
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedStrategy.potential_challenges.map((challenge, index) => (
                      <li key={index} className="text-muted-foreground">{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedStrategy.mitigation_strategies && selectedStrategy.mitigation_strategies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Mitigation Strategies</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedStrategy.mitigation_strategies.map((mitigation, index) => (
                      <li key={index} className="text-muted-foreground">{mitigation}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedStrategy.instructions && (
                <div>
                  <h4 className="font-semibold mb-2">Execution Instructions</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedStrategy.instructions}</p>
                </div>
              )}

              {selectedStrategy.ai_tools && selectedStrategy.ai_tools.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended AI Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStrategy.ai_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedStrategy.tags && selectedStrategy.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStrategy.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}