-- Create user_tools table following the same pattern as other component tables
CREATE TABLE public.user_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID,
  tool_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  ai_tool_type TEXT,
  use_cases TEXT[],
  instructions TEXT,
  tags TEXT[],
  difficulty_level TEXT,
  setup_time TEXT,
  integration_complexity TEXT,
  cost_estimate TEXT,
  features TEXT[],
  limitations TEXT[]
);

-- Enable Row Level Security
ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_tools (same pattern as other component tables)
CREATE POLICY "Users can view their own tools"
ON public.user_tools
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tools"
ON public.user_tools
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tools"
ON public.user_tools
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tools"
ON public.user_tools
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_tools_updated_at
BEFORE UPDATE ON public.user_tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();