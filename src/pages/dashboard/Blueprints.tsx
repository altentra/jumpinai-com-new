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

                      {blueprint.deliverables && blueprint.deliverables.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium">{blueprint.deliverables.length} Deliverables</span>
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

              {/* Blueprint Overview */}
              {selectedBlueprint.blueprint_content?.overview && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Overview</h4>
                  <p className="text-sm">{selectedBlueprint.blueprint_content.overview}</p>
                </div>
              )}

              {/* Architecture */}
              {selectedBlueprint.blueprint_content?.architecture && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Architecture
                  </h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedBlueprint.blueprint_content.architecture}</p>
                  </div>
                </div>
              )}

              {/* Components */}
              {selectedBlueprint.blueprint_content?.components && selectedBlueprint.blueprint_content.components.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Components
                  </h4>
                  <div className="space-y-3">
                    {selectedBlueprint.blueprint_content.components.map((component: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-primary/50">
                        <CardContent className="pt-4">
                          <h5 className="font-semibold mb-2">{component.name || `Component ${index + 1}`}</h5>
                          {component.specs && <p className="text-sm text-muted-foreground mb-2">{component.specs}</p>}
                          {component.config && <p className="text-sm"><strong>Config:</strong> {component.config}</p>}
                          {component.requirements && <p className="text-sm"><strong>Requirements:</strong> {component.requirements}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation Steps */}
              {selectedBlueprint.blueprint_content?.implementation_steps && selectedBlueprint.blueprint_content.implementation_steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Implementation Steps</h4>
                  <div className="space-y-2">
                    {selectedBlueprint.blueprint_content.implementation_steps.map((step: any, index: number) => (
                      <div key={index} className="flex gap-3 p-3 bg-muted rounded-lg">
                        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary h-fit">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.title || step.name || step}</p>
                          {step.description && <p className="text-sm text-muted-foreground mt-1">{step.description}</p>}
                          {step.checkpoint && <p className="text-sm text-primary mt-1">✓ Checkpoint: {step.checkpoint}</p>}
                          {step.testing && <p className="text-sm text-muted-foreground mt-1">Testing: {step.testing}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Practices */}
              {selectedBlueprint.blueprint_content?.best_practices && selectedBlueprint.blueprint_content.best_practices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Best Practices</h4>
                  <ul className="space-y-2">
                    {selectedBlueprint.blueprint_content.best_practices.map((practice: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm p-3 bg-primary/5 rounded-lg">
                        <span className="text-primary mt-1">✓</span>
                        <div>
                          <p className="font-medium">{practice.title || practice.name || practice}</p>
                          {practice.rationale && <p className="text-muted-foreground mt-1">{practice.rationale}</p>}
                          {practice.example && <p className="text-muted-foreground mt-1 italic">Example: {practice.example}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
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

              {/* Resources Needed */}
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

              {/* Instructions */}
              {selectedBlueprint.instructions && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Implementation Instructions</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedBlueprint.instructions}</p>
                  </div>
                </div>
              )}

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
