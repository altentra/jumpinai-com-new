import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthUser {
  id: string;
  email: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  isGoogleUser?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (redirectTo?: string) => void;
  loginWithRedirect: (redirectTo?: string) => void; // shim for old calls
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subChecked, setSubChecked] = useState(false);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      
      if (authUser) {
        // Defer the profile fetch to avoid auth callback issues
        setTimeout(async () => {
          const userWithProfile = await fetchUserWithProfile(authUser);
          setUser(userWithProfile);
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const authUser = session?.user ?? null;
      const userWithProfile = await fetchUserWithProfile(authUser);
      setUser(userWithProfile);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !subChecked) {
      supabase.functions.invoke('check-subscription').catch(() => {}).finally(() => setSubChecked(true));
    }
  }, [user, subChecked]);

  const login = (redirectTo?: string) => {
    const next = redirectTo ?? window.location.pathname + window.location.search;
    const url = `/auth${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    window.location.href = url;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithRedirect: login,
    logout,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
