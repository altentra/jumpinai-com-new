-- Allow guest users to create jumps with NULL user_id
CREATE POLICY "Allow guest jump creation" 
ON public.user_jumps 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Allow anyone to view guest jumps (for admin dashboard)
CREATE POLICY "Allow viewing guest jumps"
ON public.user_jumps
FOR SELECT
USING (user_id IS NULL);