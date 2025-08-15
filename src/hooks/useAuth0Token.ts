import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

export const useAuth0Token = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getAuthHeaders = useCallback(async () => {
    if (!isAuthenticated) {
      return {};
    }

    try {
      const token = await getAccessTokenSilently();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting Auth0 token:', error);
      return {};
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  return { getAuthHeaders };
};