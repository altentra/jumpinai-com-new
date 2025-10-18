import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, Layers, Trash2, Sparkles, Package } from "lucide-react";
import { blueprintsService, UserBlueprint } from "@/services/blueprintsService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";
import { Separator } from "@/components/ui/separator";

export default function Blueprints() {
  const [blueprints, setBlueprints] = useState<UserBlueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<UserBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const jumpIds = blueprints.map(blueprint => blueprint.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    loadBlueprints();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isLoading) {
        loadBlueprints();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading]);

  const loadBlueprints = async () => {
    try {
      const data = await blueprintsService.getUserBlueprints();
      setBlueprints(data);
    } catch (error) {
      console.error('Error loading blueprints:', error);
      toast({
        title: "Error",
        description: "Failed to load blueprints",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (blueprintId: string) => {
    setDeletingId(blueprintId);
    try {
      await blueprintsService.deleteBlueprint(blueprintId);
      setBlueprints(blueprints.filter(b => b.id !== blueprintId));
      toast({
        title: "Success",
        description: "Blueprint deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blueprint",
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
          <p className="text-muted-foreground">Loading blueprints...</p>
        </div>
      </div>
    );
  }

  if (blueprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6 text-center px-4">
        <div className="rounded-full bg-primary/10 p-6">
          <Layers className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">No Blueprints Yet</h3>
          <p className="text-muted-foreground max-w-md">
            Generate your first blueprint in the JumpinAI Studio to kickstart your AI implementation
          </p>
        </div>
        <Button size="lg" onClick={() => window.location.href = "/jumpinai-studio"}>
          Create Your First Blueprint
        </Button>
      </div>
    );
  }

  const groupedBlueprints = blueprints.reduce((acc, blueprint) => {
    const jumpId = blueprint.jump_id || 'No Jump';
    if (!acc[jumpId]) acc[jumpId] = [];
    acc[jumpId].push(blueprint);
    return acc;
  }, {} as Record<string, UserBlueprint[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedBlueprints)
        .sort(([, a], [, b]) => (b[0]?.created_at || '').localeCompare(a[0]?.created_at || ''))
        .map(([jumpId, jumpBlueprints]) => {
          const jumpInfo = jumpsInfo[jumpId];
          return (
            <div key={jumpId} className="space-y-4">
              {jumpInfo && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
                  <div>
                    <h2 className="text-xl font-bold">{jumpInfo.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {jumpBlueprints.length} blueprint{jumpBlueprints.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jumpBlueprints.map((blueprint) => (
                  <Card 
                    key={blueprint.id} 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => setSelectedBlueprint(blueprint)}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {blueprint.title}
                        </CardTitle>
                        <AlertDialog>
                          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              disabled={deletingId === blueprint.id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Blueprint?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{blueprint.title}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(blueprint.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {blueprint.category && (
                        <Badge variant="secondary" className="w-fit">
                          {blueprint.category}
                        </Badge>
                      )}

                      {blueprint.description && (
                        <CardDescription className="line-clamp-2">
                          {blueprint.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {blueprint.implementation_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{blueprint.implementation_time}</span>
                          </div>
                        )}
                        {blueprint.difficulty_level && (
                          <Badge variant="outline" className="capitalize">
                            {blueprint.difficulty_level}
                          </Badge>
                        )}
                      </div>

                      {blueprint.blueprint_content?.phases && (
                        <div className="flex items-center gap-2 text-sm">
                          <Layers className="h-4 w-4 text-primary" />
                          <span className="font-medium">{blueprint.blueprint_content.phases.length} Phases</span>
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
      <Dialog open={!!selectedBlueprint} onOpenChange={() => setSelectedBlueprint(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBlueprint && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedBlueprint.title}</DialogTitle>
                <div className="flex gap-2">
                  {selectedBlueprint.category && (
                    <Badge variant="secondary">{selectedBlueprint.category}</Badge>
                  )}
                  {selectedBlueprint.difficulty_level && (
                    <Badge variant="outline" className="capitalize">{selectedBlueprint.difficulty_level}</Badge>
                  )}
                </div>
              </DialogHeader>

              {selectedBlueprint.description && (
                <div>
                  <p className="text-muted-foreground">{selectedBlueprint.description}</p>
                </div>
              )}

              <Separator />

              {/* Phases */}
              {selectedBlueprint.blueprint_content?.phases && selectedBlueprint.blueprint_content.phases.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Implementation Phases
                  </h3>
                  <div className="space-y-4">
                    {selectedBlueprint.blueprint_content.phases.map((phase: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                              Phase {phase.phase || index + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="font-semibold">{phase.name}</h4>
                                {phase.duration && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {phase.duration}
                                  </p>
                                )}
                              </div>

                              {phase.objectives && phase.objectives.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Objectives:</p>
                                  <ul className="space-y-1">
                                    {phase.objectives.map((obj: string, i: number) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>{obj}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {phase.tasks && phase.tasks.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Tasks:</p>
                                  <ul className="space-y-1">
                                    {phase.tasks.map((task: string, i: number) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <Package className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                        <span>{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {phase.milestones && phase.milestones.length > 0 && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-sm font-medium mb-2">Milestones:</p>
                                  <ul className="space-y-1">
                                    {phase.milestones.map((milestone: string, i: number) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-primary">✓</span>
                                        <span>{milestone}</span>
                                      </li>
                                    ))}
                                  </ul>
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

              {/* Deliverables */}
              {selectedBlueprint.deliverables && selectedBlueprint.deliverables.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Deliverables</h4>
                  <ul className="space-y-2">
                    {selectedBlueprint.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Package className="h-4 w-4 text-primary mt-0.5" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBlueprint.instructions && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Implementation Instructions</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedBlueprint.instructions}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {selectedBlueprint.resources_needed && selectedBlueprint.resources_needed.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Resources Needed</h4>
                    <ul className="space-y-2">
                      {selectedBlueprint.resources_needed.map((resource, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {selectedBlueprint.ai_tools && selectedBlueprint.ai_tools.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">AI Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.ai_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedBlueprint.tags && selectedBlueprint.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.tags.map((tag, index) => (
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
