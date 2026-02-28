
-- Fix search_path on initialize_user_credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
