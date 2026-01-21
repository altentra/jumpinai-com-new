import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SavedAgent {
  id: string;
  title: string;
  description: string | null;
  automation_target: string | null;
  automation_type: string | null;
  impact_level: string | null;
  complexity_level: string | null;
  estimated_time_saved: string | null;
  required_tools: string[];
  benefits: string[];
  workflow_json: any;
  workflow_filename: string | null;
  detailed_instructions: any;
  platform: string;
  status: string;
  download_count: number;
  created_at: string;
  jump_id: string;
}

const CACHE_KEY = 'user-automations';
const STALE_TIME = 2 * 60 * 1000; // 2 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// LocalStorage cache for instant loading
const getLocalCache = (userId: string): SavedAgent[] | null => {
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
    console.error('Error reading automations cache:', e);
  }
  return null;
};

const setLocalCache = (userId: string, data: SavedAgent[]) => {
  try {
    localStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error writing automations cache:', e);
  }
};

const fetchAutomations = async (userId: string): Promise<SavedAgent[]> => {
  const { data, error } = await supabase
    .from('user_agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const mappedAgents: SavedAgent[] = (data || []).map(agent => ({
    ...agent,
    automation_type: agent.automation_type || 'workflow',
  }));

  // Update local cache
  setLocalCache(userId, mappedAgents);

  return mappedAgents;
};

export const useAutomations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CACHE_KEY, user?.id],
    queryFn: () => fetchAutomations(user!.id),
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    initialData: () => {
      if (user?.id) {
        return getLocalCache(user.id) || undefined;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
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

  const deleteMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('user_agents')
        .delete()
        .eq('id', agentId);
      
      if (error) throw error;
      return agentId;
    },
    onSuccess: (deletedId) => {
      // Update cache optimistically
      queryClient.setQueryData([CACHE_KEY, user?.id], (old: SavedAgent[] | undefined) => 
        old?.filter(a => a.id !== deletedId) || []
      );
      
      // Also update local storage cache
      if (user?.id) {
        const currentData = query.data?.filter(a => a.id !== deletedId) || [];
        setLocalCache(user.id, currentData);
      }
      
      toast.success("Automation deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete automation");
    }
  });

  const invalidateCache = () => {
    if (user?.id) {
      localStorage.removeItem(`${CACHE_KEY}-${user.id}`);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEY, user.id] });
    }
  };

  const addToCache = (agent: SavedAgent) => {
    queryClient.setQueryData([CACHE_KEY, user?.id], (old: SavedAgent[] | undefined) => {
      const updated = [agent, ...(old || [])];
      if (user?.id) {
        setLocalCache(user.id, updated);
      }
      return updated;
    });
  };

  return {
    automations: query.data || [],
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    invalidateCache,
    addToCache,
    deleteAutomation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
