import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, Rocket, RefreshCw, Trash2 } from "lucide-react";
import { promptsService, UserPrompt } from "@/services/promptsService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";

export default function Prompts() {
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<UserPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get jump information for all prompts
  const jumpIds = prompts.map(prompt => prompt.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  const loadPrompts = async () => {
    try {
      const data = await promptsService.getUserPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast({
        title: "Error",
        description: "Failed to load prompts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  // Add visibility change listener to refresh data when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isLoading) {
        loadPrompts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async (promptId: string) => {
    try {
      setDeletingId(promptId);
      await promptsService.deletePrompt(promptId);
      setPrompts(prompts.filter(p => p.id !== promptId));
      toast({
        title: "Deleted",
        description: "Prompt deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: "Error",
        description: "Failed to delete prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Loading your prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-4 shadow-modern">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Prompts</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPrompts()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant="secondary" className="text-xs">{prompts.length} prompts</Badge>
          </div>
        </div>
      </div>

      {prompts.length === 0 ? (
        <Card className="glass text-center py-12 rounded-xl shadow-modern">
          <CardContent>
            <h3 className="text-base font-medium text-muted-foreground mb-2">
              No prompts yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your personalized AI transformation plan in JumpinAI Studio to get custom prompts
            </p>
            <Button variant="outline" className="text-sm" onClick={() => window.location.href = '/jumpinai-studio'}>
              <ExternalLink className="w-3 h-3 mr-2" />
              Visit JumpinAI Studio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Group prompts by Jump */}
          {Object.entries(
            prompts.reduce((groups, prompt) => {
              const jumpId = prompt.jump_id || 'unassigned';
              if (!groups[jumpId]) groups[jumpId] = [];
              groups[jumpId].push(prompt);
              return groups;
            }, {} as Record<string, UserPrompt[]>)
          )
            .sort(([jumpIdA], [jumpIdB]) => {
              // Sort by jump number descending (latest first), with unassigned last
              if (jumpIdA === 'unassigned') return 1;
              if (jumpIdB === 'unassigned') return -1;
              const jumpA = jumpIdA && jumpsInfo[jumpIdA];
              const jumpB = jumpIdB && jumpsInfo[jumpIdB];
              return (jumpB?.jumpNumber || 0) - (jumpA?.jumpNumber || 0);
            })
            .map(([jumpId, jumpPrompts]) => (
            <div key={jumpId} className="glass border rounded-xl p-5 bg-card shadow-modern">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Rocket className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-semibold">
                  {jumpId === 'unassigned' 
                    ? 'Unassigned Prompts' 
                    : jumpsInfo[jumpId] 
                      ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                      : 'Loading Jump Info...'}
                </h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {jumpPrompts.length} prompt{jumpPrompts.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {jumpPrompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className="glass group cursor-pointer hover:shadow-modern-lg transition-all duration-300 relative rounded-lg border-0 hover:scale-[1.02]"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-2 font-semibold">{prompt.title}</CardTitle>
                          {prompt.description && (
                            <CardDescription className="mt-1 line-clamp-3 text-xs">
                              {prompt.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {prompt.category && (
                            <Badge variant="secondary" className="text-xs">
                              {prompt.category}
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
                                <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{prompt.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(prompt.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deletingId === prompt.id}
                                >
                                  {deletingId === prompt.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {prompt.ai_tools && prompt.ai_tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {prompt.ai_tools.slice(0, 3).map((tool, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {prompt.ai_tools.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{prompt.ai_tools.length - 3}
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

      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedPrompt?.title}
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedPrompt && copyToClipboard(selectedPrompt.prompt_text)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPrompt && (
            <div className="space-y-6">
              {selectedPrompt.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedPrompt.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Prompt</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{selectedPrompt.prompt_text}</pre>
                </div>
              </div>

              {selectedPrompt.instructions && (
                <div>
                  <h4 className="font-semibold mb-2">How to Use</h4>
                  <p className="text-muted-foreground">{selectedPrompt.instructions}</p>
                </div>
              )}

              {selectedPrompt.ai_tools && selectedPrompt.ai_tools.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommended AI Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.ai_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedPrompt.use_cases && selectedPrompt.use_cases.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Use Cases</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPrompt.use_cases.map((useCase, index) => (
                      <li key={index} className="text-muted-foreground">{useCase}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag, index) => (
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
