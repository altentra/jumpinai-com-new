import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityData } from '@/services/dashboardStatsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

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

  return (
    <Card className="glass border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Activity Overview
        </CardTitle>
        <CardDescription>
          Last 30 days • {totalItems} total items created ({totalJumps} jumps, {totalComponents} components)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={formatDate}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="jumps"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(217, 91%, 60%)', r: 3 }}
              activeDot={{ r: 5 }}
              name="Jumps"
            />
            <Line
              type="monotone"
              dataKey="components"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(142, 71%, 45%)', r: 3 }}
              activeDot={{ r: 5 }}
              name="Components"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
