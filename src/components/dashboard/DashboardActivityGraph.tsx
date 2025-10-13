import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityData } from '@/services/dashboardStatsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface DashboardActivityGraphProps {
  data: ActivityData[];
  isLoading?: boolean;
}

export const DashboardActivityGraph: React.FC<DashboardActivityGraphProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="glass border-border rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Activity Overview</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalJumps = data.reduce((sum, item) => sum + item.jumps, 0);
  const totalComponents = data.reduce((sum, item) => sum + item.components, 0);
  const totalItems = totalJumps + totalComponents;

  const chartConfig = {
    jumps: {
      label: "Jumps",
      color: "hsl(217, 91%, 60%)",
    },
    components: {
      label: "Components",
      color: "hsl(142, 71%, 45%)",
    },
  };

  return (
    <Card className="glass border-border rounded-xl overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Activity Overview
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Last 30 days
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-semibold text-primary">{totalItems}</span>
            <span className="text-xs text-muted-foreground">items</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="jumpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="componentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.05} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.2}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent indicator="line" labelFormatter={formatDate} />}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.5 }}
            />
            <ChartLegend 
              content={<ChartLegendContent />}
              verticalAlign="top"
            />
            <Area
              type="monotone"
              dataKey="jumps"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={3}
              fill="url(#jumpsGradient)"
              dot={{ 
                fill: 'hsl(217, 91%, 60%)', 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                filter: 'url(#glow)'
              }}
              activeDot={{ 
                r: 6, 
                strokeWidth: 3,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(217, 91%, 60%)',
                filter: 'url(#glow)'
              }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="components"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={3}
              fill="url(#componentsGradient)"
              dot={{ 
                fill: 'hsl(142, 71%, 45%)', 
                r: 4,
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                filter: 'url(#glow)'
              }}
              activeDot={{ 
                r: 6,
                strokeWidth: 3,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(142, 71%, 45%)',
                filter: 'url(#glow)'
              }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
