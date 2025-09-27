import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, Settings, AlertTriangle, CheckCircle, Tag, Rocket } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useJumpInfo } from "@/hooks/useJumpInfo";

type UserTool = Database['public']['Tables']['user_tools']['Row'];

interface ToolDetailModalProps {
  tool: UserTool | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolDetailModal({ tool, isOpen, onClose }: ToolDetailModalProps) {
  if (!tool) return null;

  const { jumpInfo } = useJumpInfo(tool.jump_id || undefined);
  
  // Get the rich content from tool_content field or fall back to flattened fields
  const toolContent = tool.tool_content as any;
  const displayTool = {
    title: tool.title,
    description: toolContent?.description || tool.description,
    category: toolContent?.category || tool.category,
    ai_tool_type: toolContent?.type || tool.ai_tool_type,
    use_cases: toolContent?.use_cases || toolContent?.useCases || tool.use_cases || [],
    instructions: toolContent?.instructions || toolContent?.howToUse || toolContent?.implementation || tool.instructions,
    tags: toolContent?.tags || tool.tags || [],
    difficulty_level: toolContent?.difficulty || toolContent?.difficultyLevel || tool.difficulty_level,
    setup_time: toolContent?.setup_time || toolContent?.setupTime || tool.setup_time,
    integration_complexity: toolContent?.complexity || toolContent?.integrationComplexity || tool.integration_complexity,
    cost_estimate: toolContent?.cost || toolContent?.costEstimate || tool.cost_estimate,
    features: toolContent?.features || toolContent?.keyFeatures || tool.features || [],
    limitations: toolContent?.limitations || toolContent?.considerations || tool.limitations || [],
    benefits: toolContent?.benefits || [],
    prerequisites: toolContent?.prerequisites || [],
    examples: toolContent?.examples || [],
    resources: toolContent?.resources || []
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">{displayTool.title}</DialogTitle>
              <DialogDescription className="text-base">
                {displayTool.description}
              </DialogDescription>
              {jumpInfo && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Rocket className="h-4 w-4" />
                  <span>From Jump: {jumpInfo.title}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {displayTool.ai_tool_type && (
              <Badge variant="secondary">{displayTool.ai_tool_type}</Badge>
            )}
            {displayTool.category && (
              <Badge variant="outline">{displayTool.category}</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayTool.setup_time && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Setup Time</p>
                    <p className="text-sm text-muted-foreground">{displayTool.setup_time}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {displayTool.cost_estimate && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Cost Estimate</p>
                    <p className="text-sm text-muted-foreground">{displayTool.cost_estimate}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {displayTool.integration_complexity && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Complexity</p>
                    <p className="text-sm text-muted-foreground">{displayTool.integration_complexity}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Use Cases */}
          {displayTool.use_cases && displayTool.use_cases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayTool.use_cases.map((useCase, index) => (
                    <li key={index} className="text-sm">{useCase}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {displayTool.features && displayTool.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayTool.features.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {displayTool.benefits && displayTool.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayTool.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm">{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {displayTool.prerequisites && displayTool.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayTool.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="text-sm">{prerequisite}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {displayTool.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implementation Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg border">{displayTool.instructions}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Examples */}
          {displayTool.examples && displayTool.examples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayTool.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-sm">{example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limitations */}
          {displayTool.limitations && displayTool.limitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Limitations & Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayTool.limitations.map((limitation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{limitation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {displayTool.resources && displayTool.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {displayTool.resources.map((resource, index) => (
                    <li key={index} className="text-sm">{resource}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {displayTool.tags && displayTool.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {displayTool.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />
          
          {/* Metadata */}
          <div className="text-sm text-muted-foreground">
            <p>Created: {formatDate(tool.created_at)}</p>
            <p>Updated: {formatDate(tool.updated_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}