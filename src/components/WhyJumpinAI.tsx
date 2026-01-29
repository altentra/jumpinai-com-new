import React from 'react';
import { ArrowRight, Zap, Target, Rocket } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

const WhyJumpinAI = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useOptimizedAuth();
  
  const { elementRef: headerRef, scrollProgress: headerProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: statementsRef, scrollProgress: statementsProgress } = useScrollAnimation({ threshold: 0.1 });
  const { elementRef: ctaRef, scrollProgress: ctaProgress } = useScrollAnimation({ threshold: 0.15 });

  const statements = [
    {
      icon: Zap,
      highlight: "Stop Wasting Time",
      subtext: "on endless research and trial-and-error",
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/20",
    },
    {
      icon: Target,
      highlight: "Know Exactly What To Do",
      subtext: "with a clear path tailored to you",
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/20",
    },
    {
      icon: Rocket,
      highlight: "Turn AI Overwhelm Into Results",
      subtext: "from confusion to execution—automatically",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/20",
    },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/jumpinai-studio');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className="text-center mb-16 sm:mb-20 transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, headerProgress * 2),
            transform: `translateY(${(1 - Math.min(1, headerProgress * 2)) * 30}px)`
          }}
        >
          <p className="text-sm sm:text-base font-semibold text-primary tracking-wide uppercase mb-4">
            What You Gain
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-display leading-tight">
            <span className="text-muted-foreground">Everyone talks about AI.</span>
            <br />
            <span className="gradient-text-primary">We help you actually use it.</span>
          </h2>
        </div>

        {/* 3 Bold Statements */}
        <div 
          ref={statementsRef}
          className="max-w-5xl mx-auto space-y-6 sm:space-y-8 mb-16 sm:mb-20"
        >
          {statements.map((statement, index) => {
            const Icon = statement.icon;
            const delay = index * 0.15;
            const progress = Math.max(0, statementsProgress - delay);
            const normalizedProgress = Math.min(1, progress * 2);
            
            return (
              <div
                key={index}
                className="group relative transition-all duration-700 ease-out"
                style={{
                  opacity: normalizedProgress,
                  transform: `translateX(${(1 - normalizedProgress) * (index % 2 === 0 ? -60 : 60)}px)`
                }}
              >
                {/* Statement card */}
                <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-border/50 hover:border-primary/30 transition-all duration-500 group-hover:shadow-modern-lg overflow-hidden">
                  {/* Hover glow */}
                  <div className={`absolute inset-0 ${statement.bgGlow} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl`}></div>
                  
                  <div className="relative z-10 flex items-center gap-4 sm:gap-6 lg:gap-8">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${statement.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r ${statement.gradient} bg-clip-text text-transparent leading-tight`}>
                        {statement.highlight}
                      </h3>
                      <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mt-1 sm:mt-2">
                        {statement.subtext}
                      </p>
                    </div>
                    
                    {/* Arrow indicator */}
                    <ArrowRight className="hidden sm:block flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div 
          ref={ctaRef}
          className="text-center transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, ctaProgress * 2),
            transform: `translateY(${(1 - Math.min(1, ctaProgress * 2)) * 30}px)`
          }}
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 sm:px-14 py-6 sm:py-7 text-lg sm:text-xl font-semibold rounded-full transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Start Your Jump — Free
            <Rocket className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-5">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyJumpinAI;
