import { useCallback } from 'react';

// Auth0 has been removed. This hook now returns empty headers because
// our Supabase Edge Functions do not require extra auth headers.
export const useAuth0Token = () => {
  const getAuthHeaders = useCallback(async () => {
    return {} as Record<string, string>;
  }, []);

  return { getAuthHeaders };
};
