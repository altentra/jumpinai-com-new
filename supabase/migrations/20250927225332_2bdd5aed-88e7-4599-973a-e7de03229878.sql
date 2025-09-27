-- Create user_credits table to track credits for each user
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_credits UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to user_credits"
ON public.user_credits
FOR ALL
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create credit_transactions table to track credit usage and purchases
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'welcome_bonus')),
  credits_amount INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT, -- For Stripe payment IDs or Jump IDs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to credit_transactions"
ON public.credit_transactions
FOR ALL
USING (true);

-- Function to initialize user credits (5 welcome credits)
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert welcome credits for new user
  INSERT INTO public.user_credits (user_id, credits_balance, total_credits_purchased)
  VALUES (NEW.id, 5, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log welcome bonus transaction
  INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
  VALUES (NEW.id, 'welcome_bonus', 5, 'Welcome bonus credits')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to give new users 5 welcome credits
CREATE TRIGGER on_user_created_give_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- Function to safely deduct credits
CREATE OR REPLACE FUNCTION public.deduct_user_credit(p_user_id UUID, p_description TEXT DEFAULT 'JumpinAI Studio generation', p_reference_id TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits balance
  SELECT credits_balance INTO current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user has sufficient credits
  IF current_credits IS NULL OR current_credits < 1 THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credit
  UPDATE public.user_credits
  SET 
    credits_balance = credits_balance - 1,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description, reference_id)
  VALUES (p_user_id, 'usage', -1, p_description, p_reference_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for purchases)
CREATE OR REPLACE FUNCTION public.add_user_credits(p_user_id UUID, p_credits INTEGER, p_description TEXT, p_reference_id TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Add credits to balance
  UPDATE public.user_credits
  SET 
    credits_balance = credits_balance + p_credits,
    total_credits_purchased = total_credits_purchased + p_credits,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- If no existing record, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, credits_balance, total_credits_purchased)
    VALUES (p_user_id, p_credits, p_credits);
  END IF;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description, reference_id)
  VALUES (p_user_id, 'purchase', p_credits, p_description, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credit packages table for Stripe integration
CREATE TABLE public.credit_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for credit_packages (public read access)
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active credit packages
CREATE POLICY "Anyone can view active credit packages"
ON public.credit_packages
FOR SELECT
USING (active = true);

-- Service role full access to credit_packages
CREATE POLICY "Service role full access to credit_packages"
ON public.credit_packages
FOR ALL
USING (true);

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price_cents, active)
VALUES
  ('10 Credits Package', 10, 500, true),
  ('25 Credits Package', 25, 1000, true),
  ('50 Credits Package', 50, 2000, true),
  ('100 Credits Package', 100, 3500, true);

-- Add trigger for credit_packages updated_at
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();