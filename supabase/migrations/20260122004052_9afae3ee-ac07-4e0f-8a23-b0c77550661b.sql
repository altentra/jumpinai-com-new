-- Update Free Plan features
UPDATE subscription_plans 
SET features = ARRAY[
  '3 welcome credits upon signup',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify main steps into actionable details',
  'Full Reroute and Equip functionality on all levels',
  'Build Workflows (1 credit) and AI Agents (2 credits)',
  'Export to n8n and Make.com platforms',
  'Limited access to platform resources'
],
updated_at = now()
WHERE name = 'Free Plan';

-- Update Starter Plan features
UPDATE subscription_plans 
SET features = ARRAY[
  '25 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 2 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Build Workflows (1 credit) and AI Agents (2 credits)',
  'Export to n8n and Make.com platforms',
  'Full access to all platform resources'
],
updated_at = now()
WHERE name = 'Starter Plan';

-- Update Pro Plan features
UPDATE subscription_plans 
SET features = ARRAY[
  '100 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 3 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Build Workflows (1 credit) and AI Agents (2 credits)',
  'Export to n8n and Make.com platforms',
  'Full access to all platform resources',
  'Early access to new features'
],
updated_at = now()
WHERE name = 'Pro Plan';

-- Update Growth Plan features
UPDATE subscription_plans 
SET features = ARRAY[
  '250 monthly credits (roll over)',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify steps up to 4 levels deep',
  'Full Reroute and Equip functionality on all levels',
  'Build Workflows (1 credit) and AI Agents (2 credits)',
  'Export to n8n and Make.com platforms',
  'Full access to all platform resources',
  'Early access to new features and updates'
],
updated_at = now()
WHERE name = 'Growth Plan';