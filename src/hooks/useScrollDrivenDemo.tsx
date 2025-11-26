import { useEffect, useRef, useState } from 'react';

interface ScrollDrivenDemoState {
  activeTab: string;
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
  const savedScrollPositionRef = useRef(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if demo is in viewport and ready to lock
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      
      // Lock when section top is near viewport top
      const shouldStartLocking = sectionTop <= 120 && sectionBottom > windowHeight / 2;
      
      // Start lock sequence
      if (shouldStartLocking && !isLockedRef.current) {
        console.log('🔒 LOCKING SCROLL');
        isLockedRef.current = true;
        totalProgressRef.current = 0;
        savedScrollPositionRef.current = window.scrollY;
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollPositionRef.current}px`;
        document.body.style.width = '100%';
        
        setDemoState({
          activeTab: 'overview',
          scrollProgress: 0,
          isLocked: true,
        });
      }

      // Handle locked scroll
      if (isLockedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        
        const delta = e.deltaY;
        const scrollSpeed = 0.004; // Adjusted for better feel
        
        // Update total progress (0-3 range for 3 tabs)
        totalProgressRef.current += delta * scrollSpeed;
        totalProgressRef.current = Math.max(-0.1, Math.min(3.1, totalProgressRef.current));
        
        const progress = totalProgressRef.current;
        
        console.log('📊 Tab Progress:', progress.toFixed(2));
        
        // Determine which tab and scroll position
        let activeTab = 'overview';
        let scrollProgress = 0;
        
        if (progress < 1) {
          activeTab = 'overview';
          scrollProgress = Math.max(0, Math.min(1, progress));
        } else if (progress < 2) {
          activeTab = 'plan';
          scrollProgress = Math.max(0, Math.min(1, progress - 1));
        } else if (progress < 3) {
          activeTab = 'tools';
          scrollProgress = Math.max(0, Math.min(1, progress - 2));
        } else {
          activeTab = 'tools';
          scrollProgress = 1;
        }
        
        console.log(`📜 Tab: ${activeTab}, Scroll: ${(scrollProgress * 100).toFixed(0)}%`);
        
        // Update state (this will trigger useEffect in component to scroll)
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
          
          // Unlock body scroll
          const scrollY = savedScrollPositionRef.current;
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
          
          setDemoState({
            activeTab: 'tools',
            scrollProgress: 1,
            isLocked: false,
          });
          
          // Continue scroll momentum
          setTimeout(() => {
            window.scrollBy({ top: 100, behavior: 'smooth' });
          }, 100);
          return;
        }
        
        // Check if scrolling back past start
        if (progress <= 0 && delta < 0) {
          console.log('🔓 UNLOCKING - Scrolling back');
          isLockedRef.current = false;
          totalProgressRef.current = 0;
          
          // Unlock body scroll
          const scrollY = savedScrollPositionRef.current;
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
          
          setDemoState({
            activeTab: 'overview',
            scrollProgress: 0,
            isLocked: false,
          });
          
          // Continue scroll momentum
          setTimeout(() => {
            window.scrollBy({ top: -100, behavior: 'smooth' });
          }, 100);
          return;
        }
      }
    };

    console.log('✅ Listeners attached');
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      console.log('🧹 Cleanup');
      window.removeEventListener('wheel', handleWheel);
      
      // Ensure unlock on cleanup
      if (isLockedRef.current) {
        const scrollY = savedScrollPositionRef.current;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) window.scrollTo(0, scrollY);
        isLockedRef.current = false;
      }
    };
  }, []);

  return { 
    containerRef, 
    demoState
  };
};
