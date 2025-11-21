-- One-time admin operation: Grant Growth Plan subscription and 250 credits to john.v.mchook@gmail.com
-- Correct user_id: dbdcaab4-d890-4b65-9d9f-d68ceb5d2a76

-- Update subscription to Growth Plan
UPDATE public.subscribers
SET 
  subscribed = true,
  subscription_tier = 'Growth Plan',
  subscription_end = NOW() + INTERVAL '30 days',
  manual_subscription = true,
  updated_at = NOW()
WHERE email = 'john.v.mchook@gmail.com';

-- Ensure user_credits record exists
INSERT INTO public.user_credits (user_id, credits_balance, total_credits_purchased)
VALUES ('dbdcaab4-d890-4b65-9d9f-d68ceb5d2a76', 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Add 250 credits to their balance
UPDATE public.user_credits
SET 
  credits_balance = credits_balance + 250,
  total_credits_purchased = total_credits_purchased + 250,
  updated_at = NOW()
WHERE user_id = 'dbdcaab4-d890-4b65-9d9f-d68ceb5d2a76';

-- Log the credit transaction
INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description, reference_id)
VALUES (
  'dbdcaab4-d890-4b65-9d9f-d68ceb5d2a76',
  'purchase',
  250,
  'Admin granted 250 credits with Growth Plan subscription',
  'admin_grant_' || EXTRACT(EPOCH FROM NOW())::TEXT
);