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
    
    console.log('🎯 useJumpsInfo - fetching info for jump IDs:', validJumpIds);
    
    if (validJumpIds.length === 0) {
      setJumpsInfo({});
      return;
    }

    const fetchJumpsInfo = async () => {
      setIsLoading(true);
      try {
        console.log('📥 Fetching all user jumps...');
        
        // Get all user jumps at once (more efficient than individual fetches)
        const allJumps = await getUserJumps();
        
        console.log('✅ Fetched all jumps:', allJumps.length);
        
        // Sort by creation date to assign consistent numbers
        const sortedJumps = allJumps.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Create a mapping of jump ID to jump info with number
        const jumpsMap: Record<string, UserJump & { jumpNumber: number }> = {};
        
        sortedJumps.forEach((jump, index) => {
          // Only include jumps that are in the requested IDs
          if (validJumpIds.includes(jump.id)) {
            jumpsMap[jump.id] = {
              ...jump,
              jumpNumber: index + 1
            };
          }
        });
        
        console.log('✅ Mapped jump info for', Object.keys(jumpsMap).length, 'jumps');
        console.log('📋 Mapped jump IDs:', Object.keys(jumpsMap));
        
        setJumpsInfo(jumpsMap);
      } catch (error) {
        console.error('❌ Error fetching jumps info:', error);
        setJumpsInfo({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchJumpsInfo();
  }, [JSON.stringify(jumpIds.filter(Boolean))]);

  return { jumpsInfo, isLoading };
};