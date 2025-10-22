import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Rocket, Wrench, Lightbulb, GitBranch, Boxes, Target, CheckCircle2 } from 'lucide-react';
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
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      path: '/dashboard/jumps',
    },
    {
      title: 'Tools & Prompts',
      value: stats.totalToolPrompts,
      implemented: stats.implementedToolPrompts,
      icon: Wrench,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      path: '/dashboard/tools-prompts',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
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
    <div className="space-y-6">
      {/* Stats Grid - Centered and Beautiful */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="glass border-border/50 hover:border-primary/30 hover:shadow-modern-lg transition-all duration-300 rounded-xl cursor-pointer group overflow-hidden relative"
            onClick={() => navigate(stat.path)}
          >
            {/* Subtle gradient background */}
            <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{stat.value}</p>
                    {stat.implemented !== undefined && stat.value > 0 && (
                      <span className="text-sm font-medium text-muted-foreground">
                        / {stat.implemented} done
                      </span>
                    )}
                  </div>
                  {stat.implemented !== undefined && stat.value > 0 && (
                    <div className="mt-2">
                      <Progress 
                        value={(stat.implemented / stat.value) * 100} 
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Progress */}
      {totalItems > 0 && (
        <Card className="glass border-border rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Implementation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {totalImplemented} of {totalItems} items implemented
              </span>
              <span className="font-semibold text-foreground">
                {implementationRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={implementationRate} className="h-2" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {statCards.slice(1).map((stat) => (
                stat.value > 0 && (
                  <div key={stat.title} className="flex items-center gap-1.5">
                    <stat.icon className={`h-3 w-3 ${stat.color}`} />
                    <span className="text-muted-foreground">
                      {stat.title}: {stat.implemented}/{stat.value}
                    </span>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
