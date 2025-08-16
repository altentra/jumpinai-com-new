-- Update profiles table to use text for id column instead of uuid
-- since Auth0 user IDs are not valid UUIDs

-- First, drop existing constraints and policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Change the profiles table id column from uuid to text
ALTER TABLE public.profiles ALTER COLUMN id TYPE text;

-- Update the subscribers table to use text for user_id to match
ALTER TABLE public.subscribers ALTER COLUMN user_id TYPE text;

-- Recreate the RLS policies with updated logic for Auth0
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'sub' = id);

-- Update subscribers policies to work with Auth0 
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

CREATE POLICY "select_own_subscription" 
ON public.subscribers 
FOR SELECT 
USING ((user_id = (auth.jwt() ->> 'sub')) OR (email = (auth.jwt() ->> 'email')));

CREATE POLICY "update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "insert_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'sub' = user_id);