import { supabase } from "@/integrations/supabase/client";

export interface UserWorkflow {
  id: string;
  user_id: string;
  jump_id?: string;
  title: string;
  description?: string;
  workflow_steps: any;
  category?: string;
  ai_tools?: string[];
  duration_estimate?: string;
  complexity_level?: string;
  prerequisites?: string[];
  expected_outcomes?: string[];
  instructions?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateWorkflowData {
  title: string;
  description?: string;
  workflow_steps: any;
  category?: string;
  ai_tools?: string[];
  duration_estimate?: string;
  complexity_level?: string;
  prerequisites?: string[];
  expected_outcomes?: string[];
  instructions?: string;
  tags?: string[];
  jump_id?: string;
}

export const workflowsService = {
  async getUserWorkflows(): Promise<UserWorkflow[]> {
    const { data, error } = await supabase
      .from('user_workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user workflows:', error);
      throw error;
    }

    return data || [];
  },

  async getWorkflowById(workflowId: string): Promise<UserWorkflow | null> {
    const { data, error } = await supabase
      .from('user_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }

    return data;
  },

  async createWorkflow(workflowData: CreateWorkflowData): Promise<UserWorkflow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create workflows');
    }

    const { data, error } = await supabase
      .from('user_workflows')
      .insert({
        user_id: user.id,
        ...workflowData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }

    return data;
  },

  async updateWorkflow(workflowId: string, updates: Partial<CreateWorkflowData>): Promise<UserWorkflow | null> {
    const { data, error } = await supabase
      .from('user_workflows')
      .update(updates)
      .eq('id', workflowId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }

    return data;
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    const { error } = await supabase
      .from('user_workflows')
      .delete()
      .eq('id', workflowId);

    if (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  },

  async getWorkflowsByJump(jumpId: string): Promise<UserWorkflow[]> {
    const { data, error } = await supabase
      .from('user_workflows')
      .select('*')
      .eq('jump_id', jumpId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows by jump:', error);
      throw error;
    }

    return data || [];
  }
};