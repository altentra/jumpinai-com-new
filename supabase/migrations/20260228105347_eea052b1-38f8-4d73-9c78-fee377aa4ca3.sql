UPDATE public.subscription_plans 
SET features = ARRAY[
  '5 welcome credits upon signup',
  'Complete AI adaptation plans with Overview, Plan, and Tools & Prompts',
  'Clarify main steps into actionable details',
  'Full Reroute and Equip functionality on all levels',
  'Build Workflows (1 credit) and AI Agents (2 credits)',
  'Export to n8n and Make.com platforms',
  'Limited access to platform resources'
],
updated_at = now()
WHERE id = '0a866fd8-66c5-4e0e-b05c-624ccd68628a';