import React from 'react';
import { Loader2, CheckCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';

interface ProgressiveJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
}

const ProgressiveJumpDisplay: React.FC<ProgressiveJumpDisplayProps> = ({ 
  result, 
  generationTimer 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (isComplete: boolean, hasContent: boolean) => {
    if (isComplete && hasContent) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (hasContent) return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Add null safety checks
  if (!result || !result.processing_status) {
    return (
      <div className="w-full space-y-6">
        <div className="glass-dark rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Initializing generation system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress Header */}
      <div className="glass-dark rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">{result.title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {formatTime(generationTimer)}
            </Badge>
            <Badge 
              variant={result.processing_status?.isComplete ? "default" : "secondary"}
              className="text-sm"
            >
              {result.processing_status?.stage || 'Initializing...'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{result.processing_status?.currentTask || 'Starting...'}</span>
            <span className="text-foreground font-medium">{result.processing_status?.progress || 0}%</span>
          </div>
          <Progress value={result.processing_status?.progress || 0} className="h-2" />
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            {getStatusIcon(result.processing_status?.isComplete || false, !!result.full_content)}
            Overview
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            {getStatusIcon(result.processing_status?.isComplete || false, !!result.structured_plan)}
            Plan
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.prompts?.length || 0) > 0)}
            Prompts ({result.components?.prompts?.length || 0}/4)
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.workflows?.length || 0) > 0)}
            Workflows ({result.components?.workflows?.length || 0}/4)
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center gap-2">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.blueprints?.length || 0) > 0)}
            Blueprints ({result.components?.blueprints?.length || 0}/4)
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            {getStatusIcon(result.processing_status?.isComplete || false, (result.components?.strategies?.length || 0) > 0)}
            Strategies ({result.components?.strategies?.length || 0}/4)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {result.full_content ? (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: result.full_content.replace(/\n/g, '<br>') }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Generating strategic action plan...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {result.structured_plan ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{result.structured_plan.overview}</p>
                  <div className="grid gap-4">
                    {result.structured_plan.phases?.map((phase: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Phase {phase.phase_number}: {phase.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Duration: {phase.duration}</p>
                        <p className="text-sm">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Creating implementation plan...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          <div className="grid gap-4">
            {[...Array(4)].map((_, index) => {
              const prompt = result.components.prompts[index];
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.processing_status.isComplete, !!prompt)}
                      {prompt ? prompt.title : `AI Prompt ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prompt ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{prompt.description}</p>
                        <div className="bg-muted rounded-lg p-4">
                          <pre className="text-sm whitespace-pre-wrap">{prompt.prompt_text}</pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Prompts' && result.components.prompts.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating prompt...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <div className="grid gap-4">
            {[...Array(4)].map((_, index) => {
              const workflow = result.components.workflows[index];
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.processing_status.isComplete, !!workflow)}
                      {workflow ? workflow.title : `Workflow ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workflow ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        <div className="space-y-2">
                          {workflow.workflow_steps?.slice(0, 3).map((step: any, stepIndex: number) => (
                            <div key={stepIndex} className="border-l-2 border-primary/30 pl-4 py-2">
                              <h4 className="font-medium text-sm">Step {step.step}: {step.title}</h4>
                              <p className="text-xs text-muted-foreground">{step.description?.slice(0, 100)}...</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Workflows' && result.components.workflows.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating workflow...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="blueprints" className="mt-6">
          <div className="grid gap-4">
            {[...Array(4)].map((_, index) => {
              const blueprint = result.components.blueprints[index];
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.processing_status.isComplete, !!blueprint)}
                      {blueprint ? blueprint.title : `Blueprint ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {blueprint ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{blueprint.description}</p>
                        <div className="bg-muted rounded-lg p-4">
                          <h4 className="font-medium mb-2">Overview</h4>
                          <p className="text-sm">{blueprint.blueprint_content?.overview?.slice(0, 200)}...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Blueprints' && result.components.blueprints.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating blueprint...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="mt-6">
          <div className="grid gap-4">
            {[...Array(4)].map((_, index) => {
              const strategy = result.components.strategies[index];
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.processing_status.isComplete, !!strategy)}
                      {strategy ? strategy.title : `Strategy ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strategy ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        <div className="space-y-2">
                          <div className="border rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-1">Objective</h4>
                            <p className="text-xs text-muted-foreground">{strategy.strategy_framework?.objective}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground">
                        {result.processing_status.stage === 'Processing Strategies' && result.components.strategies.length === index ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Generating strategy...
                          </>
                        ) : (
                          <Clock className="w-5 h-5 mr-2" />
                        )}
                        Waiting for generation...
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressiveJumpDisplay;