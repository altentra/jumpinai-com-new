-- Create a subscription order for ivan.adventuring@gmail.com to track his $10/month subscription
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
  gen_random_uuid(), -- Subscription product ID (virtual)
  1000, -- $10.00 in cents
  'usd',
  'subscription', -- New status for subscription orders
  'cs_live_a1fhL1yx9xM3OjTtiCtYkMN9rWckndwwYa0foiyW5h6kckvU6NLElq6Rl7', -- From the logs
  '2025-08-30 03:43:57+00', -- Subscription date from logs
  '2025-08-30 03:43:57+00'
);

-- Create a virtual product for "JumpinAI Pro Subscription"
INSERT INTO public.products (
  id,
  name,
  description,
  price,
  file_name,
  file_path,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT product_id FROM orders WHERE user_email = 'ivan.adventuring@gmail.com' AND status = 'subscription' LIMIT 1),
  'JumpinAI Pro Subscription',
  'Monthly subscription to JumpinAI Pro with unlimited access to all digital products and features.',
  1000,
  'subscription',
  'subscription',
  'subscription',
  '2025-08-30 03:43:57+00',
  '2025-08-30 03:43:57+00'
) ON CONFLICT (id) DO NOTHING;