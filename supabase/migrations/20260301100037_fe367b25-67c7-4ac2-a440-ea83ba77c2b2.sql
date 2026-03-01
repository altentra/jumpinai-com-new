
CREATE TABLE public.ai_model_registry (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  tool_name text NOT NULL,
  latest_models jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text NOT NULL DEFAULT 'general',
  notes text,
  source text DEFAULT 'gemini_auto',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(provider, tool_name)
);

-- RLS: readable by service role and edge functions, no public access needed
ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to ai_model_registry"
  ON public.ai_model_registry
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_ai_model_registry_updated ON public.ai_model_registry(updated_at DESC);

-- Seed with known providers (models will be auto-filled by the refresh function)
INSERT INTO public.ai_model_registry (provider, tool_name, category, latest_models, notes) VALUES
  ('Anthropic', 'Claude', 'AI Writing/Reasoning', '[]', 'Auto-updated by refresh function'),
  ('OpenAI', 'ChatGPT', 'AI Writing/Reasoning', '[]', 'Auto-updated by refresh function'),
  ('Google', 'Gemini', 'AI Writing/Reasoning', '[]', 'Auto-updated by refresh function'),
  ('xAI', 'Grok', 'AI Writing/Reasoning', '[]', 'Auto-updated by refresh function'),
  ('Midjourney', 'Midjourney', 'AI Image', '[]', 'Auto-updated by refresh function'),
  ('Runway', 'Runway', 'AI Video', '[]', 'Auto-updated by refresh function'),
  ('Cursor', 'Cursor', 'AI Code', '[]', 'Auto-updated by refresh function'),
  ('Lovable', 'Lovable', 'AI Code', '[]', 'Auto-updated by refresh function'),
  ('Manus', 'Manus', 'AI Agentic', '[]', 'Auto-updated by refresh function'),
  ('ElevenLabs', 'ElevenLabs', 'AI Audio', '[]', 'Auto-updated by refresh function'),
  ('Perplexity', 'Perplexity', 'AI Research', '[]', 'Auto-updated by refresh function'),
  ('Stability AI', 'Stable Diffusion', 'AI Image', '[]', 'Auto-updated by refresh function'),
  ('OpenAI', 'DALL-E', 'AI Image', '[]', 'Auto-updated by refresh function'),
  ('Google', 'Veo', 'AI Video', '[]', 'Auto-updated by refresh function'),
  ('OpenAI', 'Sora', 'AI Video', '[]', 'Auto-updated by refresh function'),
  ('Suno', 'Suno', 'AI Audio', '[]', 'Auto-updated by refresh function');
