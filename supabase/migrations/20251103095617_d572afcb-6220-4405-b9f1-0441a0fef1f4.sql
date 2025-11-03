-- Update the allocate_drip_credits function to use the correct transaction type
CREATE OR REPLACE FUNCTION public.allocate_drip_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users who are eligible for drip credits
  FOR user_record IN 
    SELECT 
      uc.user_id,
      uc.last_drip_credit_at,
      COALESCE(uc.last_drip_credit_at, uc.created_at) as reference_time
    FROM user_credits uc
    WHERE 
      -- Either never received drip credits, or last drip was more than 48 hours ago
      (uc.last_drip_credit_at IS NULL AND uc.created_at < NOW() - INTERVAL '48 hours')
      OR (uc.last_drip_credit_at < NOW() - INTERVAL '48 hours')
  LOOP
    BEGIN
      -- Add 1 credit to the user's balance
      UPDATE user_credits
      SET 
        credits_balance = credits_balance + 1,
        last_drip_credit_at = NOW(),
        updated_at = NOW()
      WHERE user_id = user_record.user_id;

      -- Record the transaction with the correct transaction_type
      INSERT INTO public.credit_transactions (
        user_id,
        transaction_type,
        credits_amount,
        description
      ) VALUES (
        user_record.user_id,
        'monthly_allocation',
        1,
        'Bonus credit every 48hr'
      );

      RAISE NOTICE 'Allocated drip credit to user: %', user_record.user_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to allocate drip credit to user %: %', user_record.user_id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;
END;
$$;