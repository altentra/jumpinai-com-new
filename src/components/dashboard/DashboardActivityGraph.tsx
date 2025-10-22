import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityData } from '@/services/dashboardStatsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Sparkles, Activity } from 'lucide-react';
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
      color: "hsl(210, 100%, 60%)",
    },
    components: {
      label: "Components",
      color: "hsl(152, 76%, 46%)",
    },
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl animate-fade-in-up mx-2 sm:mx-0">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardHeader className="relative pb-4 sm:pb-6 space-y-0 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-start gap-2.5 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <div className="space-y-0.5 sm:space-y-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CardTitle className="text-base sm:text-xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Activity Overview
                </CardTitle>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 animate-pulse" />
              </div>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
                Your creative journey over the last 30 days
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 backdrop-blur-sm border border-blue-500/20 shadow-lg">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">{totalItems}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground/60 font-medium">total items</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-4 sm:pb-8 px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[240px] sm:h-[300px] md:h-[340px] w-full">
          <AreaChart 
            data={data} 
            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Ultra-modern gradient for jumps - beautiful blue */}
              <linearGradient id="jumpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.6} />
                <stop offset="40%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.02} />
              </linearGradient>
              
              {/* Ultra-modern gradient for components - vibrant green */}
              <linearGradient id="componentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 76%, 46%)" stopOpacity={0.6} />
                <stop offset="40%" stopColor="hsl(152, 76%, 46%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(152, 76%, 46%)" stopOpacity={0.02} />
              </linearGradient>

              {/* Subtle glow effect */}
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="hsl(var(--border))" 
              opacity={0.15}
              vertical={false}
            />
            
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground)/0.3)"
              tick={{ fill: 'hsl(var(--muted-foreground)/0.6)', fontSize: 10, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            
            <YAxis 
              stroke="hsl(var(--muted-foreground)/0.3)"
              tick={{ fill: 'hsl(var(--muted-foreground)/0.6)', fontSize: 10, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dx={-8}
            />
            
            <ChartTooltip 
              content={<ChartTooltipContent indicator="dot" labelFormatter={formatDate} />}
              cursor={{ 
                stroke: 'hsl(210, 100%, 60%)', 
                strokeWidth: 1.5, 
                strokeDasharray: '6 6', 
                opacity: 0.3 
              }}
            />
            
            <ChartLegend 
              content={<ChartLegendContent />}
              verticalAlign="top"
              iconType="circle"
            />
            
            {/* Components area (behind) */}
            <Area
              type="monotone"
              dataKey="components"
              stroke="hsl(152, 76%, 46%)"
              strokeWidth={2}
              fill="url(#componentsGradient)"
              dot={false}
              activeDot={{ 
                r: 5, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(152, 76%, 46%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            
            {/* Jumps area (front) */}
            <Area
              type="monotone"
              dataKey="jumps"
              stroke="hsl(210, 100%, 60%)"
              strokeWidth={2}
              fill="url(#jumpsGradient)"
              dot={false}
              activeDot={{ 
                r: 5, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(210, 100%, 60%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
};
