import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserTool = Database['public']['Tables']['user_tools']['Row'];
type UserToolInsert = Database['public']['Tables']['user_tools']['Insert'];

export const toolsService = {
  async getUserTools(userId: string): Promise<UserTool[]> {
    const { data, error } = await supabase
      .from('user_tools')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tools:', error);
      throw error;
    }

    return data || [];
  },

  async getToolsByJumpId(jumpId: string): Promise<UserTool[]> {
    const { data, error } = await supabase
      .from('user_tools')
      .select('*')
      .eq('jump_id', jumpId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tools by jump ID:', error);
      throw error;
    }

    return data || [];
  },

  async saveTool(tool: UserToolInsert): Promise<UserTool> {
    const { data, error } = await supabase
      .from('user_tools')
      .insert(tool)
      .select()
      .single();

    if (error) {
      console.error('Error saving tool:', error);
      throw error;
    }

    return data;
  },

  async saveTools(tools: any[], userId: string, jumpId: string): Promise<void> {
    if (!tools || tools.length === 0) return;

    const toolsToInsert: UserToolInsert[] = tools.map((tool) => ({
      user_id: userId,
      jump_id: jumpId,
      title: tool.name || tool.title || 'AI Tool',
      description: tool.description || '',
      category: tool.category || 'AI Tool',
      ai_tool_type: tool.type || 'general',
      use_cases: tool.use_cases || tool.useCases || [],
      instructions: tool.instructions || '',
      tags: tool.tags || [],
      difficulty_level: tool.difficulty || tool.difficultyLevel || 'medium',
      setup_time: tool.setup_time || tool.setupTime || '',
      integration_complexity: tool.complexity || tool.integrationComplexity || 'medium',
      cost_estimate: tool.cost || tool.costEstimate || '',
      features: tool.features || [],
      limitations: tool.limitations || [],
      tool_content: tool
    }));

    const { error } = await supabase
      .from('user_tools')
      .insert(toolsToInsert);

    if (error) {
      console.error('Error saving tools:', error);
      throw error;
    }
  },

  async updateTool(id: string, updates: Partial<UserToolInsert>): Promise<UserTool> {
    const { data, error } = await supabase
      .from('user_tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tool:', error);
      throw error;
    }

    return data;
  },

  async deleteTool(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_tools')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tool:', error);
      throw error;
    }
  }
};