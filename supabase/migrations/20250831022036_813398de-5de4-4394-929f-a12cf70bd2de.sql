-- Create a virtual product for "JumpinAI Pro Subscription" first
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
) RETURNING id;