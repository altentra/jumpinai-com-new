import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, Users, ExternalLink, Rocket, RefreshCw, Trash2 } from "lucide-react";
import { workflowsService, UserWorkflow } from "@/services/workflowsService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get jump information for all workflows
  const jumpIds = workflows.map(workflow => workflow.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    loadWorkflows();
  }, []);

  // Add visibility change listener to refresh data when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isLoading) {
        loadWorkflows();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading]);

  const loadWorkflows = async () => {
    try {
      const data = await workflowsService.getUserWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'secondary';
      case 'intermediate': return 'outline';
      case 'advanced': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleDelete = async (workflowId: string) => {
    try {
      setDeletingId(workflowId);
      await workflowsService.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      toast({
        title: "Deleted",
        description: "Workflow deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Loading your workflows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-4 shadow-modern">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Workflows</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadWorkflows()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant="secondary" className="text-xs">{workflows.length} workflows</Badge>
          </div>
        </div>
      </div>

      {workflows.length === 0 ? (
        <Card className="glass text-center py-12 rounded-xl shadow-modern">
          <CardContent>
            <h3 className="text-base font-medium text-muted-foreground mb-2">
              No workflows yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your personalized AI transformation plan in JumpinAI Studio to get custom workflows
            </p>
            <Button variant="outline" className="text-sm" onClick={() => window.location.href = '/jumpinai-studio'}>
              <ExternalLink className="w-3 h-3 mr-2" />
              Visit JumpinAI Studio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Group workflows by Jump */}
          {Object.entries(
            workflows.reduce((groups, workflow) => {
              const jumpId = workflow.jump_id || 'unassigned';
              if (!groups[jumpId]) groups[jumpId] = [];
              groups[jumpId].push(workflow);
              return groups;
            }, {} as Record<string, UserWorkflow[]>)
          )
            .sort(([jumpIdA], [jumpIdB]) => {
              // Sort by jump number descending (latest first), with unassigned last
              if (jumpIdA === 'unassigned') return 1;
              if (jumpIdB === 'unassigned') return -1;
              const jumpA = jumpIdA && jumpsInfo[jumpIdA];
              const jumpB = jumpIdB && jumpsInfo[jumpIdB];
              return (jumpB?.jumpNumber || 0) - (jumpA?.jumpNumber || 0);
            })
            .map(([jumpId, jumpWorkflows]) => (
            <div key={jumpId} className="glass border rounded-xl p-5 bg-card shadow-modern">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Rocket className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">
                  {jumpId === 'unassigned' 
                    ? 'Unassigned Workflows' 
                    : jumpsInfo[jumpId] 
                      ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                      : 'Loading Jump Info...'}
                </h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {jumpWorkflows.length} workflow{jumpWorkflows.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {jumpWorkflows.map((workflow) => (
                  <Card 
                    key={workflow.id} 
                    className="group cursor-pointer hover:shadow-modern-lg transition-shadow relative rounded-lg"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-2 font-semibold">{workflow.title}</CardTitle>
                          {workflow.description && (
                            <CardDescription className="mt-1 line-clamp-3 text-xs">
                              {workflow.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {workflow.category && (
                            <Badge variant="outline" className="text-xs">
                              {workflow.category}
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
                                <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{workflow.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(workflow.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deletingId === workflow.id}
                                >
                                  {deletingId === workflow.id ? "Deleting..." : "Delete"}
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
                          {workflow.duration_estimate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{workflow.duration_estimate}</span>
                            </div>
                          )}
                          {workflow.complexity_level && (
                            <Badge variant={getDifficultyColor(workflow.complexity_level)} className="text-xs">
                              {workflow.complexity_level}
                            </Badge>
                          )}
                        </div>
                        
                        {workflow.ai_tools && workflow.ai_tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {workflow.ai_tools.slice(0, 3).map((tool, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {workflow.ai_tools.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{workflow.ai_tools.length - 3}
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

      <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedWorkflow?.title}
              {selectedWorkflow?.complexity_level && (
                <Badge className={getDifficultyColor(selectedWorkflow.complexity_level)}>
                  {selectedWorkflow.complexity_level}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkflow && (
            <div className="space-y-6">
              {selectedWorkflow.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedWorkflow.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {selectedWorkflow.duration_estimate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Duration: {selectedWorkflow.duration_estimate}</span>
                  </div>
                )}
                {selectedWorkflow.complexity_level && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Level: {selectedWorkflow.complexity_level}</span>
                  </div>
                )}
              </div>

              {selectedWorkflow.workflow_steps && Array.isArray(selectedWorkflow.workflow_steps) && (
                <div>
                  <h4 className="font-semibold mb-4">Workflow Steps</h4>
                  <div className="space-y-4">
                    {selectedWorkflow.workflow_steps.map((step: any, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Step {step.step || index + 1}
                          </Badge>
                          {step.estimated_time && (
                            <span className="text-xs text-muted-foreground">
                              {step.estimated_time}
                            </span>
                          )}
                        </div>
                        <h5 className="font-medium mb-1">{step.title}</h5>
                        <p className="text-muted-foreground text-sm mb-2">{step.description}</p>
                        {step.tools && Array.isArray(step.tools) && step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {step.tools.map((tool: string, toolIndex: number) => (
                              <Badge key={toolIndex} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkflow.prerequisites && selectedWorkflow.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedWorkflow.prerequisites.map((prereq, index) => (
                      <li key={index} className="text-muted-foreground">{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedWorkflow.expected_outcomes && selectedWorkflow.expected_outcomes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Expected Outcomes</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedWorkflow.expected_outcomes.map((outcome, index) => (
                      <li key={index} className="text-muted-foreground">{outcome}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedWorkflow.instructions && (
                <div>
                  <h4 className="font-semibold mb-2">Implementation Instructions</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedWorkflow.instructions}</p>
                </div>
              )}

              {selectedWorkflow.ai_tools && selectedWorkflow.ai_tools.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended AI Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.ai_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkflow.tags && selectedWorkflow.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.tags.map((tag, index) => (
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