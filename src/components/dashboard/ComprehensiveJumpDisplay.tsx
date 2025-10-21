import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Workflow,
  BarChart3,
  BookOpen,
  Users,
  Zap,
  Star,
  Play,
  Download,
  Rocket
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComprehensiveJump {
  title: string;
  executive_summary: string;
  overview: {
    vision_statement: string;
    transformation_scope: string;
    expected_outcomes: string[];
    timeline_overview: string;
  };
  analysis: {
    current_state: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    gap_analysis: string[];
    readiness_assessment: {
      score: number;
      factors: Array<{ factor: string; level: string; description: string; }>;
    };
    market_context: string;
  };
  action_plan: {
    phases: Array<{
      phase_number: number;
      title: string;
      description: string;
      duration: string;
      objectives: string[];
      key_actions: Array<{
        action: string;
        description: string;
        priority: string;
        effort_level: string;
        dependencies: string[];
      }>;
      milestones: Array<{
        milestone: string;
        target_date: string;
        success_criteria: string[];
      }>;
      deliverables: string[];
      risks: Array<{
        risk: string;
        impact: string;
        probability: string;
        mitigation: string;
      }>;
    }>;
  };
  tools_prompts: {
    recommended_ai_tools: Array<{
      tool: string;
      category: string;
      use_case: string;
      learning_curve: string;
      cost_estimate: string;
      integration_priority: string;
    }>;
    custom_prompts: Array<{
      title: string;
      purpose: string;
      prompt: string;
      ai_tool: string;
      expected_output: string;
    }>;
    templates: Array<{
      name: string;
      type: string;
      description: string;
      use_case: string;
    }>;
  };
  workflows_strategies: {
    workflows: Array<{
      title: string;
      description: string;
      trigger: string;
      steps: Array<{
        step: string;
        description: string;
        tools_used: string[];
        estimated_time: string;
      }>;
      automation_level: string;
      frequency: string;
    }>;
    strategies: Array<{
      strategy: string;
      description: string;
      success_factors: string[];
      implementation_tips: string[];
      monitoring_approach: string;
    }>;
  };
  metrics_tracking: {
    kpis: Array<{
      metric: string;
      description: string;
      target: string;
      measurement_frequency: string;
      data_source: string;
    }>;
    tracking_methods: Array<{
      method: string;
      tools: string[];
      setup_complexity: string;
      cost: string;
    }>;
    reporting_schedule: {
      daily: string[];
      weekly: string[];
      monthly: string[];
      quarterly: string[];
    };
    success_criteria: Array<{
      timeframe: string;
      criteria: string[];
    }>;
  };
  investment: {
    time_investment: {
      total_hours: string;
      weekly_commitment: string;
      phase_breakdown: Array<{ phase: string; hours: string; }>;
    };
    financial_investment: {
      total_budget: string;
      categories: Array<{ category: string; amount: string; description: string; }>;
    };
    roi_projection: {
      timeframe: string;
      expected_roi: string;
      break_even_point: string;
    };
  };
}

interface ComprehensiveJumpDisplayProps {
  jump: ComprehensiveJump;
  onEdit?: () => void;
  onDownload?: () => void;
  className?: string;
}

