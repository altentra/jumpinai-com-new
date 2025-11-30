-- Create a trigger function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, is_public)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    '@' || LOWER(REGEXP_REPLACE(
      COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      '[^a-zA-Z0-9]',
      '',
      'g'
    )),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Backfill existing users without profiles
INSERT INTO public.profiles (id, display_name, username, is_public)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  '@' || LOWER(REGEXP_REPLACE(
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    '[^a-zA-Z0-9]',
    '',
    'g'
  )) || '_' || substr(au.id::text, 1, 8),
  false
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;