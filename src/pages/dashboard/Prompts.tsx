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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <Card 
              key={prompt.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPrompt(prompt)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
                  <div className="flex flex-col gap-1 shrink-0">
                    {prompt.jump_id && jumpsInfo[prompt.jump_id] && (
                      <Badge variant="default" className="text-xs">
                        <Rocket className="w-3 h-3 mr-1" />
                        Jump #{jumpsInfo[prompt.jump_id].jumpNumber}
                      </Badge>
                    )}
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
