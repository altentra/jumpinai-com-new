import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subscriptionCache } from "@/utils/subscriptionCache";

interface AuthUser {
  id: string;
  email: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  isGoogleUser?: boolean;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
  manual_subscription?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: SubscriptionInfo | null;
  isSubscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  login: (redirectTo?: string) => void;
  loginWithRedirect: (redirectTo?: string) => void; // shim for old calls
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

  // Guards against stale async profile fetches racing with logout / auth changes
  const profileFetchTokenRef = useRef(0);
  const profileFetchTimeoutRef = useRef<number | null>(null);

  // Function to fetch and merge user profile data
  const fetchUserWithProfile = async (authUser: any): Promise<AuthUser | null> => {
    if (!authUser) return null;

    try {
      // Fetch profile data from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      const meta = authUser.user_metadata || {};
      const identities = (authUser.identities || []);
      const identityData = identities[0]?.identity_data || {};

      const derivedDisplay = profile?.display_name ||
        meta.full_name ||
        meta.name ||
        meta.display_name ||
        authUser.email?.split('@')[0] || null;

      const derivedAvatar = profile?.avatar_url ||
        meta.avatar_url ||
        meta.picture ||
        identityData.picture ||
        null;

      // If profile is missing or missing key fields, upsert to keep in sync
      if (!profile || (!profile.avatar_url && derivedAvatar) || (!profile.display_name && derivedDisplay)) {
        await supabase.from('profiles').upsert({
          id: authUser.id,
          display_name: derivedDisplay ?? undefined,
          avatar_url: derivedAvatar ?? undefined,
        });
      }

      return {
        id: authUser.id,
        email: authUser.email,
        display_name: derivedDisplay,
        avatar_url: derivedAvatar,
        isGoogleUser: authUser.app_metadata?.provider === 'google' || 
          authUser.app_metadata?.providers?.includes('google'),
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to auth metadata
      const meta = authUser.user_metadata || {};
      const identities = (authUser.identities || []);
      const identityData = identities[0]?.identity_data || {};
      return {
        id: authUser.id,
        email: authUser.email,
        display_name: meta.full_name ||
          meta.name ||
          meta.display_name ||
          authUser.email?.split('@')[0] || null,
        avatar_url: meta.avatar_url || meta.picture || identityData.picture || null,
        isGoogleUser: authUser.app_metadata?.provider === 'google' || 
          authUser.app_metadata?.providers?.includes('google'),
      };
    }
  };

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Invalidate any previously scheduled profile fetch
      profileFetchTokenRef.current += 1;
      const token = profileFetchTokenRef.current;

      if (profileFetchTimeoutRef.current) {
        window.clearTimeout(profileFetchTimeoutRef.current);
        profileFetchTimeoutRef.current = null;
      }

      const authUser = session?.user ?? null;

      if (authUser) {
        // Defer the profile fetch to avoid auth callback issues
        profileFetchTimeoutRef.current = window.setTimeout(() => {
          fetchUserWithProfile(authUser).then((userWithProfile) => {
            // Ignore stale fetch results (e.g. logout happened while this was in-flight)
            if (profileFetchTokenRef.current !== token) return;
            setUser(userWithProfile);
            setIsLoading(false);
          });
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      profileFetchTokenRef.current += 1;
      const token = profileFetchTokenRef.current;

      const authUser = session?.user ?? null;
      const userWithProfile = await fetchUserWithProfile(authUser);

      if (profileFetchTokenRef.current !== token) return;
      setUser(userWithProfile);
      setIsLoading(false);
    });

    return () => {
      if (profileFetchTimeoutRef.current) {
        window.clearTimeout(profileFetchTimeoutRef.current);
        profileFetchTimeoutRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, []);

  // Fetch subscription data directly from Supabase - NO Stripe calls!
  const fetchSubscription = async (): Promise<SubscriptionInfo | null> => {
    if (!user?.email) {
      console.log('No user email available');
      return null;
    }

    try {
      console.log('Querying subscribers table for email:', user.email);
      // Query subscribers table directly - fast and efficient
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end, manual_subscription')
        .eq('email', user.email)
        .maybeSingle();
      
      if (error) {
        console.error('Error querying subscribers:', error);
        throw error;
      }
      
      console.log('Subscribers query result:', data);
      
      const subInfo: SubscriptionInfo = {
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier || null,
        subscription_end: data?.subscription_end || null,
        manual_subscription: data?.manual_subscription || false
      };
      
      // Cache the result
      subscriptionCache.set(subInfo);
      return subInfo;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return { subscribed: false, subscription_tier: null, subscription_end: null };
    }
  };

  const refreshSubscription = async () => {
    if (!user) return;
    
    setIsSubscriptionLoading(true);
    subscriptionCache.clear(); // Clear cache to force refresh
    
    try {
      const subInfo = await fetchSubscription();
      setSubscription(subInfo);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  // Load subscription data when user is available - always fetch fresh on mount
  useEffect(() => {
    if (user) {
      // Clear cache and fetch fresh subscription data on every mount
      subscriptionCache.clear();
      console.log('Fetching subscription for user:', user.email);
      fetchSubscription().then(sub => {
        console.log('Subscription fetched:', sub);
        setSubscription(sub);
      });
    }
  }, [user]);

  const login = (redirectTo?: string) => {
    const next = redirectTo ?? window.location.pathname + window.location.search;
    const url = `/auth${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    window.location.href = url;
  };

  const logout = useCallback(async () => {
    // Invalidate any in-flight profile fetch that could re-set the user after logout
    profileFetchTokenRef.current += 1;
    if (profileFetchTimeoutRef.current) {
      window.clearTimeout(profileFetchTimeoutRef.current);
      profileFetchTimeoutRef.current = null;
    }

    subscriptionCache.clear();
    setUser(null);
    setSubscription(null);

    // Always clear local auth state immediately (even if the server session is already gone)
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      // Avoid blocking logout UX on network/session edge cases
      console.warn("supabase.auth.signOut failed (local scope):", err);
    } finally {
      // Hard redirect ensures all route guards/state are reset
      window.location.assign("/");
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    subscription,
    isSubscriptionLoading,
    refreshSubscription,
    login,
    loginWithRedirect: login,
    logout,
  }), [user, isLoading, subscription, isSubscriptionLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
