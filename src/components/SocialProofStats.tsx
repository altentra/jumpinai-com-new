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

const StatItem = React.memo(({ icon: Icon, value, label, gradient, glowColor, delay, isVisible }: {
  icon: React.ElementType;
  value: number;
  label: string;
  gradient: string;
  glowColor: string;
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
      {/* Icon container with glow ring */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className={`absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-xl ${glowColor}`}
        />
        {/* Icon pill */}
        <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white drop-shadow-sm" strokeWidth={1.8} />
        </div>
      </div>

      {/* Value + label */}
      <div className="text-center space-y-0.5">
        <p className="text-2xl sm:text-3xl md:text-[2rem] font-extrabold text-white tabular-nums tracking-tight leading-none">
          {formatNumber(animatedValue)}
          <span className="text-white/40 font-semibold">+</span>
        </p>
        <p className="text-[10px] sm:text-[11px] text-white/50 font-semibold uppercase tracking-[0.15em] leading-tight">
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
    {
      icon: Rocket,
      value: stats.totalJumps,
      label: 'AI Jumps',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      glowColor: 'bg-blue-500/40',
    },
    {
      icon: Wrench,
      value: stats.totalToolPrompts,
      label: 'Tool-Prompt Combos',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      glowColor: 'bg-emerald-500/40',
    },
    {
      icon: Sparkles,
      value: stats.totalClarifications,
      label: 'Clarifications',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      glowColor: 'bg-amber-500/40',
    },
    {
      icon: Bot,
      value: stats.totalAutomations,
      label: 'Automations',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      glowColor: 'bg-cyan-500/40',
    },
    {
      icon: Clock,
      value: stats.estimatedHoursSaved,
      label: 'Hours Saved',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      glowColor: 'bg-violet-500/40',
    },
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
                  gradient={item.gradient}
                  glowColor={item.glowColor}
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
