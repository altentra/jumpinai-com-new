import { Eye, MessageSquare, GitBranch, MousePointer, Copy, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const StatItem = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold text-foreground">{value || 0}</span>
    </div>
  );

  return (
    <div className="relative mt-4 pt-4 border-t border-border/40">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        <StatItem
          icon={Eye}
          label="Views"
          value={stats.views_count}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatItem
          icon={MessageSquare}
          label="Clarifications"
          value={stats.clarifications_count}
          color="bg-purple-500/10 text-purple-500"
        />
        <StatItem
          icon={TrendingUp}
          label="Max Level"
          value={stats.max_clarification_level}
          color="bg-purple-500/10 text-purple-500"
        />
        <StatItem
          icon={GitBranch}
          label="Reroutes"
          value={stats.reroutes_count}
          color="bg-orange-500/10 text-orange-500"
        />
        <StatItem
          icon={MousePointer}
          label="Tools"
          value={stats.tools_clicked_count}
          color="bg-green-500/10 text-green-500"
        />
        <StatItem
          icon={Copy}
          label="Prompts"
          value={stats.prompts_copied_count}
          color="bg-cyan-500/10 text-cyan-500"
        />
        <StatItem
          icon={Sparkles}
          label="Combos"
          value={stats.combos_used_count}
          color="bg-primary/10 text-primary"
        />
      </div>
    </div>
  );
}
