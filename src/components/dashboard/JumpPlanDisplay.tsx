import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { safeParseJSON } from '@/utils/safeJson';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JumpPlanDisplayProps {
  planContent: string;
  structuredPlan?: any; // Optional structured data for enhanced display
  onEdit: () => void;
  onDownload: () => void;
  jumpId?: string; // Jump ID for linking to tool/prompt combos
  toolPromptIds?: string[]; // Array of 9 tool/prompt IDs in order
}

// Helper function to check if structured plan matches comprehensive format
function isComprehensiveStructure(plan: any): boolean {
  return plan && 
    typeof plan === 'object' && 
    plan.overview && 
    plan.analysis && 
    plan.action_plan && 
    Array.isArray(plan.action_plan?.phases);
}

// Build a default comprehensive plan template
function buildDefaultPlan(title: string = 'Your Jump Plan') {
  return {
    title,
    executiveSummary: '',
    situationAnalysis: {
      currentState: '',
      challenges: [] as string[],
      opportunities: [] as string[]
    },
    strategicVision: '',
    roadmap: {
      immediate: '',
      shortTerm: '',
      longTerm: ''
    },
    successFactors: [] as string[],
    riskMitigation: [] as string[],
    action_plan: {
      phases: [1,2,3].map((n) => ({
        phase_number: n,
        title: `Phase ${n}`,
        description: '',
        duration: '',
        steps: [] as any[]
      }))
    },
    tools_prompts: {
      recommended_ai_tools: [] as any[],
      custom_prompts: [] as any[],
      templates: [] as any[]
    },
    workflows_strategies: {
      workflows: [] as any[],
      strategies: [] as any[]
    },
    metrics_tracking: {
      kpis: [] as any[],
      tracking_methods: [] as any[],
      reporting_schedule: { daily: [] as string[], weekly: [] as string[], monthly: [] as string[], quarterly: [] as string[] },
      success_criteria: [] as any[]
    },
    investment: {
      time_investment: { total_hours: '', weekly_commitment: '', phase_breakdown: [] as any[] },
      financial_investment: { total_budget: '', categories: [] as any[] },
      roi_projection: { timeframe: '', expected_roi: '', break_even_point: '' }
    }
  };
}

