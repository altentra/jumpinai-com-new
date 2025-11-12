-- Add form input fields to user_jumps table
ALTER TABLE public.user_jumps
ADD COLUMN IF NOT EXISTS form_goals TEXT,
ADD COLUMN IF NOT EXISTS form_challenges TEXT;

COMMENT ON COLUMN public.user_jumps.form_goals IS 'Original goals input from JumpinAI Studio form';
COMMENT ON COLUMN public.user_jumps.form_challenges IS 'Original challenges input from JumpinAI Studio form';