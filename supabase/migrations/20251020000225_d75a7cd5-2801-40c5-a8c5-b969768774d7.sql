-- Drop old user_tools table (replaced by user_tool_prompts)
DROP TABLE IF EXISTS public.user_tools CASCADE;

-- Drop old user_prompts table (replaced by user_tool_prompts)
DROP TABLE IF EXISTS public.user_prompts CASCADE;