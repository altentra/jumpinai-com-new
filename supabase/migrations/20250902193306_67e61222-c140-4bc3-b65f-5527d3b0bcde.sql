-- Fix critical security vulnerability in orders table
-- Add user_id column for proper authentication-based access control
ALTER TABLE public.orders 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance on user_id lookups
CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- Drop the insecure email-based policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create secure user_id-based policies
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);