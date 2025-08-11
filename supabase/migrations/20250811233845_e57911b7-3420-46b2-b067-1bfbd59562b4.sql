-- Remove overly permissive service_role policy on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role full access (contacts)" ON public.contacts;

-- No other public policies remain; with zero policies, anon/authenticated users cannot read/write contacts
-- Edge Functions using the service role key will continue to bypass RLS safely
