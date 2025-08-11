-- Harden newsletter_subscribers RLS to prevent public reads and conflicting policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Remove conflicting/overly-permissive policies
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow email owners to unsubscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service role full access" ON public.newsletter_subscribers;

-- Ensure explicit deny-read policy for anon/authenticated roles
DROP POLICY IF EXISTS "Restrict subscriber data access" ON public.newsletter_subscribers;
CREATE POLICY "Restrict subscriber data access"
ON public.newsletter_subscribers
FOR SELECT
TO anon, authenticated
USING (false);

-- Provide explicit service role full access (for Edge Functions only)
CREATE POLICY "service_role full access (newsletter_subscribers)"
ON public.newsletter_subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Keep existing public INSERT policy (Allow public newsletter subscription) for signups
-- If it doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers' AND policyname = 'Allow public newsletter subscription'
  ) THEN
    CREATE POLICY "Allow public newsletter subscription"
    ON public.newsletter_subscribers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
  END IF;
END$$;