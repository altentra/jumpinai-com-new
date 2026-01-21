import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Returns authorization headers with the current Supabase session token
// Required for authenticated edge function calls
export const useAuth0Token = () => {
  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
      } as Record<string, string>;
    }
    
    return {} as Record<string, string>;
  }, []);

  return { getAuthHeaders };
};
