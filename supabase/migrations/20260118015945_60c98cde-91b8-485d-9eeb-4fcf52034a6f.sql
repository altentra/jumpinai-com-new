-- Create table for storing jump analysis results
CREATE TABLE public.jump_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID NOT NULL REFERENCES public.user_jumps(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  overall_potential TEXT,
  opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, jump_id)
);

-- Create table for storing built AI agents/workflows
CREATE TABLE public.user_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID NOT NULL REFERENCES public.user_jumps(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.jump_analysis(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  automation_target TEXT,
  impact_level TEXT,
  complexity_level TEXT,
  estimated_time_saved TEXT,
  required_tools TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  workflow_json JSONB NOT NULL,
  workflow_filename TEXT,
  detailed_instructions JSONB,
  platform TEXT DEFAULT 'n8n',
  status TEXT DEFAULT 'active',
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.jump_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- RLS policies for jump_analysis
CREATE POLICY "Users can view their own analysis"
ON public.jump_analysis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis"
ON public.jump_analysis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis"
ON public.jump_analysis
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis"
ON public.jump_analysis
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_agents
CREATE POLICY "Users can view their own agents"
ON public.user_agents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
ON public.user_agents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
ON public.user_agents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
ON public.user_agents
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_jump_analysis_updated_at
BEFORE UPDATE ON public.jump_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_agents_updated_at
BEFORE UPDATE ON public.user_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_jump_analysis_user_id ON public.jump_analysis(user_id);
CREATE INDEX idx_jump_analysis_jump_id ON public.jump_analysis(jump_id);
CREATE INDEX idx_user_agents_user_id ON public.user_agents(user_id);
CREATE INDEX idx_user_agents_jump_id ON public.user_agents(jump_id);
CREATE INDEX idx_user_agents_status ON public.user_agents(status);