export default function ComprehensiveJumpDisplay({ jump, onEdit, onDownload, className }: ComprehensiveJumpDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const TabCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <Card className={`border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5 rounded-3xl overflow-hidden ${className}`}>
      <CardContent className="p-8 space-y-8">
        {children}
      </CardContent>
    </Card>
  );

  const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; description?: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl text-primary shadow-lg backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
    </div>
  );

  const renderOverview = () => (
    <TabCard>
      <div className="space-y-8">
        {/* Executive Summary */}
        <div>
          <SectionHeader 
            icon={<Star className="h-5 w-5" />} 
            title="Executive Summary"
            description="Your transformation journey at a glance"
          />
          <p className="text-xs sm:text-sm text-foreground leading-relaxed">{jump.executive_summary}</p>
        </div>

        <Separator />

        {/* Vision Statement */}
        <div>
          <SectionHeader 
            icon={<Target className="h-5 w-5" />} 
            title="Vision Statement"
          />
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <p className="text-foreground font-medium">{jump.overview.vision_statement}</p>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Transformation Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{jump.overview.transformation_scope}</p>
            </CardContent>
          </Card>

          <Card className="border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{jump.overview.timeline_overview}</p>
            </CardContent>
          </Card>
        </div>

        {/* Expected Outcomes */}
        <div>
          <SectionHeader 
            icon={<CheckCircle2 className="h-5 w-5" />} 
            title="Expected Outcomes"
          />
          <div className="grid gap-3">
            {jump.overview.expected_outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-foreground">{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabCard>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* SWOT Analysis */}
      <TabCard>
        <SectionHeader 
          icon={<BarChart3 className="h-5 w-5" />} 
          title="SWOT Analysis"
          description="Understanding your current position"
        />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {jump.analysis.current_state.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300">• {strength}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Opportunities</h4>
              <ul className="space-y-1">
                {jump.analysis.current_state.opportunities.map((opportunity, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-300">• {opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Weaknesses</h4>
              <ul className="space-y-1">
                {jump.analysis.current_state.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">• {weakness}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <h4 className="font-medium text-orange-800 dark:text-orange-400 mb-2">Threats</h4>
              <ul className="space-y-1">
                {jump.analysis.current_state.threats.map((threat, index) => (
                  <li key={index} className="text-sm text-orange-700 dark:text-orange-300">• {threat}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </TabCard>

      {/* Readiness Assessment */}
      <TabCard>
        <SectionHeader 
          icon={<CheckCircle2 className="h-5 w-5" />} 
          title="Readiness Assessment"
        />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">{jump.analysis.readiness_assessment.score}/10</div>
            <Progress value={jump.analysis.readiness_assessment.score * 10} className="flex-1" />
          </div>
          <div className="grid gap-4">
            {jump.analysis.readiness_assessment.factors.map((factor, index) => (
              <Card key={index} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-foreground">{factor.factor}</h5>
                    <Badge variant={factor.level === 'High' ? 'default' : factor.level === 'Medium' ? 'secondary' : 'outline'}>
                      {factor.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabCard>
    </div>
  );

  const renderActionPlan = () => {
    // Safety check for phases data
    if (!jump.action_plan?.phases || !Array.isArray(jump.action_plan.phases) || jump.action_plan.phases.length === 0) {
      return (
        <TabCard>
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Action Plan Available</h3>
            <p className="text-muted-foreground">The action plan is being generated. Please refresh or check back soon.</p>
          </div>
        </TabCard>
      );
    }

    return (
      <div className="space-y-8">
        {/* Executive Summary Bar */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Your Transformation Roadmap</h3>
          </div>
          <p className="text-muted-foreground">
            This comprehensive action plan breaks down your transformation into {jump.action_plan.phases.length} strategic phases. 
            Each phase builds on the previous one, with clear objectives, actionable steps, and measurable milestones.
          </p>
        </div>

        {jump.action_plan.phases.map((phase, index) => (
        <TabCard key={index}>
          <div className="space-y-6">
            {/* Enhanced Phase Header */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-xl font-bold text-xl drop-shadow-lg border-2 border-primary/30 flex-shrink-0">
                {phase.phase_number}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">{phase.title}</h3>
                <div className="text-foreground/90 leading-relaxed mb-3">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="inline" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />
                    }}
                  >
                    {phase.description}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <span className="text-sm text-muted-foreground" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />
                    }}
                  >
                    {phase.duration}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <Separator className="border-border/50" />

            {/* Objectives Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-lg p-5 border border-blue-200/50 dark:border-blue-800/30">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Phase Objectives
              </h4>
              <div className="grid gap-3">
                {phase.objectives.map((objective, objIndex) => (
                  <div key={objIndex} className="flex items-start gap-3 bg-white/50 dark:bg-background/30 rounded-md p-3 border border-blue-200/30 dark:border-blue-800/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-foreground/90 flex-1 leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <span {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />
                        }}
                      >
                        {objective}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Actions Section */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                <Play className="h-5 w-5 text-primary" />
                Action Steps
              </h4>
              <div className="space-y-4">
                {phase.key_actions.map((action, actionIndex) => (
                  <Card key={actionIndex} className="border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold text-sm flex-shrink-0 border border-primary/20">
                            {actionIndex + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground text-base mb-2 leading-snug">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({node, ...props}) => <span {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />
                                }}
                              >
                                {action.action}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge 
                            variant={action.priority === 'High' ? 'destructive' : action.priority === 'Medium' ? 'default' : 'secondary'} 
                            className="text-xs whitespace-nowrap"
                          >
                            {action.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {action.effort_level}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed pl-11">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="inline" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />
                          }}
                        >
                          {action.description}
                        </ReactMarkdown>
                      </div>
                      {action.dependencies && action.dependencies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 pl-11">
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground">Dependencies:</span> 
                            <span>{action.dependencies.join(' • ')}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Milestones Section */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg p-5 border border-amber-200/50 dark:border-amber-800/30">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Key Milestones
              </h4>
              <div className="space-y-4">
                {phase.milestones.map((milestone, milestoneIndex) => (
                  <Card key={milestoneIndex} className="border-amber-200/50 dark:border-amber-800/30 bg-white/60 dark:bg-background/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="font-semibold text-foreground flex-1 leading-snug">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <span {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-amber-700 dark:text-amber-400" {...props} />
                            }}
                          >
                            {milestone.milestone}
                          </ReactMarkdown>
                        </div>
                        <Badge variant="outline" className="text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 flex-shrink-0 whitespace-nowrap">
                          {milestone.target_date}
                        </Badge>
                      </div>
                      <div className="space-y-2 mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-800/30">
                        <div className="text-xs font-medium text-foreground mb-2">Success Criteria:</div>
                        {milestone.success_criteria.map((criteria, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 leading-relaxed">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({node, ...props}) => <span {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />
                                }}
                              >
                                {criteria}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabCard>
      ))}
      </div>
    );
  };

  const renderToolsPrompts = () => (
    <div className="space-y-6">
      {/* AI Tools */}
      <TabCard>
        <SectionHeader 
          icon={<Zap className="h-5 w-5" />} 
          title="Recommended AI Tools"
          description="Essential AI tools for your transformation journey"
        />
        {jump.tools_prompts.recommended_ai_tools.length > 0 ? (
          <div className="grid gap-4">
            {jump.tools_prompts.recommended_ai_tools.map((tool, index) => (
              <Card key={index} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{tool.tool}</h5>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                      <Badge variant={tool.integration_priority === 'High' ? 'destructive' : tool.integration_priority === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                        {tool.integration_priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tool.use_case}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span><strong>Learning:</strong> {tool.learning_curve}</span>
                    <span><strong>Cost:</strong> {tool.cost_estimate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Popular AI Tools */}
            {[
              { name: "ChatGPT", category: "General AI", url: "https://chat.openai.com", description: "Conversational AI for ideation, writing, and problem-solving" },
              { name: "Claude", category: "AI Assistant", url: "https://claude.ai", description: "Advanced AI for analysis, writing, and complex reasoning" },
              { name: "Midjourney", category: "Image Generation", url: "https://midjourney.com", description: "AI-powered image creation and visual content" },
              { name: "Notion AI", category: "Productivity", url: "https://notion.so", description: "AI-enhanced note-taking and knowledge management" },
              { name: "Perplexity", category: "Research", url: "https://perplexity.ai", description: "AI-powered search and research assistant" },
              { name: "GitHub Copilot", category: "Development", url: "https://github.com/features/copilot", description: "AI pair programmer for code generation" }
            ].map((tool, index) => (
              <Card key={index} className="border-border/30 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{tool.name}</h5>
                    <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    Visit {tool.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabCard>

      {/* Custom Prompts */}
      <TabCard>
        <SectionHeader 
          icon={<BookOpen className="h-5 w-5" />} 
          title="Custom Prompts"
          description="Ready-to-use prompts for your specific needs"
        />
        <div className="space-y-4">
          {jump.tools_prompts.custom_prompts.map((prompt, index) => (
            <Card key={index} className="border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-foreground">{prompt.title}</h5>
                  <Badge variant="outline" className="text-xs">{prompt.ai_tool}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{prompt.purpose}</p>
                <div className="bg-muted/30 p-3 rounded-lg mb-3">
                  <p className="text-sm font-mono text-foreground">{prompt.prompt}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Expected Output:</strong> {prompt.expected_output}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabCard>
    </div>
  );

  const renderWorkflowsStrategies = () => (
    <div className="space-y-6">
      {/* Quick Access to Resources */}
      <TabCard>
        <SectionHeader 
          icon={<BookOpen className="h-5 w-5" />} 
          title="Your Resource Library"
          description="Access all your generated prompts, workflows, and strategies"
        />
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/prompts'}>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
              <h5 className="font-medium text-foreground mb-2">My Prompts</h5>
              <p className="text-sm text-muted-foreground mb-4">Access your custom AI prompts</p>
              <Button variant="outline" size="sm" className="w-full">
                View Prompts
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/workflows'}>
            <CardContent className="p-6 text-center">
              <Workflow className="h-8 w-8 text-primary mx-auto mb-3" />
              <h5 className="font-medium text-foreground mb-2">My Workflows</h5>
              <p className="text-sm text-muted-foreground mb-4">View your process workflows</p>
              <Button variant="outline" size="sm" className="w-full">
                View Workflows
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-border/30 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/strategies'}>
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-8 w-8 text-primary mx-auto mb-3" />
              <h5 className="font-medium text-foreground mb-2">My Strategies</h5>
              <p className="text-sm text-muted-foreground mb-4">Explore strategic approaches</p>
              <Button variant="outline" size="sm" className="w-full">
                View Strategies
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabCard>

      {/* Workflows */}
      {jump.workflows_strategies.workflows.length > 0 && (
        <TabCard>
          <SectionHeader 
            icon={<Workflow className="h-5 w-5" />} 
            title="Workflows"
            description="Step-by-step processes for consistent execution"
          />
          <div className="space-y-4">
            {jump.workflows_strategies.workflows.map((workflow, index) => (
              <Card key={index} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{workflow.title}</h5>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{workflow.automation_level}</Badge>
                      <Badge variant="secondary" className="text-xs">{workflow.frequency}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                  <div className="text-xs text-muted-foreground mb-3">
                    <strong>Trigger:</strong> {workflow.trigger}
                  </div>
                  <div className="space-y-2">
                    {workflow.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-3 p-2 bg-muted/20 rounded">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{step.step}</p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Tools: {step.tools_used.join(', ')}</span>
                            <span>Time: {step.estimated_time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabCard>
      )}

      {/* Strategies */}
      <TabCard>
        <SectionHeader 
          icon={<Lightbulb className="h-5 w-5" />} 
          title="Implementation Strategies"
          description="Strategic approaches for successful execution"
        />
        <div className="space-y-4">
          {jump.workflows_strategies.strategies.map((strategy, index) => (
            <Card key={index} className="border-border/30">
              <CardContent className="p-4">
                <h5 className="font-medium text-foreground mb-2">{strategy.strategy}</h5>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="text-sm font-medium text-foreground mb-2">Success Factors</h6>
                    <ul className="space-y-1">
                      {strategy.success_factors.map((factor, factorIndex) => (
                        <li key={factorIndex} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h6 className="text-sm font-medium text-foreground mb-2">Implementation Tips</h6>
                    <ul className="space-y-1">
                      {strategy.implementation_tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-muted/20 rounded">
                  <p className="text-xs text-muted-foreground">
                    <strong>Monitoring:</strong> {strategy.monitoring_approach}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabCard>
    </div>
  );

  const renderMetricsTracking = () => (
    <div className="space-y-6">
      {/* Progress Dashboard */}
      <TabCard>
        <SectionHeader 
          icon={<TrendingUp className="h-5 w-5" />} 
          title="Transformation Progress Dashboard"
          description="Track your AI journey and learning milestones"
        />
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="border-border/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <Progress value={0} className="mt-3" />
            </CardContent>
          </Card>
          
          <Card className="border-border/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <p className="text-sm text-muted-foreground">Skills Mastered</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0h</div>
              <p className="text-sm text-muted-foreground">Time Invested</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center p-8 bg-muted/20 rounded-lg">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">Progress Tracking Coming Soon</h4>
          <p className="text-muted-foreground mb-4">
            We're building advanced analytics to help you track your learning progress, 
            skill development, and transformation milestones with interactive charts and insights.
          </p>
          <Badge variant="secondary">Feature in Development</Badge>
        </div>
      </TabCard>

      {/* KPIs */}
      {jump.metrics_tracking.kpis.length > 0 && (
        <TabCard>
          <SectionHeader 
            icon={<BarChart3 className="h-5 w-5" />} 
            title="Key Performance Indicators"
            description="Metrics to measure your transformation success"
          />
          <div className="grid gap-4">
            {jump.metrics_tracking.kpis.map((kpi, index) => (
              <Card key={index} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{kpi.metric}</h5>
                    <Badge variant="outline" className="text-xs">{kpi.measurement_frequency}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{kpi.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span><strong>Target:</strong> {kpi.target}</span>
                    <span><strong>Source:</strong> {kpi.data_source}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabCard>
      )}

      {/* Reporting Schedule */}
      <TabCard>
        <SectionHeader 
          icon={<Clock className="h-5 w-5" />} 
          title="Reporting Schedule"
          description="When and what to track"
        />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <h6 className="font-medium text-green-800 dark:text-green-400 mb-2">Daily Tracking</h6>
              <ul className="space-y-1">
                {jump.metrics_tracking.reporting_schedule.daily.map((item, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300">• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <h6 className="font-medium text-orange-800 dark:text-orange-400 mb-2">Monthly Reviews</h6>
              <ul className="space-y-1">
                {jump.metrics_tracking.reporting_schedule.monthly.map((item, index) => (
                  <li key={index} className="text-sm text-orange-700 dark:text-orange-300">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <h6 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Weekly Reviews</h6>
              <ul className="space-y-1">
                {jump.metrics_tracking.reporting_schedule.weekly.map((item, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-300">• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <h6 className="font-medium text-purple-800 dark:text-purple-400 mb-2">Quarterly Assessments</h6>
              <ul className="space-y-1">
                {jump.metrics_tracking.reporting_schedule.quarterly.map((item, index) => (
                  <li key={index} className="text-sm text-purple-700 dark:text-purple-300">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </TabCard>

      {/* Success Criteria Timeline */}
      <TabCard>
        <SectionHeader 
          icon={<Target className="h-5 w-5" />} 
          title="Success Criteria Timeline"
          description="What success looks like at each stage"
        />
        <div className="space-y-4">
          {jump.metrics_tracking.success_criteria.map((criteria, index) => (
            <Card key={index} className="border-border/30">
              <CardContent className="p-4">
                <h6 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {criteria.timeframe}
                </h6>
                <div className="space-y-1">
                  {criteria.criteria.map((criterion, criterionIndex) => (
                    <div key={criterionIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {criterion}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabCard>
    </div>
  );

  const renderInvestment = () => (
    <div className="space-y-6">
      {/* Time Investment */}
      <TabCard>
        <SectionHeader 
          icon={<Clock className="h-5 w-5" />} 
          title="Time Investment"
          description="Time commitment breakdown for your transformation"
        />
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{jump.investment.time_investment.total_hours}</div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{jump.investment.time_investment.weekly_commitment}</div>
              <p className="text-sm text-muted-foreground">Weekly Commitment</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/30">
            <CardContent className="p-4">
              <h6 className="font-medium text-foreground mb-2">Phase Breakdown</h6>
              <div className="space-y-1">
                {jump.investment.time_investment.phase_breakdown.map((phase, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{phase.phase}:</span>
                    <span className="text-foreground font-medium">{phase.hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabCard>

      {/* Financial Investment */}
      <TabCard>
        <SectionHeader 
          icon={<DollarSign className="h-5 w-5" />} 
          title="Financial Investment"
          description="Budget requirements and cost breakdown"
        />
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{jump.investment.financial_investment.total_budget}</div>
              <p className="text-sm text-muted-foreground">Total Budget Required</p>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            {jump.investment.financial_investment.categories.map((category, index) => (
              <Card key={index} className="border-border/30">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h6 className="font-medium text-foreground text-sm">{category.category}</h6>
                    <span className="text-sm font-bold text-primary">{category.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabCard>

      {/* ROI Projection */}
      <TabCard>
        <SectionHeader 
          icon={<TrendingUp className="h-5 w-5" />} 
          title="ROI Projection"
          description="Expected return on your investment"
        />
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{jump.investment.roi_projection.expected_roi}</div>
              <p className="text-sm text-muted-foreground">Expected ROI</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{jump.investment.roi_projection.break_even_point}</div>
              <p className="text-sm text-muted-foreground">Break-even Point</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{jump.investment.roi_projection.timeframe}</div>
              <p className="text-sm text-muted-foreground">Timeframe</p>
            </CardContent>
          </Card>
        </div>
      </TabCard>
    </div>
  );

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 sm:px-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 sm:mb-8 pt-4 sm:pt-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="w-full max-w-full overflow-hidden">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 break-words hyphens-auto leading-tight max-w-full">{jump.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words max-w-full overflow-wrap-anywhere">{jump.executive_summary}</p>
          </div>
          <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
            {onEdit && (
              <Button variant="outline" onClick={onEdit} size="sm" className="whitespace-nowrap text-xs px-2 py-1 h-7">
                Edit
              </Button>
            )}
            {onDownload && (
              <Button onClick={onDownload} size="sm" className="gap-1 whitespace-nowrap text-xs px-2 py-1 h-7">
                <Download className="h-3 w-3" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid w-full min-w-[600px] grid-cols-6 mb-8 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-primary/20 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 px-2 py-2 h-10">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium truncate">Overview</span>
              <span className="sm:hidden font-medium">Over</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 px-2 py-2 h-10">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium truncate">Analysis</span>
              <span className="sm:hidden font-medium">Ana</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 px-2 py-2 h-10">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium truncate">Action Plan</span>
              <span className="sm:hidden font-medium">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 px-2 py-2 h-10">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium truncate">Tools</span>
              <span className="sm:hidden font-medium">Tool</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 px-2 py-2 h-10">
              <Workflow className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium truncate">Workflows</span>
              <span className="sm:hidden font-medium">Work</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 px-2 py-2 h-10">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium truncate">Metrics</span>
              <span className="sm:hidden font-medium">Met</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-0">
          {renderAnalysis()}
        </TabsContent>
        
        <TabsContent value="plan" className="mt-0">
          {renderActionPlan()}
        </TabsContent>
        
        <TabsContent value="tools" className="mt-0">
          {renderToolsPrompts()}
        </TabsContent>
        
        <TabsContent value="workflows" className="mt-0">
          {renderWorkflowsStrategies()}
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-0">
          {renderMetricsTracking()}
        </TabsContent>
      </Tabs>
    </div>
  );
}