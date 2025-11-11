-- Add tracking fields to user_jumps table
ALTER TABLE public.user_jumps
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS clarifications_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_clarification_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reroutes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tools_clicked_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS prompts_copied_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS combos_used_count integer DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_jumps_user_id_created_at ON public.user_jumps(user_id, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.user_jumps.views_count IS 'Number of times user viewed this jump in detail';
COMMENT ON COLUMN public.user_jumps.clarifications_count IS 'Number of clarifications requested for this jump';
COMMENT ON COLUMN public.user_jumps.max_clarification_level IS 'Maximum clarification depth level (1-4)';
COMMENT ON COLUMN public.user_jumps.reroutes_count IS 'Number of reroutes requested for this jump';
COMMENT ON COLUMN public.user_jumps.tools_clicked_count IS 'Number of tool links clicked in tools & prompts';
COMMENT ON COLUMN public.user_jumps.prompts_copied_count IS 'Number of prompts copied in tools & prompts';
COMMENT ON COLUMN public.user_jumps.combos_used_count IS 'Number of complete combos used (tool clicked + prompt copied)';