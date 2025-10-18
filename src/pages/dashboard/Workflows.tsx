import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, Zap, CheckCircle2, Trash2, Sparkles } from "lucide-react";
import { workflowsService, UserWorkflow } from "@/services/workflowsService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";
import { Separator } from "@/components/ui/separator";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const jumpIds = workflows.map(workflow => workflow.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    loadWorkflows();
  }, []);

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
        description: "Failed to load workflows",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (workflowId: string) => {
    setDeletingId(workflowId);
    try {
      await workflowsService.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      toast({
        title: "Success",
        description: "Workflow deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6 text-center px-4">
        <div className="rounded-full bg-primary/10 p-6">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">No Workflows Yet</h3>
          <p className="text-muted-foreground max-w-md">
            Start your AI journey by visiting the JumpinAI Studio to generate your first workflow
          </p>
        </div>
        <Button size="lg" onClick={() => window.location.href = "/jumpinai-studio"}>
          Create Your First Workflow
        </Button>
      </div>
    );
  }

  const groupedWorkflows = workflows.reduce((acc, workflow) => {
    const jumpId = workflow.jump_id || 'No Jump';
    if (!acc[jumpId]) acc[jumpId] = [];
    acc[jumpId].push(workflow);
    return acc;
  }, {} as Record<string, UserWorkflow[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedWorkflows)
        .sort(([, a], [, b]) => (b[0]?.created_at || '').localeCompare(a[0]?.created_at || ''))
        .map(([jumpId, jumpWorkflows]) => {
          const jumpInfo = jumpsInfo[jumpId];
          return (
            <div key={jumpId} className="space-y-4">
              {jumpInfo && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
                  <div>
                    <h2 className="text-xl font-bold">{jumpInfo.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {jumpWorkflows.length} workflow{jumpWorkflows.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jumpWorkflows.map((workflow) => (
                  <Card 
                    key={workflow.id} 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {workflow.title}
                        </CardTitle>
                        <AlertDialog>
                          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              disabled={deletingId === workflow.id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{workflow.title}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(workflow.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {workflow.category && (
                        <Badge variant="secondary" className="w-fit">
                          {workflow.category}
                        </Badge>
                      )}

                      {workflow.description && (
                        <CardDescription className="line-clamp-2">
                          {workflow.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {workflow.duration_estimate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{workflow.duration_estimate}</span>
                          </div>
                        )}
                        {workflow.complexity_level && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            <span className="capitalize">{workflow.complexity_level}</span>
                          </div>
                        )}
                      </div>

                      {workflow.workflow_steps && workflow.workflow_steps.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">{workflow.workflow_steps.length} Steps</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

      {/* Detail Modal */}
      <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedWorkflow && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedWorkflow.title}</DialogTitle>
                {selectedWorkflow.category && (
                  <Badge variant="secondary" className="w-fit">
                    {selectedWorkflow.category}
                  </Badge>
                )}
              </DialogHeader>

              {selectedWorkflow.description && (
                <div>
                  <p className="text-muted-foreground">{selectedWorkflow.description}</p>
                </div>
              )}

              <Separator />

              {/* Workflow Steps */}
              {selectedWorkflow.workflow_steps && selectedWorkflow.workflow_steps.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Workflow Steps
                  </h3>
                  <div className="space-y-4">
                    {selectedWorkflow.workflow_steps.map((step: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                              {step.stepNumber || index + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold">{step.title}</h4>
                              {step.description && (
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              )}
                              <div className="flex flex-wrap gap-3 text-sm">
                                {step.aiTool && (
                                  <Badge variant="outline">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {step.aiTool}
                                  </Badge>
                                )}
                                {step.estimatedTime && (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {step.estimatedTime}
                                  </Badge>
                                )}
                              </div>
                              {step.deliverable && (
                                <div className="mt-2 p-3 bg-muted rounded-lg">
                                  <p className="text-sm"><strong>Deliverable:</strong> {step.deliverable}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid gap-6 md:grid-cols-2">
                {selectedWorkflow.prerequisites && selectedWorkflow.prerequisites.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Prerequisites</h4>
                    <ul className="space-y-2">
                      {selectedWorkflow.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedWorkflow.expected_outcomes && selectedWorkflow.expected_outcomes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Expected Outcomes</h4>
                    <ul className="space-y-2">
                      {selectedWorkflow.expected_outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedWorkflow.instructions && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Instructions</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedWorkflow.instructions}</p>
                  </div>
                </div>
              )}

              {selectedWorkflow.ai_tools && selectedWorkflow.ai_tools.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">AI Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.ai_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkflow.tags && selectedWorkflow.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
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
