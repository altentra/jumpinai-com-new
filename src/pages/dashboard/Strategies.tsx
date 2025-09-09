import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Target, AlertTriangle, ExternalLink, Rocket, RefreshCw } from "lucide-react";
import { strategiesService, UserStrategy } from "@/services/strategiesService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";

export default function Strategies() {
  const [strategies, setStrategies] = useState<UserStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<UserStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Loading your strategies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Strategies</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadStrategies()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant="secondary">{strategies.length} strategies</Badge>
        </div>
      </div>

      {strategies.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No strategies yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate your personalized AI transformation plan in Jumps Studio to get custom strategies
            </p>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Jumps Studio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
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
            <div key={jumpId} className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Rocket className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {jumpId === 'unassigned' 
                    ? 'Unassigned Strategies' 
                    : jumpsInfo[jumpId] 
                      ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                      : 'Loading Jump Info...'}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  {jumpStrategies.length} strateg{jumpStrategies.length !== 1 ? 'ies' : 'y'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jumpStrategies.map((strategy) => (
                  <Card 
                    key={strategy.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{strategy.title}</CardTitle>
                        <div className="flex flex-col gap-1 shrink-0">
                          {strategy.category && (
                            <Badge variant="outline" className="text-xs">
                              {strategy.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {strategy.description && (
                        <CardDescription className="line-clamp-3">
                          {strategy.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {strategy.timeline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {strategy.timeline}
                            </div>
                          )}
                        </div>
                        
                        {strategy.key_actions && strategy.key_actions.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Target className="w-4 h-4" />
                            <span>{strategy.key_actions.length} action{strategy.key_actions.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        {strategy.ai_tools && strategy.ai_tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {strategy.ai_tools.slice(0, 3).map((tool, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {strategy.ai_tools.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
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
                <div>
                  <h4 className="font-semibold mb-4">Strategy Framework</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-4">
                    {selectedStrategy.strategy_framework.overview && (
                      <div>
                        <h5 className="font-medium mb-2">Overview</h5>
                        <p className="text-muted-foreground text-sm">{selectedStrategy.strategy_framework.overview}</p>
                      </div>
                    )}
                    
                    {selectedStrategy.strategy_framework.phases && Array.isArray(selectedStrategy.strategy_framework.phases) && (
                      <div>
                        <h5 className="font-medium mb-2">Phases</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedStrategy.strategy_framework.phases.map((phase: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Phase {index + 1}</Badge>
                              <span className="text-sm">{phase}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedStrategy.strategy_framework.objectives && Array.isArray(selectedStrategy.strategy_framework.objectives) && (
                      <div>
                        <h5 className="font-medium mb-2">Objectives</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedStrategy.strategy_framework.objectives.map((objective: string, index: number) => (
                            <li key={index} className="text-muted-foreground text-sm">{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedStrategy.strategy_framework.approach && (
                      <div>
                        <h5 className="font-medium mb-2">Approach</h5>
                        <p className="text-muted-foreground text-sm">{selectedStrategy.strategy_framework.approach}</p>
                      </div>
                    )}
                  </div>
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