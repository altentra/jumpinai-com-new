import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Rocket } from "lucide-react";
import { promptsService, UserPrompt } from "@/services/promptsService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";

export default function Prompts() {
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<UserPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Get jump information for all prompts
  const jumpIds = prompts.map(prompt => prompt.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    loadPrompts();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Loading your prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Prompts</h2>
        <Badge variant="secondary">{prompts.length} prompts</Badge>
      </div>

      {prompts.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No prompts yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate your personalized AI transformation plan in Jumps Studio to get custom prompts
            </p>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Jumps Studio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
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
            <div key={jumpId} className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Rocket className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {jumpId === 'unassigned' 
                    ? 'Unassigned Prompts' 
                    : jumpsInfo[jumpId] 
                      ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                      : 'Loading Jump Info...'}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  {jumpPrompts.length} prompt{jumpPrompts.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jumpPrompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
                        <div className="flex flex-col gap-1 shrink-0">
                          {prompt.category && (
                            <Badge variant="outline" className="text-xs">
                              {prompt.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {prompt.description && (
                        <CardDescription className="line-clamp-3">
                          {prompt.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
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
