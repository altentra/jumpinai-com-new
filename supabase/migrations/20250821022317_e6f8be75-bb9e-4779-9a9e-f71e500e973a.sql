-- Remove foreign key constraint from profiles table since we're using Auth0, not Supabase auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Also remove any triggers that reference auth.users since we're using Auth0
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;