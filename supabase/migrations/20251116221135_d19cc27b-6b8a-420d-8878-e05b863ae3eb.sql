-- Create a read-only function to check guest usage without recording
CREATE OR REPLACE FUNCTION get_guest_usage(
  p_ip_address TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage_count INTEGER;
  v_last_used_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean up old records first (over 24 hours)
  DELETE FROM public.guest_usage_tracking
  WHERE ip_address = p_ip_address 
    AND last_used_at < NOW() - INTERVAL '24 hours';
  
  -- Check current usage within 24 hour window
  SELECT usage_count, last_used_at
  INTO v_usage_count, v_last_used_at
  FROM public.guest_usage_tracking
  WHERE ip_address = p_ip_address
    AND last_used_at >= NOW() - INTERVAL '24 hours'
  ORDER BY last_used_at DESC
  LIMIT 1;
  
  -- Return current usage status without modifying
  IF v_usage_count IS NULL THEN
    -- No usage within 24 hours
    RETURN json_build_object(
      'usage_count', 0,
      'remaining', 3,
      'reset_at', NULL
    );
  ELSIF v_usage_count >= 3 THEN
    -- Limit reached
    RETURN json_build_object(
      'usage_count', v_usage_count,
      'remaining', 0,
      'reset_at', v_last_used_at + INTERVAL '24 hours'
    );
  ELSE
    -- Still have tries left
    RETURN json_build_object(
      'usage_count', v_usage_count,
      'remaining', 3 - v_usage_count,
      'reset_at', NULL
    );
  END IF;
END;
$$;