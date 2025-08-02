-- Create storage policies for investment deck downloads
-- Policy to allow reading investment deck files through edge functions
CREATE POLICY "Allow service role to read investment decks" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'digital-products' AND (storage.foldername(name))[1] = 'investment-decks');

-- Allow service role to list files in investment-decks folder
CREATE POLICY "Allow service role to list investment decks" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'digital-products' AND name LIKE 'investment-decks/%');