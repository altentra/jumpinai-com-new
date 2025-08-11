-- Secure contacts table: remove public access and restrict to service_role only

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy if it exists
DROP POLICY IF EXISTS "Allow all operations on contacts" ON public.contacts;

-- Create strict service_role-only policy for all operations
CREATE POLICY "service_role full access (contacts)"
ON public.contacts
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
