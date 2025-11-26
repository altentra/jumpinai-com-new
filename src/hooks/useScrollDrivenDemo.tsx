import { useEffect, useRef, useState } from 'react';

interface ScrollDrivenDemoState {
  activeTab: string;
  scrollProgress: number;
  isActive: boolean;
}

export const useScrollDrivenDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [demoState, setDemoState] = useState<ScrollDrivenDemoState>({
    activeTab: 'overview',
    scrollProgress: 0,
    isActive: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate when demo becomes active (enters viewport)
      const demoStart = rect.top;
      const demoHeight = rect.height;
      
      // Demo is active when it's in the center third of the viewport
      const activationPoint = windowHeight * 0.3;
      const deactivationPoint = windowHeight * 0.7;
      
      // Check if demo is in active zone
      const isInActiveZone = demoStart < deactivationPoint && demoStart > -demoHeight + activationPoint;
      
      if (!isInActiveZone) {
        setDemoState(prev => ({ ...prev, isActive: false }));
        return;
      }

      // Calculate scroll progress through the demo (0 to 1)
      const scrollStart = demoStart - deactivationPoint;
      const scrollRange = demoHeight + (deactivationPoint - activationPoint);
      const rawProgress = Math.max(0, Math.min(1, -scrollStart / scrollRange));
      
      // Divide progress into 3 sections for 3 tabs
      const sectionSize = 1 / 3;
      let activeTab = 'overview';
      let scrollProgress = 0;

      if (rawProgress < sectionSize) {
        // Overview tab
        activeTab = 'overview';
        scrollProgress = rawProgress / sectionSize;
      } else if (rawProgress < sectionSize * 2) {
        // Plan tab
        activeTab = 'plan';
        scrollProgress = (rawProgress - sectionSize) / sectionSize;
      } else {
        // Tools & Prompts tab
        activeTab = 'tools';
        scrollProgress = (rawProgress - sectionSize * 2) / sectionSize;
      }

      setDemoState({
        activeTab,
        scrollProgress: Math.max(0, Math.min(1, scrollProgress)),
        isActive: true,
      });
    };

    // Initial check
    handleScroll();

    // Optimized scroll listener
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return { containerRef, demoState };
};
