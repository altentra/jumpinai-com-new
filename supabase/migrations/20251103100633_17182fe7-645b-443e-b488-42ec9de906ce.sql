-- Fix the allocate_drip_credits function to use the correct table and column names
CREATE OR REPLACE FUNCTION public.allocate_drip_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users who are eligible for drip credits (48+ hours since last drip)
  FOR user_record IN 
    SELECT 
      uc.user_id,
      dct.last_drip_at,
      COALESCE(dct.last_drip_at, uc.created_at) as reference_time
    FROM user_credits uc
    LEFT JOIN drip_credit_tracking dct ON dct.user_id = uc.user_id
    WHERE 
      -- Either never received drip credits, or last drip was more than 48 hours ago
      (dct.last_drip_at IS NULL AND uc.created_at < NOW() - INTERVAL '48 hours')
      OR (dct.last_drip_at < NOW() - INTERVAL '48 hours')
  LOOP
    BEGIN
      -- Add 1 credit to the user's balance
      UPDATE user_credits
      SET 
        credits_balance = credits_balance + 1,
        updated_at = NOW()
      WHERE user_id = user_record.user_id;

      -- Update or insert drip tracking
      INSERT INTO drip_credit_tracking (user_id, last_drip_at, drip_count_this_month, current_month)
      VALUES (
        user_record.user_id, 
        NOW(), 
        1, 
        EXTRACT(MONTH FROM NOW())
      )
      ON CONFLICT (user_id) DO UPDATE SET
        last_drip_at = NOW(),
        drip_count_this_month = drip_credit_tracking.drip_count_this_month + 1,
        updated_at = NOW();

      -- Record the transaction
      INSERT INTO credit_transactions (
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