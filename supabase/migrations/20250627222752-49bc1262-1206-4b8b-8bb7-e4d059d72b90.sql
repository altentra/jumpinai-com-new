
-- Create unified contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT NOT NULL, -- 'newsletter', 'lead_magnet', 'contact_form', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  newsletter_subscribed BOOLEAN DEFAULT false,
  lead_magnet_downloaded BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}', -- For segmentation
  notes TEXT
);

-- Create contact activities table for tracking all interactions
CREATE TABLE public.contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'signup', 'download', 'unsubscribe', 'email_sent', etc.
  source TEXT NOT NULL, -- which form/page/trigger
  details JSONB, -- flexible data for each activity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (you can restrict later if needed)
CREATE POLICY "Allow all operations on contacts" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on contact_activities" ON public.contact_activities FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_source ON public.contacts(source);
CREATE INDEX idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX idx_contact_activities_type ON public.contact_activities(activity_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to upsert contact (insert or update existing)
CREATE OR REPLACE FUNCTION public.upsert_contact(
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'unknown',
  p_newsletter_subscribed BOOLEAN DEFAULT false,
  p_lead_magnet_downloaded BOOLEAN DEFAULT false,
  p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  contact_id UUID;
BEGIN
  -- Insert or update contact
  INSERT INTO public.contacts (
    email, first_name, last_name, source, 
    newsletter_subscribed, lead_magnet_downloaded, tags
  )
  VALUES (
    p_email, p_first_name, p_last_name, p_source,
    p_newsletter_subscribed, p_lead_magnet_downloaded, p_tags
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, contacts.first_name),
    last_name = COALESCE(EXCLUDED.last_name, contacts.last_name),
    newsletter_subscribed = EXCLUDED.newsletter_subscribed OR contacts.newsletter_subscribed,
    lead_magnet_downloaded = EXCLUDED.lead_magnet_downloaded OR contacts.lead_magnet_downloaded,
    tags = array(SELECT DISTINCT unnest(EXCLUDED.tags || contacts.tags)),
    updated_at = now()
  RETURNING id INTO contact_id;
  
  RETURN contact_id;
END;
$$;
