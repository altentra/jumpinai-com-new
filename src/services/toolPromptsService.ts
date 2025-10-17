import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserToolPrompt = Database['public']['Tables']['user_tool_prompts']['Row'];
type UserToolPromptInsert = Database['public']['Tables']['user_tool_prompts']['Insert'];

export const toolPromptsService = {
  async getUserToolPrompts(userId: string): Promise<UserToolPrompt[]> {
    const { data, error } = await supabase
      .from('user_tool_prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tool-prompts:', error);
      throw error;
    }

    return data || [];
  },

  async getToolPromptsByJumpId(jumpId: string): Promise<UserToolPrompt[]> {
    const { data, error } = await supabase
      .from('user_tool_prompts')
      .select('*')
      .eq('jump_id', jumpId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tool-prompts by jump ID:', error);
      throw error;
    }

    return data || [];
  },

  async saveToolPrompt(toolPrompt: UserToolPromptInsert): Promise<UserToolPrompt> {
    const { data, error } = await supabase
      .from('user_tool_prompts')
      .insert(toolPrompt)
      .select()
      .single();

    if (error) {
      console.error('Error saving tool-prompt:', error);
      throw error;
    }

    return data;
  },

  async saveToolPrompts(toolPrompts: any[], userId: string, jumpId: string): Promise<void> {
    if (!toolPrompts || toolPrompts.length === 0) {
      console.log('⚠️ No tool prompts to save');
      return;
    }

    console.log(`💾 Saving ${toolPrompts.length} tool prompts:`, toolPrompts);

    const toolPromptsToInsert: UserToolPromptInsert[] = toolPrompts.map((item) => {
      // Extract all fields from the item, whether they're at root or nested
      const toolPromptData = {
        user_id: userId,
        jump_id: jumpId,
        title: item.title || item.name || 'AI Tool & Prompt',
        description: item.description || '',
        category: item.category || 'General',
        tool_name: item.tool_name || item.tool || '',
        tool_url: item.tool_url || item.url || '',
        tool_type: item.tool_type || item.type || '',
        setup_time: item.setup_time || '',
        cost_estimate: item.cost_estimate || item.cost || '',
        integration_complexity: item.integration_complexity || item.complexity || '',
        prompt_text: item.prompt_text || item.prompt || '',
        prompt_instructions: item.prompt_instructions || item.instructions || '',
        use_cases: item.use_cases || [],
        tags: item.tags || [],
        difficulty_level: item.difficulty_level || item.difficulty || 'medium',
        ai_tools: item.ai_tools || [],
        features: item.features || [],
        limitations: item.limitations || [],
        content: item // Store the complete original object
      };

      console.log('📝 Formatted tool prompt:', toolPromptData.title);
      return toolPromptData;
    });

    const { data, error } = await supabase
      .from('user_tool_prompts')
      .insert(toolPromptsToInsert)
      .select();

    if (error) {
      console.error('❌ Error saving tool-prompts:', error);
      throw error;
    }

    console.log(`✅ Successfully saved ${data?.length || 0} tool prompts`);
  },

  async updateToolPrompt(id: string, updates: Partial<UserToolPromptInsert>): Promise<UserToolPrompt> {
    const { data, error } = await supabase
      .from('user_tool_prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tool-prompt:', error);
      throw error;
    }

    return data;
  },

  async deleteToolPrompt(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_tool_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tool-prompt:', error);
      throw error;
    }
  }
};
