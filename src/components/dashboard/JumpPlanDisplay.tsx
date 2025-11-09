import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { safeParseJSON } from '@/utils/safeJson';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Sparkles, Lightbulb, GitBranch, ChevronDown, ChevronUp, Loader2, CheckCircle2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { updateJump } from '@/services/jumpService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { subscription } = useAuth();
  const [hoveredStep, setHoveredStep] = React.useState<{ phaseIndex: number; stepIndex: number } | null>(null);
  const [hoveredSubStep, setHoveredSubStep] = React.useState<{ phaseIndex: number; stepIndex: number; subStepIndex: number } | null>(null);
  const [expandedSubSteps, setExpandedSubSteps] = React.useState<Set<string>>(new Set());
  const [expandedLevel2SubSteps, setExpandedLevel2SubSteps] = React.useState<Set<string>>(new Set());
  const [loadingClarify, setLoadingClarify] = React.useState<Set<string>>(new Set());
  const [loadingReroute, setLoadingReroute] = React.useState<Set<string>>(new Set());
  const [rerouteOptions, setRerouteOptions] = React.useState<Record<string, any>>({});
  const [localPlan, setLocalPlan] = React.useState<any>(null);
  
  // Check if user has Starter plan or higher (not Free)
  const hasStarterPlan = subscription?.subscribed && subscription?.subscription_tier !== null;
  
  if (!planContent.trim() && !structuredPlan) {
    return null;
  }

  const candidate = React.useMemo(() => {
    const parsedStructured = typeof structuredPlan === 'string' ? safeParseJSON(structuredPlan) : structuredPlan;
    return parsedStructured || safeParseJSON(planContent);
  }, [structuredPlan, planContent]);
  
  const comprehensivePlan = React.useMemo(() => candidate ? normalizeToComprehensive(candidate) : null, [candidate]);
  
  const finalPlan = React.useMemo(() => {
    if (localPlan) return localPlan;
    if (comprehensivePlan) return comprehensivePlan;
    return buildDefaultPlan();
  }, [localPlan, comprehensivePlan]);

  // Initialize localPlan when comprehensivePlan changes
  React.useEffect(() => {
    if (comprehensivePlan && !localPlan) {
      setLocalPlan(comprehensivePlan);
    }
  }, [comprehensivePlan, localPlan]);

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

  // Helper function to track user actions (clarify/reroute)
  const trackAction = async (actionType: 'clarify' | 'reroute') => {
    if (!jumpId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_jump_actions').insert({
        user_id: user.id,
        jump_id: jumpId,
        action_type: actionType,
      });
    } catch (error) {
      console.error('Error tracking action:', error);
      // Don't show error to user, this is background tracking
    }
  };

  const handleClarifyStep = async (phaseIndex: number, stepIndex: number) => {
    if (!jumpId) {
      toast.error('Jump ID is required');
      return;
    }

    const stepKey = `${phaseIndex}-${stepIndex}`;
    setLoadingClarify(prev => new Set(prev).add(stepKey));

    try {
      const phase = finalPlan.action_plan.phases[phaseIndex];
      const step = phase.steps[stepIndex];

      // Prepare context for the API call
      const jumpOverview = `
Executive Summary: ${finalPlan.executiveSummary || ''}
Strategic Vision: ${finalPlan.strategicVision || ''}
Current State: ${finalPlan.situationAnalysis?.currentState || ''}
      `.trim();

      const requestBody = {
        jumpOverview,
        phaseTitle: phase.title,
        phaseNumber: phase.phase_number,
        stepTitle: step.title,
        stepDescription: step.description,
        stepNumber: step.step_number,
      };

      console.log('Calling clarify-step function:', requestBody);

      const { data, error } = await supabase.functions.invoke('clarify-step', {
        body: requestBody,
      });

      if (error) throw error;

      if (!data || !data.subSteps) {
        throw new Error('Invalid response from clarify-step function');
      }

      console.log('Received sub-steps:', data.subSteps);

      // Update the local plan with sub-steps
      const updatedPlan = { ...finalPlan };
      updatedPlan.action_plan.phases[phaseIndex].steps[stepIndex].sub_steps = data.subSteps;
      
      setLocalPlan(updatedPlan);

      // Save to database only if this is a real (authenticated) jump
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateJump(jumpId, {
          comprehensive_plan: updatedPlan,
        });
      }

      // Expand the sub-steps
      setExpandedSubSteps(prev => new Set(prev).add(stepKey));

      // Track the clarify action
      await trackAction('clarify');

      toast.success('Sub-steps generated successfully!');
    } catch (error) {
      console.error('Error clarifying step:', error);
      toast.error('Failed to generate sub-steps. Please try again.');
    } finally {
      setLoadingClarify(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepKey);
        return newSet;
      });
    }
  };

  const handleRerouteStep = async (phaseIndex: number, stepIndex: number) => {
    if (!jumpId) {
      toast.error('Jump ID is required');
      return;
    }

    const stepKey = `${phaseIndex}-${stepIndex}`;
    setLoadingReroute(prev => new Set(prev).add(stepKey));

    try {
      const phase = finalPlan.action_plan.phases[phaseIndex];
      const step = phase.steps[stepIndex];

      const jumpOverview = `
Executive Summary: ${finalPlan.executiveSummary || ''}
Strategic Vision: ${finalPlan.strategicVision || ''}
Current State: ${finalPlan.situationAnalysis?.currentState || ''}
      `.trim();

      const requestBody = {
        jumpOverview,
        phaseTitle: phase.title,
        phaseNumber: phase.phase_number,
        stepTitle: step.title,
        stepDescription: step.description,
        stepNumber: step.step_number,
      };

      console.log('Calling reroute-step function:', requestBody);

      const { data, error } = await supabase.functions.invoke('reroute-step', {
        body: requestBody,
      });

      if (error) throw error;

      if (!data || !data.directions) {
        throw new Error('Invalid response from reroute-step function');
      }

      console.log('Received directions:', data.directions);

      setRerouteOptions(prev => ({ ...prev, [stepKey]: data.directions }));
      
      // Track the reroute action (only for authenticated users)
      await trackAction('reroute');
      
      toast.success('Alternative routes generated successfully!');
    } catch (error) {
      console.error('Error generating reroute options:', error);
      toast.error('Failed to generate alternative routes. Please try again.');
    } finally {
      setLoadingReroute(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepKey);
        return newSet;
      });
    }
  };

  const handleChooseRoute = async (phaseIndex: number, stepIndex: number, directionIndex: number) => {
    if (!jumpId) {
      toast.error('Jump ID is required');
      return;
    }

    const stepKey = `${phaseIndex}-${stepIndex}`;
    const directions = rerouteOptions[stepKey];
    const chosenDirection = directions[directionIndex];

    try {
      const updatedPlan = { ...finalPlan };
      updatedPlan.action_plan.phases[phaseIndex].steps[stepIndex].reroute = {
        overview: chosenDirection.overview,
        sub_steps: chosenDirection.sub_steps,
      };
      setLocalPlan(updatedPlan);

      await updateJump(jumpId, {
        comprehensive_plan: updatedPlan,
      });

      setRerouteOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions[stepKey];
        return newOptions;
      });

      toast.success('Route selected successfully!');
    } catch (error) {
      console.error('Error choosing route:', error);
      toast.error('Failed to save chosen route. Please try again.');
    }
  };

  const toggleSubSteps = (phaseIndex: number, stepIndex: number) => {
    const stepKey = `${phaseIndex}-${stepIndex}`;
    setExpandedSubSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepKey)) {
        newSet.delete(stepKey);
      } else {
        newSet.add(stepKey);
      }
      return newSet;
    });
  };

  const toggleLevel2SubSteps = (phaseIndex: number, stepIndex: number, subStepIndex: number) => {
    const subStepKey = `${phaseIndex}-${stepIndex}-${subStepIndex}`;
    setExpandedLevel2SubSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subStepKey)) {
        newSet.delete(subStepKey);
      } else {
        newSet.add(subStepKey);
      }
      return newSet;
    });
  };

  // Handler for Level 2 clarification (clarifying a sub-step)
  const handleClarifySubStep = async (phaseIndex: number, stepIndex: number, subStepIndex: number) => {
    if (!jumpId) {
      toast.error('Jump ID is required');
      return;
    }

    const subStepKey = `${phaseIndex}-${stepIndex}-${subStepIndex}`;
    setLoadingClarify(prev => new Set(prev).add(subStepKey));

    try {
      const phase = finalPlan.action_plan.phases[phaseIndex];
      const step = phase.steps[stepIndex];
      const subStep = step.sub_steps[subStepIndex];

      const jumpOverview = `
Executive Summary: ${finalPlan.executiveSummary || ''}
Strategic Vision: ${finalPlan.strategicVision || ''}
Current State: ${finalPlan.situationAnalysis?.currentState || ''}
      `.trim();

      const requestBody = {
        jumpOverview,
        phaseTitle: phase.title,
        phaseNumber: phase.phase_number,
        stepTitle: subStep.title,
        stepDescription: subStep.description,
        stepNumber: subStep.sub_step_number,
        level: 2, // Indicate this is Level 2
      };

      console.log('Calling clarify-step function for Level 2:', requestBody);

      const { data, error } = await supabase.functions.invoke('clarify-step', {
        body: requestBody,
      });

      if (error) throw error;

      if (!data || !data.subSteps) {
        throw new Error('Invalid response from clarify-step function');
      }

      console.log('Received Level 2 sub-steps:', data.subSteps);

      // Update the local plan with Level 2 sub-steps
      const updatedPlan = { ...finalPlan };
      updatedPlan.action_plan.phases[phaseIndex].steps[stepIndex].sub_steps[subStepIndex].level_2_sub_steps = data.subSteps;
      
      setLocalPlan(updatedPlan);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateJump(jumpId, {
          comprehensive_plan: updatedPlan,
        });
      }

      // Expand the Level 2 sub-steps
      setExpandedLevel2SubSteps(prev => new Set(prev).add(subStepKey));

      // Track the clarify action
      await trackAction('clarify');

      toast.success('Level 2 sub-steps generated successfully!');
    } catch (error) {
      console.error('Error clarifying sub-step:', error);
      toast.error('Failed to generate Level 2 sub-steps. Please try again.');
    } finally {
      setLoadingClarify(prev => {
        const newSet = new Set(prev);
        newSet.delete(subStepKey);
        return newSet;
      });
    }
  };

  // Handler for Level 2 rerouting (rerouting a sub-step)
  const handleRerouteSubStep = async (phaseIndex: number, stepIndex: number, subStepIndex: number) => {
    if (!jumpId) {
      toast.error('Jump ID is required');
      return;
    }

    const subStepKey = `${phaseIndex}-${stepIndex}-${subStepIndex}`;
    setLoadingReroute(prev => new Set(prev).add(subStepKey));

    try {
      const phase = finalPlan.action_plan.phases[phaseIndex];
      const step = phase.steps[stepIndex];
      const subStep = step.sub_steps[subStepIndex];

      const jumpOverview = `
Executive Summary: ${finalPlan.executiveSummary || ''}
Strategic Vision: ${finalPlan.strategicVision || ''}
Current State: ${finalPlan.situationAnalysis?.currentState || ''}
      `.trim();

      const requestBody = {
        jumpOverview,
        phaseTitle: phase.title,
        phaseNumber: phase.phase_number,
        stepTitle: subStep.title,
        stepDescription: subStep.description,
        stepNumber: subStep.sub_step_number,
      };

      console.log('Calling reroute-step function for Level 2:', requestBody);

      const { data, error } = await supabase.functions.invoke('reroute-step', {
        body: requestBody,
      });

      if (error) throw error;

      if (!data || !data.directions) {
        throw new Error('Invalid response from reroute-step function');
      }

      console.log('Received Level 2 directions:', data.directions);

      setRerouteOptions(prev => ({ ...prev, [subStepKey]: data.directions }));
      
      // Track the reroute action
      await trackAction('reroute');
      
      toast.success('Alternative routes generated successfully!');
    } catch (error) {
      console.error('Error generating Level 2 reroute options:', error);
      toast.error('Failed to generate alternative routes. Please try again.');
    } finally {
      setLoadingReroute(prev => {
        const newSet = new Set(prev);
        newSet.delete(subStepKey);
        return newSet;
      });
    }
  };

  // Handler for choosing a Level 2 route
  const handleChooseSubStepRoute = async (phaseIndex: number, stepIndex: number, subStepIndex: number, directionIndex: number) => {
    if (!jumpId) {
      toast.error('Jump ID is required');
      return;
    }

    const subStepKey = `${phaseIndex}-${stepIndex}-${subStepIndex}`;
    const directions = rerouteOptions[subStepKey];
    const chosenDirection = directions[directionIndex];

    try {
      const updatedPlan = { ...finalPlan };
      updatedPlan.action_plan.phases[phaseIndex].steps[stepIndex].sub_steps[subStepIndex].reroute = {
        overview: chosenDirection.overview,
        sub_steps: chosenDirection.sub_steps,
      };
      setLocalPlan(updatedPlan);

      await updateJump(jumpId, {
        comprehensive_plan: updatedPlan,
      });

      setRerouteOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions[subStepKey];
        return newOptions;
      });

      toast.success('Route selected successfully!');
    } catch (error) {
      console.error('Error choosing Level 2 route:', error);
      toast.error('Failed to save chosen route. Please try again.');
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
                  <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2">
                    <ReactMarkdown className="prose max-w-none break-words [&>p]:m-0 [&_strong]:font-bold">
                      {phase.title || `Phase ${phaseIndex + 1}`}
                    </ReactMarkdown>
                  </CardTitle>
                  {phase.description && (
                    <div className="text-muted-foreground leading-relaxed">
                      <ReactMarkdown className="prose prose-xs sm:prose-sm max-w-none break-words overflow-wrap-anywhere text-xs sm:text-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic">
                        {phase.description}
                      </ReactMarkdown>
                    </div>
                  )}
                  {phase.duration && (
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
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
                    const stepKey = `${phaseIndex}-${stepIndex}`;
                    const hasSubSteps = step.sub_steps && Array.isArray(step.sub_steps) && step.sub_steps.length > 0;
                    const isExpanded = expandedSubSteps.has(stepKey);
                    const isLoading = loadingClarify.has(stepKey);
                    const isRerouteLoading = loadingReroute.has(stepKey);
                    const hasRerouteOptions = rerouteOptions[stepKey];
                    const hasChosenRoute = step.reroute;
                    
                    return (
                      <div key={stepIndex} className="group">
                        <div 
                          className="bg-background/40 backdrop-blur-[2px] border border-primary/40 border-l-2 border-l-primary/50 hover:border-primary/70 hover:border-l-primary/80 rounded-3xl p-3 sm:p-4 md:p-5 hover:bg-background/60 transition-all duration-300 shadow-[0_2px_8px_rgba(var(--primary),0.15)] hover:shadow-[0_4px_16px_rgba(var(--primary),0.25)]"
                          onMouseEnter={() => setHoveredStep({ phaseIndex, stepIndex })}
                          onMouseLeave={() => setHoveredStep(null)}
                        >
                        <div className="flex items-start gap-3 sm:gap-4 mb-3">
                          <div className="flex-shrink-0 pt-0.5">
                            <div className="px-3 py-2 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center border border-primary/40 shadow-sm">
                              <span className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                                Step {stepIndex + 1}.
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
                            
                            // Get the actual tool prompt ID (check if it exists and is not null/undefined)
                            const toolPromptId = toolPromptIds?.[comboIndex];
                            const hasValidToolPromptId = toolPromptId && toolPromptId !== 'null' && toolPromptId !== null && toolPromptId !== undefined && toolPromptId.trim() !== '';
                            
                            return (
                              <div className={`p-3 rounded-2xl border ${hasValidToolPromptId ? 'bg-blue-500/5 border-blue-500/30' : 'bg-muted/30 border-border/50'}`}>
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
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleToolPromptClick(comboIndex);
                                       }}
                                       className="relative group/view shrink-0"
                                     >
                                       {/* Liquid glass glow effect */}
                                       <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 group-hover/view:opacity-70 transition duration-500"></div>
                                       
                                       {/* Button */}
                                       <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 group-hover/view:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                                         {/* Shimmer effect */}
                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/view:translate-x-full transition-transform duration-1000"></div>
                                         
                                         {/* Content */}
                                         <span className="relative text-sm font-bold text-foreground group-hover/view:text-primary transition-colors duration-300 whitespace-nowrap">
                                           View
                                         </span>
                                         
                                         {/* Arrow icon */}
                                         <div className="relative flex items-center justify-center w-5 h-5 rounded-xl bg-primary/30 group-hover/view:bg-primary/40 transition-all duration-300">
                                           <ArrowRight className="w-3.5 h-3.5 text-primary group-hover/view:translate-x-0.5 transition-transform duration-300" />
                                         </div>
                                       </div>
                                     </button>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] shrink-0 h-6">
                                      Generating
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                          
                           {/* Reroute options display */}
                           {hasRerouteOptions && (
                             <div className="mt-4 space-y-4">
                               <div className="flex items-center gap-2">
                                 <GitBranch className="w-4 h-4 text-primary" />
                                 <h4 className="text-sm font-semibold text-foreground">Choose Your Route:</h4>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 {rerouteOptions[stepKey].map((direction: any, dirIndex: number) => (
                                   <div
                                     key={dirIndex}
                                     className="bg-background/40 border border-primary/30 rounded-xl p-4 flex flex-col"
                                   >
                                     <div className="mb-3">
                                       <h4 className="text-base font-semibold text-foreground text-center mb-3">
                                         Direction {dirIndex + 1}
                                       </h4>
                                       <div className="text-sm text-muted-foreground/90 leading-relaxed">
                                         <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                                           {direction.overview}
                                         </ReactMarkdown>
                                       </div>
                                     </div>

                                     <div className="space-y-2 mb-4 flex-grow">
                                       {direction.sub_steps?.map((subStep: any, subStepIndex: number) => (
                                         <div
                                           key={subStepIndex}
                                           className="bg-background/30 border border-primary/20 rounded-xl p-3"
                                         >
                                           <div className="flex flex-col gap-2 mb-2">
                                             <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border border-primary/60 shadow-sm w-fit">
                                                <span className="text-xs font-bold text-primary/90 whitespace-nowrap">
                                                  Sub-Step {subStepIndex + 1}.
                                                </span>
                                             </div>
                                             <h5 className="text-sm font-semibold text-foreground leading-tight">
                                               <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-0">
                                                 {subStep.title}
                                               </ReactMarkdown>
                                             </h5>
                                           </div>
                                           <div className="text-xs text-muted-foreground/90 leading-relaxed">
                                             <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&_strong]:font-bold">
                                               {subStep.description}
                                             </ReactMarkdown>
                                           </div>
                                           {subStep.estimated_time && (
                                             <div className="mt-2">
                                               <Badge variant="outline" className="text-xs">
                                                 {subStep.estimated_time}
                                               </Badge>
                                             </div>
                                           )}
                                         </div>
                                       ))}
                                     </div>

                                     <Button
                                       size="sm"
                                       className="w-full gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700/50"
                                       onClick={() => handleChooseRoute(phaseIndex, stepIndex, dirIndex)}
                                     >
                                       <Check className="h-4 w-4" />
                                       Choose this route
                                     </Button>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}

                           {/* Chosen reroute display */}
                           {hasChosenRoute && (
                             <div className="mt-4">
                               <div className="bg-background/40 border border-primary/30 rounded-xl p-4">
                                 <div className="flex items-center gap-2 mb-3">
                                   <GitBranch className="h-4 w-4 text-primary" />
                                   <h4 className="text-sm font-semibold text-foreground">Alternative Route Selected</h4>
                                 </div>
                                 <div className="text-sm text-muted-foreground/90 leading-relaxed mb-4">
                                   <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                                     {step.reroute.overview}
                                   </ReactMarkdown>
                                 </div>
                                 <div className="space-y-2">
                                   {step.reroute.sub_steps?.map((subStep: any, subStepIndex: number) => (
                                     <div
                                       key={subStepIndex}
                                       className="bg-background/30 border border-primary/20 rounded-xl p-3"
                                     >
                                       <div className="flex items-start gap-2 mb-2">
                                         <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border border-primary/60 shadow-sm">
                                            <span className="text-xs font-bold text-primary/90 whitespace-nowrap">
                                              Sub-Step {subStepIndex + 1}.
                                            </span>
                                         </div>
                                         <h5 className="text-sm font-semibold text-foreground pt-0.5">
                                           <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold">
                                             {subStep.title}
                                           </ReactMarkdown>
                                         </h5>
                                       </div>
                                       <div className="text-xs text-muted-foreground/90 leading-relaxed">
                                         <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&_strong]:font-bold">
                                           {subStep.description}
                                         </ReactMarkdown>
                                       </div>
                                       {subStep.estimated_time && (
                                         <div className="mt-2">
                                           <Badge variant="outline" className="text-xs">
                                             {subStep.estimated_time}
                                           </Badge>
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           )}

                           {/* Sub-steps display */}
                           {hasSubSteps && (
                            <div className="mt-3 pt-3 border-t border-primary/20">
                              <button
                                onClick={() => toggleSubSteps(phaseIndex, stepIndex)}
                                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    Hide Sub-Steps
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    Show {step.sub_steps.length} Sub-Steps
                                  </>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-3 space-y-2 animate-fade-in">
                                  {step.sub_steps.map((subStep: any, subStepIndex: number) => {
                                    const isSubStepHovered = hasStarterPlan && hoveredSubStep?.phaseIndex === phaseIndex && hoveredSubStep?.stepIndex === stepIndex && hoveredSubStep?.subStepIndex === subStepIndex;
                                    const subStepKey = `${phaseIndex}-${stepIndex}-${subStepIndex}`;
                                    const hasLevel2SubSteps = subStep.level_2_sub_steps && Array.isArray(subStep.level_2_sub_steps) && subStep.level_2_sub_steps.length > 0;
                                    const isLevel2Expanded = expandedLevel2SubSteps.has(subStepKey);
                                    const isSubStepLoading = loadingClarify.has(subStepKey);
                                    const isSubStepRerouteLoading = loadingReroute.has(subStepKey);
                                    const hasSubStepRerouteOptions = rerouteOptions[subStepKey];
                                    const hasSubStepChosenRoute = subStep.reroute;
                                    
                                    return (
                                      <div
                                        key={subStepIndex}
                                        className="bg-background/30 border border-primary/20 rounded-xl p-3 ml-4"
                                        onMouseEnter={() => hasStarterPlan && setHoveredSubStep({ phaseIndex, stepIndex, subStepIndex })}
                                        onMouseLeave={() => hasStarterPlan && setHoveredSubStep(null)}
                                      >
                                        <div className="flex items-start gap-2 mb-2">
                                          <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border border-primary/60 shadow-sm">
                                             <span className="text-xs font-bold text-primary/90 whitespace-nowrap">
                                               Sub-Step {subStepIndex + 1}.
                                             </span>
                                          </div>
                                          <h5 className="text-sm font-semibold text-foreground pt-0.5">
                                            <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold">
                                              {subStep.title}
                                            </ReactMarkdown>
                                          </h5>
                                        </div>
                                        <div className="text-xs text-muted-foreground/90 leading-relaxed">
                                          <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&_strong]:font-bold">
                                            {subStep.description}
                                          </ReactMarkdown>
                                        </div>
                                        {subStep.estimated_time && (
                                          <div className="mt-2">
                                            <Badge variant="outline" className="text-xs">
                                              {subStep.estimated_time}
                                            </Badge>
                                          </div>
                                        )}

                                        {/* Level 2 Reroute options display */}
                                        {hasSubStepRerouteOptions && (
                                          <div className="mt-4 space-y-4">
                                            <div className="flex items-center gap-2">
                                              <GitBranch className="w-3.5 h-3.5 text-primary" />
                                              <h4 className="text-xs font-semibold text-foreground">Choose Your Route:</h4>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                              {rerouteOptions[subStepKey].map((direction: any, dirIndex: number) => (
                                                <div
                                                  key={dirIndex}
                                                  className="bg-background/40 border border-primary/30 rounded-xl p-3 flex flex-col"
                                                >
                                                  <div className="mb-2">
                                                    <h4 className="text-sm font-semibold text-foreground mb-2">
                                                      Direction {dirIndex + 1}
                                                    </h4>
                                                    <div className="text-xs text-muted-foreground/90 leading-relaxed">
                                                      <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                                                        {direction.overview}
                                                      </ReactMarkdown>
                                                    </div>
                                                  </div>

                                                  <div className="space-y-2 mb-3 flex-grow">
                                                    {direction.sub_steps?.map((level2SubStep: any, level2SubStepIndex: number) => (
                                                      <div
                                                        key={level2SubStepIndex}
                                                        className="bg-background/30 border border-primary/20 rounded-lg p-2"
                                                      >
                                                        <div className="flex flex-col gap-1 mb-1">
                                                          <div className="flex-shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border border-primary/60 shadow-sm w-fit">
                                                             <span className="text-[10px] font-bold text-primary/90 whitespace-nowrap">
                                                               Level 2. Sub-Step {level2SubStepIndex + 1}.
                                                             </span>
                                                          </div>
                                                          <h5 className="text-xs font-semibold text-foreground leading-tight">
                                                            <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-0">
                                                              {level2SubStep.title}
                                                            </ReactMarkdown>
                                                          </h5>
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground/90 leading-relaxed">
                                                          <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&_strong]:font-bold">
                                                            {level2SubStep.description}
                                                          </ReactMarkdown>
                                                        </div>
                                                        {level2SubStep.estimated_time && (
                                                          <div className="mt-1">
                                                            <Badge variant="outline" className="text-[10px]">
                                                              {level2SubStep.estimated_time}
                                                            </Badge>
                                                          </div>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>

                                                  <Button
                                                    size="sm"
                                                    className="w-full gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700/50 text-xs py-1"
                                                    onClick={() => handleChooseSubStepRoute(phaseIndex, stepIndex, subStepIndex, dirIndex)}
                                                  >
                                                    <Check className="h-3 w-3" />
                                                    Choose this route
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Level 2 Chosen reroute display */}
                                        {hasSubStepChosenRoute && (
                                          <div className="mt-3">
                                            <div className="bg-background/40 border border-primary/30 rounded-xl p-3">
                                              <div className="flex items-center gap-2 mb-2">
                                                <GitBranch className="h-3.5 w-3.5 text-primary" />
                                                <h4 className="text-xs font-semibold text-foreground">Alternative Route Selected</h4>
                                              </div>
                                              <div className="text-xs text-muted-foreground/90 leading-relaxed mb-3">
                                                <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                                                  {subStep.reroute.overview}
                                                </ReactMarkdown>
                                              </div>
                                              <div className="space-y-2">
                                                {subStep.reroute.sub_steps?.map((level2SubStep: any, level2SubStepIndex: number) => (
                                                  <div
                                                    key={level2SubStepIndex}
                                                    className="bg-background/30 border border-primary/20 rounded-lg p-2"
                                                  >
                                                    <div className="flex items-start gap-2 mb-1">
                                                      <div className="flex-shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border border-primary/60 shadow-sm">
                                                         <span className="text-[10px] font-bold text-primary/90 whitespace-nowrap">
                                                           Level 2. Sub-Step {level2SubStepIndex + 1}.
                                                         </span>
                                                      </div>
                                                      <h5 className="text-xs font-semibold text-foreground pt-0.5">
                                                        <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold">
                                                          {level2SubStep.title}
                                                        </ReactMarkdown>
                                                      </h5>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground/90 leading-relaxed">
                                                      <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&_strong]:font-bold">
                                                        {level2SubStep.description}
                                                      </ReactMarkdown>
                                                    </div>
                                                    {level2SubStep.estimated_time && (
                                                      <div className="mt-1">
                                                        <Badge variant="outline" className="text-[10px]">
                                                          {level2SubStep.estimated_time}
                                                        </Badge>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Level 2 Sub-steps display */}
                                        {hasLevel2SubSteps && (
                                          <div className="mt-3 pt-3 border-t border-primary/20">
                                            <button
                                              onClick={() => toggleLevel2SubSteps(phaseIndex, stepIndex, subStepIndex)}
                                              className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                            >
                                              {isLevel2Expanded ? (
                                                <>
                                                  <ChevronUp className="w-3.5 h-3.5" />
                                                  Hide Level 2 Sub-Steps
                                                </>
                                              ) : (
                                                <>
                                                  <ChevronDown className="w-3.5 h-3.5" />
                                                  Show {subStep.level_2_sub_steps.length} Level 2 Sub-Steps
                                                </>
                                              )}
                                            </button>

                                            {isLevel2Expanded && (
                                              <div className="mt-2 space-y-2 animate-fade-in">
                                                {subStep.level_2_sub_steps.map((level2SubStep: any, level2SubStepIndex: number) => (
                                                  <div
                                                    key={level2SubStepIndex}
                                                    className="bg-background/30 border border-primary/20 rounded-lg p-2 ml-2"
                                                  >
                                                    <div className="flex items-start gap-2 mb-1">
                                                      <div className="flex-shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-primary/40 to-primary/30 flex items-center justify-center border border-primary/60 shadow-sm">
                                                         <span className="text-[10px] font-bold text-primary/90 whitespace-nowrap">
                                                           Level 2. Sub-Step {level2SubStepIndex + 1}.
                                                         </span>
                                                      </div>
                                                      <h5 className="text-xs font-semibold text-foreground pt-0.5">
                                                        <ReactMarkdown className="prose prose-sm max-w-none [&>p]:m-0 [&_strong]:font-bold">
                                                          {level2SubStep.title}
                                                        </ReactMarkdown>
                                                      </h5>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground/90 leading-relaxed">
                                                      <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&_strong]:font-bold">
                                                        {level2SubStep.description}
                                                      </ReactMarkdown>
                                                    </div>
                                                    {level2SubStep.estimated_time && (
                                                      <div className="mt-1">
                                                        <Badge variant="outline" className="text-[10px]">
                                                          {level2SubStep.estimated_time}
                                                        </Badge>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Level 2 Action Buttons - Only visible on hover for Starter plan */}
                                        {hasStarterPlan && isSubStepHovered && (
                                          <div className="mt-3 pt-3 border-t border-primary/20 animate-fade-in">
                                            <TooltipProvider>
                                              <div className="flex items-center justify-center gap-2">
                                                 <Tooltip>
                                                   <TooltipTrigger asChild>
                                                     <button
                                                       onClick={(e) => {
                                                         e.stopPropagation();
                                                         handleClarifySubStep(phaseIndex, stepIndex, subStepIndex);
                                                       }}
                                                       disabled={isSubStepLoading || hasLevel2SubSteps}
                                                       className="relative group/clarify disabled:opacity-50 disabled:cursor-not-allowed"
                                                     >
                                                       {/* Liquid glass glow effect */}
                                                       <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 group-hover/clarify:opacity-70 transition duration-500"></div>
                                                       
                                                       {/* Button */}
                                                       <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 group-hover/clarify:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                                                         {/* Shimmer effect */}
                                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/clarify:translate-x-full transition-transform duration-1000"></div>
                                                         
                                                         {/* Content */}
                                                         {isSubStepLoading ? (
                                                           <>
                                                             <Loader2 className="relative w-3 h-3 animate-spin text-primary" />
                                                             <span className="relative text-xs font-bold text-foreground whitespace-nowrap">Generating...</span>
                                                           </>
                                                         ) : hasLevel2SubSteps ? (
                                                           <>
                                                             <Sparkles className="relative w-3 h-3 text-primary" />
                                                             <span className="relative text-xs font-bold text-foreground whitespace-nowrap">Clarified</span>
                                                           </>
                                                         ) : (
                                                           <>
                                                             <Sparkles className="relative w-3 h-3 text-primary" />
                                                             <span className="relative text-xs font-bold text-foreground group-hover/clarify:text-primary transition-colors duration-300 whitespace-nowrap">Clarify</span>
                                                           </>
                                                         )}
                                                       </div>
                                                     </button>
                                                   </TooltipTrigger>
                                                  <TooltipContent className="max-w-xs">
                                                    <p className="text-xs">
                                                      {hasLevel2SubSteps 
                                                        ? 'This sub-step has already been clarified with Level 2 sub-steps'
                                                        : 'Generate 5 detailed Level 2 sub-steps to break down this sub-step with greater clarity'
                                                      }
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                                
                                                 <Tooltip>
                                                   <TooltipTrigger asChild>
                                                     <button
                                                       onClick={(e) => {
                                                         e.stopPropagation();
                                                         handleRerouteSubStep(phaseIndex, stepIndex, subStepIndex);
                                                       }}
                                                       disabled={isSubStepRerouteLoading || hasSubStepRerouteOptions || hasSubStepChosenRoute}
                                                       className="relative group/reroute disabled:opacity-50 disabled:cursor-not-allowed"
                                                     >
                                                       {/* Liquid glass glow effect */}
                                                       <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 group-hover/reroute:opacity-70 transition duration-500"></div>
                                                       
                                                       {/* Button */}
                                                       <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 group-hover/reroute:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                                                         {/* Shimmer effect */}
                                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/reroute:translate-x-full transition-transform duration-1000"></div>
                                                         
                                                         {/* Content */}
                                                         {isSubStepRerouteLoading ? (
                                                           <>
                                                             <Loader2 className="relative w-3 h-3 animate-spin text-primary" />
                                                             <span className="relative text-xs font-bold text-foreground whitespace-nowrap">Generating...</span>
                                                           </>
                                                         ) : hasSubStepChosenRoute ? (
                                                           <>
                                                             <Sparkles className="relative w-3 h-3 text-primary" />
                                                             <span className="relative text-xs font-bold text-foreground whitespace-nowrap">Rerouted</span>
                                                           </>
                                                         ) : (
                                                           <>
                                                             <GitBranch className="relative w-3 h-3 text-primary" />
                                                             <span className="relative text-xs font-bold text-foreground group-hover/reroute:text-primary transition-colors duration-300 whitespace-nowrap">Reroute</span>
                                                           </>
                                                         )}
                                                       </div>
                                                     </button>
                                                   </TooltipTrigger>
                                                   <TooltipContent className="max-w-xs">
                                                     <p className="text-xs">
                                                       {hasSubStepChosenRoute
                                                         ? 'This sub-step has already been rerouted with an alternative approach'
                                                         : 'Explore 3 alternative approaches for this sub-step'
                                                       }
                                                     </p>
                                                   </TooltipContent>
                                                 </Tooltip>
                                              </div>
                                            </TooltipProvider>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Expandable Action Buttons Row - Only visible on hover */}
                          {isHovered && (
                            <div className="mt-3 pt-3 border-t border-primary/20 animate-fade-in">
                              <TooltipProvider>
                                <div className="flex items-center justify-center gap-3">
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <button
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           handleClarifyStep(phaseIndex, stepIndex);
                                         }}
                                         disabled={isLoading || hasSubSteps}
                                         className="relative group/clarify disabled:opacity-50 disabled:cursor-not-allowed"
                                       >
                                         {/* Liquid glass glow effect */}
                                         <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 group-hover/clarify:opacity-70 transition duration-500"></div>
                                         
                                         {/* Button */}
                                         <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 group-hover/clarify:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                                           {/* Shimmer effect */}
                                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/clarify:translate-x-full transition-transform duration-1000"></div>
                                           
                                           {/* Content */}
                                           {isLoading ? (
                                             <>
                                               <Loader2 className="relative w-3.5 h-3.5 animate-spin text-primary" />
                                               <span className="relative text-sm font-bold text-foreground whitespace-nowrap">Generating...</span>
                                             </>
                                           ) : hasSubSteps ? (
                                             <>
                                               <Sparkles className="relative w-3.5 h-3.5 text-primary" />
                                               <span className="relative text-sm font-bold text-foreground whitespace-nowrap">Clarified</span>
                                             </>
                                           ) : (
                                             <>
                                               <Sparkles className="relative w-3.5 h-3.5 text-primary" />
                                               <span className="relative text-sm font-bold text-foreground group-hover/clarify:text-primary transition-colors duration-300 whitespace-nowrap">Clarify</span>
                                             </>
                                           )}
                                         </div>
                                       </button>
                                     </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="text-sm">
                                        {hasSubSteps 
                                          ? 'This step has already been clarified with sub-steps'
                                          : 'Generate 5 detailed sub-steps to break down this action with greater clarity and precision'
                                        }
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <button
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           handleRerouteStep(phaseIndex, stepIndex);
                                         }}
                                         disabled={isRerouteLoading || hasRerouteOptions || hasChosenRoute}
                                         className="relative group/reroute disabled:opacity-50 disabled:cursor-not-allowed"
                                       >
                                         {/* Liquid glass glow effect */}
                                         <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 group-hover/reroute:opacity-70 transition duration-500"></div>
                                         
                                         {/* Button */}
                                         <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 group-hover/reroute:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                                           {/* Shimmer effect */}
                                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/reroute:translate-x-full transition-transform duration-1000"></div>
                                           
                                           {/* Content */}
                                           {isRerouteLoading ? (
                                             <>
                                               <Loader2 className="relative w-3.5 h-3.5 animate-spin text-primary" />
                                               <span className="relative text-sm font-bold text-foreground whitespace-nowrap">Generating...</span>
                                             </>
                                           ) : hasChosenRoute ? (
                                             <>
                                               <Sparkles className="relative w-3.5 h-3.5 text-primary" />
                                               <span className="relative text-sm font-bold text-foreground whitespace-nowrap">Rerouted</span>
                                             </>
                                           ) : (
                                             <>
                                               <GitBranch className="relative w-3.5 h-3.5 text-primary" />
                                               <span className="relative text-sm font-bold text-foreground group-hover/reroute:text-primary transition-colors duration-300 whitespace-nowrap">Reroute</span>
                                             </>
                                           )}
                                         </div>
                                       </button>
                                     </TooltipTrigger>
                                     <TooltipContent className="max-w-xs">
                                       <p className="text-sm">
                                         {hasChosenRoute
                                           ? 'This step has already been rerouted with an alternative approach'
                                           : 'Explore 3 alternative approaches with different strategies, each containing 3 actionable steps'
                                         }
                                       </p>
                                     </TooltipContent>
                                   </Tooltip>
                                </div>
                              </TooltipProvider>
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
