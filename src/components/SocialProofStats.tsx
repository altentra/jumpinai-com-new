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

const useCountUp = (target: number, duration: number = 1400, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!shouldStart || target === 0) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
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

const StatItem = React.memo(({ icon: Icon, value, label, delay, isVisible }: {
  icon: React.ElementType;
  value: number;
  label: string;
  delay: number;
  isVisible: boolean;
}) => {
  const animatedValue = useCountUp(value, 1400, isVisible);

  return (
    <div
      className="group flex flex-col items-center gap-3 sm:gap-4 px-2 sm:px-4 transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Icon — dark glass pill */}
      <div className="relative">
        <div className="absolute -inset-1.5 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-white/10 blur-lg" />
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.07] group-hover:border-white/[0.14] transition-all duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5 text-white/50 group-hover:text-white/75 transition-colors duration-300" strokeWidth={1.5} />
        </div>
      </div>

      {/* Value + label */}
      <div className="text-center space-y-0.5">
        <p className="text-2xl sm:text-3xl md:text-[2rem] font-extrabold text-white/90 tabular-nums tracking-tight leading-none">
          {formatNumber(animatedValue)}
          <span className="text-white/25 font-semibold">+</span>
        </p>
        <p className="text-[10px] sm:text-[11px] text-white/30 font-semibold uppercase tracking-[0.15em] leading-tight">
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!stats) return null;

  const statItems = [
    { icon: Rocket, value: stats.totalJumps, label: 'AI Jumps' },
    { icon: Wrench, value: stats.totalToolPrompts, label: 'Tool-Prompt Combos' },
    { icon: Sparkles, value: stats.totalClarifications, label: 'Clarifications' },
    { icon: Bot, value: stats.totalAutomations, label: 'Automations' },
    { icon: Clock, value: stats.estimatedHoursSaved, label: 'Hours Saved' },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[180px] bg-gradient-to-r from-blue-500/[0.04] via-violet-500/[0.06] to-cyan-500/[0.04] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Glass card */}
          <div className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-8 sm:p-10">
            {/* Top edge highlight */}
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
            {/* Inner glow */}
            <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none"></div>

            <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 sm:gap-6">
              {statItems.map((item, index) => (
                <StatItem
                  key={item.label}
                  icon={item.icon}
                  value={item.value}
                  label={item.label}
                  delay={index * 120}
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
