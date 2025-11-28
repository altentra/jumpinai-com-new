-- Update Growth Plan to remove priority feature request consideration
UPDATE subscription_plans 
SET features = ARRAY[
  '250 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 4 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Full access to all platform resources',
  'Early access to new features and updates'
]
WHERE name = 'Growth Plan';

-- Update Free Plan with corrected features
UPDATE subscription_plans 
SET features = ARRAY[
  '3 welcome credits upon signup',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify main steps into actionable details',
  'Full Reroute and Equip functionality on all levels',
  'Limited access to platform resources'
]
WHERE name = 'Free Plan';

-- Update Starter Plan platform access
UPDATE subscription_plans 
SET features = ARRAY[
  '25 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 2 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Full access to all platform resources'
]
WHERE name = 'Starter Plan';

-- Update Pro Plan platform access
UPDATE subscription_plans 
SET features = ARRAY[
  '100 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 3 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Full access to all platform resources',
  'Early access to new features'
]
WHERE name = 'Pro Plan';