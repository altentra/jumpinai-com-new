import { useEffect, useRef, useState } from 'react';

interface ScrollDrivenDemoState {
  activeTab: 'overview' | 'plan' | 'tools';
  scrollProgress: number;
  isLocked: boolean;
}

export const useScrollDrivenDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [demoState, setDemoState] = useState<ScrollDrivenDemoState>({
    activeTab: 'overview',
    scrollProgress: 0,
    isLocked: false,
  });
  
  const isLockedRef = useRef(false);
  const accumulatedDeltaRef = useRef(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if demo section is in the "lock zone" 
      const isInLockZone = rect.top <= 50 && rect.bottom > windowHeight * 0.3;
      
      // LOCK: When demo enters lock zone and not already locked
      if (isInLockZone && !isLockedRef.current) {
        e.preventDefault();
        isLockedRef.current = true;
        accumulatedDeltaRef.current = 0;
        
        document.body.style.overflow = 'hidden';
        
        console.log('🔒 LOCKED');
        
        setDemoState({
          activeTab: 'overview',
          scrollProgress: 0,
          isLocked: true,
        });
        return;
      }

      // HANDLE LOCKED SCROLLING
      if (isLockedRef.current) {
        e.preventDefault();
        
        // Accumulate scroll delta (each tab needs ~800px of scroll)
        accumulatedDeltaRef.current += e.deltaY;
        accumulatedDeltaRef.current = Math.max(0, Math.min(2400, accumulatedDeltaRef.current));
        
        const totalProgress = accumulatedDeltaRef.current / 800; // 0-3 range
        
        // Determine active tab and its scroll progress
        let activeTab: 'overview' | 'plan' | 'tools' = 'overview';
        let scrollProgress = 0;
        
        if (totalProgress < 1) {
          activeTab = 'overview';
          scrollProgress = totalProgress;
        } else if (totalProgress < 2) {
          activeTab = 'plan';
          scrollProgress = totalProgress - 1;
        } else {
          activeTab = 'tools';
          scrollProgress = totalProgress - 2;
        }
        
        console.log(`📊 Progress: ${totalProgress.toFixed(2)} | Tab: ${activeTab} | Scroll: ${(scrollProgress * 100).toFixed(0)}%`);
        
        setDemoState({
          activeTab,
          scrollProgress,
          isLocked: true,
        });
        
        // UNLOCK: Completed demo (scrolling forward past end)
        if (accumulatedDeltaRef.current >= 2400 && e.deltaY > 0) {
          console.log('🔓 UNLOCKING - Demo complete');
          
          document.body.style.overflow = '';
          
          isLockedRef.current = false;
          accumulatedDeltaRef.current = 0;
          
          setDemoState({
            activeTab: 'tools',
            scrollProgress: 1,
            isLocked: false,
          });
          
          setTimeout(() => {
            window.scrollBy({ top: 100, behavior: 'smooth' });
          }, 50);
          return;
        }
        
        // UNLOCK: Scrolling back to start
        if (accumulatedDeltaRef.current <= 0 && e.deltaY < 0) {
          console.log('🔓 UNLOCKING - Scrolled back');
          
          document.body.style.overflow = '';
          
          isLockedRef.current = false;
          accumulatedDeltaRef.current = 0;
          
          setDemoState({
            activeTab: 'overview',
            scrollProgress: 0,
            isLocked: false,
          });
          
          setTimeout(() => {
            window.scrollBy({ top: -100, behavior: 'smooth' });
          }, 50);
          return;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      
      if (isLockedRef.current) {
        document.body.style.overflow = '';
        isLockedRef.current = false;
      }
    };
  }, []);

  return { 
    containerRef, 
    demoState
  };
};
