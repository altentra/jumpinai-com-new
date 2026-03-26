-- =====================================================
-- SECURITY FIX: Correct "service role" policies that 
-- are incorrectly applied to public role
-- =====================================================

-- 1. FIX api_usage_logs - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to api_usage_logs" ON public.api_usage_logs;
CREATE POLICY "Service role full access to api_usage_logs" 
ON public.api_usage_logs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 2. FIX credit_transactions - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to credit_transactions" ON public.credit_transactions;
CREATE POLICY "Service role full access to credit_transactions" 
ON public.credit_transactions 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. FIX drip_credit_tracking - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to drip_credit_tracking" ON public.drip_credit_tracking;
CREATE POLICY "Service role full access to drip_credit_tracking" 
ON public.drip_credit_tracking 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 4. FIX feature_requests - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to feature_requests" ON public.feature_requests;
CREATE POLICY "Service role full access to feature_requests" 
ON public.feature_requests 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Also add policy for authenticated users to submit feature requests
CREATE POLICY "Authenticated users can insert feature requests"
ON public.feature_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. FIX guest_usage_tracking - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to guest_usage_tracking" ON public.guest_usage_tracking;
CREATE POLICY "Service role full access to guest_usage_tracking" 
ON public.guest_usage_tracking 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 6. FIX stt_usage_logs - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to stt_usage_logs" ON public.stt_usage_logs;
CREATE POLICY "Service role full access to stt_usage_logs" 
ON public.stt_usage_logs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 7. FIX credit_packages - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to credit_packages" ON public.credit_packages;
CREATE POLICY "Service role full access to credit_packages" 
ON public.credit_packages 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 8. FIX subscription_plans - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to subscription_plans" ON public.subscription_plans;
CREATE POLICY "Service role full access to subscription_plans" 
ON public.subscription_plans 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 9. FIX products - DROP incorrect policy, recreate with service_role
DROP POLICY IF EXISTS "Service role full access to products" ON public.products;
CREATE POLICY "Service role full access to products" 
ON public.products 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 10. OPTIONAL: Remove location/IP from public jump views by creating a safe view
-- For now, we'll keep the existing policy but note this for review

-- 11. FIX newsletter_subscribers INSERT policy - add email validation
DROP POLICY IF EXISTS "Allow public newsletter subscription" ON public.newsletter_subscribers;
CREATE POLICY "Allow public newsletter subscription"
ON public.newsletter_subscribers
FOR INSERT
TO public
WITH CHECK (
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
);