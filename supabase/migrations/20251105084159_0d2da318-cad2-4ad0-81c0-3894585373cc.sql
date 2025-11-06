-- Fix RLS policy on user_credits to prevent data exposure
-- Drop the existing overly permissive service role policy and ensure strict user-scoped access

-- Drop the service role policy that allows unrestricted access
DROP POLICY IF EXISTS "Service role full access to user_credits" ON public.user_credits;

-- Verify the user-scoped SELECT policy is correct (should already exist)
-- If it doesn't exist or is incorrect, recreate it
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Recreate service role policy with explicit service role check
-- This prevents authenticated users from seeing all credits while allowing service role operations
CREATE POLICY "Service role full access to user_credits"
ON public.user_credits
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);