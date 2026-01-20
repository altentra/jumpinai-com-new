-- Add automation_type column to user_agents table to differentiate between workflows and AI agents
ALTER TABLE public.user_agents 
ADD COLUMN IF NOT EXISTS automation_type TEXT DEFAULT 'workflow';

-- Add a comment to explain the column
COMMENT ON COLUMN public.user_agents.automation_type IS 'Type of automation: workflow (simple task automation) or ai-agent (autonomous decision-making)';