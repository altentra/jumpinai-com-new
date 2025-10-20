import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  credits: number;
  totalJumps: number;
  totalToolPrompts: number;
  implementedJumps: number;
  implementedToolPrompts: number;
}

export interface ActivityData {
  date: string;
  jumps: number;
  components: number;
  total: number;
}

export const dashboardStatsService = {
  async getStats(userId: string): Promise<DashboardStats> {
    try {
      // Get credits
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', userId)
        .single();

      // Get jumps count and implemented count
      const { data: jumpsData } = await supabase
        .from('user_jumps')
        .select('id, implemented')
        .eq('user_id', userId) as any;

      // Get tool prompts count and implemented count
      const { data: toolPromptsData } = await supabase
        .from('user_tool_prompts')
        .select('id, implemented')
        .eq('user_id', userId) as any;

      return {
        credits: creditsData?.credits_balance || 0,
        totalJumps: jumpsData?.length || 0,
        totalToolPrompts: toolPromptsData?.length || 0,
        implementedJumps: jumpsData?.filter((j: any) => j.implemented).length || 0,
        implementedToolPrompts: toolPromptsData?.filter((tp: any) => tp.implemented).length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        credits: 0,
        totalJumps: 0,
        totalToolPrompts: 0,
        implementedJumps: 0,
        implementedToolPrompts: 0,
      };
    }
  },

  async getActivityData(userId: string, days: number = 30): Promise<ActivityData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch all data with created_at timestamps
      const [jumpsRes, toolPromptsRes] = await Promise.all([
        supabase.from('user_jumps').select('created_at').eq('user_id', userId).gte('created_at', startDate.toISOString()),
        supabase.from('user_tool_prompts').select('created_at').eq('user_id', userId).gte('created_at', startDate.toISOString()),
      ]);

      // Create a map for all dates in range
      const dateMap = new Map<string, { jumps: number; components: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dateMap.set(dateKey, { jumps: 0, components: 0 });
      }

      // Count jumps per day
      jumpsRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.jumps += 1;
        }
      });

      // Count tool-prompts per day
      toolPromptsRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.components += 1;
        }
      });

      // Convert to array and sort by date
      const activityData: ActivityData[] = Array.from(dateMap.entries())
        .map(([date, counts]) => ({
          date,
          jumps: counts.jumps,
          components: counts.components,
          total: counts.jumps + counts.components,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return activityData;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      return [];
    }
  },
};