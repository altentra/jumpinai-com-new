-- Create table to track user actions (clarify and reroute)
CREATE TABLE public.user_jump_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID REFERENCES public.user_jumps(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('clarify', 'reroute')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_jump_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own actions"
ON public.user_jump_actions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own actions"
ON public.user_jump_actions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_jump_actions_user_id ON public.user_jump_actions(user_id);
CREATE INDEX idx_user_jump_actions_action_type ON public.user_jump_actions(action_type);