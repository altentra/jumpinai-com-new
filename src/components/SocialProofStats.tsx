import React, { useEffect, useState, useRef } from 'react';
import { Rocket, Wrench, Sparkles, Bot, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  totalJumps: number;
  totalToolPrompts: number;
  totalClarifications: number;
  totalAutomations: number;
  estimatedHoursSaved: number;
}

const useCountUp = (target: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!shouldStart || target === 0) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, shouldStart]);

  return count;
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toLocaleString();
};

const StatItem = React.memo(({ icon: Icon, value, label, color, delay, isVisible }: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  delay: number;
  isVisible: boolean;
}) => {
  const animatedValue = useCountUp(value, 2200, isVisible);

  return (
    <div
      className="flex flex-col items-center gap-1.5 sm:gap-2 px-3 sm:px-6 transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
      <div className="text-center">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tabular-nums tracking-tight">
          {formatNumber(animatedValue)}+
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
});

StatItem.displayName = 'StatItem';

const SocialProofStats: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('platform-stats');
        if (error) throw error;
        setStats(data as PlatformStats);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!stats) return null;

  const statItems = [
    { icon: Rocket, value: stats.totalJumps, label: 'AI Jumps Created', color: 'bg-blue-500' },
    { icon: Wrench, value: stats.totalToolPrompts, label: 'Tool-Prompt Combos', color: 'bg-green-500' },
    { icon: Sparkles, value: stats.totalClarifications, label: 'Clarifications Made', color: 'bg-orange-500' },
    { icon: Bot, value: stats.totalAutomations, label: 'Automations Built', color: 'bg-cyan-500' },
    { icon: Clock, value: stats.estimatedHoursSaved, label: 'Hours Saved', color: 'bg-purple-500' },
  ];

  return (
    <section ref={sectionRef} className="py-10 sm:py-14 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center mb-6 sm:mb-8 transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Platform Impact
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-6 sm:p-8">
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none"></div>

            <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-4">
              {statItems.map((item, index) => (
                <StatItem
                  key={item.label}
                  icon={item.icon}
                  value={item.value}
                  label={item.label}
                  color={item.color}
                  delay={index * 150}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofStats;
