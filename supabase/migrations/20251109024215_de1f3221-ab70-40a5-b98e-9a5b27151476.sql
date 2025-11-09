-- Update Free Plan: Remove drip credits and add basic clarify/reroute feature
UPDATE subscription_plans 
SET features = ARRAY[
  '5 welcome credits',
  'Step clarification and alternative route discovery',
  'Basic AI transformation plans',
  'Community support',
  'Access to free resources'
]
WHERE name = 'Free Plan';

-- Update Starter Plan: Remove drip credits and add 2-level deep clarify/reroute
UPDATE subscription_plans 
SET features = ARRAY[
  '25 monthly credits',
  'Clarify and reroute steps up to 2 levels deep',
  'Priority AI generation',
  'Email support',
  'Access to all guides & resources'
]
WHERE name = 'Starter Plan';

-- Update Pro Plan: Remove drip credits and add 3-level deep clarify/reroute
UPDATE subscription_plans 
SET features = ARRAY[
  '100 monthly credits',
  'Clarify and reroute steps up to 3 levels deep',
  'Priority processing',
  'Advanced AI models',
  'Phone & email support',
  'Access to all guides & resources',
  'Custom workflows'
]
WHERE name = 'Pro Plan';

-- Update Growth Plan: Remove drip credits and add 4-level deep clarify/reroute
UPDATE subscription_plans 
SET features = ARRAY[
  '250 monthly credits',
  'Clarify and reroute steps up to 4 levels deep',
  'Fastest processing',
  'Premium AI models',
  'Dedicated support',
  'Access to all guides & resources',
  'Custom workflows',
  'Team collaboration tools',
  'Priority feature requests'
]
WHERE name = 'Growth Plan';