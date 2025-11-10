-- Fix subscription for ivan.v.kruchok@gmail.com
-- Keep the 75 extra credits as requested, just restore subscription status

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'ivan.v.kruchok@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Restore Starter Plan subscription
  UPDATE public.subscribers 
  SET 
    subscribed = true,
    subscription_tier = 'Starter Plan',
    subscription_end = '2025-12-10 09:59:26+00'::timestamptz,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  RAISE NOTICE 'Subscription restored to Starter Plan for user %', v_user_id;
END $$;
