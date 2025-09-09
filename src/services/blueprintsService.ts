import { supabase } from "@/integrations/supabase/client";

export interface UserBlueprint {
  id: string;
  user_id: string;
  jump_id?: string;
  title: string;
  description?: string;
  blueprint_content: any;
  category?: string;
  ai_tools?: string[];
  implementation_time?: string;
  difficulty_level?: string;
  resources_needed?: string[];
  deliverables?: string[];
  instructions?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateBlueprintData {
  title: string;
  description?: string;
  blueprint_content: any;
  category?: string;
  ai_tools?: string[];
  implementation_time?: string;
  difficulty_level?: string;
  resources_needed?: string[];
  deliverables?: string[];
  instructions?: string;
  tags?: string[];
  jump_id?: string;
}

export const blueprintsService = {
  async getUserBlueprints(): Promise<UserBlueprint[]> {
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user blueprints:', error);
      throw error;
    }

    return data || [];
  },

  async getBlueprintById(blueprintId: string): Promise<UserBlueprint | null> {
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('id', blueprintId)
      .single();

    if (error) {
      console.error('Error fetching blueprint:', error);
      return null;
    }

    return data;
  },

  async createBlueprint(blueprintData: CreateBlueprintData): Promise<UserBlueprint | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create blueprints');
    }

    const { data, error } = await supabase
      .from('user_blueprints')
      .insert({
        user_id: user.id,
        ...blueprintData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blueprint:', error);
      throw error;
    }

    return data;
  },

  async updateBlueprint(blueprintId: string, updates: Partial<CreateBlueprintData>): Promise<UserBlueprint | null> {
    const { data, error } = await supabase
      .from('user_blueprints')
      .update(updates)
      .eq('id', blueprintId)
      .select()
      .single();

    if (error) {
      console.error('Error updating blueprint:', error);
      throw error;
    }

    return data;
  },

  async deleteBlueprint(blueprintId: string): Promise<void> {
    const { error } = await supabase
      .from('user_blueprints')
      .delete()
      .eq('id', blueprintId);

    if (error) {
      console.error('Error deleting blueprint:', error);
      throw error;
    }
  },

  async getBlueprintsByJump(jumpId: string): Promise<UserBlueprint[]> {
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('jump_id', jumpId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blueprints by jump:', error);
      throw error;
    }

    return data || [];
  }
};