-- Fix user_blueprints table schema by adding missing columns
ALTER TABLE user_blueprints 
ADD COLUMN IF NOT EXISTS implementation text;

-- Also ensure the AI coach function can properly save all data
ALTER TABLE user_blueprints 
ADD COLUMN IF NOT EXISTS requirements text[],
ADD COLUMN IF NOT EXISTS tools_used text[];

-- Check if any other component tables need similar fixes
ALTER TABLE user_workflows 
ADD COLUMN IF NOT EXISTS tools_needed text[],
ADD COLUMN IF NOT EXISTS skill_level text;

ALTER TABLE user_strategies 
ADD COLUMN IF NOT EXISTS priority_level text,
ADD COLUMN IF NOT EXISTS resource_requirements text[];

ALTER TABLE user_prompts 
ADD COLUMN IF NOT EXISTS difficulty text,
ADD COLUMN IF NOT EXISTS estimated_time text;