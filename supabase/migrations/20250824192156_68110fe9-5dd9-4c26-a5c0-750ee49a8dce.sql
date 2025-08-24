-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profile for your existing user
INSERT INTO public.profiles (id, display_name, avatar_url, created_at)
VALUES (
  '15f998db-b78c-49fa-a17d-c2f77bb16965',
  'info@vistaready.com',
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;