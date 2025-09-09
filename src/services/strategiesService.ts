import { supabase } from "@/integrations/supabase/client";

export interface UserStrategy {
  id: string;
  user_id: string;
  jump_id?: string;
  title: string;
  description?: string;
  strategy_framework: any;
  category?: string;
  ai_tools?: string[];
  timeline?: string;
  success_metrics?: string[];
  key_actions?: string[];
  potential_challenges?: string[];
  mitigation_strategies?: string[];
  instructions?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateStrategyData {
  title: string;
  description?: string;
  strategy_framework: any;
  category?: string;
  ai_tools?: string[];
  timeline?: string;
  success_metrics?: string[];
  key_actions?: string[];
  potential_challenges?: string[];
  mitigation_strategies?: string[];
  instructions?: string;
  tags?: string[];
  jump_id?: string;
}

export const strategiesService = {
  async getUserStrategies(): Promise<UserStrategy[]> {
    const { data, error } = await supabase
      .from('user_strategies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user strategies:', error);
      throw error;
    }

    return data || [];
  },

  async getStrategyById(strategyId: string): Promise<UserStrategy | null> {
    const { data, error } = await supabase
      .from('user_strategies')
      .select('*')
      .eq('id', strategyId)
      .single();

    if (error) {
      console.error('Error fetching strategy:', error);
      return null;
    }

    return data;
  },

  async createStrategy(strategyData: CreateStrategyData): Promise<UserStrategy | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create strategies');
    }

    const { data, error } = await supabase
      .from('user_strategies')
      .insert({
        user_id: user.id,
        ...strategyData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating strategy:', error);
      throw error;
    }

    return data;
  },

  async updateStrategy(strategyId: string, updates: Partial<CreateStrategyData>): Promise<UserStrategy | null> {
    const { data, error } = await supabase
      .from('user_strategies')
      .update(updates)
      .eq('id', strategyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating strategy:', error);
      throw error;
    }

    return data;
  },

  async deleteStrategy(strategyId: string): Promise<void> {
    const { error } = await supabase
      .from('user_strategies')
      .delete()
      .eq('id', strategyId);

    if (error) {
      console.error('Error deleting strategy:', error);
      throw error;
    }
  },

  async getStrategiesByJump(jumpId: string): Promise<UserStrategy[]> {
    const { data, error } = await supabase
      .from('user_strategies')
      .select('*')
      .eq('jump_id', jumpId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching strategies by jump:', error);
      throw error;
    }

    return data || [];
  }
};