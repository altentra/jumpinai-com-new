-- Create tables for the 4 major Jump components

-- User Prompts table
CREATE TABLE public.user_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category TEXT,
  ai_tools TEXT[], -- Array of recommended AI tools
  use_cases TEXT[], -- Array of use cases
  instructions TEXT, -- How to use instructions
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Workflows table  
CREATE TABLE public.user_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  workflow_steps JSONB NOT NULL, -- Array of workflow steps
  category TEXT,
  ai_tools TEXT[], -- Array of recommended AI tools
  duration_estimate TEXT, -- Estimated time to complete
  complexity_level TEXT, -- beginner, intermediate, advanced
  prerequisites TEXT[], -- What's needed before starting
  expected_outcomes TEXT[], -- What results to expect
  instructions TEXT, -- How to implement
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Blueprints table
CREATE TABLE public.user_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  blueprint_content JSONB NOT NULL, -- Structured blueprint data
  category TEXT,
  ai_tools TEXT[], -- Array of recommended AI tools
  implementation_time TEXT, -- Time needed to implement
  difficulty_level TEXT, -- beginner, intermediate, advanced
  resources_needed TEXT[], -- Required resources
  deliverables TEXT[], -- What will be created
  instructions TEXT, -- Implementation guide
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Strategies table
CREATE TABLE public.user_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jump_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  strategy_framework JSONB NOT NULL, -- Structured strategy data
  category TEXT,
  ai_tools TEXT[], -- Array of recommended AI tools
  timeline TEXT, -- Implementation timeline
  success_metrics TEXT[], -- How to measure success
  key_actions TEXT[], -- Main action items
  potential_challenges TEXT[], -- Possible obstacles
  mitigation_strategies TEXT[], -- How to overcome challenges
  instructions TEXT, -- How to execute
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strategies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_prompts
CREATE POLICY "Users can view their own prompts" 
ON public.user_prompts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts" 
ON public.user_prompts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" 
ON public.user_prompts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" 
ON public.user_prompts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_workflows
CREATE POLICY "Users can view their own workflows" 
ON public.user_workflows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" 
ON public.user_workflows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
ON public.user_workflows 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
ON public.user_workflows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_blueprints
CREATE POLICY "Users can view their own blueprints" 
ON public.user_blueprints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blueprints" 
ON public.user_blueprints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blueprints" 
ON public.user_blueprints 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blueprints" 
ON public.user_blueprints 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_strategies
CREATE POLICY "Users can view their own strategies" 
ON public.user_strategies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies" 
ON public.user_strategies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
ON public.user_strategies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
ON public.user_strategies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_prompts_updated_at
BEFORE UPDATE ON public.user_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_workflows_updated_at
BEFORE UPDATE ON public.user_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_blueprints_updated_at
BEFORE UPDATE ON public.user_blueprints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_strategies_updated_at
BEFORE UPDATE ON public.user_strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key reference to user_jumps table if needed
ALTER TABLE public.user_prompts ADD CONSTRAINT fk_user_prompts_jump_id 
FOREIGN KEY (jump_id) REFERENCES public.user_jumps(id) ON DELETE SET NULL;

ALTER TABLE public.user_workflows ADD CONSTRAINT fk_user_workflows_jump_id 
FOREIGN KEY (jump_id) REFERENCES public.user_jumps(id) ON DELETE SET NULL;

ALTER TABLE public.user_blueprints ADD CONSTRAINT fk_user_blueprints_jump_id 
FOREIGN KEY (jump_id) REFERENCES public.user_jumps(id) ON DELETE SET NULL;

ALTER TABLE public.user_strategies ADD CONSTRAINT fk_user_strategies_jump_id 
FOREIGN KEY (jump_id) REFERENCES public.user_jumps(id) ON DELETE SET NULL;