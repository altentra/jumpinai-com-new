-- Update constraints to allow subscription status
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_status_check 
CHECK (status IN ('active', 'inactive', 'archived', 'subscription'));

-- Create a virtual product for "JumpinAI Pro Subscription" 
INSERT INTO public.products (
  name,
  description,
  price,
  file_name,
  file_path,
  status,
  created_at,
  updated_at
) VALUES (
  'JumpinAI Pro Subscription',
  'Monthly subscription to JumpinAI Pro with unlimited access to all digital products and features.',
  1000,
  'subscription',
  'subscription',
  'subscription',
  '2025-08-30 03:43:57+00',
  '2025-08-30 03:43:57+00'
);

-- Now create the subscription order using the product ID
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