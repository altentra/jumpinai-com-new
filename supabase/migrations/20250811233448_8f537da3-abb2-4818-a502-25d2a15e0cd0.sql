-- Harden function search_path to prevent search_path hijacking

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public, extensions;

ALTER FUNCTION public.upsert_contact(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_source text,
  p_newsletter_subscribed boolean,
  p_lead_magnet_downloaded boolean,
  p_tags text[]
) SET search_path = public, extensions;
