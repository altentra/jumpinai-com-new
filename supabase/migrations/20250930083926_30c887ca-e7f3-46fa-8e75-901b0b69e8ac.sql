-- Add implemented tracking to all user content tables

-- Add implemented column to user_jumps
ALTER TABLE public.user_jumps 
ADD COLUMN IF NOT EXISTS implemented boolean DEFAULT false;

-- Add implemented column to user_tools
ALTER TABLE public.user_tools 
ADD COLUMN IF NOT EXISTS implemented boolean DEFAULT false;

-- Add implemented column to user_prompts
ALTER TABLE public.user_prompts 
ADD COLUMN IF NOT EXISTS implemented boolean DEFAULT false;

-- Add implemented column to user_workflows
ALTER TABLE public.user_workflows 
ADD COLUMN IF NOT EXISTS implemented boolean DEFAULT false;

-- Add implemented column to user_blueprints
ALTER TABLE public.user_blueprints 
ADD COLUMN IF NOT EXISTS implemented boolean DEFAULT false;

-- Add implemented column to user_strategies
ALTER TABLE public.user_strategies 
ADD COLUMN IF NOT EXISTS implemented boolean DEFAULT false;

COMMENT ON COLUMN public.user_jumps.implemented IS 'Tracks whether the user has implemented this jump';
COMMENT ON COLUMN public.user_tools.implemented IS 'Tracks whether the user has implemented this tool';
COMMENT ON COLUMN public.user_prompts.implemented IS 'Tracks whether the user has implemented this prompt';
COMMENT ON COLUMN public.user_workflows.implemented IS 'Tracks whether the user has implemented this workflow';
COMMENT ON COLUMN public.user_blueprints.implemented IS 'Tracks whether the user has implemented this blueprint';
COMMENT ON COLUMN public.user_strategies.implemented IS 'Tracks whether the user has implemented this strategy';