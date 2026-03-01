
-- Manually seed correct March 2026 model data
-- This overrides the AI-generated data with verified current models

UPDATE public.ai_model_registry 
SET latest_models = '{"flagship": "Opus 4.6", "coding": "Claude Code", "fast": "Sonnet 4.6"}'::jsonb,
    source = 'manual_verified',
    updated_at = now()
WHERE provider = 'Anthropic' AND tool_name = 'Claude';

UPDATE public.ai_model_registry 
SET latest_models = '{"flagship": "GPT-5.2", "fast": "GPT-5-mini"}'::jsonb,
    source = 'manual_verified',
    updated_at = now()
WHERE provider = 'OpenAI' AND tool_name = 'ChatGPT';

UPDATE public.ai_model_registry 
SET latest_models = '{"flagship": "Gemini 3.1 Pro", "fast": "Gemini 3.1 Flash"}'::jsonb,
    source = 'manual_verified',
    updated_at = now()
WHERE provider = 'Google' AND tool_name = 'Gemini';

UPDATE public.ai_model_registry 
SET latest_models = '{"flagship": "Grok 3"}'::jsonb,
    source = 'manual_verified',
    updated_at = now()
WHERE provider = 'xAI' AND tool_name = 'Grok';
