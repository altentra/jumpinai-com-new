-- Update RLS policy to allow access by user_id OR email (for backward compatibility)
-- Drop the current policy first
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create a more flexible policy that allows access by user_id OR email
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR (user_email = (auth.jwt() ->> 'email'::text) AND auth.uid() IS NOT NULL)
);

-- Update the UPDATE policy as well
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR (user_email = (auth.jwt() ->> 'email'::text) AND auth.uid() IS NOT NULL)
);