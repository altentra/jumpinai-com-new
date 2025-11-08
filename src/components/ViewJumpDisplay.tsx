import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench, AlertTriangle, Lightbulb, Target, Compass, TrendingUp, Shield, DollarSign, Heart, MapPin, Calendar, Play, Flag, LayoutDashboard, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { ToolPromptComboCard } from '@/components/dashboard/ToolPromptComboCard';
import JumpPlanDisplay from '@/components/dashboard/JumpPlanDisplay';
import { toast } from 'sonner';

interface ViewJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
}

const ViewJumpDisplay: React.FC<ViewJumpDisplayProps> = ({
  result, 
  generationTimer 
}) => {
  const navigate = useNavigate();
  const [copiedPrompts, setCopiedPrompts] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState('overview');

  const handleCopyPrompt = async (promptText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompts(prev => new Set([...prev, index]));
      toast.success("Prompt copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedPrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleToolPromptClick = (comboIndex: number, comboId: string) => {
    // Switch to the Tools & Prompts tab
    setActiveTab('toolPrompts');
    
    // Wait for tab to switch, then scroll to the combo
    setTimeout(() => {
      const element = document.getElementById(comboId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 3000);
      }
    }, 100);
  };

  const getStatusIcon = (stepName: string, hasContent: boolean) => {
    const currentStep = result.processing_status?.currentStep;
    const isComplete = result.processing_status?.isComplete;
    
    // Determine if this step is complete
    const stepOrder = ['naming', 'overview', 'plan', 'tool_prompts', 'complete'];
    const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;
    const thisStepIndex = stepOrder.indexOf(stepName);
    
    // If generation is complete, all steps get checkmark
    if (isComplete && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    // If current step is past this step and we have content, it's complete
    if (currentStepIndex > thisStepIndex && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    // If this is the current step, show spinning
    if (currentStep === stepName) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    // Otherwise, waiting
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Add null safety checks
  if (!result || !result.processing_status) {
    return (
      <div className="w-full space-y-6">
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Initializing generation system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4" style={{ overflow: 'visible' }}>
      {/* Content Tabs - Ultra Premium Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" style={{ overflow: 'visible', display: 'block' }}>
        <div className="relative mb-8">
          {/* Mobile: Equal width tabs */}
          <div className="sm:hidden pb-4">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1.5 p-2 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
              <TabsTrigger 
                value="overview" 
                className="relative flex flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold px-1.5 py-2.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('overview', !!result.full_content)}
                <span className="tracking-wide text-center">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="relative flex flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold px-1.5 py-2.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('plan', !!result.structured_plan)}
                <span className="tracking-wide text-center">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="toolPrompts" 
                className="relative flex flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold px-1.5 py-2.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-xl hover:scale-[1.02]"
              >
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
                <span className="tracking-wide text-center">Tools & Prompts</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout with premium effects */}
          <TabsList className="hidden sm:grid h-auto w-full grid-cols-3 gap-2 p-3 bg-gradient-to-r from-background/80 via-background/70 to-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
            <TabsTrigger 
              value="overview" 
              className="relative flex items-center justify-center gap-2.5 text-base font-semibold px-6 py-4
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-xl hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('overview', !!result.full_content)}
              </span>
              <span className="tracking-wide">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              className="relative flex items-center justify-center gap-2.5 text-base font-semibold px-6 py-4
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-xl hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('plan', !!result.structured_plan)}
              </span>
              <span className="tracking-wide">Plan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="toolPrompts" 
              className="relative flex items-center justify-center gap-2.5 text-base font-semibold px-6 py-4
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-xl hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
              </span>
              <span className="tracking-wide">Tools & Prompts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0" style={{ overflow: 'visible', maxHeight: 'none', height: 'auto', display: 'block' }}>
          {result.comprehensive_plan ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              {result.comprehensive_plan.executiveSummary && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere text-xs sm:text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formatAIText(result.comprehensive_plan.executiveSummary)}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Situation Analysis */}
              {result.comprehensive_plan.situationAnalysis && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Situation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.comprehensive_plan.situationAnalysis.currentState && (
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-2">Current State</h4>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.situationAnalysis.currentState)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {result.comprehensive_plan.situationAnalysis.challenges?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                            Key Challenges
                          </h4>
                          <ul className="space-y-2">
                            {result.comprehensive_plan.situationAnalysis.challenges.map((challenge: string, idx: number) => (
                              <li key={idx} className="text-xs sm:text-sm pl-4 border-l-2 border-destructive/30">
                                <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatAIText(challenge)}
                                  </ReactMarkdown>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.comprehensive_plan.situationAnalysis.opportunities?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            Opportunities
                          </h4>
                          <ul className="space-y-2">
                            {result.comprehensive_plan.situationAnalysis.opportunities.map((opp: string, idx: number) => (
                              <li key={idx} className="text-xs sm:text-sm pl-4 border-l-2 border-primary/30">
                                <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formatAIText(opp)}
                                  </ReactMarkdown>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strategic Vision */}
              {result.comprehensive_plan.strategicVision && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Strategic Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formatAIText(result.comprehensive_plan.strategicVision)}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Roadmap */}
              {result.comprehensive_plan.roadmap && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Immediate (0-30 days) */}
                    {result.comprehensive_plan.roadmap.immediate && (
                      <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-primary flex items-center gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            Immediate Actions
                          </h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30">0-30 days</Badge>
                        </div>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.roadmap.immediate)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {/* Short-term (30-90 days) */}
                    {result.comprehensive_plan.roadmap.shortTerm && (
                      <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                            Short-term Milestones
                          </h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">30-90 days</Badge>
                        </div>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.roadmap.shortTerm)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {/* Long-term (90+ days) */}
                    {result.comprehensive_plan.roadmap.longTerm && (
                      <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                            Long-term Goals
                          </h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">90+ days</Badge>
                        </div>
                        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {formatAIText(result.comprehensive_plan.roadmap.longTerm)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Key Objectives & Success Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {result.comprehensive_plan.keyObjectives?.length > 0 && (
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Key Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.comprehensive_plan.keyObjectives.map((obj: string, idx: number) => (
                          <li key={idx} className="text-xs sm:text-sm flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] sm:text-xs font-semibold text-primary">{idx + 1}</span>
                            </div>
                            <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none flex-1 text-xs sm:text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {formatAIText(obj)}
                              </ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {result.comprehensive_plan.successMetrics?.length > 0 && (
                  <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Success Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.comprehensive_plan.successMetrics.map((metric: string, idx: number) => (
                          <li key={idx} className="text-xs sm:text-sm flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none flex-1 text-xs sm:text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {formatAIText(metric)}
                              </ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Risk Assessment */}
              {result.comprehensive_plan.riskAssessment && (
                <Card className="glass backdrop-blur-xl border border-border/40 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.comprehensive_plan.riskAssessment.risks?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                          Potential Risks
                        </h4>
                        <ul className="space-y-2">
                          {result.comprehensive_plan.riskAssessment.risks.map((risk: string, idx: number) => (
                            <li key={idx} className="text-xs sm:text-sm pl-4 border-l-2 border-destructive/30">
                              <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {formatAIText(risk)}
                                </ReactMarkdown>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.comprehensive_plan.riskAssessment.mitigations?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          Mitigation Strategies
                        </h4>
                        <ul className="space-y-2">
                          {result.comprehensive_plan.riskAssessment.mitigations.map((mitigation: string, idx: number) => (
                            <li key={idx} className="text-xs sm:text-sm pl-4 border-l-2 border-primary/30">
                              <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {formatAIText(mitigation)}
                                </ReactMarkdown>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Generating strategic overview...
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan" className="mt-0" style={{ overflow: 'visible', maxHeight: 'none', height: 'auto', display: 'block' }}>
          {result.structured_plan && result.structured_plan.phases ? (
            <JumpPlanDisplay
              planContent={result.full_content || ''}
              structuredPlan={result.comprehensive_plan}
              onEdit={() => {
                toast.info('Edit feature coming soon!');
              }}
              onDownload={() => {
                toast.info('Download feature coming soon!');
              }}
              jumpId={result.jumpId || undefined}
              toolPromptIds={result.components?.toolPrompts?.map((tp: any) => tp?.id || null) || []}
              onToolPromptClick={handleToolPromptClick}
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Creating implementation plan...
            </div>
          )}
        </TabsContent>

        <TabsContent value="toolPrompts" className="mt-0" style={{ overflow: 'visible', maxHeight: 'none', height: 'auto', display: 'block' }}>
          <div className="grid gap-4">
            {result.components?.toolPrompts && result.components.toolPrompts.length > 0 ? (
              result.components.toolPrompts.map((combo: any, index: number) => (
                <div key={index} data-tool-combo={index + 1} className="animate-fade-in">
                  <ToolPromptComboCard
                    combo={combo}
                    index={index + 1}
                    onClick={() => {/* Detail modal will be added later */}}
                  />
                </div>
              ))
            ) : (
              <div className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl flex items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Generating tools & prompts...
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewJumpDisplay;