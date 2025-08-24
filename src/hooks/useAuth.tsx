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

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sUser = session?.user ?? null;
      setUser(sUser ? {
        id: sUser.id,
        email: sUser.email,
        display_name: (sUser.user_metadata as any)?.display_name ?? null,
        avatar_url: (sUser.user_metadata as any)?.avatar_url ?? null,
      } : null);
      setIsLoading(false);
    });

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sUser = session?.user ?? null;
      setUser(sUser ? {
        id: sUser.id,
        email: sUser.email,
        display_name: (sUser.user_metadata as any)?.display_name ?? null,
        avatar_url: (sUser.user_metadata as any)?.avatar_url ?? null,
      } : null);
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
