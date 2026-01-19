import { Eye, MessageSquare, GitBranch, MousePointer, Copy, Sparkles, TrendingUp, Bot, CheckCircle2, XCircle } from "lucide-react";

interface JumpStatsRowProps {
  stats: {
    views_count?: number;
    clarifications_count?: number;
    max_clarification_level?: number;
    reroutes_count?: number;
    tools_clicked_count?: number;
    prompts_copied_count?: number;
    combos_used_count?: number;
    is_analyzed?: boolean;
    agents_count?: number;
  };
}

export default function JumpStatsRow({ stats }: JumpStatsRowProps) {
  const StatItem = ({ icon: Icon, label, value, compact }: any) => (
    <div className="flex items-center gap-2">
      <div className="p-1 rounded-lg bg-muted/30">
        <Icon className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-1.5">
        {!compact && <span className="text-xs text-muted-foreground">{label}:</span>}
        <span className="text-sm font-bold text-foreground">{value || 0}</span>
      </div>
    </div>
  );

  const BooleanStatItem = ({ icon: Icon, label, value }: { icon: any; label: string; value?: boolean }) => (
    <div className="flex items-center gap-2">
      <div className="p-1 rounded-lg bg-muted/30">
        <Icon className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}:</span>
        {value ? (
          <span className="flex items-center gap-1 text-sm font-bold text-green-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm font-bold text-muted-foreground/60">
            <XCircle className="h-3.5 w-3.5" />
            No
          </span>
        )}
      </div>
    </div>
  );

  const Section = ({ title, children, icon: Icon }: any) => (
    <div className="flex flex-col gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-background/60 to-background/30 border border-border/30">
      <div className="flex items-center gap-1.5 pb-1 border-b border-border/30">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {children}
      </div>
    </div>
  );

  return (
    <div className="relative mt-4 pt-4 border-t border-border/40">
      {/* Row 1: Views, Clarification, Tools Implementation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Column 1: Views - Full width on mobile */}
        <div className="col-span-2 sm:col-span-1">
          <Section title="Views" icon={Eye}>
            <StatItem icon={Eye} label="Total" value={stats.views_count} />
          </Section>
        </div>

        {/* Column 2: Clarification */}
        <Section title="Clarification" icon={MessageSquare}>
          <StatItem icon={MessageSquare} label="Clarifications" value={stats.clarifications_count} />
          <StatItem icon={TrendingUp} label="Max Level" value={stats.max_clarification_level} />
          <StatItem icon={GitBranch} label="Reroutes" value={stats.reroutes_count} />
        </Section>

        {/* Column 3: Tools Implementation */}
        <Section title="Tools Implementation" icon={Sparkles}>
          <StatItem icon={MousePointer} label="Tools" value={stats.tools_clicked_count} />
          <StatItem icon={Copy} label="Prompts" value={stats.prompts_copied_count} />
          <StatItem icon={Sparkles} label="Combos" value={stats.combos_used_count} />
        </Section>
      </div>

      {/* Row 2: Agentic Implementation - Full width */}
      <div className="mt-3">
        <div className="flex flex-col gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-indigo-500/5 via-background/60 to-purple-500/5 border border-indigo-500/20">
          <div className="flex items-center gap-1.5 pb-1 border-b border-indigo-500/20">
            <Bot className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-foreground">Agentic Implementation</span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <BooleanStatItem icon={CheckCircle2} label="Analyzed" value={stats.is_analyzed} />
            <StatItem icon={Bot} label="AI Agents Built" value={stats.agents_count} />
          </div>
        </div>
      </div>
    </div>
  );
}
