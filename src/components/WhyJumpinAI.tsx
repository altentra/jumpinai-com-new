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
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
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
          className="text-center mb-10 sm:mb-14 lg:mb-16 transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, headerProgress * 2),
            transform: `translateY(${(1 - Math.min(1, headerProgress * 2)) * 30}px)`
          }}
        >
          {/* Premium styled heading */}
          <div className="relative inline-block">
            {/* Subtle glow behind text */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl scale-150 opacity-50"></div>
            
            <h2 className="relative text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-display leading-tight max-w-4xl mx-auto">
              <span className="block text-muted-foreground/60 mb-2 sm:mb-3">Everyone talks about AI.</span>
              <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent relative">
                We help you actually use it.
                {/* Decorative underline */}
                <span className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-amber-500 via-violet-500 to-cyan-500 rounded-full opacity-80"></span>
              </span>
            </h2>
          </div>
        </div>

        {/* 5 Bold Statements - Alternating Layout */}
        <div 
          ref={statementsRef}
          className="max-w-6xl mx-auto space-y-5 sm:space-y-6 lg:space-y-8 mb-12 sm:mb-14"
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
                    <div className={`absolute inset-0 ${statement.bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                    
                    {/* Card content */}
                    <div className={`relative bg-card/40 dark:bg-card/30 backdrop-blur-xl rounded-2xl border border-border/40 group-hover:border-border/60 p-6 sm:p-8 lg:p-10 transition-all duration-500`}>
                      
                      {/* Number badge */}
                      <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${statement.accentColor} mb-4 sm:mb-5 shadow-lg`}>
                        <span className="text-white font-bold font-mono text-xs sm:text-sm">{statement.number}</span>
                      </div>
                      
                      {/* Headline */}
                      <h3 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold font-display leading-[1.1] mb-3 sm:mb-4 bg-gradient-to-r ${statement.accentColor} bg-clip-text text-transparent`}>
                        {statement.highlight}
                      </h3>
                      
                      {/* Description */}
                      <p className={`text-sm sm:text-base lg:text-lg text-muted-foreground/80 leading-relaxed max-w-xl ${isEven ? '' : 'ml-auto text-right sm:text-left'}`}>
                        {statement.description}
                      </p>
                      
                      {/* Decorative gradient line */}
                      <div className={`absolute bottom-0 ${isEven ? 'left-0 rounded-bl-2xl' : 'right-0 rounded-br-2xl'} h-1 w-0 group-hover:w-1/2 bg-gradient-to-r ${statement.accentColor} transition-all duration-700 ease-out`}></div>
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
