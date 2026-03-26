-- Add STT duration tracking columns to user_jumps
ALTER TABLE public.user_jumps
ADD COLUMN IF NOT EXISTS goals_stt_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenges_stt_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS input_method text DEFAULT 'typed';

-- Add comment for documentation
COMMENT ON COLUMN public.user_jumps.goals_stt_seconds IS 'Seconds spent using speech-to-text for goals input';
COMMENT ON COLUMN public.user_jumps.challenges_stt_seconds IS 'Seconds spent using speech-to-text for challenges input';
COMMENT ON COLUMN public.user_jumps.input_method IS 'Input method used: typed, narrated, or mixed';