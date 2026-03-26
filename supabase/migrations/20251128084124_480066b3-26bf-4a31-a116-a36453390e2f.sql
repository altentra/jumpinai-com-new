-- Update Free Plan credits_per_month to 3
UPDATE subscription_plans 
SET credits_per_month = 3
WHERE name = 'Free Plan';