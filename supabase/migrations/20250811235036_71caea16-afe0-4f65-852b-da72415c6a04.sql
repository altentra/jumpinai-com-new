-- Add explicit restrictive RLS policies for lead_magnet_downloads to prevent unauthorized access
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

-- Deny SELECT for anon and authenticated (explicitly)
DROP POLICY IF EXISTS "Restrict download data access" ON public.lead_magnet_downloads;
CREATE POLICY "Restrict download data access"
ON public.lead_magnet_downloads
FOR SELECT
TO anon, authenticated
USING (false);

-- Grant full access to service_role for edge functions
DROP POLICY IF EXISTS "service_role full access (lead_magnet_downloads)" ON public.lead_magnet_downloads;
CREATE POLICY "service_role full access (lead_magnet_downloads)"
ON public.lead_magnet_downloads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
