import React, { useState } from 'react';
import { CheckCircle, Clock, User, Target, Lightbulb, Workflow, FileText, TrendingUp, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface JumpResultProps {
  fullContent: string;
  structuredPlan?: any;
  comprehensivePlan?: any;
  components?: {
    prompts: any[];
    workflows: any[];
    blueprints: any[];
    strategies: any[];
  };
  isAuthenticated: boolean;
  jumpId?: string;
}

const JumpResultDisplay: React.FC<JumpResultProps> = ({
  fullContent,
  structuredPlan,
  comprehensivePlan,
  components,
  isAuthenticated,
  jumpId
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-blue-500/20 text-blue-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-blue-500/20 text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold text-lg">Your Jump in AI is Ready!</span>
        </div>
        {isAuthenticated && jumpId && (
          <Badge variant="outline" className="text-green-400 border-green-400/30">
            Saved to Dashboard
          </Badge>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 glass">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Prompts ({components?.prompts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflows ({components?.workflows?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Blueprints ({components?.blueprints?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Strategies ({components?.strategies?.length || 0})
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
              {comprehensivePlan?.executiveSummary && (
                <div>
                   <h4 className="font-semibold mb-2 text-white drop-shadow-sm">Executive Summary</h4>
                   <p className="text-white/90 drop-shadow-sm leading-relaxed whitespace-pre-wrap">
                     {comprehensivePlan.executiveSummary}
                   </p>
                </div>
              )}
              
              {comprehensivePlan?.situationAnalysis && (
                <div className="space-y-3">
                   <h4 className="font-semibold mb-2 text-white drop-shadow-sm">Situation Analysis</h4>
                   
                   {comprehensivePlan.situationAnalysis.currentState && (
                     <div>
                       <h5 className="text-sm font-medium text-white/80 mb-1">Current State</h5>
                       <p className="text-white/90 drop-shadow-sm text-sm">{comprehensivePlan.situationAnalysis.currentState}</p>
                     </div>
                   )}
                   
                   {comprehensivePlan.situationAnalysis.challenges && comprehensivePlan.situationAnalysis.challenges.length > 0 && (
                     <div>
                       <h5 className="text-sm font-medium text-white/80 mb-1">Challenges</h5>
                       <ul className="space-y-1">
                         {comprehensivePlan.situationAnalysis.challenges.map((challenge: string, index: number) => (
                           <li key={index} className="flex items-start gap-2 text-white/90 drop-shadow-sm text-sm">
                             <span className="text-red-400 mt-1">•</span>
                             {challenge}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                   
                   {comprehensivePlan.situationAnalysis.opportunities && comprehensivePlan.situationAnalysis.opportunities.length > 0 && (
                     <div>
                       <h5 className="text-sm font-medium text-white/80 mb-1">Opportunities</h5>
                       <ul className="space-y-1">
                         {comprehensivePlan.situationAnalysis.opportunities.map((opp: string, index: number) => (
                           <li key={index} className="flex items-start gap-2 text-white/90 drop-shadow-sm text-sm">
                             <span className="text-green-400 mt-1">•</span>
                             {opp}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                </div>
              )}

              {comprehensivePlan?.strategicVision && (
                <div>
                  <h4 className="font-semibold mb-2 text-white drop-shadow-sm">Strategic Vision</h4>
                  <p className="text-white/90 drop-shadow-sm leading-relaxed">{comprehensivePlan.strategicVision}</p>
                </div>
              )}

              {comprehensivePlan?.roadmap && (
                <div>
                  <h4 className="font-semibold mb-3 text-white drop-shadow-sm">Implementation Roadmap</h4>
                  <div className="grid gap-3">
                    {Object.entries(comprehensivePlan.roadmap).map(([key, phase]: [string, any]) => (
                      <div key={key} className="p-3 glass rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-primary border-primary/30">{phase.name}</Badge>
                          <span className="text-sm text-white/70">{phase.timeline}</span>
                        </div>
                        {phase.milestones && phase.milestones.length > 0 && (
                          <ul className="space-y-1 mt-2">
                            {phase.milestones.map((milestone: string, idx: number) => (
                              <li key={idx} className="text-sm text-white/90 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                {milestone}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comprehensivePlan?.successFactors && comprehensivePlan.successFactors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-white drop-shadow-sm">Key Success Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {comprehensivePlan.successFactors.map((factor: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-green-400 border-green-400/30">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {comprehensivePlan?.riskMitigation && comprehensivePlan.riskMitigation.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-white drop-shadow-sm">Risk Mitigation</h4>
                  <ul className="space-y-1">
                    {comprehensivePlan.riskMitigation.map((strategy: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-white/90 drop-shadow-sm text-sm">
                        <span className="text-blue-400 mt-1">•</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <Lightbulb className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                 <div className="text-2xl font-bold text-white drop-shadow-sm">{components?.prompts?.length || 0}</div>
                 <div className="text-sm text-white/80 drop-shadow-sm">AI Prompts</div>
              </CardContent>
            </Card>
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <Workflow className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                 <div className="text-2xl font-bold text-white drop-shadow-sm">{components?.workflows?.length || 0}</div>
                 <div className="text-sm text-white/80 drop-shadow-sm">Workflows</div>
              </CardContent>
            </Card>
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-green-400" />
                 <div className="text-2xl font-bold text-white drop-shadow-sm">{components?.blueprints?.length || 0}</div>
                 <div className="text-sm text-white/80 drop-shadow-sm">Blueprints</div>
              </CardContent>
            </Card>
            <Card className="glass border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                 <div className="text-2xl font-bold text-white drop-shadow-sm">{components?.strategies?.length || 0}</div>
                 <div className="text-sm text-white/80 drop-shadow-sm">Strategies</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          {components?.prompts?.map((prompt: any, index: number) => (
            <Card key={index} className="glass border-white/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      {prompt.title}
                    </CardTitle>
                    {prompt.description && (
                      <CardDescription>{prompt.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(prompt.difficulty)}>
                      {prompt.difficulty || 'Standard'}
                    </Badge>
                    {(prompt.estimatedTime || prompt.estimated_time) && (
                      <Badge variant="outline" className="text-blue-300 border-blue-300/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {prompt.estimatedTime || prompt.estimated_time}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                   <h5 className="font-medium mb-2 text-white drop-shadow-sm">Prompt:</h5>
                   <p className="text-sm text-white/90 drop-shadow-sm font-mono whitespace-pre-wrap">
                     {prompt.promptText || prompt.prompt_text}
                   </p>
                </div>
                
                {(prompt.aiTools || prompt.ai_tools) && (
                  <div>
                    <h5 className="font-medium mb-2 text-white drop-shadow-sm">Recommended AI Tools:</h5>
                    <div className="flex flex-wrap gap-2">
                      {(prompt.aiTools || prompt.ai_tools).map((tool: string, toolIndex: number) => (
                        <Badge key={toolIndex} variant="outline" className="text-primary border-primary/30">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {prompt.instructions && (
                  <div>
                     <h5 className="font-medium mb-2 text-white drop-shadow-sm">Instructions:</h5>
                     <p className="text-sm text-white/90 drop-shadow-sm">{prompt.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          {components?.workflows?.map((workflow: any, index: number) => (
            <Card key={index} className="glass border-white/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5 text-blue-400" />
                      {workflow.title}
                    </CardTitle>
                    {workflow.description && (
                      <CardDescription>{workflow.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(workflow.complexityLevel || workflow.complexity_level)}>
                      {workflow.complexityLevel || workflow.complexity_level || 'Standard'}
                    </Badge>
                    {(workflow.durationEstimate || workflow.duration_estimate) && (
                      <Badge variant="outline" className="text-blue-300 border-blue-300/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {workflow.durationEstimate || workflow.duration_estimate}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(workflow.workflowSteps || workflow.workflow_steps) && (
                  <div>
                    <h5 className="font-medium mb-3 text-white drop-shadow-sm">Workflow Steps:</h5>
                    <div className="space-y-3">
                      {(workflow.workflowSteps || workflow.workflow_steps).map((step: any, stepIndex: number) => (
                        <div key={stepIndex} className="flex gap-3 p-3 glass rounded-lg border border-white/10">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                            {step.stepNumber || step.step || stepIndex + 1}
                          </div>
                           <div className="flex-1 space-y-2">
                             <h6 className="font-medium text-white drop-shadow-sm">{step.title}</h6>
                             <p className="text-sm text-white/90 drop-shadow-sm">{step.description}</p>
                            {(step.aiTool || step.ai_tool) && (
                              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                {step.aiTool || step.ai_tool}
                              </Badge>
                            )}
                            {(step.estimatedTime || step.estimated_time) && (
                              <span className="text-xs text-white/70">⏱️ {step.estimatedTime || step.estimated_time}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(workflow.expectedOutcomes || workflow.expected_outcomes) && (
                  <div>
                    <h5 className="font-medium mb-2 text-white drop-shadow-sm">Expected Outcomes:</h5>
                    <ul className="space-y-1">
                      {(workflow.expectedOutcomes || workflow.expected_outcomes).map((outcome: string, outcomeIndex: number) => (
                        <li key={outcomeIndex} className="flex items-start gap-2 text-sm text-white/90 drop-shadow-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Blueprints Tab */}
        <TabsContent value="blueprints" className="space-y-4">
          {components?.blueprints?.map((blueprint: any, index: number) => (
            <Card key={index} className="glass border-white/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-400" />
                      {blueprint.title}
                    </CardTitle>
                    {blueprint.description && (
                      <CardDescription>{blueprint.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(blueprint.difficultyLevel || blueprint.difficulty_level)}>
                      {blueprint.difficultyLevel || blueprint.difficulty_level || 'Standard'}
                    </Badge>
                    {(blueprint.implementationTime || blueprint.implementation_time) && (
                      <Badge variant="outline" className="text-blue-300 border-blue-300/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {blueprint.implementationTime || blueprint.implementation_time}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(blueprint.blueprintContent || blueprint.blueprint_content) && (
                  <Collapsible 
                    open={expandedSections[`blueprint-${index}`]} 
                    onOpenChange={() => toggleSection(`blueprint-${index}`)}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                       <span className="font-medium text-white drop-shadow-sm">Blueprint Details</span>
                       {expandedSections[`blueprint-${index}`] ? (
                         <ChevronUp className="w-4 h-4 text-white/80" />
                       ) : (
                         <ChevronDown className="w-4 h-4 text-white/80" />
                       )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3">
                      {(blueprint.blueprintContent || blueprint.blueprint_content)?.phases && (
                        <div>
                          <h6 className="font-medium mb-2 text-white drop-shadow-sm">Implementation Phases:</h6>
                          <div className="space-y-3">
                            {(blueprint.blueprintContent || blueprint.blueprint_content).phases.map((phase: any, phaseIdx: number) => (
                              <div key={phaseIdx} className="p-3 bg-black/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    Phase {phase.phase}
                                  </Badge>
                                  <span className="text-sm font-medium text-white">{phase.name}</span>
                                  <span className="text-xs text-white/60">{phase.duration}</span>
                                </div>
                                {phase.objectives && phase.objectives.length > 0 && (
                                  <div className="mb-2">
                                    <span className="text-xs font-medium text-white/80">Objectives:</span>
                                    <ul className="mt-1 space-y-1">
                                      {phase.objectives.map((obj: string, idx: number) => (
                                        <li key={idx} className="text-xs text-white/90 flex items-start gap-1">
                                          <span className="text-green-400">•</span>
                                          {obj}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {phase.tasks && phase.tasks.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-white/80">Tasks:</span>
                                    <ul className="mt-1 space-y-1">
                                      {phase.tasks.map((task: string, idx: number) => (
                                        <li key={idx} className="text-xs text-white/80 flex items-start gap-1">
                                          <span className="text-blue-400">→</span>
                                          {task}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {(blueprint.resourcesNeeded || blueprint.resources_needed) && (
                  <div>
                    <h5 className="font-medium mb-2 text-white drop-shadow-sm">Resources Needed:</h5>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.resources_needed.map((resource: string, resourceIndex: number) => (
                        <Badge key={resourceIndex} variant="outline" className="text-orange-300 border-orange-300/30">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          {components?.strategies?.map((strategy: any, index: number) => (
            <Card key={index} className="glass border-white/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      {strategy.title}
                    </CardTitle>
                    {strategy.description && (
                      <CardDescription>{strategy.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(strategy.priority_level)}>
                      {strategy.priority_level || 'Medium'} Priority
                    </Badge>
                    {strategy.timeline && (
                      <Badge variant="outline" className="text-blue-300 border-blue-300/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {strategy.timeline}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategy.key_actions && (
                  <div>
                     <h5 className="font-medium mb-2 text-white drop-shadow-sm">Key Actions:</h5>
                     <ul className="space-y-1">
                       {strategy.key_actions.map((action: string, actionIndex: number) => (
                         <li key={actionIndex} className="flex items-start gap-2 text-sm text-white/90 drop-shadow-sm">
                          <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.success_metrics && (
                  <div>
                    <h5 className="font-medium mb-2 text-white drop-shadow-sm">Success Metrics:</h5>
                    <div className="flex flex-wrap gap-2">
                      {strategy.success_metrics.map((metric: string, metricIndex: number) => (
                        <Badge key={metricIndex} variant="outline" className="text-green-300 border-green-300/30">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.potential_challenges && (
                  <Collapsible 
                    open={expandedSections[`strategy-${index}`]} 
                    onOpenChange={() => toggleSection(`strategy-${index}`)}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                       <span className="font-medium text-white drop-shadow-sm">Challenges & Mitigation</span>
                       {expandedSections[`strategy-${index}`] ? (
                         <ChevronUp className="w-4 h-4 text-white/80" />
                       ) : (
                         <ChevronDown className="w-4 h-4 text-white/80" />
                       )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3">
                      <div>
                         <h6 className="font-medium mb-2 text-white drop-shadow-sm">Potential Challenges:</h6>
                         <ul className="space-y-1 text-sm text-white/90 drop-shadow-sm">
                          {strategy.potential_challenges.map((challenge: string, challengeIndex: number) => (
                            <li key={challengeIndex} className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">⚠</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {strategy.mitigation_strategies && (
                        <div>
                           <h6 className="font-medium mb-2 text-white drop-shadow-sm">Mitigation Strategies:</h6>
                           <ul className="space-y-1 text-sm text-white/90 drop-shadow-sm">
                            {strategy.mitigation_strategies.map((mitigation: string, mitigationIndex: number) => (
                              <li key={mitigationIndex} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                {mitigation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Full Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white drop-shadow-sm">
                <Clock className="w-5 h-5 text-white drop-shadow-sm" />
                Complete Strategic Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="prose prose-invert max-w-none">
                 <div className="whitespace-pre-wrap text-white/90 drop-shadow-sm leading-relaxed">
                   {fullContent}
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Footer */}
      {isAuthenticated && jumpId && (
        <div className="text-center p-4 glass rounded-xl border border-green-400/20">
          <p className="text-green-400 text-sm mb-2">✓ Your Jump has been saved to your dashboard</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 mx-auto"
          >
            View in Dashboard
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default JumpResultDisplay;