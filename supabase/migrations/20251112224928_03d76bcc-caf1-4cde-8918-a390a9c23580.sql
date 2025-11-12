-- Add IP address and location tracking to user_jumps table
ALTER TABLE public.user_jumps 
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS location text;

-- Add index for faster IP-based queries
CREATE INDEX IF NOT EXISTS idx_user_jumps_ip_address ON public.user_jumps(ip_address);

-- Add comment
COMMENT ON COLUMN public.user_jumps.ip_address IS 'IP address of the user who generated the jump (especially useful for guest tracking)';
COMMENT ON COLUMN public.user_jumps.location IS 'Approximate location (city, country) derived from IP address';