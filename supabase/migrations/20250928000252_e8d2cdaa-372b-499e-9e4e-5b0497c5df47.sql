-- Update subscription system to handle monthly credit allocation for Pro plan

-- Create function to allocate monthly credits to Pro subscribers
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits()
RETURNS void AS $$
BEGIN
  -- Add 1000 credits to all active Pro subscribers
  UPDATE public.user_credits
  SET 
    credits_balance = credits_balance + 1000,
    updated_at = now()
  WHERE user_id IN (
    SELECT DISTINCT s.user_id 
    FROM public.subscribers s
    WHERE s.subscribed = true 
    AND s.subscription_tier = 'JumpinAI Pro'
    AND s.subscription_end > now()
  );

  -- Log monthly credit allocation transactions
  INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
  SELECT 
    s.user_id,
    'monthly_allocation',
    1000,
    'Monthly Pro subscription credit allocation'
  FROM public.subscribers s
  WHERE s.subscribed = true 
  AND s.subscription_tier = 'JumpinAI Pro'
  AND s.subscription_end > now()
  AND s.user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update credit_transactions table to support monthly_allocation type
ALTER TABLE public.credit_transactions 
DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

ALTER TABLE public.credit_transactions 
ADD CONSTRAINT credit_transactions_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'usage', 'welcome_bonus', 'monthly_allocation'));