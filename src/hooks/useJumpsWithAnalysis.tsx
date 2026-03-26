import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserJumps, UserJump } from '@/services/jumpService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface JumpWithAnalysis extends UserJump {
  hasAnalysis?: boolean;
}

const CACHE_KEY = 'jumps-with-analysis';
const STALE_TIME = 2 * 60 * 1000; // 2 minutes - data considered fresh
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes - keep in cache

// LocalStorage cache for instant loading
const getLocalCache = (userId: string): JumpWithAnalysis[] | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}-${userId}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Use local cache if less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    console.error('Error reading jumps cache:', e);
  }
  return null;
};

const setLocalCache = (userId: string, data: JumpWithAnalysis[]) => {
  try {
    localStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error writing jumps cache:', e);
  }
};

const fetchJumpsWithAnalysis = async (userId: string): Promise<JumpWithAnalysis[]> => {
  // Fetch jumps and analyses in parallel
  const [userJumps, analysesResult] = await Promise.all([
    getUserJumps(),
    supabase
      .from('jump_analysis')
      .select('jump_id')
      .eq('user_id', userId)
  ]);

  const analysedJumpIds = new Set(analysesResult.data?.map(a => a.jump_id) || []);

  const jumpsWithAnalysis = userJumps.map(jump => ({
    ...jump,
    hasAnalysis: analysedJumpIds.has(jump.id),
  }));

  // Sort by creation date, newest first
  const sortedJumps = jumpsWithAnalysis.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Update local cache
  setLocalCache(userId, sortedJumps);

  return sortedJumps;
};

export const useJumpsWithAnalysis = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CACHE_KEY, user?.id],
    queryFn: () => fetchJumpsWithAnalysis(user!.id),
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    // Use local cache as initial data for instant loading
    initialData: () => {
      if (user?.id) {
        return getLocalCache(user.id) || undefined;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      // Tell React Query when the initial data was fetched
      if (user?.id) {
        try {
          const cached = localStorage.getItem(`${CACHE_KEY}-${user.id}`);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            return timestamp;
          }
        } catch (e) {}
      }
      return 0;
    },
  });

  const invalidateCache = () => {
    if (user?.id) {
      localStorage.removeItem(`${CACHE_KEY}-${user.id}`);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEY, user.id] });
    }
  };

  return {
    jumps: query.data || [],
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    invalidateCache,
  };
};

// Export for use in other components
export type { JumpWithAnalysis };
