-- Helper functions for subscription security system

-- Function to set session configuration variables for audit trail
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, setting_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, false);
END;
$$;

COMMENT ON FUNCTION public.set_config IS 'Helper function to set session configuration variables for audit trail and security controls';