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
  const totalProgressRef = useRef(0); // 0 to 3 (one unit per tab)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if demo is in viewport
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      
      // Lock when section reaches top of viewport
      const shouldStartLocking = sectionTop <= 100 && sectionBottom > windowHeight / 2;
      
      // Start lock sequence
      if (shouldStartLocking && !isLockedRef.current) {
        console.log('🔒 LOCKING SCROLL');
        e.preventDefault();
        isLockedRef.current = true;
        totalProgressRef.current = 0;
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        
        setDemoState({
          activeTab: 'overview',
          scrollProgress: 0,
          isLocked: true,
        });
        return;
      }

      // Handle locked scroll
      if (isLockedRef.current) {
        e.preventDefault();
        
        const delta = e.deltaY;
        const scrollSpeed = 0.003;
        
        // Update total progress (0-3 range for 3 tabs)
        totalProgressRef.current += delta * scrollSpeed;
        totalProgressRef.current = Math.max(0, Math.min(3, totalProgressRef.current));
        
        const progress = totalProgressRef.current;
        
        console.log('📊 Tab Progress:', progress.toFixed(2));
        
        // Determine which tab and scroll position
        let activeTab: 'overview' | 'plan' | 'tools' = 'overview';
        let scrollProgress = 0;
        
        if (progress < 1) {
          activeTab = 'overview';
          scrollProgress = progress;
        } else if (progress < 2) {
          activeTab = 'plan';
          scrollProgress = progress - 1;
        } else {
          activeTab = 'tools';
          scrollProgress = progress - 2;
        }
        
        console.log(`📜 Tab: ${activeTab}, Scroll: ${(scrollProgress * 100).toFixed(0)}%`);
        
        // Update state
        setDemoState({
          activeTab,
          scrollProgress,
          isLocked: true,
        });
        
        // Check if completed (scrolling forward past end)
        if (progress >= 3 && delta > 0) {
          console.log('🔓 UNLOCKING - Demo complete');
          isLockedRef.current = false;
          totalProgressRef.current = 0;
          
          // Unlock and continue scrolling
          document.body.style.overflow = '';
          document.body.style.height = '';
          
          setDemoState({
            activeTab: 'tools',
            scrollProgress: 1,
            isLocked: false,
          });
          
          // Smooth continue scroll
          requestAnimationFrame(() => {
            window.scrollBy({ top: 200, behavior: 'smooth' });
          });
          return;
        }
        
        // Check if scrolling back past start
        if (progress <= 0 && delta < 0) {
          console.log('🔓 UNLOCKING - Scrolling back');
          isLockedRef.current = false;
          totalProgressRef.current = 0;
          
          // Unlock and allow backward scroll
          document.body.style.overflow = '';
          document.body.style.height = '';
          
          setDemoState({
            activeTab: 'overview',
            scrollProgress: 0,
            isLocked: false,
          });
          
          // Smooth continue scroll backward
          requestAnimationFrame(() => {
            window.scrollBy({ top: -200, behavior: 'smooth' });
          });
          return;
        }
      }
    };

    console.log('✅ Scroll listeners attached');
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      console.log('🧹 Cleanup listeners');
      window.removeEventListener('wheel', handleWheel);
      
      // Ensure unlock on cleanup
      if (isLockedRef.current) {
        document.body.style.overflow = '';
        document.body.style.height = '';
        isLockedRef.current = false;
      }
    };
  }, []);

  return { 
    containerRef, 
    demoState
  };
};
