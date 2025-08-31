import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';

// Optimized auth hook that memoizes subscription status
export const useOptimizedAuth = () => {
  const { user, subscription, isAuthenticated, isLoading, refreshSubscription, login, logout } = useAuth();
  
  // Memoize subscription status to prevent unnecessary re-renders
  const subscriptionStatus = useMemo(() => {
    return {
      subscribed: subscription?.subscribed || false,
      tier: subscription?.subscription_tier || null,
      isPro: subscription?.subscribed && subscription.subscription_tier === 'JumpinAI Pro',
      isFree: !subscription?.subscribed || subscription.subscription_tier !== 'JumpinAI Pro'
    };
  }, [subscription?.subscribed, subscription?.subscription_tier]);

  // Memoize user display data
  const userDisplay = useMemo(() => {
    if (!user) return null;
    return {
      name: user.display_name || user.email?.split('@')[0] || 'User',
      email: user.email,
      avatar: user.avatar_url,
      isGoogle: user.isGoogleUser
    };
  }, [user?.display_name, user?.email, user?.avatar_url, user?.isGoogleUser]);

  return {
    user,
    userDisplay,
    subscription,
    subscriptionStatus,
    isAuthenticated,
    isLoading,
    refreshSubscription,
    login,
    logout
  };
};