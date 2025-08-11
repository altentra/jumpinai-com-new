-- Add explicit restrictive RLS policies for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Deny SELECT for anon and authenticated roles explicitly
DROP POLICY IF EXISTS "Restrict contacts data access" ON public.contacts;
CREATE POLICY "Restrict contacts data access"
ON public.contacts
FOR SELECT
TO anon, authenticated
USING (false);

-- Grant full access to service_role (for Edge Functions only)
DROP POLICY IF EXISTS "service_role full access (contacts)" ON public.contacts;
CREATE POLICY "service_role full access (contacts)"
ON public.contacts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
