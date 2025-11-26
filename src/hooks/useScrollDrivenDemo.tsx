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
      // Lock when top of section reaches top of viewport (with small offset for header)
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const headerOffset = 100; // Account for any header
      
      // Demo should lock when it's centered in viewport
      const shouldLock = sectionTop <= headerOffset && sectionBottom > windowHeight * 0.5;
      
      console.log('Scroll Debug:', {
        isLocked: isLockedRef.current,
        sectionTop,
        sectionBottom,
        windowHeight,
        shouldLock,
        accumulator: scrollAccumulatorRef.current
      });
      
      if (shouldLock && !isLockedRef.current) {
        // Lock scroll when demo enters viewport
        console.log('🔒 LOCKING SCROLL');
        isLockedRef.current = true;
        scrollAccumulatorRef.current = 0;
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        setDemoState(prev => ({ ...prev, isLocked: true }));
      }

      if (isLockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        
        // Accumulate scroll delta (normalized for different devices)
        const delta = e.deltaY;
        const scrollSpeed = 0.0015; // Adjusted sensitivity
        scrollAccumulatorRef.current += delta * scrollSpeed;
        
        console.log('📜 Scrolling locked, accumulator:', scrollAccumulatorRef.current);
        
        // Clamp between 0 and 1
        scrollAccumulatorRef.current = Math.max(0, Math.min(1, scrollAccumulatorRef.current));
        
        const newState = calculateTabState(scrollAccumulatorRef.current);
        
        // Check if we've completed the entire demo
        if (scrollAccumulatorRef.current >= 1 && delta > 0) {
          // Unlock and allow normal scroll to continue
          console.log('🔓 UNLOCKING SCROLL - Demo complete');
          isLockedRef.current = false;
          document.body.style.overflow = '';
          document.body.style.height = '';
          setDemoState({ ...newState, isLocked: false });
          return;
        }
        
        // Check if scrolling back before demo start
        if (scrollAccumulatorRef.current <= 0 && delta < 0) {
          // Unlock and allow scroll up
          console.log('🔓 UNLOCKING SCROLL - Scrolling back');
          isLockedRef.current = false;
          document.body.style.overflow = '';
          document.body.style.height = '';
          setDemoState({ ...newState, isLocked: false });
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
      isLockedRef.current = false;
    };
  }, [calculateTabState]);

  return { containerRef, demoState };
};
