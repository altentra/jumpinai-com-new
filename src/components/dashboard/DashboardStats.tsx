import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Rocket, Wrench, Lightbulb, GitBranch, Boxes, Target, CheckCircle2, Sparkles, GitCompare } from 'lucide-react';
import { DashboardStats as StatsType } from '@/services/dashboardStatsService';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface DashboardStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();
  const totalItems = stats.totalJumps + stats.totalToolPrompts;
  
  const totalImplemented = stats.implementedJumps + stats.implementedToolPrompts;
  
  const implementationRate = totalItems > 0 ? (totalImplemented / totalItems) * 100 : 0;

  const statCards = [
    {
      title: 'Credits',
      value: stats.credits,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      path: '/dashboard/subscription',
    },
    {
      title: 'Jumps',
      value: stats.totalJumps,
      implemented: stats.implementedJumps,
      icon: Rocket,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      path: '/dashboard/jumps',
    },
    {
      title: 'Tools & Prompts',
      value: stats.totalToolPrompts,
      implemented: stats.implementedToolPrompts,
      icon: Wrench,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      path: '/dashboard/tools-prompts',
    },
    {
      title: 'Clarifications',
      value: stats.totalClarifications,
      icon: Sparkles,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      path: '/dashboard/jumps',
    },
    {
      title: 'Reroutes',
      value: stats.totalReroutes,
      icon: GitCompare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      path: '/dashboard/jumps',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="glass animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid - Centered and Beautiful */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto px-2 sm:px-0">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="glass border-border/50 hover:border-primary/30 hover:shadow-modern-lg transition-all duration-300 rounded-xl cursor-pointer group overflow-hidden relative"
            onClick={() => navigate(stat.path)}
          >
            {/* Subtle gradient background */}
            <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <CardContent className="p-4 sm:p-5 md:p-6 relative z-10">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{stat.value}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};
