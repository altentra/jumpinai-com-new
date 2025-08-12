-- Harden contact_activities RLS: block public reads while keeping Edge Functions working
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- Remove any overly permissive policies if present
DROP POLICY IF EXISTS "Allow all operations on contact_activities" ON public.contact_activities;

-- Explicitly deny SELECT for anon and authenticated
DROP POLICY IF EXISTS "Restrict contact_activities data access" ON public.contact_activities;
CREATE POLICY "Restrict contact_activities data access"
ON public.contact_activities
FOR SELECT
TO anon, authenticated
USING (false);

-- Ensure service role retains full access
DROP POLICY IF EXISTS "service_role full access (contact_activities)" ON public.contact_activities;
CREATE POLICY "service_role full access (contact_activities)"
ON public.contact_activities
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);