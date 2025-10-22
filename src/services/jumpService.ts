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

// Get jumps with minimal fields for list view (optimized for performance)
export const getUserJumpsLight = async (limit?: number): Promise<Pick<UserJump, 'id' | 'title' | 'summary' | 'created_at' | 'jump_type' | 'status' | 'completion_percentage'>[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  let query = supabase
    .from('user_jumps')
    .select('id, title, summary, created_at, jump_type, status, completion_percentage')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user jumps (light):', error);
    throw error;
  }

  return data || [];
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
