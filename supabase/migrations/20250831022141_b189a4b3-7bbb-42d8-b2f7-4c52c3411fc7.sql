-- Check current constraints
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%status%' 
AND constraint_schema = 'public';

-- Update the orders constraint again
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'subscription'));

-- Now create the subscription order
INSERT INTO public.orders (
  user_email,
  product_id,
  amount,
  currency,
  status,
  stripe_session_id,
  created_at,
  updated_at
) VALUES (
  'ivan.adventuring@gmail.com',
  (SELECT id FROM products WHERE name = 'JumpinAI Pro Subscription' LIMIT 1),
  1000,
  'usd',
  'subscription',
  'cs_live_a1fhL1yx9xM3OjTtiCtYkMN9rWckndwwYa0foiyW5h6kckvU6NLElq6Rl7',
  '2025-08-30 03:43:57+00',
  '2025-08-30 03:43:57+00'
);