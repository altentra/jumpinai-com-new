import { supabase } from '@/integrations/supabase/client';

export const markJumpAsUsingSTT = async (jumpId: string) => {
  try {
    const { error } = await supabase
      .from('user_jumps')
      .update({ stt_used: true })
      .eq('id', jumpId);

    if (error) {
      console.error('Failed to mark jump as using STT:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking jump as using STT:', error);
    return false;
  }
};
