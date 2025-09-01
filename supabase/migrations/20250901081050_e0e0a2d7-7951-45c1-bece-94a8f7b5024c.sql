-- SECURITY FIX: Add rate limiting and proper policies to prevent spam attacks

-- Fix lead_magnet_downloads table policies
DROP POLICY IF EXISTS "Allow authenticated users to insert lead magnet download" ON public.lead_magnet_downloads;
DROP POLICY IF EXISTS "Allow public to insert lead magnet download" ON public.lead_magnet_downloads;

-- Create new secure policies for lead_magnet_downloads
CREATE POLICY "Allow inserting lead magnet downloads with rate limiting"
ON public.lead_magnet_downloads
FOR INSERT
WITH CHECK (
  -- Only allow 3 downloads per email per day to prevent spam
  (
    SELECT COUNT(*) 
    FROM public.lead_magnet_downloads 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) < 3
);

-- Fix contacts table policies  
DROP POLICY IF EXISTS "Allow public to insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON public.contacts;

-- Create new secure policy for contacts
CREATE POLICY "Allow inserting contacts with validation"
ON public.contacts
FOR INSERT  
WITH CHECK (
  -- Validate email format and prevent spam
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
  AND (first_name IS NULL OR length(first_name) <= 100)
  AND (last_name IS NULL OR length(last_name) <= 100)
  -- Only allow 5 contact submissions per email per day
  AND (
    SELECT COUNT(*) 
    FROM public.contacts 
    WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) < 5
);

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_email_created_at 
ON public.lead_magnet_downloads(email, created_at);

CREATE INDEX IF NOT EXISTS idx_contacts_email_created_at 
ON public.contacts(email, created_at);

-- Enable leaked password protection in auth settings
-- Note: This needs to be done manually in Supabase Dashboard > Authentication > Settings > Password Protection