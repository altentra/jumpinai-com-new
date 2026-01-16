import { supabase } from '@/integrations/supabase/client';

export interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
}

export const profileService = {
  // Get profile by user ID
  async getProfileByUserId(userId: string): Promise<ProfileData | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  // Get public profile by username
  async getProfileByUsername(username: string): Promise<ProfileData | null> {
    // Ensure username starts with @
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', formattedUsername)
      .eq('is_public', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      console.error('Error fetching public profile:', error);
      throw error;
    }

    return data;
  },

  // Update profile
  async updateProfile(userId: string, updates: {
    username?: string;
    display_name?: string;
    bio?: string;
    is_public?: boolean;
  }): Promise<ProfileData> {
    // Format username if provided
    if (updates.username && !updates.username.startsWith('@')) {
      updates.username = `@${updates.username}`;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  },

  // Get user's private jumps
  async getPrivateJumps(userId: string) {
    const { data, error } = await supabase
      .from('user_jumps')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching private jumps:', error);
      throw error;
    }

    return data;
  },

  // Get user's public jumps (uses secure view that hides IP/location)
  async getPublicJumps(userId: string) {
    const { data, error } = await supabase
      .from('public_jumps_safe')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public jumps:', error);
      throw error;
    }

    return data;
  },

  // Get public jumps by username (for public profile view - uses secure view)
  async getPublicJumpsByUsername(username: string) {
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    
    // First get the user ID from username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', formattedUsername)
      .eq('is_public', true)
      .single();

    if (!profile) return [];

    // Use secure view that hides IP addresses and masks location
    const { data, error } = await supabase
      .from('public_jumps_safe')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public jumps:', error);
      throw error;
    }

    return data;
  },

  // Toggle jump visibility
  async toggleJumpVisibility(jumpId: string, isPublic: boolean) {
    const { data, error } = await supabase
      .from('user_jumps')
      .update({ is_public: isPublic })
      .eq('id', jumpId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling jump visibility:', error);
      throw error;
    }

    return data;
  },

  // Check username availability
  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', formattedUsername);

    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    const { data } = await query.maybeSingle();
    
    return !data; // Available if no data found
  }
};