-- Create user_tool_prompts table for combined tools and prompts
CREATE TABLE public.user_tool_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Tool information
  tool_name TEXT,
  tool_url TEXT,
  tool_type TEXT,
  setup_time TEXT,
  cost_estimate TEXT,
  integration_complexity TEXT,
  
  -- Prompt information
  prompt_text TEXT NOT NULL,
  prompt_instructions TEXT,
  
  -- Common fields
  use_cases TEXT[],
  tags TEXT[],
  difficulty_level TEXT,
  ai_tools TEXT[],
  features TEXT[],
  limitations TEXT[],
  
  -- Store full structured content
  content JSONB,
  
  -- Metadata
  implemented BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tool_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tool prompts"
  ON public.user_tool_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tool prompts"
  ON public.user_tool_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool prompts"
  ON public.user_tool_prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tool prompts"
  ON public.user_tool_prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_tool_prompts_updated_at
  BEFORE UPDATE ON public.user_tool_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_user_tool_prompts_user_id ON public.user_tool_prompts(user_id);
CREATE INDEX idx_user_tool_prompts_jump_id ON public.user_tool_prompts(jump_id);
CREATE INDEX idx_user_tool_prompts_category ON public.user_tool_prompts(category);