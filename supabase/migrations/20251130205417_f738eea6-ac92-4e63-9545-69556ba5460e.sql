-- Change default privacy setting to private for all profiles
ALTER TABLE public.profiles
ALTER COLUMN is_public SET DEFAULT false;

-- Update all existing profiles to be private by default
UPDATE public.profiles
SET is_public = false
WHERE is_public = true;