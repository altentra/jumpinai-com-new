-- Function to clean old guest jumps (90-day retention)
CREATE OR REPLACE FUNCTION public.clean_old_guest_jumps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.user_jumps
  WHERE user_id IS NULL 
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Function to anonymize guest IP addresses after 7 days
CREATE OR REPLACE FUNCTION public.anonymize_guest_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_jumps
  SET ip_address = 'anonymized',
      location = NULL
  WHERE user_id IS NULL
    AND created_at < NOW() - INTERVAL '7 days'
    AND ip_address IS NOT NULL
    AND ip_address != 'anonymized';
END;
$$;