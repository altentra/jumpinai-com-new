-- Add structured_plan field to user_jumps table to store JSON format
ALTER TABLE public.user_jumps 
ADD COLUMN structured_plan JSONB;