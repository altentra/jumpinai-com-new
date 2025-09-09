import { useState, useEffect } from 'react';
import { getJumpById, getUserJumps, UserJump } from '@/services/jumpService';

export const useJumpInfo = (jumpId?: string) => {
  const [jumpInfo, setJumpInfo] = useState<UserJump | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!jumpId) {
      setJumpInfo(null);
      return;
    }

    const fetchJumpInfo = async () => {
      setIsLoading(true);
      try {
        const jump = await getJumpById(jumpId);
        setJumpInfo(jump);
      } catch (error) {
        console.error('Error fetching jump info:', error);
        setJumpInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJumpInfo();
  }, [jumpId]);

  return { jumpInfo, isLoading };
};

// Hook to fetch multiple jump infos at once with jump numbers
export const useJumpsInfo = (jumpIds: (string | undefined)[]) => {
  const [jumpsInfo, setJumpsInfo] = useState<Record<string, UserJump & { jumpNumber: number }>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validJumpIds = jumpIds.filter((id): id is string => !!id);
    if (validJumpIds.length === 0) {
      setJumpsInfo({});
      return;
    }

    const fetchJumpsInfo = async () => {
      setIsLoading(true);
      try {
        // Get all user jumps to determine jump numbers
        const allJumps = await getUserJumps();
        
        // Sort by creation date to assign consistent numbers
        const sortedJumps = allJumps.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Create a mapping of jump ID to jump number
        const jumpNumberMap: Record<string, number> = {};
        sortedJumps.forEach((jump, index) => {
          jumpNumberMap[jump.id] = index + 1;
        });
        
        // Fetch specific jump details for requested IDs
        const promises = validJumpIds.map(async (jumpId) => {
          const jump = await getJumpById(jumpId);
          return { jumpId, jump, jumpNumber: jumpNumberMap[jumpId] || 0 };
        });
        
        const results = await Promise.all(promises);
        const jumpsMap: Record<string, UserJump & { jumpNumber: number }> = {};
        
        results.forEach(({ jumpId, jump, jumpNumber }) => {
          if (jump) {
            jumpsMap[jumpId] = { ...jump, jumpNumber };
          }
        });
        
        setJumpsInfo(jumpsMap);
      } catch (error) {
        console.error('Error fetching jumps info:', error);
        setJumpsInfo({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchJumpsInfo();
  }, [JSON.stringify(jumpIds.filter(Boolean))]);

  return { jumpsInfo, isLoading };
};