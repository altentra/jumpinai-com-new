import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Rocket, Wrench, Sparkles, GitCompare, Route, Search, Bot } from 'lucide-react';
import { DashboardStats as StatsType } from '@/services/dashboardStatsService';
import { useNavigate } from 'react-router-dom';

interface DashboardStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();

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
    {
      title: 'Alt. Routes',
      value: stats.totalAlternativeRoutes,
      icon: Route,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      path: '/dashboard/jumps',
    },
    {
      title: 'Analyzed Jumps',
      value: stats.totalAnalyzedJumps,
      icon: Search,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      path: '/dashboard/implementation',
    },
    {
      title: 'AI Agents',
      value: stats.totalAiAgents,
      icon: Bot,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      path: '/dashboard/implementation',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 max-w-7xl mx-auto px-2 sm:px-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="glass animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid - Compact 8-column layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 max-w-7xl mx-auto px-2 sm:px-0">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="glass border-border/50 hover:border-primary/30 hover:shadow-modern transition-all duration-300 rounded-lg cursor-pointer group overflow-hidden relative"
            onClick={() => navigate(stat.path)}
          >
            {/* Subtle gradient background */}
            <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <CardContent className="p-2.5 sm:p-3 relative z-10">
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[8px] sm:text-[9px] font-medium text-muted-foreground uppercase tracking-wide leading-tight">{stat.title}</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
