-- Lock down contact_activities: remove public access to sensitive tracking data
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on contact_activities" ON public.contact_activities;

-- Grant explicit access only to service role (Edge Functions)
CREATE POLICY "service_role full access (contact_activities)"
ON public.contact_activities
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
