-- Update user_jumps table to support comprehensive jump structure
ALTER TABLE user_jumps 
ADD COLUMN IF NOT EXISTS comprehensive_plan jsonb,
ADD COLUMN IF NOT EXISTS jump_type text DEFAULT 'comprehensive',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0;

-- Add comments for the new structure
COMMENT ON COLUMN user_jumps.comprehensive_plan IS 'Complete structured plan with overview, analysis, action plan, tools, workflows, and metrics';
COMMENT ON COLUMN user_jumps.jump_type IS 'Type of jump: basic, comprehensive, or advanced';
COMMENT ON COLUMN user_jumps.status IS 'Status: active, completed, paused, archived';
COMMENT ON COLUMN user_jumps.completion_percentage IS 'Percentage of jump plan completed (0-100)';

-- Update the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;