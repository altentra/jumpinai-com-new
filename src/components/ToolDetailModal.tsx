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
import { Clock, DollarSign, Settings, AlertTriangle, CheckCircle, Tag } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UserTool = Database['public']['Tables']['user_tools']['Row'];

interface ToolDetailModalProps {
  tool: UserTool | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolDetailModal({ tool, isOpen, onClose }: ToolDetailModalProps) {
  if (!tool) return null;

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
              <DialogTitle className="text-2xl mb-2">{tool.title}</DialogTitle>
              <DialogDescription className="text-base">
                {tool.description}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {tool.ai_tool_type && (
              <Badge variant="secondary">{tool.ai_tool_type}</Badge>
            )}
            {tool.category && (
              <Badge variant="outline">{tool.category}</Badge>
            )}
            {tool.difficulty_level && (
              <Badge className={getDifficultyColor(tool.difficulty_level)}>
                {tool.difficulty_level}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.setup_time && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Setup Time</p>
                    <p className="text-sm text-muted-foreground">{tool.setup_time}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {tool.cost_estimate && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Cost Estimate</p>
                    <p className="text-sm text-muted-foreground">{tool.cost_estimate}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {tool.integration_complexity && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Complexity</p>
                    <p className="text-sm text-muted-foreground">{tool.integration_complexity}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Use Cases */}
          {tool.use_cases && tool.use_cases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {tool.use_cases.map((useCase, index) => (
                    <li key={index} className="text-sm">{useCase}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {tool.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implementation Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm">{tool.instructions}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limitations */}
          {tool.limitations && tool.limitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Limitations & Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {tool.limitations.map((limitation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{limitation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
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