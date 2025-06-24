
-- Fix the newsletter_subscribers table structure
ALTER TABLE public.newsletter_subscribers 
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL,
  ADD PRIMARY KEY (id);

ALTER TABLE public.newsletter_subscribers 
  ALTER COLUMN email SET NOT NULL,
  ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);

ALTER TABLE public.newsletter_subscribers 
  ALTER COLUMN subscribed_at SET DEFAULT now(),
  ALTER COLUMN subscribed_at SET NOT NULL;

ALTER TABLE public.newsletter_subscribers 
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE public.newsletter_subscribers 
  ALTER COLUMN source SET DEFAULT 'website';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  TO authenticated
  USING (true);