// Normalize any partial/legacy plan into the comprehensive structure
function normalizeToComprehensive(input: any): any {
  const source = input && typeof input === 'string' ? safeParseJSON(input) : input;
  const base = buildDefaultPlan(source?.title || 'Your Jump Plan');

  if (!source || typeof source !== 'object') return base;

  // Map XAI response format to ComprehensiveJump format
  // XAI uses: executiveSummary, situationAnalysis, strategicVision, roadmap, successFactors, riskMitigation
  
  // Direct executiveSummary mapping
  if (typeof source.executiveSummary === 'string') {
    base.executiveSummary = source.executiveSummary;
  }
  
  // situationAnalysis mapping
  if (source.situationAnalysis && typeof source.situationAnalysis === 'object') {
    base.situationAnalysis = {
      currentState: source.situationAnalysis.currentState || '',
      challenges: Array.isArray(source.situationAnalysis.challenges) ? source.situationAnalysis.challenges : [],
      opportunities: Array.isArray(source.situationAnalysis.opportunities) ? source.situationAnalysis.opportunities : []
    };
  }
  
  // strategicVision mapping
  if (typeof source.strategicVision === 'string') {
    base.strategicVision = source.strategicVision;
  }
  
  // roadmap mapping (XAI uses: immediate, shortTerm, longTerm)
  if (source.roadmap && typeof source.roadmap === 'object') {
    base.roadmap = {
      immediate: source.roadmap.immediate || '',
      shortTerm: source.roadmap.shortTerm || '',
      longTerm: source.roadmap.longTerm || ''
    };
  }
  
  // successFactors mapping
  if (Array.isArray(source.successFactors)) {
    base.successFactors = source.successFactors;
  }
  
  // riskMitigation mapping
  if (Array.isArray(source.riskMitigation)) {
    base.riskMitigation = source.riskMitigation;
  }

  // Phases (accept either root phases[] or action_plan.phases[])
  const phases = Array.isArray(source?.action_plan?.phases) ? source.action_plan.phases : (Array.isArray(source?.phases) ? source.phases : []);
  if (Array.isArray(phases) && phases.length) {
    base.action_plan.phases = phases.map((p: any, idx: number) => ({
      phase_number: typeof p.phase_number === 'number' ? p.phase_number : (idx + 1),
      title: p.title || `Phase ${idx + 1}`,
      description: p.description || '',
      duration: p.duration || p.timeline || '',
      steps: Array.isArray(p.steps) ? p.steps : []
    }));
  }

  // Tools & Prompts
  const tp = source.tools_prompts || {};
  if (Array.isArray(tp.recommended_ai_tools)) base.tools_prompts.recommended_ai_tools = tp.recommended_ai_tools;
  if (Array.isArray(tp.custom_prompts)) base.tools_prompts.custom_prompts = tp.custom_prompts;
  if (Array.isArray(tp.templates)) base.tools_prompts.templates = tp.templates;

  // Workflows & Strategies
  const ws = source.workflows_strategies || {};
  if (Array.isArray(ws.workflows)) base.workflows_strategies.workflows = ws.workflows;
  if (Array.isArray(ws.strategies)) base.workflows_strategies.strategies = ws.strategies;

  // Metrics tracking
  const mt = source.metrics_tracking || {};
  if (Array.isArray(mt.kpis)) base.metrics_tracking.kpis = mt.kpis;
  if (Array.isArray(mt.tracking_methods)) base.metrics_tracking.tracking_methods = mt.tracking_methods;
  if (mt.reporting_schedule && typeof mt.reporting_schedule === 'object') base.metrics_tracking.reporting_schedule = {
    daily: Array.isArray(mt.reporting_schedule.daily) ? mt.reporting_schedule.daily : [],
    weekly: Array.isArray(mt.reporting_schedule.weekly) ? mt.reporting_schedule.weekly : [],
    monthly: Array.isArray(mt.reporting_schedule.monthly) ? mt.reporting_schedule.monthly : [],
    quarterly: Array.isArray(mt.reporting_schedule.quarterly) ? mt.reporting_schedule.quarterly : []
  };
  if (Array.isArray(mt.success_criteria)) base.metrics_tracking.success_criteria = mt.success_criteria;

  // Investment
  const inv = source.investment || {};
  if (inv.time_investment && typeof inv.time_investment === 'object') base.investment.time_investment = {
    total_hours: inv.time_investment.total_hours || '',
    weekly_commitment: inv.time_investment.weekly_commitment || '',
    phase_breakdown: Array.isArray(inv.time_investment.phase_breakdown) ? inv.time_investment.phase_breakdown : []
  };
  if (inv.financial_investment && typeof inv.financial_investment === 'object') base.investment.financial_investment = {
    total_budget: inv.financial_investment.total_budget || '',
    categories: Array.isArray(inv.financial_investment.categories) ? inv.financial_investment.categories : []
  };
  if (inv.roi_projection && typeof inv.roi_projection === 'object') base.investment.roi_projection = {
    timeframe: inv.roi_projection.timeframe || '',
    expected_roi: inv.roi_projection.expected_roi || '',
    break_even_point: inv.roi_projection.break_even_point || ''
  };

  return base;
}

