-- Enable realtime for user_jumps table
ALTER TABLE public.user_jumps REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_jumps;