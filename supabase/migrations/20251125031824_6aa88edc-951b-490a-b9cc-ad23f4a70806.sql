-- Create feature_requests table to track all feature request submissions
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  feature_description TEXT NOT NULL,
  credits_rewarded BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to feature_requests"
ON public.feature_requests
FOR ALL
USING (true);

-- Index for email lookups (to check if user already submitted)
CREATE INDEX idx_feature_requests_email ON public.feature_requests(user_email);

-- Index for user_id lookups
CREATE INDEX idx_feature_requests_user_id ON public.feature_requests(user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();