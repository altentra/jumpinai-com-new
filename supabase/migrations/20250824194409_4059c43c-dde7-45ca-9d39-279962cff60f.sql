-- Add email verification tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;