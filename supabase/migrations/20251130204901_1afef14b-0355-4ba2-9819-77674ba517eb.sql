-- Add profile fields for username, bio, and privacy settings
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE,
ADD COLUMN bio text,
ADD COLUMN is_public boolean DEFAULT true;

-- Create index on username for fast lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Add is_public field to user_jumps for public/private jump tracking
ALTER TABLE public.user_jumps
ADD COLUMN is_public boolean DEFAULT false;

-- Create index on is_public for efficient filtering
CREATE INDEX idx_user_jumps_is_public ON public.user_jumps(is_public, user_id);

-- Function to generate default username from profile
CREATE OR REPLACE FUNCTION generate_default_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  -- Generate base username from display_name or email
  IF NEW.display_name IS NOT NULL THEN
    base_username := lower(regexp_replace(NEW.display_name, '[^a-zA-Z0-9]', '', 'g'));
  ELSE
    base_username := lower(split_part(NEW.id::text, '-', 1));
  END IF;
  
  -- Ensure username starts with @
  base_username := '@' || base_username;
  final_username := base_username;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != NEW.id) LOOP
    final_username := base_username || counter;
    counter := counter + 1;
  END LOOP;
  
  NEW.username := final_username;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate username if not provided
CREATE TRIGGER generate_username_on_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.username IS NULL)
EXECUTE FUNCTION generate_default_username();

-- Update existing profiles with default usernames
DO $$
DECLARE
  profile_record RECORD;
  base_username text;
  final_username text;
  counter integer;
BEGIN
  FOR profile_record IN SELECT id, display_name FROM public.profiles WHERE username IS NULL LOOP
    IF profile_record.display_name IS NOT NULL THEN
      base_username := '@' || lower(regexp_replace(profile_record.display_name, '[^a-zA-Z0-9]', '', 'g'));
    ELSE
      base_username := '@' || lower(split_part(profile_record.id::text, '-', 1));
    END IF;
    
    final_username := base_username;
    counter := 1;
    
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      final_username := base_username || counter;
      counter := counter + 1;
    END LOOP;
    
    UPDATE public.profiles SET username = final_username WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Add RLS policy for public profile viewing
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (is_public = true);

-- Add RLS policy for public jumps viewing
CREATE POLICY "Public jumps are viewable by everyone"
ON public.user_jumps
FOR SELECT
USING (is_public = true);