import { supabase } from '@/integrations/supabase/client';

export const jumpLikesService = {
  async likeJump(jumpId: string, userId: string) {
    const { error } = await supabase
      .from('jump_likes')
      .insert({
        jump_id: jumpId,
        user_id: userId
      });

    if (error) throw error;
  },

  async unlikeJump(jumpId: string, userId: string) {
    const { error } = await supabase
      .from('jump_likes')
      .delete()
      .match({
        jump_id: jumpId,
        user_id: userId
      });

    if (error) throw error;
  },

  async hasUserLiked(jumpId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('jump_likes')
      .select('id')
      .match({
        jump_id: jumpId,
        user_id: userId
      })
      .single();

    if (error && error.code !== 'PGRST116') throw error;
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
