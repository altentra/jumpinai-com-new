-- Create table for tracking speech-to-text usage
CREATE TABLE IF NOT EXISTS public.stt_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  session_duration_seconds INTEGER,
  transcript_length INTEGER,
  jump_id UUID REFERENCES public.user_jumps(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stt_usage_logs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to stt_usage_logs"
  ON public.stt_usage_logs
  FOR ALL
  USING (true);

-- Create index for rate limiting queries
CREATE INDEX idx_stt_usage_logs_user_created ON public.stt_usage_logs(user_id, created_at);
CREATE INDEX idx_stt_usage_logs_ip_created ON public.stt_usage_logs(ip_address, created_at);

-- Add STT usage flag to user_jumps table
ALTER TABLE public.user_jumps 
ADD COLUMN IF NOT EXISTS stt_used BOOLEAN DEFAULT false;

-- Database function to check STT rate limit
CREATE OR REPLACE FUNCTION public.check_stt_rate_limit(
  p_user_id UUID,
  p_ip_address TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
  v_is_authenticated BOOLEAN;
BEGIN
  -- Determine if user is authenticated
  v_is_authenticated := p_user_id IS NOT NULL;
  
  -- Set limit based on authentication status
  IF v_is_authenticated THEN
    v_limit := 50; -- 50 per hour for authenticated users
  ELSE
    v_limit := 10; -- 10 per hour for guests
  END IF;
  
  -- Count recent requests (within last hour)
  IF v_is_authenticated THEN
    -- Check by user_id for authenticated users
    SELECT COUNT(*) INTO v_count
    FROM public.stt_usage_logs
    WHERE user_id = p_user_id
      AND created_at > NOW() - INTERVAL '1 hour';
  ELSE
    -- Check by IP address for guests
    SELECT COUNT(*) INTO v_count
    FROM public.stt_usage_logs
    WHERE ip_address = p_ip_address
      AND user_id IS NULL
      AND created_at > NOW() - INTERVAL '1 hour';
  END IF;
  
  -- Return result
  RETURN json_build_object(
    'allowed', v_count < v_limit,
    'current_usage', v_count,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_count),
    'is_authenticated', v_is_authenticated
  );
END;
$$;