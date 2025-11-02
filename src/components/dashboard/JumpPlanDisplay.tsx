import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { safeParseJSON } from '@/utils/safeJson';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JumpPlanDisplayProps {
  planContent: string;
  structuredPlan?: any; // Optional structured data for enhanced display
  onEdit: () => void;
  onDownload: () => void;
  jumpId?: string; // Jump ID for linking to tool/prompt combos
  toolPromptIds?: string[]; // Array of 9 tool/prompt IDs in order
  onToolPromptClick?: (comboIndex: number, comboId: string) => void; // Callback to switch tabs and scroll to combo
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

export default function JumpPlanDisplay({ planContent, structuredPlan, onEdit, onDownload, jumpId, toolPromptIds, onToolPromptClick }: JumpPlanDisplayProps) {
  const [hoveredStep, setHoveredStep] = React.useState<{ phaseIndex: number; stepIndex: number } | null>(null);
  
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
    if (!toolPromptIds || comboIndex >= toolPromptIds.length) {
      console.warn('Missing toolPromptIds or invalid index:', comboIndex);
      return;
    }
    
    const comboId = toolPromptIds[comboIndex];
    
    // Check if the ID is valid (not null, undefined, or the string 'null')
    if (!comboId || comboId === 'null' || comboId === null) {
      console.warn('Tool prompt ID not available yet for combo index:', comboIndex);
      return;
    }
    
    // Use the callback if provided (for switching tabs in the same module)
    if (onToolPromptClick) {
      onToolPromptClick(comboIndex, comboId);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 sm:space-y-8" style={{ overflow: 'visible' }}>
      {phases.map((phase: any, phaseIndex: number) => (
        <div key={phaseIndex} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/30">
                    <span className="text-[9px] sm:text-[10px] font-semibold text-primary uppercase tracking-wider">Phase</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary leading-none mt-0.5">
                      {phase.phase_number || phaseIndex + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                    <ReactMarkdown className="prose max-w-none break-words [&>p]:m-0 [&_strong]:font-bold">
                      {phase.title || `Phase ${phaseIndex + 1}`}
                    </ReactMarkdown>
                  </CardTitle>
                  {phase.description && (
                    <div className="text-muted-foreground leading-relaxed">
                      <ReactMarkdown className="prose prose-sm max-w-none break-words overflow-wrap-anywhere [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic">
                        {phase.description}
                      </ReactMarkdown>
                    </div>
                  )}
                  {phase.duration && (
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        <ReactMarkdown className="inline [&>p]:inline [&>p]:m-0 [&_strong]:font-bold">
                          {`Duration: ${phase.duration}`}
                        </ReactMarkdown>
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="space-y-3 sm:space-y-4">
                {Array.isArray(phase.steps) && phase.steps.length > 0 ? (
                  phase.steps.map((step: any, stepIndex: number) => {
                    const isHovered = hoveredStep?.phaseIndex === phaseIndex && hoveredStep?.stepIndex === stepIndex;
                    
                    return (
                      <div key={stepIndex} className="group">
                        <div 
                          className="bg-background/40 backdrop-blur-[2px] border border-primary/40 border-l-2 border-l-primary/50 hover:border-primary/70 hover:border-l-primary/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 hover:bg-background/60 transition-all duration-300 shadow-[0_2px_8px_rgba(var(--primary),0.15)] hover:shadow-[0_4px_16px_rgba(var(--primary),0.25)]"
                          onMouseEnter={() => setHoveredStep({ phaseIndex, stepIndex })}
                          onMouseLeave={() => setHoveredStep(null)}
                        >
                        <div className="flex items-start gap-3 sm:gap-4 mb-3">
                          <div className="flex-shrink-0 pt-0.5">
                            <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center border border-primary/40 shadow-sm">
                              <span className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                                Step {stepIndex + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className="text-base sm:text-lg font-bold mb-1.5 text-foreground leading-snug">
                              <ReactMarkdown className="prose prose-sm max-w-none break-words [&>p]:m-0 [&_strong]:font-bold">
                                {step.title || step.action || `Step ${stepIndex + 1}`}
                              </ReactMarkdown>
                            </h4>
                            {step.brief_description && (
                              <div className="text-sm text-muted-foreground/90 leading-relaxed">
                                <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold">
                                  {step.brief_description}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3 pl-0 sm:pl-13">
                          <div className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                            <ReactMarkdown className="prose prose-sm max-w-none break-words overflow-wrap-anywhere [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic">
                              {step.description || step.details || 'No description available'}
                            </ReactMarkdown>
                          </div>
                          {step.tools_prompts && Array.isArray(step.tools_prompts) && step.tools_prompts.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">Recommended Tools</p>
                              <div className="flex flex-wrap gap-1.5">
                                {step.tools_prompts.map((tool: string, toolIndex: number) => (
                                  <Badge key={toolIndex} variant="secondary" className="text-xs">
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
                              <div className={`p-3 rounded-md border ${hasValidToolPromptId ? 'bg-blue-500/5 border-blue-500/30' : 'bg-muted/30 border-border/50'}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-start gap-2 flex-1">
                                    <Sparkles className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${hasValidToolPromptId ? 'text-blue-400' : 'text-muted-foreground'}`} />
                                    <div>
                                      <p className={`text-xs font-medium mb-0.5 ${hasValidToolPromptId ? 'text-blue-400' : 'text-muted-foreground'}`}>
                                        Tools & Prompts for this Step
                                      </p>
                                      <p className="text-xs text-muted-foreground/80 leading-snug">
                                        {hasValidToolPromptId 
                                          ? "Custom AI tool & prompt ready for this step"
                                          : "Tool & prompt combo generating..."
                                        }
                                      </p>
                                    </div>
                                  </div>
                                   {hasValidToolPromptId ? (
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleToolPromptClick(comboIndex);
                                       }}
                                       className="relative px-6 py-2.5 text-sm font-semibold
                                         bg-background/60 hover:bg-background/80
                                         border border-primary/40 hover:border-primary/70
                                         text-primary
                                         shadow-sm hover:shadow-md shadow-primary/10 hover:shadow-primary/20
                                         transition-all duration-300 rounded-xl hover:scale-[1.05]
                                         backdrop-blur-sm flex items-center gap-2"
                                     >
                                       View
                                       <ArrowRight className="w-3.5 h-3.5" />
                                     </Button>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] shrink-0 h-6">
                                      Generating
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Expandable Action Buttons Row - Only visible on hover */}
                          {isHovered && (
                            <div className="mt-3 pt-3 border-t border-primary/20 animate-fade-in">
                              <div className="flex items-center justify-center gap-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Clarify clicked for step:', phaseIndex, stepIndex);
                                  }}
                                  className="relative px-6 py-2.5 text-sm font-semibold
                                    bg-background/60 hover:bg-background/80
                                    border border-primary/40 hover:border-primary/70
                                    text-primary
                                    shadow-sm hover:shadow-md shadow-primary/10 hover:shadow-primary/20
                                    transition-all duration-300 rounded-xl hover:scale-[1.05]
                                    backdrop-blur-sm"
                                >
                                  Clarify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Reroute clicked for step:', phaseIndex, stepIndex);
                                  }}
                                  className="relative px-6 py-2.5 text-sm font-semibold
                                    bg-background/60 hover:bg-background/80
                                    border border-primary/40 hover:border-primary/70
                                    text-primary
                                    shadow-sm hover:shadow-md shadow-primary/10 hover:shadow-primary/20
                                    transition-all duration-300 rounded-xl hover:scale-[1.05]
                                    backdrop-blur-sm"
                                >
                                  Reroute
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No steps available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
