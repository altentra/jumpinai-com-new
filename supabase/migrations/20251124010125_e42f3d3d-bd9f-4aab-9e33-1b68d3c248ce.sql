-- Make user_id nullable to allow guest jumps
ALTER TABLE user_jumps ALTER COLUMN user_id DROP NOT NULL;

-- Add index for guest jump queries
CREATE INDEX IF NOT EXISTS idx_user_jumps_guest ON user_jumps(ip_address, created_at) WHERE user_id IS NULL;

-- Update RLS policy to allow guest jump reads by admin
DROP POLICY IF EXISTS "Allow guest jump reads" ON user_jumps;
CREATE POLICY "Allow guest jump reads" ON user_jumps
  FOR SELECT
  USING (
    user_id IS NULL 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );