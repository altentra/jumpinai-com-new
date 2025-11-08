-- Create guest_usage_tracking table for server-side enforcement
CREATE TABLE IF NOT EXISTS public.guest_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups by IP and timestamp
CREATE INDEX idx_guest_usage_ip_time ON public.guest_usage_tracking(ip_address, last_used_at);

-- Enable RLS
ALTER TABLE public.guest_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Service role needs full access
CREATE POLICY "Service role full access to guest_usage_tracking"
  ON public.guest_usage_tracking
  FOR ALL
  USING (true);

-- Create API usage monitoring table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  request_duration_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for monitoring queries
CREATE INDEX idx_api_logs_endpoint_time ON public.api_usage_logs(endpoint, created_at);
CREATE INDEX idx_api_logs_ip_time ON public.api_usage_logs(ip_address, created_at);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Service role needs full access
CREATE POLICY "Service role full access to api_usage_logs"
  ON public.api_usage_logs
  FOR ALL
  USING (true);

-- Function to clean up old guest usage records (older than 24 hours)
CREATE OR REPLACE FUNCTION clean_old_guest_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.guest_usage_tracking
  WHERE last_used_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Function to check and record guest usage (server-side enforcement)
CREATE OR REPLACE FUNCTION check_and_record_guest_usage(
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage_count INTEGER;
  v_last_used_at TIMESTAMP WITH TIME ZONE;
  v_can_use BOOLEAN;
BEGIN
  -- Clean up old records first
  DELETE FROM public.guest_usage_tracking
  WHERE ip_address = p_ip_address 
    AND last_used_at < NOW() - INTERVAL '24 hours';
  
  -- Check current usage
  SELECT usage_count, last_used_at
  INTO v_usage_count, v_last_used_at
  FROM public.guest_usage_tracking
  WHERE ip_address = p_ip_address
    AND last_used_at >= NOW() - INTERVAL '24 hours'
  ORDER BY last_used_at DESC
  LIMIT 1;
  
  -- Determine if user can use the service
  IF v_usage_count IS NULL THEN
    -- First time user within 24 hours
    INSERT INTO public.guest_usage_tracking (ip_address, user_agent, usage_count)
    VALUES (p_ip_address, p_user_agent, 1);
    
    RETURN json_build_object(
      'can_use', true,
      'usage_count', 1,
      'remaining', 2
    );
  ELSIF v_usage_count >= 3 THEN
    -- Limit reached
    RETURN json_build_object(
      'can_use', false,
      'usage_count', v_usage_count,
      'remaining', 0,
      'reset_at', v_last_used_at + INTERVAL '24 hours'
    );
  ELSE
    -- Increment usage
    UPDATE public.guest_usage_tracking
    SET usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE ip_address = p_ip_address
      AND last_used_at >= NOW() - INTERVAL '24 hours';
    
    RETURN json_build_object(
      'can_use', true,
      'usage_count', v_usage_count + 1,
      'remaining', 3 - (v_usage_count + 1)
    );
  END IF;
END;
$$;