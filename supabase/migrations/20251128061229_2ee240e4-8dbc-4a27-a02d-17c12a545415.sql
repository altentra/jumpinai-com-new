-- Allow guest users to have tool prompts by making user_id nullable
ALTER TABLE public.user_tool_prompts 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for better query performance on jump_id for guest lookups
CREATE INDEX IF NOT EXISTS idx_user_tool_prompts_jump_id ON public.user_tool_prompts(jump_id);