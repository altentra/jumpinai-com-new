import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  credits: number;
  totalJumps: number;
  totalToolPrompts: number;
  implementedJumps: number;
  implementedToolPrompts: number;
  totalClarifications: number;
  totalReroutes: number;
  totalAlternativeRoutes: number;
  totalAnalyzedJumps: number;
  totalAiAgents: number;
}

export interface ActivityData {
  date: string;
  jumps: number;
  components: number;
  clarifications: number;
  reroutes: number;
  alternativeRoutes: number;
  analyzedJumps: number;
  aiAgents: number;
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

      // Get clarifications count
      const { data: clarificationsData } = await supabase
        .from('user_jump_actions')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', 'clarify') as any;

      // Get reroutes count
      const { data: reroutesData } = await supabase
        .from('user_jump_actions')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', 'reroute') as any;

      // Get alternative routes count
      const { data: alternativeRoutesData } = await supabase
        .from('user_jump_actions')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', 'alternative_route') as any;

      // Get analyzed jumps count
      const { data: analyzedJumpsData } = await supabase
        .from('jump_analysis')
        .select('id')
        .eq('user_id', userId) as any;

      // Get AI agents count
      const { data: aiAgentsData } = await supabase
        .from('user_agents')
        .select('id')
        .eq('user_id', userId) as any;

      return {
        credits: creditsData?.credits_balance || 0,
        totalJumps: jumpsData?.length || 0,
        totalToolPrompts: toolPromptsData?.length || 0,
        implementedJumps: jumpsData?.filter((j: any) => j.implemented).length || 0,
        implementedToolPrompts: toolPromptsData?.filter((tp: any) => tp.implemented).length || 0,
        totalClarifications: clarificationsData?.length || 0,
        totalReroutes: reroutesData?.length || 0,
        totalAlternativeRoutes: alternativeRoutesData?.length || 0,
        totalAnalyzedJumps: analyzedJumpsData?.length || 0,
        totalAiAgents: aiAgentsData?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        credits: 0,
        totalJumps: 0,
        totalToolPrompts: 0,
        implementedJumps: 0,
        implementedToolPrompts: 0,
        totalClarifications: 0,
        totalReroutes: 0,
        totalAlternativeRoutes: 0,
        totalAnalyzedJumps: 0,
        totalAiAgents: 0,
      };
    }
  },

  async getActivityData(userId: string, days: number = 30): Promise<ActivityData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch all data with created_at timestamps
      const [jumpsRes, toolPromptsRes, clarificationsRes, reroutesRes, alternativeRoutesRes, analyzedJumpsRes, aiAgentsRes] = await Promise.all([
        supabase.from('user_jumps').select('created_at').eq('user_id', userId).gte('created_at', startDate.toISOString()),
        supabase.from('user_tool_prompts').select('created_at').eq('user_id', userId).gte('created_at', startDate.toISOString()),
        supabase.from('user_jump_actions').select('created_at').eq('user_id', userId).eq('action_type', 'clarify').gte('created_at', startDate.toISOString()),
        supabase.from('user_jump_actions').select('created_at').eq('user_id', userId).eq('action_type', 'reroute').gte('created_at', startDate.toISOString()),
        supabase.from('user_jump_actions').select('created_at').eq('user_id', userId).eq('action_type', 'alternative_route').gte('created_at', startDate.toISOString()),
        supabase.from('jump_analysis').select('created_at').eq('user_id', userId).gte('created_at', startDate.toISOString()),
        supabase.from('user_agents').select('created_at').eq('user_id', userId).gte('created_at', startDate.toISOString()),
      ]);

      // Create a map for all dates in range
      const dateMap = new Map<string, { jumps: number; components: number; clarifications: number; reroutes: number; alternativeRoutes: number; analyzedJumps: number; aiAgents: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dateMap.set(dateKey, { jumps: 0, components: 0, clarifications: 0, reroutes: 0, alternativeRoutes: 0, analyzedJumps: 0, aiAgents: 0 });
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

      // Count clarifications per day
      clarificationsRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.clarifications += 1;
        }
      });

      // Count reroutes per day
      reroutesRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.reroutes += 1;
        }
      });

      // Count alternative routes per day
      alternativeRoutesRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.alternativeRoutes += 1;
        }
      });

      // Count analyzed jumps per day
      analyzedJumpsRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.analyzedJumps += 1;
        }
      });

      // Count AI agents per day
      aiAgentsRes.data?.forEach(item => {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey)!.aiAgents += 1;
        }
      });

      // Convert to array and sort by date
      const activityData: ActivityData[] = Array.from(dateMap.entries())
        .map(([date, counts]) => ({
          date,
          jumps: counts.jumps,
          components: counts.components,
          clarifications: counts.clarifications,
          reroutes: counts.reroutes,
          alternativeRoutes: counts.alternativeRoutes,
          analyzedJumps: counts.analyzedJumps,
          aiAgents: counts.aiAgents,
          total: counts.jumps + counts.components + counts.clarifications + counts.reroutes + counts.alternativeRoutes + counts.analyzedJumps + counts.aiAgents,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return activityData;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      return [];
    }
  },
};