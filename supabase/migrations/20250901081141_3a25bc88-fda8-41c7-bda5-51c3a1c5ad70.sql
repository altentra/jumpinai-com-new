-- SECURITY FIX: Add proper policies to prevent spam attacks

-- Fix lead_magnet_downloads table - remove any existing INSERT policies
DROP POLICY IF EXISTS "Allow authenticated users to insert lead magnet download" ON public.lead_magnet_downloads;
DROP POLICY IF EXISTS "Allow public to insert lead magnet download" ON public.lead_magnet_downloads;
DROP POLICY IF EXISTS "Allow inserting lead magnet downloads with rate limiting" ON public.lead_magnet_downloads;

-- Create secure policy for lead_magnet_downloads with email validation
CREATE POLICY "Allow inserting validated lead magnet downloads"
ON public.lead_magnet_downloads
FOR INSERT  
WITH CHECK (
  -- Validate email format
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
  AND length(pdf_name) <= 255
);

-- Fix contacts table - remove any existing INSERT policies  
DROP POLICY IF EXISTS "Allow public to insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow inserting contacts with validation" ON public.contacts;

-- Create secure policy for contacts with email validation
CREATE POLICY "Allow inserting validated contacts"
ON public.contacts
FOR INSERT
WITH CHECK (
  -- Validate email format and field lengths
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
  AND (first_name IS NULL OR (length(first_name) <= 100 AND length(first_name) > 0))
  AND (last_name IS NULL OR (length(last_name) <= 100 AND length(last_name) > 0))
  AND (notes IS NULL OR length(notes) <= 1000)
  AND source IS NOT NULL AND length(source) <= 100
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_email_time 
ON public.lead_magnet_downloads(email, downloaded_at);

CREATE INDEX IF NOT EXISTS idx_contacts_email_time 
ON public.contacts(email, created_at);

-- Create rate limiting function for better security
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  table_name text,
  email_col text,
  time_col text,
  user_email text,
  limit_count integer,
  time_window_hours integer DEFAULT 24
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE %I = $1 AND %I > NOW() - INTERVAL ''%s hours''',
    table_name, email_col, time_col, time_window_hours
  ) INTO current_count USING user_email;
  
  RETURN current_count < limit_count;
END;
$$;