export default function JumpPlanDisplay({ planContent, structuredPlan, onEdit, onDownload, jumpId, toolPromptIds }: JumpPlanDisplayProps) {
  if (!planContent.trim() && !structuredPlan) {
    return null;
  }

  const candidate = React.useMemo(() => {
    const parsedStructured = typeof structuredPlan === 'string' ? safeParseJSON(structuredPlan) : structuredPlan;
    return parsedStructured || safeParseJSON(planContent);
  }, [structuredPlan, planContent]);
  
  const comprehensivePlan = React.useMemo(() => candidate ? normalizeToComprehensive(candidate) : null, [candidate]);
  
  const finalPlan = React.useMemo(() => {
    if (comprehensivePlan) return comprehensivePlan;
    return buildDefaultPlan();
  }, [comprehensivePlan]);

  const phases = finalPlan?.action_plan?.phases || [];
  const navigate = useNavigate();

  // Helper function to get the tool/prompt combo index for a given phase and step
  const getToolPromptComboIndex = (phaseIndex: number, stepIndex: number): number | null => {
    // First 3 steps of each phase map to tool/prompt combos
    if (stepIndex >= 3) return null; // Only first 3 steps per phase
    
    // Calculate the combo index (0-8) based on phase and step
    const comboIndex = phaseIndex * 3 + stepIndex;
    return comboIndex < 9 ? comboIndex : null; // We only have 9 combos
  };

  const handleToolPromptClick = (comboIndex: number) => {
    if (!jumpId || !toolPromptIds || comboIndex >= toolPromptIds.length) {
      console.warn('Missing jumpId or toolPromptIds for navigation');
      return;
    }
    
    const comboId = toolPromptIds[comboIndex];
    
    // Check if the ID is valid (not null, undefined, or the string 'null')
    if (!comboId || comboId === 'null' || comboId === null) {
      console.warn('Tool prompt ID not available yet for combo index:', comboIndex);
      return;
    }
    
    // Navigate to tools & prompts tab with the specific combo ID as a hash
    navigate(`/dashboard/tools-prompts#${comboId}`);
    
    // After navigation, scroll to and highlight the element
    setTimeout(() => {
      const element = document.getElementById(comboId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 3000);
      }
    }, 100);
  };

  return (
    <div className="w-full space-y-8">
      {phases.map((phase: any, phaseIndex: number) => (
        <Card key={phaseIndex} className="overflow-hidden border-primary/20 bg-gradient-to-br from-card/95 to-primary/5 shadow-xl rounded-3xl backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex flex-col items-center justify-center shadow-lg border-2 border-gray-400 dark:border-gray-500">
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Phase</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none mt-0.5">
                    {phase.phase_number || phaseIndex + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  <ReactMarkdown className="prose max-w-none [&>p]:m-0 [&_strong]:font-bold">
                    {phase.title || `Phase ${phaseIndex + 1}`}
                  </ReactMarkdown>
                </CardTitle>
                {phase.description && (
                  <div className="text-muted-foreground leading-relaxed">
                    <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic">
                      {phase.description}
                    </ReactMarkdown>
                  </div>
                )}
                {phase.duration && (
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 rounded-full">
                      <ReactMarkdown className="inline [&>p]:inline [&>p]:m-0 [&_strong]:font-bold">
                        {`Duration: ${phase.duration}`}
                      </ReactMarkdown>
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.isArray(phase.steps) && phase.steps.length > 0 ? (
                phase.steps.map((step: any, stepIndex: number) => (
                  <Card key={stepIndex} className="group overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/20 hover:-translate-y-1 rounded-[24px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 via-primary/30 to-primary/20 flex flex-col items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                            <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider">Step</span>
                            <span className="text-xl font-bold text-primary leading-none">
                              {stepIndex + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                            <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold [&_strong]:text-primary">
                              {step.title || step.action || `Step ${stepIndex + 1}`}
                            </ReactMarkdown>
                          </CardTitle>
                          {step.brief_description && (
                            <div className="text-sm text-muted-foreground/90 font-medium">
                              <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold">
                                {step.brief_description}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="text-sm text-muted-foreground leading-relaxed ml-[72px]">
                        <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-foreground/90 [&_em]:italic">
                          {step.description || step.details || 'No description available'}
                        </ReactMarkdown>
                      </div>
                      {step.tools_prompts && Array.isArray(step.tools_prompts) && step.tools_prompts.length > 0 && (
                        <div className="mt-4 ml-[72px] space-y-2">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Recommended Tools:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.tools_prompts.map((tool: string, toolIndex: number) => (
                              <Badge key={toolIndex} variant="outline" className="text-xs border-primary/30 bg-primary/10">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Tools & Prompts Combo Section - Only for first 3 steps of each phase */}
                      {(() => {
                        const comboIndex = getToolPromptComboIndex(phaseIndex, stepIndex);
                        if (comboIndex === null) return null;
                        
                        // Get the actual tool prompt ID (check if it exists and is not null)
                        const toolPromptId = toolPromptIds?.[comboIndex];
                        const hasValidToolPromptId = toolPromptId && toolPromptId !== 'null' && toolPromptId !== null;
                        
                        return (
                          <div className="mt-4 ml-[72px]">
                            <div className={`p-4 rounded-xl border-2 ${hasValidToolPromptId ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5' : 'border-muted-foreground/20 bg-muted/20'} backdrop-blur-sm animate-fade-in`}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-start gap-2 flex-1">
                                  <Sparkles className={`w-4 h-4 mt-1 shrink-0 ${hasValidToolPromptId ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <div className="space-y-1">
                                    <p className={`text-xs font-bold uppercase tracking-wide ${hasValidToolPromptId ? 'text-primary' : 'text-muted-foreground'}`}>
                                      Tools & Prompts for this Step
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {hasValidToolPromptId 
                                        ? "We've created a custom AI tool & ready-to-use prompt specifically for this step"
                                        : "Custom tool & prompt combo will be available once generation completes"
                                      }
                                    </p>
                                  </div>
                                </div>
                                {hasValidToolPromptId ? (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToolPromptClick(comboIndex);
                                    }}
                                    className="shrink-0 gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                                  >
                                    View Combo #{comboIndex + 1}
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="shrink-0 text-xs border-muted-foreground/30 text-muted-foreground">
                                    Combo #{comboIndex + 1}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No steps defined for this phase</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
