-- Update credit packages with new pricing structure
DELETE FROM credit_packages WHERE active = true;

-- Insert new credit packages
INSERT INTO credit_packages (name, credits, price_cents, active) VALUES
('Starter Pack', 10, 700, true),
('Value Pack', 25, 1500, true),
('Professional Pack', 50, 2500, true),
('Business Pack', 100, 4000, true),
('Enterprise Pack', 250, 7500, true);

-- Create subscription_plans table for the new tiered plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  credits_per_month integer NOT NULL,
  price_cents integer NOT NULL,
  stripe_price_id text,
  stripe_product_id text,
  features text[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" 
ON subscription_plans 
FOR SELECT 
USING (active = true);

CREATE POLICY "Service role full access to subscription_plans" 
ON subscription_plans 
FOR ALL 
USING (true);

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, credits_per_month, price_cents, features) VALUES
(
  'Free Plan', 
  'Perfect for getting started with AI transformation', 
  5, 
  0, 
  ARRAY['5 welcome credits', 'Basic AI transformation plans', 'Community support', 'Access to free resources']
),
(
  'Starter Plan', 
  'Ideal for individuals exploring AI solutions', 
  40, 
  1500, 
  ARRAY['40 monthly credits', 'Priority AI generation', 'Email support', 'Access to all guides & resources', 'Credit rollover']
),
(
  'Pro Plan', 
  'Best for professionals and small teams', 
  150, 
  3900, 
  ARRAY['150 monthly credits', 'Priority processing', 'Advanced AI models', 'Phone & email support', 'Access to all guides & resources', 'Credit rollover', 'Custom workflows']
),
(
  'Growth Plan', 
  'Perfect for growing businesses and teams', 
  400, 
  7900, 
  ARRAY['400 monthly credits', 'Fastest processing', 'Premium AI models', 'Dedicated support', 'Access to all guides & resources', 'Credit rollover', 'Custom workflows', 'Team collaboration tools', 'Priority feature requests']
);

-- Create trigger for subscription_plans updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();