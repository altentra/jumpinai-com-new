
-- 1. Update Free Plan: 3 credits → 5 credits
UPDATE public.subscription_plans 
SET credits_per_month = 5, updated_at = now() 
WHERE id = '0a866fd8-66c5-4e0e-b05c-624ccd68628a';

-- 2. Deactivate Starter Plan
UPDATE public.subscription_plans 
SET active = false, updated_at = now() 
WHERE id = 'c8656e00-88b7-452c-af65-54d9c4ddc3b1';

-- 3. Update Pro Plan: $25 → $15 (promo), keep credits at 100
UPDATE public.subscription_plans 
SET price_cents = 1500, updated_at = now() 
WHERE id = 'e8025e95-ae94-4606-b255-8a5d5eef3abf';

-- 4. Update Growth Plan: $49 → $30 (promo), keep credits at 250
UPDATE public.subscription_plans 
SET price_cents = 3000, updated_at = now() 
WHERE id = 'ef1c2c5f-6b5c-4773-97e7-89f4b6643fad';

-- 5. Update welcome credits trigger: 3 → 5 credits for new users
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_balance, total_credits_purchased)
  VALUES (NEW.id, 5, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
  VALUES (NEW.id, 'welcome_bonus', 5, 'Welcome bonus credits')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;
