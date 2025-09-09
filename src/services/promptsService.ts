import { supabase } from "@/integrations/supabase/client";

export interface UserPrompt {
  id: string;
  user_id: string;
  jump_id?: string;
  title: string;
  description?: string;
  prompt_text: string;
  category?: string;
  ai_tools?: string[];
  use_cases?: string[];
  instructions?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePromptData {
  title: string;
  description?: string;
  prompt_text: string;
  category?: string;
  ai_tools?: string[];
  use_cases?: string[];
  instructions?: string;
  tags?: string[];
  jump_id?: string;
}

export const promptsService = {
  async getUserPrompts(): Promise<UserPrompt[]> {
    const { data, error } = await supabase
      .from('user_prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user prompts:', error);
      throw error;
    }

    return data || [];
  },

  async getPromptById(promptId: string): Promise<UserPrompt | null> {
    const { data, error } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (error) {
      console.error('Error fetching prompt:', error);
      return null;
    }

    return data;
  },

  async createPrompt(promptData: CreatePromptData): Promise<UserPrompt | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create prompts');
    }

    const { data, error } = await supabase
      .from('user_prompts')
      .insert({
        user_id: user.id,
        ...promptData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }

    return data;
  },

  async updatePrompt(promptId: string, updates: Partial<CreatePromptData>): Promise<UserPrompt | null> {
    const { data, error } = await supabase
      .from('user_prompts')
      .update(updates)
      .eq('id', promptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }

    return data;
  },

  async deletePrompt(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('user_prompts')
      .delete()
      .eq('id', promptId);

    if (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  },

  async getPromptsByJump(jumpId: string): Promise<UserPrompt[]> {
    const { data, error } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('jump_id', jumpId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts by jump:', error);
      throw error;
    }

    return data || [];
  }
};