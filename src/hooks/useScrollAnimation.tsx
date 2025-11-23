import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (options: { threshold?: number; delay?: number } = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from entering the viewport
      // When element is below viewport: positive value
      // When element is in viewport: 0 to 1
      // When element is above viewport: > 1
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Start animation when element is 20% into viewport
      const startPoint = windowHeight * 0.8;
      const endPoint = windowHeight * 0.2;
      
      if (elementTop > startPoint) {
        // Element hasn't entered animation zone yet
        setScrollProgress(0);
      } else if (elementTop < endPoint) {
        // Element has fully animated
        setScrollProgress(1);
      } else {
        // Element is animating
        const progress = 1 - (elementTop - endPoint) / (startPoint - endPoint);
        setScrollProgress(Math.max(0, Math.min(1, progress)));
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener with throttling for performance
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

  return { elementRef, scrollProgress };
};
