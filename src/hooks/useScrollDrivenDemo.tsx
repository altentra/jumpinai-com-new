import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollDrivenDemoState {
  activeTab: string;
  scrollProgress: number;
  isLocked: boolean;
  totalProgress: number; // 0-1 across all tabs
}

export const useScrollDrivenDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [demoState, setDemoState] = useState<ScrollDrivenDemoState>({
    activeTab: 'overview',
    scrollProgress: 0,
    isLocked: false,
    totalProgress: 0,
  });
  
  const scrollAccumulatorRef = useRef(0);
  const isLockedRef = useRef(false);
  const lastWheelTimeRef = useRef(0);

  // Calculate which tab and progress based on total progress (0-1)
  const calculateTabState = useCallback((totalProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, totalProgress));
    const sectionSize = 1 / 3;
    
    let activeTab = 'overview';
    let scrollProgress = 0;

    if (clampedProgress < sectionSize) {
      activeTab = 'overview';
      scrollProgress = clampedProgress / sectionSize;
    } else if (clampedProgress < sectionSize * 2) {
      activeTab = 'plan';
      scrollProgress = (clampedProgress - sectionSize) / sectionSize;
    } else {
      activeTab = 'tools';
      scrollProgress = (clampedProgress - sectionSize * 2) / sectionSize;
    }

    return { activeTab, scrollProgress, totalProgress: clampedProgress };
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if demo section is in a position to start locking
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const headerOffset = 100;
      
      // Demo should lock when it's near top of viewport
      const shouldLock = sectionTop <= headerOffset && sectionBottom > windowHeight * 0.5;
      
      if (shouldLock && !isLockedRef.current) {
        // Lock scroll when demo enters viewport
        console.log('🔒 LOCKING SCROLL');
        isLockedRef.current = true;
        scrollAccumulatorRef.current = 0;
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        setDemoState(prev => ({ ...prev, isLocked: true, totalProgress: 0 }));
      }

      if (isLockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        
        // Accumulate scroll delta
        const delta = e.deltaY;
        const scrollSpeed = 0.0012; // Slower for more control
        scrollAccumulatorRef.current += delta * scrollSpeed;
        
        // Clamp between -0.1 and 1.1 to allow some buffer for unlocking
        scrollAccumulatorRef.current = Math.max(-0.05, Math.min(1.05, scrollAccumulatorRef.current));
        
        console.log('📜 Progress:', scrollAccumulatorRef.current.toFixed(3));
        
        const newState = calculateTabState(scrollAccumulatorRef.current);
        
        // Check if we've completed the entire demo and scrolling forward
        if (scrollAccumulatorRef.current >= 1.0 && delta > 0) {
          // Unlock and allow normal scroll to continue
          console.log('🔓 UNLOCKING SCROLL - Demo complete, continuing down');
          isLockedRef.current = false;
          document.body.style.overflow = '';
          document.body.style.height = '';
          document.body.style.position = '';
          document.body.style.width = '';
          scrollAccumulatorRef.current = 0;
          setDemoState({ ...newState, isLocked: false });
          // Small delay to allow normal scroll to take over
          setTimeout(() => {
            window.scrollBy({ top: 50, behavior: 'smooth' });
          }, 50);
          return;
        }
        
        // Check if scrolling back before demo start
        if (scrollAccumulatorRef.current <= 0 && delta < 0) {
          // Unlock and allow scroll up
          console.log('🔓 UNLOCKING SCROLL - Scrolling back up');
          isLockedRef.current = false;
          document.body.style.overflow = '';
          document.body.style.height = '';
          document.body.style.position = '';
          document.body.style.width = '';
          scrollAccumulatorRef.current = 0;
          setDemoState({ ...newState, isLocked: false });
          // Small delay to allow normal scroll to take over
          setTimeout(() => {
            window.scrollBy({ top: -50, behavior: 'smooth' });
          }, 50);
          return;
        }
        
        setDemoState({ ...newState, isLocked: true });
        lastWheelTimeRef.current = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isLockedRef.current) {
        e.preventDefault();
      }
    };

    console.log('✅ Scroll listeners attached');

    // Add wheel listener (non-passive to allow preventDefault)
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      console.log('🧹 Cleanup: removing listeners');
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      // Cleanup: ensure scroll is unlocked
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
      isLockedRef.current = false;
    };
  }, [calculateTabState]);

  return { containerRef, demoState };
};
