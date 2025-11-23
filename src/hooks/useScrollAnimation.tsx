import { useEffect, useRef, useState } from 'react';

// Premium easing function for smooth, distinctive end
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const useScrollAnimation = (options: { threshold?: number; delay?: number } = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Optimized viewport calculation
      const elementTop = rect.top;
      
      // Animation completes earlier and more distinctly
      // Start when element is 75% into viewport
      // End when element is 50% into viewport (much earlier than before)
      const startPoint = windowHeight * 0.75;
      const endPoint = windowHeight * 0.5;
      
      if (elementTop > startPoint) {
        setScrollProgress(0);
      } else if (elementTop < endPoint) {
        setScrollProgress(1);
      } else {
        // Calculate linear progress
        const linearProgress = 1 - (elementTop - endPoint) / (startPoint - endPoint);
        // Apply premium easing for distinctive end movement
        const easedProgress = easeOutCubic(linearProgress);
        setScrollProgress(Math.max(0, Math.min(1, easedProgress)));
      }
    };

    // Initial check
    handleScroll();

    // Optimized scroll listener with better performance
    let ticking = false;
    let lastScrollTime = 0;
    const scrollListener = () => {
      const now = Date.now();
      // Throttle to max 60fps for smoother performance on all devices
      if (!ticking && now - lastScrollTime > 16) {
        lastScrollTime = now;
        ticking = true;
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return { elementRef, scrollProgress };
};
