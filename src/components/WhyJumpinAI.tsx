import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { ArrowRight } from 'lucide-react';

const WhyJumpinAI = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useOptimizedAuth();
  
  const { elementRef: headerRef, scrollProgress: headerProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: statementsRef, scrollProgress: statementsProgress } = useScrollAnimation({ threshold: 0.05 });
  const { elementRef: ctaRef, scrollProgress: ctaProgress } = useScrollAnimation({ threshold: 0.15 });

  const statements = [
    {
      number: "01",
      highlight: "Reclaim Your Time",
      description: "Automate the tasks that drain your day. Let AI handle the repetitive, so you can focus on what truly matters.",
      accentColor: "from-amber-400 via-orange-500 to-red-500",
      bgGlow: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent",
      borderGlow: "group-hover:shadow-[0_0_60px_-12px_rgba(251,146,60,0.4)]",
    },
    {
      number: "02",
      highlight: "End the Overwhelm",
      description: "Stop drowning in AI options. Get one clear, personalized path forward—built specifically for your goals.",
      accentColor: "from-cyan-400 via-blue-500 to-indigo-500",
      bgGlow: "bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent",
      borderGlow: "group-hover:shadow-[0_0_60px_-12px_rgba(34,211,238,0.4)]",
    },
    {
      number: "03",
      highlight: "Become AI-Empowered",
      description: "Shift from watching AI change the world to using it to change yours. From spectator to strategist.",
      accentColor: "from-violet-400 via-purple-500 to-fuchsia-500",
      bgGlow: "bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent",
      borderGlow: "group-hover:shadow-[0_0_60px_-12px_rgba(167,139,250,0.4)]",
    },
    {
      number: "04",
      highlight: "Achieve What Felt Impossible",
      description: "The productivity, the efficiency, the results you thought required a team—now within your reach.",
      accentColor: "from-emerald-400 via-green-500 to-teal-500",
      bgGlow: "bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent",
      borderGlow: "group-hover:shadow-[0_0_60px_-12px_rgba(52,211,153,0.4)]",
    },
    {
      number: "05",
      highlight: "Future-Proof Your Life",
      description: "Those who adapt to AI will thrive. Those who don't will fall behind. The choice is yours—we make it easy.",
      accentColor: "from-rose-400 via-pink-500 to-red-500",
      bgGlow: "bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent",
      borderGlow: "group-hover:shadow-[0_0_60px_-12px_rgba(251,113,133,0.4)]",
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
    <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-primary/3 via-transparent to-transparent"></div>
        
        {/* Floating color orbs */}
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] left-[10%] w-[450px] h-[450px] bg-violet-500/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-[70%] right-[10%] w-[350px] h-[350px] bg-emerald-500/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[5%] left-[20%] w-[400px] h-[400px] bg-rose-500/[0.03] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className="text-center mb-20 sm:mb-28 lg:mb-36 transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, headerProgress * 2),
            transform: `translateY(${(1 - Math.min(1, headerProgress * 2)) * 30}px)`
          }}
        >
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-6">
            What You Gain
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-display leading-tight max-w-4xl mx-auto">
            <span className="text-muted-foreground/80">Everyone talks about AI.</span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              We help you actually use it.
            </span>
          </h2>
        </div>

        {/* 5 Bold Statements - Alternating Layout */}
        <div 
          ref={statementsRef}
          className="max-w-6xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20 mb-24 sm:mb-32"
        >
          {statements.map((statement, index) => {
            const delay = index * 0.08;
            const progress = Math.max(0, statementsProgress - delay);
            const normalizedProgress = Math.min(1, progress * 2);
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={index}
                className="transition-all duration-1000 ease-out"
                style={{
                  opacity: normalizedProgress,
                  transform: `translateX(${(1 - normalizedProgress) * (isEven ? -80 : 80)}px)`
                }}
              >
                <div className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                  {/* Card */}
                  <div 
                    className={`group relative w-full sm:w-[85%] lg:w-[75%] xl:w-[70%] ${statement.borderGlow} transition-shadow duration-700`}
                  >
                    {/* Background glow */}
                    <div className={`absolute inset-0 ${statement.bgGlow} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                    
                    {/* Card content */}
                    <div className={`relative bg-card/40 dark:bg-card/30 backdrop-blur-xl rounded-3xl border border-border/40 group-hover:border-border/60 p-8 sm:p-10 lg:p-12 transition-all duration-500`}>
                      
                      {/* Number badge */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${statement.accentColor} mb-6 sm:mb-8 shadow-lg`}>
                        <span className="text-white font-bold font-mono text-sm sm:text-base">{statement.number}</span>
                      </div>
                      
                      {/* Headline */}
                      <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-display leading-[1.1] mb-4 sm:mb-5 bg-gradient-to-r ${statement.accentColor} bg-clip-text text-transparent`}>
                        {statement.highlight}
                      </h3>
                      
                      {/* Description */}
                      <p className={`text-base sm:text-lg lg:text-xl text-muted-foreground/80 leading-relaxed max-w-xl ${isEven ? '' : 'ml-auto text-right sm:text-left'}`}>
                        {statement.description}
                      </p>
                      
                      {/* Decorative gradient line */}
                      <div className={`absolute bottom-0 ${isEven ? 'left-0 rounded-bl-3xl' : 'right-0 rounded-br-3xl'} h-1 w-0 group-hover:w-1/2 bg-gradient-to-r ${statement.accentColor} transition-all duration-700 ease-out`}></div>
                    </div>
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
            className="group bg-foreground hover:bg-foreground/90 text-background px-10 sm:px-14 py-6 sm:py-7 text-base sm:text-lg font-semibold rounded-full transition-all duration-500 hover:scale-[1.02] shadow-xl hover:shadow-2xl"
          >
            Start Your Jump — Free
            <ArrowRight className="ml-3 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          
          <p className="text-xs sm:text-sm text-muted-foreground/60 mt-5">
            No credit card required • Your personalized AI strategy in minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyJumpinAI;
