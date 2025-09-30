import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Rocket, Wrench, Lightbulb, GitBranch, Boxes, Target, CheckCircle2 } from 'lucide-react';
import { DashboardStats as StatsType } from '@/services/dashboardStatsService';
import { Progress } from '@/components/ui/progress';

interface DashboardStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const totalItems = stats.totalJumps + stats.totalTools + stats.totalPrompts + 
                     stats.totalWorkflows + stats.totalBlueprints + stats.totalStrategies;
  
  const totalImplemented = stats.implementedJumps + stats.implementedTools + stats.implementedPrompts +
                           stats.implementedWorkflows + stats.implementedBlueprints + stats.implementedStrategies;
  
  const implementationRate = totalItems > 0 ? (totalImplemented / totalItems) * 100 : 0;

  const statCards = [
    {
      title: 'Credits',
      value: stats.credits,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Jumps',
      value: stats.totalJumps,
      implemented: stats.implementedJumps,
      icon: Rocket,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Tools',
      value: stats.totalTools,
      implemented: stats.implementedTools,
      icon: Wrench,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Prompts',
      value: stats.totalPrompts,
      implemented: stats.implementedPrompts,
      icon: Lightbulb,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Workflows',
      value: stats.totalWorkflows,
      implemented: stats.implementedWorkflows,
      icon: GitBranch,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Blueprints',
      value: stats.totalBlueprints,
      implemented: stats.implementedBlueprints,
      icon: Boxes,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Strategies',
      value: stats.totalStrategies,
      implemented: stats.implementedStrategies,
      icon: Target,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
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
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass border-border hover:shadow-modern transition-all duration-300 rounded-xl">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.implemented !== undefined && stat.value > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({stat.implemented} done)
                      </span>
                    )}
                  </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
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
