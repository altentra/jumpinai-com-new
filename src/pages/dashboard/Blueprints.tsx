import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Layers, ExternalLink, Rocket } from "lucide-react";
import { blueprintsService, UserBlueprint } from "@/services/blueprintsService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";

export default function Blueprints() {
  const [blueprints, setBlueprints] = useState<UserBlueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<UserBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Get jump information for all blueprints
  const jumpIds = blueprints.map(blueprint => blueprint.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    loadBlueprints();
  }, []);

  const loadBlueprints = async () => {
    try {
      const data = await blueprintsService.getUserBlueprints();
      setBlueprints(data);
    } catch (error) {
      console.error('Error loading blueprints:', error);
      toast({
        title: "Error",
        description: "Failed to load blueprints. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Loading your blueprints...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Blueprints</h2>
        <Badge variant="secondary">{blueprints.length} blueprints</Badge>
      </div>

      {blueprints.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No blueprints yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate your personalized AI transformation plan in Jumps Studio to get custom blueprints
            </p>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Jumps Studio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Group blueprints by Jump */}
          {Object.entries(
            blueprints.reduce((groups, blueprint) => {
              const jumpId = blueprint.jump_id || 'unassigned';
              if (!groups[jumpId]) groups[jumpId] = [];
              groups[jumpId].push(blueprint);
              return groups;
            }, {} as Record<string, UserBlueprint[]>)
          )
            .sort(([jumpIdA], [jumpIdB]) => {
              // Sort by jump number, with unassigned last
              if (jumpIdA === 'unassigned') return 1;
              if (jumpIdB === 'unassigned') return -1;
              const jumpA = jumpIdA && jumpsInfo[jumpIdA];
              const jumpB = jumpIdB && jumpsInfo[jumpIdB];
              return (jumpA?.jumpNumber || 0) - (jumpB?.jumpNumber || 0);
            })
            .map(([jumpId, jumpBlueprints]) => (
            <div key={jumpId} className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Rocket className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {jumpId === 'unassigned' 
                    ? 'Unassigned Blueprints' 
                    : jumpsInfo[jumpId] 
                      ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                      : 'Loading Jump Info...'}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  {jumpBlueprints.length} blueprint{jumpBlueprints.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jumpBlueprints.map((blueprint) => (
                  <Card 
                    key={blueprint.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedBlueprint(blueprint)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{blueprint.title}</CardTitle>
                        <div className="flex flex-col gap-1 shrink-0">
                          {blueprint.category && (
                            <Badge variant="outline" className="text-xs">
                              {blueprint.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {blueprint.description && (
                        <CardDescription className="line-clamp-3">
                          {blueprint.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {blueprint.implementation_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {blueprint.implementation_time}
                            </div>
                          )}
                          {blueprint.difficulty_level && (
                            <Badge className={`text-xs ${getDifficultyColor(blueprint.difficulty_level)}`}>
                              {blueprint.difficulty_level}
                            </Badge>
                          )}
                        </div>
                        
                        {blueprint.deliverables && blueprint.deliverables.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Layers className="w-4 h-4" />
                            <span>{blueprint.deliverables.length} deliverable{blueprint.deliverables.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        {blueprint.ai_tools && blueprint.ai_tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blueprint.ai_tools.slice(0, 3).map((tool, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {blueprint.ai_tools.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{blueprint.ai_tools.length - 3}
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

      <Dialog open={!!selectedBlueprint} onOpenChange={() => setSelectedBlueprint(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedBlueprint?.title}
              {selectedBlueprint?.difficulty_level && (
                <Badge className={getDifficultyColor(selectedBlueprint.difficulty_level)}>
                  {selectedBlueprint.difficulty_level}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBlueprint && (
            <div className="space-y-6">
              {selectedBlueprint.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedBlueprint.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedBlueprint.implementation_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Implementation: {selectedBlueprint.implementation_time}</span>
                  </div>
                )}
                {selectedBlueprint.difficulty_level && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <span>Difficulty: {selectedBlueprint.difficulty_level}</span>
                  </div>
                )}
              </div>

              {selectedBlueprint.blueprint_content && (
                <div>
                  <h4 className="font-semibold mb-4">Blueprint Details</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-4">
                    {selectedBlueprint.blueprint_content.overview && (
                      <div>
                        <h5 className="font-medium mb-2">Overview</h5>
                        <p className="text-muted-foreground text-sm">{selectedBlueprint.blueprint_content.overview}</p>
                      </div>
                    )}
                    
                    {selectedBlueprint.blueprint_content.components && Array.isArray(selectedBlueprint.blueprint_content.components) && (
                      <div>
                        <h5 className="font-medium mb-2">Components</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedBlueprint.blueprint_content.components.map((component: string, index: number) => (
                            <li key={index} className="text-muted-foreground text-sm">{component}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedBlueprint.blueprint_content.structure && (
                      <div>
                        <h5 className="font-medium mb-2">Structure</h5>
                        <p className="text-muted-foreground text-sm">{selectedBlueprint.blueprint_content.structure}</p>
                      </div>
                    )}
                    
                    {selectedBlueprint.blueprint_content.implementation && (
                      <div>
                        <h5 className="font-medium mb-2">Implementation</h5>
                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">{selectedBlueprint.blueprint_content.implementation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBlueprint.resources_needed && selectedBlueprint.resources_needed.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Required Resources</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedBlueprint.resources_needed.map((resource, index) => (
                      <li key={index} className="text-muted-foreground">{resource}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBlueprint.deliverables && selectedBlueprint.deliverables.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Deliverables</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedBlueprint.deliverables.map((deliverable, index) => (
                      <li key={index} className="text-muted-foreground">{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedBlueprint.instructions && (
                <div>
                  <h4 className="font-semibold mb-2">Implementation Guide</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedBlueprint.instructions}</p>
                </div>
              )}

              {selectedBlueprint.ai_tools && selectedBlueprint.ai_tools.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended AI Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.ai_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedBlueprint.tags && selectedBlueprint.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.tags.map((tag, index) => (
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