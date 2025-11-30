import { supabase } from '@/integrations/supabase/client';

export const jumpLikesService = {
  async likeJump(jumpId: string, userId: string) {
    const { data, error } = await supabase
      .from('jump_likes')
      .insert({
        jump_id: jumpId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error liking jump:', error);
      throw new Error(error.message || 'Failed to like jump');
    }
    return data;
  },

  async unlikeJump(jumpId: string, userId: string) {
    const { error } = await supabase
      .from('jump_likes')
      .delete()
      .eq('jump_id', jumpId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unliking jump:', error);
      throw new Error(error.message || 'Failed to unlike jump');
    }
  },

  async hasUserLiked(jumpId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('jump_likes')
      .select('id')
      .eq('jump_id', jumpId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking like status:', error);
      return false;
    }
    return !!data;
  },

  async getLikesCount(jumpId: string): Promise<number> {
    const { count, error } = await supabase
      .from('jump_likes')
      .select('*', { count: 'exact', head: true })
      .eq('jump_id', jumpId);

    if (error) throw error;
    return count || 0;
  }
};
