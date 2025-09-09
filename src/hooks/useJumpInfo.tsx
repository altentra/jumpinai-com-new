import { useState, useEffect } from 'react';
import { getJumpById, UserJump } from '@/services/jumpService';

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

// Hook to fetch multiple jump infos at once
export const useJumpsInfo = (jumpIds: (string | undefined)[]) => {
  const [jumpsInfo, setJumpsInfo] = useState<Record<string, UserJump>>({});
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
        const promises = validJumpIds.map(async (jumpId) => {
          const jump = await getJumpById(jumpId);
          return { jumpId, jump };
        });
        
        const results = await Promise.all(promises);
        const jumpsMap: Record<string, UserJump> = {};
        
        results.forEach(({ jumpId, jump }) => {
          if (jump) {
            jumpsMap[jumpId] = jump;
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