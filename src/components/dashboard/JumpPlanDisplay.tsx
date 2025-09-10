import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Edit, Sparkles } from 'lucide-react';
import { formatAIText } from '@/utils/aiTextFormatter';
import { safeParseJSON } from '@/utils/safeJson';
import ComprehensiveJumpDisplay from './ComprehensiveJumpDisplay';

interface JumpPlanDisplayProps {
  planContent: string;
  structuredPlan?: any; // Optional structured data for enhanced display
  onEdit: () => void;
  onDownload: () => void;
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
    executive_summary: '',
    overview: {
      vision_statement: '',
      transformation_scope: '',
      expected_outcomes: [] as string[],
      timeline_overview: ''
    },
    analysis: {
      current_state: {
        strengths: [] as string[],
        weaknesses: [] as string[],
        opportunities: [] as string[],
        threats: [] as string[]
      },
      gap_analysis: [] as string[],
      readiness_assessment: { score: 0, factors: [] as any[] },
      market_context: ''
    },
    action_plan: {
      phases: [1,2,3].map((n) => ({
        phase_number: n,
        title: `Phase ${n}`,
        description: '',
        duration: '',
        objectives: [] as string[],
        key_actions: [] as any[],
        milestones: [] as any[],
        deliverables: [] as string[],
        risks: [] as any[]
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

  // Direct fields
  if (typeof source.executive_summary === 'string') base.executive_summary = source.executive_summary;

  // Overview
  const ov = source.overview || {};
  if (typeof ov.vision_statement === 'string') base.overview.vision_statement = ov.vision_statement;
  if (typeof ov.transformation_scope === 'string') base.overview.transformation_scope = ov.transformation_scope;
  if (Array.isArray(ov.expected_outcomes)) base.overview.expected_outcomes = ov.expected_outcomes;
  if (typeof ov.timeline_overview === 'string') base.overview.timeline_overview = ov.timeline_overview;
  if (!base.overview.timeline_overview && typeof (source.timeline || source.timeline_overview) === 'string') base.overview.timeline_overview = source.timeline || source.timeline_overview;

  // Analysis
  const an = source.analysis || {};
  const cs = an.current_state || {};
  if (Array.isArray(cs.strengths)) base.analysis.current_state.strengths = cs.strengths;
  if (Array.isArray(cs.weaknesses)) base.analysis.current_state.weaknesses = cs.weaknesses;
  if (Array.isArray(cs.opportunities)) base.analysis.current_state.opportunities = cs.opportunities;
  if (Array.isArray(cs.threats)) base.analysis.current_state.threats = cs.threats;
  if (Array.isArray(an.gap_analysis)) base.analysis.gap_analysis = an.gap_analysis;
  if (an.readiness_assessment && typeof an.readiness_assessment === 'object') base.analysis.readiness_assessment = {
    score: typeof an.readiness_assessment.score === 'number' ? an.readiness_assessment.score : 0,
    factors: Array.isArray(an.readiness_assessment.factors) ? an.readiness_assessment.factors : []
  };
  if (typeof an.market_context === 'string') base.analysis.market_context = an.market_context;

  // Phases (accept either root phases[] or action_plan.phases[])
  const phases = Array.isArray(source?.action_plan?.phases) ? source.action_plan.phases : (Array.isArray(source?.phases) ? source.phases : []);
  if (Array.isArray(phases) && phases.length) {
    base.action_plan.phases = phases.map((p: any, idx: number) => ({
      phase_number: typeof p.phase_number === 'number' ? p.phase_number : (idx + 1),
      title: p.title || `Phase ${idx + 1}`,
      description: p.description || '',
      duration: p.duration || p.timeline || '',
      objectives: Array.isArray(p.objectives) ? p.objectives : [],
      key_actions: Array.isArray(p.key_actions) ? p.key_actions : [],
      milestones: Array.isArray(p.milestones) ? p.milestones : [],
      deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
      risks: Array.isArray(p.risks) ? p.risks : []
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

export default function JumpPlanDisplay({ planContent, structuredPlan, onEdit, onDownload }: JumpPlanDisplayProps) {
  if (!planContent.trim() && !structuredPlan) {
    return null;
  }

const candidate = React.useMemo(() => {
  const parsedStructured = typeof structuredPlan === 'string' ? safeParseJSON(structuredPlan) : structuredPlan;
  return parsedStructured || safeParseJSON(planContent);
}, [structuredPlan, planContent]);
const comprehensivePlan = React.useMemo(() => candidate ? normalizeToComprehensive(candidate) : null, [candidate]);
const enhancedContent = React.useMemo(() => formatAIText(planContent), [planContent]);
const finalPlan = React.useMemo(() => {
  if (comprehensivePlan) return comprehensivePlan;
  const fallback = buildDefaultPlan();

  // Avoid dumping raw JSON into the executive summary if parsing failed
  const isJSONish = typeof planContent === 'string'
    && /[{\[][\s\S]*[}\]]/.test(planContent)
    && /"title"|"overview"|"action_plan"|"metrics_tracking"/.test(planContent);

  if (planContent && planContent.trim() && !isJSONish) {
    const text = enhancedContent.replace(/[#>*`]/g, '').trim();
    fallback.executive_summary = text;
  }
  return fallback;
}, [comprehensivePlan, planContent, enhancedContent]);

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Your AI-Generated Jump Plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your personalized transformation roadmap
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            Generated by AI
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Plan
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Refine with Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ComprehensiveJumpDisplay 
          jump={finalPlan}
          onEdit={onEdit}
          onDownload={onDownload}
          className="border-0 shadow-none"
        />
      </CardContent>
    </Card>
  );
}
