import { supabase } from '@/integrations/supabase/client';

// Increment view count when user views a jump
export const trackJumpView = async (jumpId: string): Promise<void> => {
  try {
    const { data: currentJump } = await supabase
      .from('user_jumps')
      .select('views_count')
      .eq('id', jumpId)
      .single();

    if (!currentJump) return;

    const newCount = (currentJump.views_count || 0) + 1;

    await supabase
      .from('user_jumps')
      .update({ views_count: newCount })
      .eq('id', jumpId);

    console.log(`✅ Tracked jump view: ${jumpId} (${newCount} views)`);
  } catch (error) {
    console.error('Error tracking jump view:', error);
  }
};

// Track clarification with level
export const trackClarification = async (
  jumpId: string,
  clarificationLevel: number
): Promise<void> => {
  try {
    const { data: currentJump } = await supabase
      .from('user_jumps')
      .select('clarifications_count, max_clarification_level')
      .eq('id', jumpId)
      .single();

    if (!currentJump) return;

    const newCount = (currentJump.clarifications_count || 0) + 1;
    const newMaxLevel = Math.max(
      currentJump.max_clarification_level || 0,
      clarificationLevel
    );

    await supabase
      .from('user_jumps')
      .update({
        clarifications_count: newCount,
        max_clarification_level: newMaxLevel
      })
      .eq('id', jumpId);

    console.log(`✅ Tracked clarification for jump ${jumpId}: Level ${clarificationLevel}`);
  } catch (error) {
    console.error('Error tracking clarification:', error);
  }
};

// Track reroute
export const trackReroute = async (jumpId: string): Promise<void> => {
  try {
    const { data: currentJump } = await supabase
      .from('user_jumps')
      .select('reroutes_count')
      .eq('id', jumpId)
      .single();

    if (!currentJump) return;

    const newCount = (currentJump.reroutes_count || 0) + 1;

    await supabase
      .from('user_jumps')
      .update({ reroutes_count: newCount })
      .eq('id', jumpId);

    console.log(`✅ Tracked reroute for jump ${jumpId}`);
  } catch (error) {
    console.error('Error tracking reroute:', error);
  }
};

// Track tool click
export const trackToolClick = async (jumpId: string): Promise<void> => {
  try {
    const { data: currentJump } = await supabase
      .from('user_jumps')
      .select('tools_clicked_count')
      .eq('id', jumpId)
      .single();

    if (!currentJump) return;

    const newCount = (currentJump.tools_clicked_count || 0) + 1;

    await supabase
      .from('user_jumps')
      .update({ tools_clicked_count: newCount })
      .eq('id', jumpId);

    console.log(`✅ Tracked tool click for jump ${jumpId}`);
  } catch (error) {
    console.error('Error tracking tool click:', error);
  }
};

// Track prompt copy
export const trackPromptCopy = async (jumpId: string): Promise<void> => {
  try {
    const { data: currentJump } = await supabase
      .from('user_jumps')
      .select('prompts_copied_count')
      .eq('id', jumpId)
      .single();

    if (!currentJump) return;

    const newCount = (currentJump.prompts_copied_count || 0) + 1;

    await supabase
      .from('user_jumps')
      .update({ prompts_copied_count: newCount })
      .eq('id', jumpId);

    console.log(`✅ Tracked prompt copy for jump ${jumpId}`);
  } catch (error) {
    console.error('Error tracking prompt copy:', error);
  }
};

// Track complete combo usage (both tool click and prompt copy)
export const trackComboUsage = async (jumpId: string): Promise<void> => {
  try {
    const { data: currentJump } = await supabase
      .from('user_jumps')
      .select('combos_used_count')
      .eq('id', jumpId)
      .single();

    if (!currentJump) return;

    const newCount = (currentJump.combos_used_count || 0) + 1;

    await supabase
      .from('user_jumps')
      .update({ combos_used_count: newCount })
      .eq('id', jumpId);

    console.log(`✅ Tracked combo usage for jump ${jumpId}`);
  } catch (error) {
    console.error('Error tracking combo usage:', error);
  }
};
