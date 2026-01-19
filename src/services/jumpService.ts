import { supabase } from '@/integrations/supabase/client';

export interface UserJump {
  id: string;
  user_id: string;
  profile_id: string | null;
  title: string;
  summary: string | null;
  full_content: string;
  structured_plan?: any;
  comprehensive_plan?: any;
  jump_type?: string;
  status?: string;
  completion_percentage?: number;
  views_count?: number;
  clarifications_count?: number;
  max_clarification_level?: number;
  reroutes_count?: number;
  tools_clicked_count?: number;
  prompts_copied_count?: number;
  combos_used_count?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateJumpData {
  profile_id?: string;
  title: string;
  summary?: string;
  full_content: string;
  structured_plan?: any;
  comprehensive_plan?: any;
  jump_type?: string;
  status?: string;
  completion_percentage?: number;
}

// Create a new jump
export const createJump = async (jumpData: CreateJumpData): Promise<UserJump | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create jumps');
  }

  const { data, error } = await supabase
    .from('user_jumps')
    .insert({
      user_id: user.id,
      profile_id: jumpData.profile_id || null,
      title: jumpData.title,
      summary: jumpData.summary || null,
      full_content: jumpData.full_content,
      structured_plan: jumpData.structured_plan || null,
      comprehensive_plan: jumpData.comprehensive_plan || null,
      jump_type: jumpData.jump_type || 'comprehensive',
      status: jumpData.status || 'active',
      completion_percentage: jumpData.completion_percentage || 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating jump:', error);
    throw error;
  }

  return data;
};

// Get all jumps for the current user
export const getUserJumps = async (): Promise<UserJump[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_jumps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user jumps:', error);
    throw error;
  }

  return data || [];
};

// Extended jump type with agentic implementation stats
export interface LightJumpWithAgentStats {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  jump_type?: string;
  status?: string;
  completion_percentage?: number;
  views_count?: number;
  clarifications_count?: number;
  max_clarification_level?: number;
  reroutes_count?: number;
  tools_clicked_count?: number;
  prompts_copied_count?: number;
  combos_used_count?: number;
  is_analyzed?: boolean;
  agents_count?: number;
}

// Get jumps with minimal fields for list view (optimized for performance)
export const getUserJumpsLight = async (limit?: number): Promise<LightJumpWithAgentStats[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // Fetch jumps
  let query = supabase
    .from('user_jumps')
    .select('id, title, summary, created_at, jump_type, status, completion_percentage, views_count, clarifications_count, max_clarification_level, reroutes_count, tools_clicked_count, prompts_copied_count, combos_used_count')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: jumps, error: jumpsError } = await query;

  if (jumpsError) {
    console.error('Error fetching user jumps (light):', jumpsError);
    throw jumpsError;
  }

  if (!jumps || jumps.length === 0) {
    return [];
  }

  // Get jump IDs for querying related tables
  const jumpIds = jumps.map(j => j.id);

  // Fetch analysis status for all jumps in parallel
  const [analysisResult, agentsResult] = await Promise.all([
    supabase
      .from('jump_analysis')
      .select('jump_id')
      .in('jump_id', jumpIds),
    supabase
      .from('user_agents')
      .select('jump_id')
      .in('jump_id', jumpIds)
  ]);

  // Create lookup sets/maps
  const analyzedJumpIds = new Set(analysisResult.data?.map(a => a.jump_id) || []);
  
  // Count agents per jump
  const agentsCountMap = new Map<string, number>();
  agentsResult.data?.forEach(agent => {
    const current = agentsCountMap.get(agent.jump_id) || 0;
    agentsCountMap.set(agent.jump_id, current + 1);
  });

  // Merge stats into jumps
  return jumps.map(jump => ({
    ...jump,
    is_analyzed: analyzedJumpIds.has(jump.id),
    agents_count: agentsCountMap.get(jump.id) || 0
  }));
};

// Get a specific jump by ID
export const getJumpById = async (jumpId: string): Promise<UserJump | null> => {
  const { data, error } = await supabase
    .from('user_jumps')
    .select('*')
    .eq('id', jumpId)
    .single();

  if (error) {
    console.error('Error fetching jump:', error);
    throw error;
  }

  return data;
};

// Update a jump
export const updateJump = async (jumpId: string, updates: Partial<CreateJumpData>): Promise<UserJump | null> => {
  const { data, error } = await supabase
    .from('user_jumps')
    .update(updates)
    .eq('id', jumpId)
    .select()
    .single();

  if (error) {
    console.error('Error updating jump:', error);
    throw error;
  }

  return data;
};

// Delete a jump
export const deleteJump = async (jumpId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_jumps')
    .delete()
    .eq('id', jumpId);

  if (error) {
    console.error('Error deleting jump:', error);
    throw error;
  }
};

// Extract summary from full content (first paragraph or first 200 chars)
export const extractSummary = (fullContent: string): string => {
  if (!fullContent) return '';
  
  // Try to find the first paragraph (before double newline)
  const firstParagraph = fullContent.split('\n\n')[0];
  
  // If first paragraph is reasonable length, use it
  if (firstParagraph.length > 50 && firstParagraph.length <= 300) {
    return firstParagraph.trim();
  }
  
  // Otherwise, take first 200 characters and add ellipsis
  if (fullContent.length > 200) {
    return fullContent.substring(0, 200).trim() + '...';
  }
  
  return fullContent.trim();
};

// Extract title from full content (first line or first few words)
export const extractTitle = (fullContent: string): string => {
  if (!fullContent) return 'Untitled Jump';
  
  // Try to find a header (line starting with # or ##)
  const lines = fullContent.split('\n');
  const headerLine = lines.find(line => line.match(/^#{1,3}\s+(.+)/));
  
  if (headerLine) {
    return headerLine.replace(/^#{1,3}\s+/, '').trim();
  }
  
  // Try to find first meaningful line
  const firstLine = lines.find(line => line.trim().length > 0);
  if (firstLine && firstLine.length <= 100) {
    return firstLine.trim();
  }
  
  // Extract first 50 characters as title
  const title = fullContent.substring(0, 50).trim();
  return title.length < fullContent.length ? title + '...' : title;
};
