
-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'website'
);

-- Create index for faster email lookups
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

-- Create index for active subscribers
CREATE INDEX idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active);

-- Enable Row Level Security (make it public readable for now since it's newsletter signups)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for newsletter signups)
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Allow reading for authenticated users (for admin purposes)
CREATE POLICY "Authenticated users can view subscribers" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  TO authenticated
  USING (true);
