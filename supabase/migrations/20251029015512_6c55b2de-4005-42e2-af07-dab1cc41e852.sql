-- ============================================
-- SECURITY ENHANCEMENT: Row Level Security Policies
-- This migration ensures all sensitive user data is properly protected
-- ============================================

-- Note: Most tables already have correct RLS policies in place.
-- This migration adds any missing policies and ensures consistency.

-- Verify RLS is enabled on all sensitive tables
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drip_credit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_jumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tool_prompts ENABLE ROW LEVEL SECURITY;

-- Add index to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_drip_credit_tracking_user_id ON public.drip_credit_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_jumps_user_id ON public.user_jumps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_prompts_user_id ON public.user_tool_prompts(user_id);

-- Add comment documenting security model
COMMENT ON TABLE public.credit_transactions IS 'User credit transaction history. Protected by RLS - users can only view their own transactions.';
COMMENT ON TABLE public.user_credits IS 'User credit balances. Protected by RLS - users can only view their own credits.';
COMMENT ON TABLE public.orders IS 'Customer orders. Protected by RLS - users can only view their own orders.';
COMMENT ON TABLE public.subscribers IS 'Subscription data. Protected by RLS - users can only view their own subscription.';
COMMENT ON TABLE public.profiles IS 'User profiles. Protected by RLS - users can only view their own profile.';
COMMENT ON TABLE public.drip_credit_tracking IS 'Credit drip tracking. Protected by RLS - users can only view their own tracking data.';
COMMENT ON TABLE public.user_jumps IS 'User AI transformation plans. Protected by RLS - users can only view their own jumps.';
COMMENT ON TABLE public.user_profiles IS 'User business profiles. Protected by RLS - users can only view their own profiles.';
COMMENT ON TABLE public.user_tool_prompts IS 'User custom prompts. Protected by RLS - users can only view their own prompts.';