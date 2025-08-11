-- Secure orders table: remove any broad access and restrict to service role + per-user select
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Replace permissive service role policy with role-scoped one
DROP POLICY IF EXISTS "Service role full access to orders" ON public.orders;

CREATE POLICY "service_role full access (orders)"
ON public.orders
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure per-user SELECT policy exists (kept if already there)
-- If it doesn't exist, create it now
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'orders' 
      AND policyname = 'Users can view their own orders'
  ) THEN
    CREATE POLICY "Users can view their own orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (user_email = (auth.jwt() ->> 'email'));
  END IF;
END$$;
