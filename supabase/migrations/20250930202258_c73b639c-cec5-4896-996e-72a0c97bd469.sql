-- Update subscription plans with new pricing
UPDATE public.subscription_plans
SET 
  name = 'Free Plan',
  description = 'Perfect for getting started with AI transformation',
  credits_per_month = 5,
  price_cents = 0,
  features = ARRAY[
    '5 welcome credits',
    '1 credit every 48 hours',
    'Basic AI transformation plans',
    'Community support',
    'Access to free resources'
  ],
  updated_at = now()
WHERE name = 'Free Plan';

UPDATE public.subscription_plans
SET 
  name = 'Starter Plan',
  description = 'Ideal for individuals exploring AI solutions',
  credits_per_month = 25,
  price_cents = 900,
  features = ARRAY[
    '25 monthly credits',
    '1 credit every 48 hours',
    'Priority AI generation',
    'Email support',
    'Access to all guides & resources'
  ],
  updated_at = now()
WHERE name = 'Starter Plan';

UPDATE public.subscription_plans
SET 
  name = 'Pro Plan',
  description = 'Best for professionals and small teams',
  credits_per_month = 100,
  price_cents = 2500,
  features = ARRAY[
    '100 monthly credits',
    '1 credit every 48 hours',
    'Priority processing',
    'Advanced AI models',
    'Phone & email support',
    'Access to all guides & resources',
    'Custom workflows'
  ],
  updated_at = now()
WHERE name = 'Pro Plan';

UPDATE public.subscription_plans
SET 
  name = 'Growth Plan',
  description = 'Perfect for growing businesses and teams',
  credits_per_month = 250,
  price_cents = 4900,
  features = ARRAY[
    '250 monthly credits',
    '1 credit every 48 hours',
    'Fastest processing',
    'Premium AI models',
    'Dedicated support',
    'Access to all guides & resources',
    'Custom workflows',
    'Team collaboration tools',
    'Priority feature requests'
  ],
  updated_at = now()
WHERE name = 'Growth Plan';

-- Update credit packages with new pricing
UPDATE public.credit_packages
SET 
  name = 'Starter Pack',
  credits = 10,
  price_cents = 500,
  updated_at = now()
WHERE credits = 10;

UPDATE public.credit_packages
SET 
  name = 'Value Pack',
  credits = 25,
  price_cents = 1000,
  updated_at = now()
WHERE credits = 25;

UPDATE public.credit_packages
SET 
  name = 'Professional Pack',
  credits = 50,
  price_cents = 1800,
  updated_at = now()
WHERE credits = 50;

UPDATE public.credit_packages
SET 
  name = 'Business Pack',
  credits = 100,
  price_cents = 3000,
  updated_at = now()
WHERE credits = 100;

UPDATE public.credit_packages
SET 
  name = 'Enterprise Pack',
  credits = 250,
  price_cents = 6500,
  updated_at = now()
WHERE credits = 250;

-- Create table for tracking drip credits
CREATE TABLE IF NOT EXISTS public.drip_credit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_drip_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  drip_count_this_month INTEGER NOT NULL DEFAULT 0,
  current_month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on drip_credit_tracking
ALTER TABLE public.drip_credit_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for drip_credit_tracking
CREATE POLICY "Users can view their own drip tracking"
  ON public.drip_credit_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to drip_credit_tracking"
  ON public.drip_credit_tracking
  FOR ALL
  USING (true);

-- Create function to allocate drip credits
CREATE OR REPLACE FUNCTION public.allocate_drip_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  current_month_num INTEGER;
BEGIN
  current_month_num := EXTRACT(MONTH FROM now());
  
  -- Loop through all users who need drip credits
  FOR user_record IN 
    SELECT 
      uc.user_id,
      COALESCE(dct.last_drip_at, uc.created_at) as last_drip,
      COALESCE(dct.current_month, 0) as tracked_month,
      COALESCE(dct.drip_count_this_month, 0) as drip_count
    FROM public.user_credits uc
    LEFT JOIN public.drip_credit_tracking dct ON dct.user_id = uc.user_id
    WHERE 
      -- User exists and has credits initialized
      uc.user_id IS NOT NULL
      -- Either no drip tracking exists, or it's been 48 hours since last drip
      AND (
        dct.last_drip_at IS NULL 
        OR dct.last_drip_at <= (now() - INTERVAL '48 hours')
      )
  LOOP
    -- Reset drip count if it's a new month
    IF user_record.tracked_month != current_month_num THEN
      -- Add 1 drip credit
      UPDATE public.user_credits
      SET 
        credits_balance = credits_balance + 1,
        updated_at = now()
      WHERE user_id = user_record.user_id;
      
      -- Update or insert drip tracking with reset count
      INSERT INTO public.drip_credit_tracking (user_id, last_drip_at, drip_count_this_month, current_month)
      VALUES (user_record.user_id, now(), 1, current_month_num)
      ON CONFLICT (user_id) DO UPDATE SET
        last_drip_at = now(),
        drip_count_this_month = 1,
        current_month = current_month_num,
        updated_at = now();
      
      -- Log transaction
      INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
      VALUES (user_record.user_id, 'drip_credit', 1, 'Monthly drip credit (48-hour interval)');
    ELSE
      -- Add 1 drip credit (not a new month)
      UPDATE public.user_credits
      SET 
        credits_balance = credits_balance + 1,
        updated_at = now()
      WHERE user_id = user_record.user_id;
      
      -- Update or insert drip tracking
      INSERT INTO public.drip_credit_tracking (user_id, last_drip_at, drip_count_this_month, current_month)
      VALUES (user_record.user_id, now(), 1, current_month_num)
      ON CONFLICT (user_id) DO UPDATE SET
        last_drip_at = now(),
        drip_count_this_month = drip_credit_tracking.drip_count_this_month + 1,
        updated_at = now();
      
      -- Log transaction
      INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
      VALUES (user_record.user_id, 'drip_credit', 1, 'Drip credit (48-hour interval)');
    END IF;
  END LOOP;
END;
$$;

-- Update the monthly allocation function to reset monthly credits properly
CREATE OR REPLACE FUNCTION public.allocate_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_record RECORD;
BEGIN
  -- Loop through each active subscription plan
  FOR plan_record IN 
    SELECT 
      sp.name,
      sp.credits_per_month,
      s.user_id
    FROM public.subscribers s
    INNER JOIN public.subscription_plans sp ON sp.name = s.subscription_tier
    WHERE 
      s.subscribed = true 
      AND s.subscription_end > now()
      AND s.user_id IS NOT NULL
      AND sp.active = true
  LOOP
    -- Add monthly credits to balance
    UPDATE public.user_credits
    SET 
      credits_balance = credits_balance + plan_record.credits_per_month,
      updated_at = now()
    WHERE user_id = plan_record.user_id;

    -- Log monthly credit allocation
    INSERT INTO public.credit_transactions (user_id, transaction_type, credits_amount, description)
    VALUES (
      plan_record.user_id,
      'monthly_allocation',
      plan_record.credits_per_month,
      format('Monthly %s credit allocation', plan_record.name)
    );
  END LOOP;
END;
$$;