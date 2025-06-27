
-- Create a table to track lead magnet downloads
CREATE TABLE public.lead_magnet_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pdf_name TEXT NOT NULL DEFAULT 'Jumpstart AI: 7 Fast Wins You Can Use Today',
  ip_address TEXT,
  user_agent TEXT
);

-- Add index for faster email lookups
CREATE INDEX idx_lead_magnet_downloads_email ON public.lead_magnet_downloads(email);

-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lead-magnets', 'lead-magnets', true);

-- Create policy to allow public read access to lead magnets
CREATE POLICY "Public can view lead magnets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'lead-magnets');

-- Create policy to allow authenticated uploads (for admin)
CREATE POLICY "Authenticated users can upload lead magnets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'lead-magnets' AND auth.role() = 'authenticated');
