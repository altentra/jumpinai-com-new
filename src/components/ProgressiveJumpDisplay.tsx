import React from 'react';
import { Clock, CheckCircle, Loader2, Target, Lightbulb, Workflow, FileText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import JumpResultDisplay from '@/components/JumpResultDisplay';

interface ProgressiveJumpDisplayProps {
  isGenerating: boolean;
  status: {
    phase: string;
    message: string;
    progress: number;
  };
  generationData: {
    prompts: any[];
    workflows: any[];
    blueprints: any[];
    strategies: any[];
    plan: any;
    comprehensivePlan: any;
    fullContent: string;
  };
  timer: string;
  jumpId?: string | null;
  isAuthenticated: boolean;
}

const ProgressiveJumpDisplay: React.FC<ProgressiveJumpDisplayProps> = ({
  isGenerating,
  status,
  generationData,
  timer,
  jumpId,
  isAuthenticated
}) => {
  if (!isGenerating && !generationData.plan && generationData.prompts.length === 0) {
    return null;
  }

  // If generation is complete, show the full result display
  if (!isGenerating && (generationData.plan || generationData.prompts.length > 0)) {
    return (
      <JumpResultDisplay
        fullContent={generationData.fullContent}
        structuredPlan={generationData.plan}
        comprehensivePlan={generationData.comprehensivePlan}
        components={{
          prompts: generationData.prompts,
          workflows: generationData.workflows,
          blueprints: generationData.blueprints,
          strategies: generationData.strategies
        }}
        isAuthenticated={isAuthenticated}
        jumpId={jumpId}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Status Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
              <span className="font-semibold text-lg">
                {isGenerating ? 'Generating Your Jump in AI...' : 'Your Jump in AI is Ready!'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{timer}</span>
            </div>
          </div>
          {jumpId && (
            <Badge variant="outline" className="text-green-400 border-green-400/30">
              Saved to Dashboard
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{status.message}</span>
            <span className="text-primary">{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="h-2" />
        </div>

        {/* Phase Indicator */}
        <div className="flex flex-wrap gap-2">
          {[
            { phase: 'starting', label: 'Starting', icon: Target },
            { phase: 'ai_generation', label: 'AI Generation', icon: Loader2 },
            { phase: 'processing_plan', label: 'Plan Ready', icon: CheckCircle },
            { phase: 'processing_components', label: 'Components', icon: Loader2 },
            { phase: 'saving', label: 'Saving', icon: Loader2 },
            { phase: 'complete', label: 'Complete', icon: CheckCircle }
          ].map(({ phase, label, icon: Icon }) => {
            const isActive = status.phase === phase;
            const isComplete = ['processing_plan', 'processing_components', 'saving', 'complete'].includes(phase) && 
                              ['processing_components', 'saving', 'complete'].includes(status.phase);
            
            return (
              <Badge 
                key={phase}
                variant={isActive ? "default" : isComplete ? "secondary" : "outline"}
                className={`flex items-center gap-1 ${
                  isActive ? 'bg-primary text-primary-foreground' :
                  isComplete ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  'text-muted-foreground'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive && phase !== 'complete' ? 'animate-spin' : ''}`} />
                {label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Progressive Content Display */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 glass">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Prompts ({generationData.prompts.length})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflows ({generationData.workflows.length})
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Blueprints ({generationData.blueprints.length})
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Strategies ({generationData.strategies.length})
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Full Plan
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Strategic Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generationData.comprehensivePlan?.executive_summary ? (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Executive Summary</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {generationData.comprehensivePlan.executive_summary}
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Executive Summary</h4>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <Lightbulb className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold text-foreground">
                  {generationData.prompts.length}
                </div>
                <div className="text-sm text-muted-foreground">AI Prompts</div>
                {isGenerating && generationData.prompts.length === 0 && (
                  <div className="mt-1">
                    <Skeleton className="h-1 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <Workflow className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-foreground">
                  {generationData.workflows.length}
                </div>
                <div className="text-sm text-muted-foreground">Workflows</div>
                {isGenerating && generationData.workflows.length === 0 && (
                  <div className="mt-1">
                    <Skeleton className="h-1 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold text-foreground">
                  {generationData.blueprints.length}
                </div>
                <div className="text-sm text-muted-foreground">Blueprints</div>
                {isGenerating && generationData.blueprints.length === 0 && (
                  <div className="mt-1">
                    <Skeleton className="h-1 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-foreground">
                  {generationData.strategies.length}
                </div>
                <div className="text-sm text-muted-foreground">Strategies</div>
                {isGenerating && generationData.strategies.length === 0 && (
                  <div className="mt-1">
                    <Skeleton className="h-1 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tabs - Show progressive loading */}
        {['prompts', 'workflows', 'blueprints', 'strategies'].map((componentType) => (
          <TabsContent key={componentType} value={componentType} className="space-y-4">
            {generationData[componentType as keyof typeof generationData].map((item: any, index: number) => (
              <Card key={index} className="glass border-white/20 animate-in slide-in-from-left duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {componentType === 'prompts' && <Lightbulb className="w-5 h-5 text-yellow-400" />}
                    {componentType === 'workflows' && <Workflow className="w-5 h-5 text-blue-400" />}
                    {componentType === 'blueprints' && <FileText className="w-5 h-5 text-green-400" />}
                    {componentType === 'strategies' && <TrendingUp className="w-5 h-5 text-purple-400" />}
                    {item.title}
                    <Badge variant="outline" className="text-green-400 border-green-400/30 ml-auto">
                      Ready
                    </Badge>
                  </CardTitle>
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Component loaded and ready for use.
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {/* Show loading placeholders */}
            {isGenerating && generationData[componentType as keyof typeof generationData].length < 4 && (
              <Card className="glass border-white/20 opacity-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-48" />
                    <div className="ml-auto">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}

        {/* Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          {generationData.plan ? (
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle>{generationData.plan.title}</CardTitle>
                <CardDescription>{generationData.plan.overview}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: generationData.fullContent }} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass border-white/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-64" />
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressiveJumpDisplay;