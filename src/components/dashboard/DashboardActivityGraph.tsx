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
  const totalClarifications = data.reduce((sum, item) => sum + item.clarifications, 0);
  const totalReroutes = data.reduce((sum, item) => sum + item.reroutes, 0);
  const totalAlternativeRoutes = data.reduce((sum, item) => sum + item.alternativeRoutes, 0);
  const totalAnalyzedJumps = data.reduce((sum, item) => sum + item.analyzedJumps, 0);
  const totalAiAgents = data.reduce((sum, item) => sum + item.aiAgents, 0);
  const totalItems = totalJumps + totalComponents + totalClarifications + totalReroutes + totalAlternativeRoutes + totalAnalyzedJumps + totalAiAgents;

  const chartConfig = {
    jumps: {
      label: "Jumps",
      color: "hsl(217, 91%, 60%)",
    },
    components: {
      label: "Tools & Prompts",
      color: "hsl(142, 76%, 36%)",
    },
    clarifications: {
      label: "Clarifications",
      color: "hsl(25, 95%, 53%)",
    },
    reroutes: {
      label: "Reroutes",
      color: "hsl(262, 83%, 58%)",
    },
    alternativeRoutes: {
      label: "Alt. Routes",
      color: "hsl(0, 84%, 60%)",
    },
    analyzedJumps: {
      label: "Analyzed Jumps",
      color: "hsl(330, 81%, 60%)",
    },
    aiAgents: {
      label: "Automations",
      color: "hsl(187, 85%, 53%)",
    },
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/50 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl animate-fade-in-up mx-2 sm:mx-0">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
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
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-green-500/20 shadow-lg">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">{totalItems}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground/60 font-medium">total items</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pb-4 sm:pb-8 px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[280px] sm:h-[340px] md:h-[380px] w-full">
          <AreaChart 
            data={data} 
            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Gradient for jumps - blue */}
              <linearGradient id="jumpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.02} />
              </linearGradient>
              
              {/* Gradient for components - green */}
              <linearGradient id="componentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.02} />
              </linearGradient>

              {/* Gradient for clarifications - orange */}
              <linearGradient id="clarificationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.02} />
              </linearGradient>

              {/* Gradient for reroutes - purple */}
              <linearGradient id="reroutesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.02} />
              </linearGradient>

              {/* Gradient for alternative routes - red */}
              <linearGradient id="alternativeRoutesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.02} />
              </linearGradient>

              {/* Gradient for analyzed jumps - pink */}
              <linearGradient id="analyzedJumpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(330, 81%, 60%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(330, 81%, 60%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(330, 81%, 60%)" stopOpacity={0.02} />
              </linearGradient>

              {/* Gradient for Automations - cyan */}
              <linearGradient id="aiAgentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.5} />
                <stop offset="40%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.02} />
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
                stroke: 'hsl(217, 91%, 60%)', 
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
            
            {/* Jumps area - blue */}
            <Area
              type="monotone"
              dataKey="jumps"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#jumpsGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(217, 91%, 60%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            
            {/* Components area - green */}
            <Area
              type="monotone"
              dataKey="components"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fill="url(#componentsGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(142, 76%, 36%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />

            {/* Clarifications area - orange */}
            <Area
              type="monotone"
              dataKey="clarifications"
              stroke="hsl(25, 95%, 53%)"
              strokeWidth={2}
              fill="url(#clarificationsGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(25, 95%, 53%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            
            {/* Reroutes area - purple */}
            <Area
              type="monotone"
              dataKey="reroutes"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              fill="url(#reroutesGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(262, 83%, 58%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />

            {/* Alternative routes area - red */}
            <Area
              type="monotone"
              dataKey="alternativeRoutes"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              fill="url(#alternativeRoutesGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(0, 84%, 60%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />

            {/* Analyzed jumps area - pink */}
            <Area
              type="monotone"
              dataKey="analyzedJumps"
              stroke="hsl(330, 81%, 60%)"
              strokeWidth={2}
              fill="url(#analyzedJumpsGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(330, 81%, 60%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />

            {/* Automations area - cyan */}
            <Area
              type="monotone"
              dataKey="aiAgents"
              stroke="hsl(187, 85%, 53%)"
              strokeWidth={2}
              fill="url(#aiAgentsGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(187, 85%, 53%)',
                filter: 'url(#softGlow)'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      
      {/* Bottom accent line with all colors */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 via-blue-500/50 via-cyan-500/50 via-pink-500/50 to-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
};
