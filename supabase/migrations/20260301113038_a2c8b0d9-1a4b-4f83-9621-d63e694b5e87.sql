-- Fix xAI/Grok to correct March 2026 data
UPDATE public.ai_model_registry 
SET latest_models = '{"flagship": "Grok 4.1", "beta": "Grok 4.2 (Agents)"}'::jsonb,
    source = 'manual_verified',
    updated_at = now()
WHERE provider = 'xAI' AND tool_name = 'Grok';

-- Also re-assert the other manual entries that got overwritten by the auto-refresh
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