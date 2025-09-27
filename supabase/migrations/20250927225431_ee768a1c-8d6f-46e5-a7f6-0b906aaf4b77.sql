-- Fix security warnings: Set search_path for all functions to prevent potential attacks

-- Fix initialize_user_credits function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix deduct_user_credit function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix add_user_credits function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;