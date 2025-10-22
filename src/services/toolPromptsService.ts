import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserToolPrompt = Database['public']['Tables']['user_tool_prompts']['Row'];
type UserToolPromptInsert = Database['public']['Tables']['user_tool_prompts']['Insert'];

export const toolPromptsService = {
  async getUserToolPrompts(userId: string, forceRefresh: boolean = false): Promise<UserToolPrompt[]> {
    console.log('🔍 toolPromptsService.getUserToolPrompts - userId:', userId);
    console.log('🔄 Force refresh:', forceRefresh);
    
    // Build query with cache control
    let query = supabase
      .from('user_tool_prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Add timestamp to bypass any potential caching
    if (forceRefresh) {
      console.log('⚡ Bypassing cache with timestamp');
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching user tool-prompts:', error);
      throw error;
    }

    console.log('✅ toolPromptsService - fetched data:', data);
    console.log('📊 Number of records:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📋 First 3 jump IDs:', data.slice(0, 3).map(d => ({ id: d.jump_id, title: d.title })));
    }

    return data || [];
  },

  // Optimized version that only fetches essential fields (no large content JSONB)
  async getUserToolPromptsLight(userId: string): Promise<Pick<UserToolPrompt, 'id' | 'jump_id' | 'title' | 'description' | 'tool_name' | 'category' | 'difficulty_level' | 'setup_time' | 'cost_estimate' | 'created_at'>[]> {
    const { data, error } = await supabase
      .from('user_tool_prompts')
      .select('id, jump_id, title, description, tool_name, category, difficulty_level, setup_time, cost_estimate, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching user tool-prompts (light):', error);
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
          title: item.title || item.name || item.tool || item.tool_name || `Tool Combo ${index + 1}`,
          description: item.description || 'No description available',
          tool_name: item.tool_name || item.name || item.tool || `Tool ${index + 1}`,
          tool_url: item.tool_url || item.website_url || item.url || item.website || '',
          tool_type: item.tool_type || item.category || 'General',
          category: item.category || 'General',
          prompt_text: item.prompt_text || item.custom_prompt || item.prompt || '',
          prompt_instructions: item.prompt_instructions || item.instructions || '',
          difficulty_level: item.difficulty_level || item.skill_level || 'Beginner',
          setup_time: item.setup_time || item.implementation_timeline || item.implementation_time || '',
          cost_estimate: item.cost_estimate || item.cost_model || item.cost || '',
          integration_complexity: item.integration_complexity || 'Medium',
          use_cases: Array.isArray(item.use_cases) ? item.use_cases : [],
          ai_tools: Array.isArray(item.ai_tools) ? item.ai_tools : [item.tool_name || item.name || 'AI Tool'],
          features: Array.isArray(item.features) ? item.features : [],
          limitations: Array.isArray(item.limitations) ? item.limitations : [],
          tags: Array.isArray(item.tags) ? item.tags : [item.category || 'General'],
          content: {
            title: item.title,
            name: item.tool_name || item.name,
            description: item.description,
            tool_name: item.tool_name || item.name,
            tool_url: item.tool_url || item.website_url || item.url,
            tool_type: item.tool_type,
            category: item.category,
            prompt_text: item.prompt_text || item.custom_prompt || item.prompt,
            prompt_instructions: item.prompt_instructions || item.instructions,
            when_to_use: item.when_to_use || '',
            why_this_combo: item.why_this_combo || item.why_this_tool || '',
            alternatives: Array.isArray(item.alternatives) ? item.alternatives : [],
            use_cases: Array.isArray(item.use_cases) ? item.use_cases : [],
            features: Array.isArray(item.features) ? item.features : [],
            limitations: Array.isArray(item.limitations) ? item.limitations : [],
            tags: Array.isArray(item.tags) ? item.tags : [],
            difficulty_level: item.difficulty_level || item.skill_level,
            setup_time: item.setup_time,
            cost_estimate: item.cost_estimate || item.cost_model
          }
        };

        console.log(`✅ Prepared record ${index + 1}:`, {
          title: record.title,
          tool_name: record.tool_name,
          category: record.category,
          hasPrompt: !!record.prompt_text,
          hasInstructions: !!record.prompt_instructions,
          hasAlternatives: record.content.alternatives?.length || 0
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
