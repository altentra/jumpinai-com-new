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
    console.log('💾 STARTING saveToolPrompts with', toolPrompts.length, 'items');
    console.log('📋 Raw tool prompts data:', JSON.stringify(toolPrompts, null, 2));
    
    if (!toolPrompts || toolPrompts.length === 0) {
      console.log('⚠️ No tool prompts to save');
      return;
    }

    try {
      const toolPromptsToInsert: UserToolPromptInsert[] = toolPrompts.map((item, index) => {
        console.log(`\n🔍 Processing tool prompt ${index + 1}:`, item);
        
        // Extract fields with comprehensive fallbacks
        const record = {
          user_id: userId,
          jump_id: jumpId,
          title: item.name || item.tool || item.title || `Tool ${index + 1}`,
          description: item.description || 'No description available',
          tool_name: item.name || item.tool || item.tool_name || `Tool ${index + 1}`,
          tool_url: item.website_url || item.url || item.tool_url || item.website || '',
          tool_type: item.category || item.tool_type || 'General',
          category: item.category || 'General',
          prompt_text: item.custom_prompt || item.prompt_text || item.prompt || '',
          prompt_instructions: item.prompt_instructions || item.instructions || '',
          difficulty_level: item.skill_level || item.difficulty_level || 'Beginner',
          setup_time: item.implementation_timeline || item.implementation_time || item.setup_time || '',
          cost_estimate: item.cost_model || item.cost_estimate || item.cost || '',
          integration_complexity: item.integration_complexity || 'Medium',
          use_cases: Array.isArray(item.use_cases) ? item.use_cases : (item.when_to_use ? [item.when_to_use] : []),
          ai_tools: Array.isArray(item.ai_tools) ? item.ai_tools : [item.name || item.tool || 'AI Tool'],
          features: Array.isArray(item.features) ? item.features : [],
          limitations: Array.isArray(item.limitations) ? item.limitations : [],
          tags: Array.isArray(item.tags) ? item.tags : [item.category || 'General'],
          content: {
            name: item.name || item.tool,
            description: item.description,
            website_url: item.website_url || item.url || item.website,
            when_to_use: item.when_to_use || '',
            why_this_tool: item.why_this_tool || '',
            how_to_integrate: item.how_to_integrate || item.integration_notes || '',
            custom_prompt: item.custom_prompt || item.prompt_text || '',
            prompt_instructions: item.prompt_instructions || '',
            alternatives: Array.isArray(item.alternatives) ? item.alternatives : [],
            skill_level: item.skill_level || 'Beginner',
            cost_model: item.cost_model || item.cost || '',
            implementation_timeline: item.implementation_timeline || item.implementation_time || ''
          }
        };

        console.log(`✅ Prepared record ${index + 1}:`, {
          title: record.title,
          tool_name: record.tool_name,
          category: record.category,
          hasPrompt: !!record.prompt_text,
          hasInstructions: !!record.prompt_instructions
        });
        
        return record;
      });

      console.log('📦 Final prepared records for insertion:', toolPromptsToInsert.length);

      const { data, error } = await supabase
        .from('user_tool_prompts')
        .insert(toolPromptsToInsert)
        .select();

      if (error) {
        console.error('❌ Error saving tool prompts to database:', error);
        throw error;
      }

      console.log(`✅ Successfully saved ${data?.length || 0} tool prompts to database`);
    } catch (error) {
      console.error('❌ CRITICAL ERROR in saveToolPrompts:', error);
      throw error;
    }
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
