-- Create user_jumps table to store AI-generated transformation plans
CREATE TABLE public.user_jumps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_jumps ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own jumps" 
ON public.user_jumps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jumps" 
ON public.user_jumps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jumps" 
ON public.user_jumps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jumps" 
ON public.user_jumps 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_jumps_user_id ON public.user_jumps(user_id);
CREATE INDEX idx_user_jumps_profile_id ON public.user_jumps(profile_id);
CREATE INDEX idx_user_jumps_created_at ON public.user_jumps(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_jumps_updated_at
BEFORE UPDATE ON public.user_jumps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();