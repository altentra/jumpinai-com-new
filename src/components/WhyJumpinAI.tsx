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
  const { elementRef: statementsRef, scrollProgress: statementsProgress } = useScrollAnimation({ threshold: 0.1 });
  const { elementRef: ctaRef, scrollProgress: ctaProgress } = useScrollAnimation({ threshold: 0.15 });

  const statements = [
    {
      number: "01",
      highlight: "Reclaim Your Time",
      description: "Automate the tasks that drain your day. Let AI handle the repetitive, so you can focus on what truly matters.",
      accentColor: "from-amber-400 via-orange-500 to-red-500",
    },
    {
      number: "02",
      highlight: "End the Overwhelm",
      description: "Stop drowning in AI options. Get one clear, personalized path forward—built specifically for your goals.",
      accentColor: "from-cyan-400 via-blue-500 to-indigo-500",
    },
    {
      number: "03",
      highlight: "Become AI-Empowered",
      description: "Shift from watching AI change the world to using it to change yours. From spectator to strategist.",
      accentColor: "from-violet-400 via-purple-500 to-fuchsia-500",
    },
    {
      number: "04",
      highlight: "Achieve What Felt Impossible",
      description: "The productivity, the efficiency, the results you thought required a team—now within your reach.",
      accentColor: "from-emerald-400 via-green-500 to-teal-500",
    },
    {
      number: "05",
      highlight: "Future-Proof Your Life",
      description: "Those who adapt to AI will thrive. Those who don't will fall behind. The choice is yours—we make it easy.",
      accentColor: "from-rose-400 via-pink-500 to-red-500",
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
        {/* Subtle radial gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-60"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className="text-center mb-20 sm:mb-28 transition-all duration-700 ease-out"
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

        {/* 5 Bold Statements */}
        <div 
          ref={statementsRef}
          className="max-w-4xl mx-auto mb-20 sm:mb-28"
        >
          {statements.map((statement, index) => {
            const delay = index * 0.1;
            const progress = Math.max(0, statementsProgress - delay);
            const normalizedProgress = Math.min(1, progress * 2.5);
            
            return (
              <div
                key={index}
                className="group relative transition-all duration-700 ease-out"
                style={{
                  opacity: normalizedProgress,
                  transform: `translateY(${(1 - normalizedProgress) * 40}px)`
                }}
              >
                {/* Statement row */}
                <div className="relative py-8 sm:py-10 border-b border-border/30 hover:border-border/60 transition-colors duration-500">
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${statement.accentColor} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 blur-xl`}></div>
                  
                  <div className="relative z-10 flex items-start gap-6 sm:gap-10">
                    {/* Number */}
                    <span className={`flex-shrink-0 text-sm sm:text-base font-mono font-medium bg-gradient-to-r ${statement.accentColor} bg-clip-text text-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 pt-1`}>
                      {statement.number}
                    </span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold font-display leading-tight mb-2 sm:mb-3 bg-gradient-to-r ${statement.accentColor} bg-clip-text text-transparent group-hover:opacity-100 opacity-90 transition-opacity duration-300`}>
                        {statement.highlight}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-300 max-w-2xl">
                        {statement.description}
                      </p>
                    </div>
                    
                    {/* Arrow indicator - hidden on mobile */}
                    <div className="hidden sm:flex flex-shrink-0 items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                      <ArrowRight className={`w-5 h-5 lg:w-6 lg:h-6`} />
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
