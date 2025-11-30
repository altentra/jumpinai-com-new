-- Create jump_likes table to track user likes on jumps
CREATE TABLE public.jump_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jump_id UUID NOT NULL REFERENCES public.user_jumps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX jump_likes_unique_user_jump ON public.jump_likes(jump_id, user_id);

-- Create index for faster queries
CREATE INDEX jump_likes_jump_id_idx ON public.jump_likes(jump_id);
CREATE INDEX jump_likes_user_id_idx ON public.jump_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.jump_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view likes (for public jumps)
CREATE POLICY "Anyone can view likes on public jumps"
ON public.jump_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_jumps
    WHERE user_jumps.id = jump_likes.jump_id
    AND user_jumps.is_public = true
  )
);

-- Users can insert their own likes
CREATE POLICY "Users can like jumps"
ON public.jump_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can delete their own likes
CREATE POLICY "Users can unlike jumps"
ON public.jump_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Add likes_count to user_jumps for performance (denormalized)
ALTER TABLE public.user_jumps
ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- Create function to update likes count
CREATE OR REPLACE FUNCTION public.update_jump_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_jumps
    SET likes_count = likes_count + 1
    WHERE id = NEW.jump_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_jumps
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.jump_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger to automatically update likes count
CREATE TRIGGER update_jump_likes_count_trigger
AFTER INSERT OR DELETE ON public.jump_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_jump_likes_count();