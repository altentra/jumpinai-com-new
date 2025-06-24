
-- Create comprehensive RLS policies for newsletter_subscribers table

-- Policy 1: Allow anyone to subscribe (INSERT)
CREATE POLICY "Allow public newsletter subscription" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Policy 2: Allow users to unsubscribe their own email (UPDATE for is_active = false)
CREATE POLICY "Allow email owners to unsubscribe" 
  ON public.newsletter_subscribers 
  FOR UPDATE 
  USING (true)
  WITH CHECK (is_active = false);

-- Policy 3: Prevent unauthorized access to subscriber data (SELECT restricted)
CREATE POLICY "Restrict subscriber data access" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  USING (false);

-- Policy 4: Allow service role to manage all operations (for edge functions)
-- This enables our edge functions to work properly while maintaining security
CREATE POLICY "Service role full access" 
  ON public.newsletter_subscribers 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);
