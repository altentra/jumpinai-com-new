-- Restore Starter Plan subscription for ivan.v.kruchok@gmail.com (again)
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'Starter Plan',
  subscription_end = '2025-12-10 09:59:26+00'::timestamptz,
  updated_at = now()
WHERE email = 'ivan.v.kruchok@gmail.com';