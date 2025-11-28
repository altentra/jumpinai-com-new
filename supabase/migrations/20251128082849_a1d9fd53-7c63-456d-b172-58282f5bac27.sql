-- Update welcome bonus from 5 to 3 credits

-- Update the trigger function to give 3 welcome credits instead of 5
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert welcome credits for new user (3 credits)
  INSERT INTO public.user_credits (user_id, credits_balance, total_credits_purchased)
  VALUES (NEW.id, 3, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log welcome bonus transaction
  INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
  VALUES (NEW.id, 'welcome_bonus', 3, 'Welcome bonus credits')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Free Plan to reflect 3 welcome credits and accurate features
UPDATE subscription_plans 
SET features = ARRAY[
  '3 welcome credits upon signup',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify main steps into actionable details',
  'Reroute to explore alternative approaches',
  'Equip steps with custom AI tool and prompt combinations',
  'Access to all platform resources'
]
WHERE name = 'Free Plan';

-- Update Starter Plan with accurate features
UPDATE subscription_plans 
SET features = ARRAY[
  '25 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 2 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Access to all platform resources'
]
WHERE name = 'Starter Plan';

-- Update Pro Plan with accurate features
UPDATE subscription_plans 
SET features = ARRAY[
  '100 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 3 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Access to all platform resources',
  'Premium access to new features'
]
WHERE name = 'Pro Plan';

-- Update Growth Plan with accurate features
UPDATE subscription_plans 
SET features = ARRAY[
  '250 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 4 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Access to all platform resources',
  'Premium access to new features',
  'Priority feature request consideration'
]
WHERE name = 'Growth Plan';