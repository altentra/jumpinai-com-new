import { Eye, MessageSquare, GitBranch, MousePointer, Copy, Sparkles, TrendingUp } from "lucide-react";

interface JumpStatsRowProps {
  stats: {
    views_count?: number;
    clarifications_count?: number;
    max_clarification_level?: number;
    reroutes_count?: number;
    tools_clicked_count?: number;
    prompts_copied_count?: number;
    combos_used_count?: number;
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
      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Column 1: Views */}
        <div className="flex items-center justify-center px-3 py-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Views</span>
              <span className="text-xl font-bold text-foreground">{stats.views_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Clarification */}
        <Section title="Clarification" icon={MessageSquare}>
          <StatItem icon={MessageSquare} label="Clarifications" value={stats.clarifications_count} />
          <StatItem icon={TrendingUp} label="Max Level" value={stats.max_clarification_level} />
          <StatItem icon={GitBranch} label="Reroutes" value={stats.reroutes_count} />
        </Section>

        {/* Column 3: Implementation */}
        <Section title="Implementation" icon={Sparkles}>
          <StatItem icon={MousePointer} label="Tools" value={stats.tools_clicked_count} />
          <StatItem icon={Copy} label="Prompts" value={stats.prompts_copied_count} />
          <StatItem icon={Sparkles} label="Combos" value={stats.combos_used_count} />
        </Section>
      </div>
    </div>
  );
}
