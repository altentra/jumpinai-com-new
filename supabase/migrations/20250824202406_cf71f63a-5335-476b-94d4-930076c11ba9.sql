-- Fix the handle_new_user function to properly extract name from Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(
      EXCLUDED.display_name,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      profiles.display_name
    ),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Update existing Google OAuth users with proper names from their user metadata
UPDATE public.profiles 
SET display_name = COALESCE(
  (auth_users.raw_user_meta_data->>'full_name'),
  (auth_users.raw_user_meta_data->>'name'),
  split_part(auth_users.email, '@', 1)
),
updated_at = now()
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
  AND profiles.display_name = auth_users.email;