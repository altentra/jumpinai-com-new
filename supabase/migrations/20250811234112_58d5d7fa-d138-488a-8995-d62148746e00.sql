-- Secure lead_magnet_downloads: remove public read access
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive public select policy
DROP POLICY IF EXISTS "Public access to download public PDFs" ON public.lead_magnet_downloads;

-- With no policies, anon/authenticated clients cannot read/write; Edge Functions using service role remain unaffected
