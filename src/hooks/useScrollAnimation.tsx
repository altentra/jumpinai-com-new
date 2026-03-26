import { useEffect, useRef, useState } from 'react';

// Premium easing function for smooth, distinctive end
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

// Staged progress for smoother mobile performance
// Reduces continuous updates by using discrete animation stages
const getStagedProgress = (linearProgress: number): number => {
  // Define smooth stages: 0%, 25%, 50%, 75%, 100%
  // This reduces jerkiness by having fewer, smoother transitions
  if (linearProgress <= 0) return 0;
  if (linearProgress >= 1) return 1;
  
  // Use 5 smooth stages for more fluid mobile performance
  const stages = 5;
  const stage = Math.floor(linearProgress * stages);
  const stageProgress = (linearProgress * stages) - stage;
  
  // Extra smooth interpolation between stages using double easing
  const stageValue = stage / stages;
  const nextStageValue = (stage + 1) / stages;
  
  // Apply easing twice for ultra-smooth transitions
  const smoothProgress = easeOutCubic(easeOutCubic(stageProgress));
  
  return stageValue + (nextStageValue - stageValue) * smoothProgress;
};

export const useScrollAnimation = (options: { threshold?: number; delay?: number } = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastProgressRef = useRef(0);

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
      // End when element is 30-35% into viewport (extended for more visible animation)
      const startPoint = windowHeight * 0.75;
      const endPoint = windowHeight * 0.32;
      
      let newProgress = 0;
      
      if (elementTop > startPoint) {
        newProgress = 0;
      } else if (elementTop < endPoint) {
        newProgress = 1;
      } else {
        // Calculate linear progress
        const linearProgress = 1 - (elementTop - endPoint) / (startPoint - endPoint);
        // Use staged progress for smoother mobile performance
        newProgress = getStagedProgress(linearProgress);
      }
      
      // Only update if progress changed significantly (reduces unnecessary renders)
      const progressDiff = Math.abs(newProgress - lastProgressRef.current);
      if (progressDiff > 0.02) {
        lastProgressRef.current = newProgress;
        setScrollProgress(newProgress);
      }
    };

    // Initial check
    handleScroll();

    // Optimized scroll listener with better performance
    let ticking = false;
    let lastScrollTime = 0;
    const scrollListener = () => {
      const now = Date.now();
      // Mobile-optimized throttling - 16ms for stable 60fps
      const throttleTime = 16;
      if (!ticking && now - lastScrollTime > throttleTime) {
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
