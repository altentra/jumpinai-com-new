import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

export interface UserProfile {
  id?: string;
  currentRole: string;
  industry: string;
  experienceLevel: string;
  aiKnowledge: string;
  goals: string;
  challenges: string;
  timeCommitment: string;
  budget: string;
}

export interface DatabaseUserProfile {
  id: string;
  user_id: string;
  profile_name: string;
  current_role_value: string | null;
  industry: string | null;
  experience_level: string | null;
  ai_knowledge: string | null;
  goals: string | null;
  challenges: string | null;
  time_commitment: string | null;
  budget: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Convert database profile to UI profile format
export const mapDatabaseToUIProfile = (dbProfile: DatabaseUserProfile): UserProfile => ({
  id: dbProfile.id,
  currentRole: dbProfile.current_role_value || '',
  industry: dbProfile.industry || '',
  experienceLevel: dbProfile.experience_level || '',
  aiKnowledge: dbProfile.ai_knowledge || '',
  goals: dbProfile.goals || '',
  challenges: dbProfile.challenges || '',
  timeCommitment: dbProfile.time_commitment || '',
  budget: dbProfile.budget || ''
});

// Convert UI profile to database format
export const mapUIToDatabaseProfile = (uiProfile: UserProfile, userId: string) => ({
  user_id: userId,
  current_role_value: uiProfile.currentRole,
  industry: uiProfile.industry,
  experience_level: uiProfile.experienceLevel,
  ai_knowledge: uiProfile.aiKnowledge,
  goals: uiProfile.goals,
  challenges: uiProfile.challenges,
  time_commitment: uiProfile.timeCommitment,
  budget: uiProfile.budget,
  is_active: true
});

export const userProfileService = {
  // Get user's active profile
  async getActiveProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    return data ? mapDatabaseToUIProfile(data) : null;
  },

  // Create new profile
  async createProfile(profile: UserProfile, userId: string): Promise<UserProfile> {
    // First, deactivate any existing active profiles
    await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([mapUIToDatabaseProfile(profile, userId)])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }

    return mapDatabaseToUIProfile(data);
  },

  // Update existing profile
  async updateProfile(profile: UserProfile, userId: string): Promise<UserProfile> {
    if (!profile.id) {
      throw new Error('Profile ID is required for updates');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(mapUIToDatabaseProfile(profile, userId))
      .eq('id', profile.id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return mapDatabaseToUIProfile(data);
  },

  // Save profile (create or update)
  async saveProfile(profile: UserProfile, userId: string): Promise<UserProfile> {
    if (profile.id) {
      return this.updateProfile(profile, userId);
    } else {
      return this.createProfile(profile, userId);
    }
  },

  // Get all profiles for user
  async getAllProfiles(userId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user profiles:', error);
      throw error;
    }

    return data.map(mapDatabaseToUIProfile);
  },

  // Delete profile
  async deleteProfile(profileId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  }
};