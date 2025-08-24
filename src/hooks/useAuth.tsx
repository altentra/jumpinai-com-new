import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthUser {
  id: string;
  email: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
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

  // Function to fetch and merge user profile data
  const fetchUserWithProfile = async (authUser: any): Promise<AuthUser | null> => {
    if (!authUser) return null;

    try {
      // Fetch profile data from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', authUser.id)
        .single();

      return {
        id: authUser.id,
        email: authUser.email,
        display_name: profile?.display_name || 
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.user_metadata?.display_name ||
          authUser.email?.split('@')[0] || null,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to auth metadata
      return {
        id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.user_metadata?.display_name ||
          authUser.email?.split('@')[0] || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
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
