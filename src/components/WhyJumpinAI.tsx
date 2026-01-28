import React from 'react';
import { Compass, Clock, Rocket, Shield, Zap } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

const WhyJumpinAI = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useOptimizedAuth();
  
  // Scroll animations
  const { elementRef: headerRef, scrollProgress: headerProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: card1Ref, scrollProgress: card1Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: card2Ref, scrollProgress: card2Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: card3Ref, scrollProgress: card3Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: card4Ref, scrollProgress: card4Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: card5Ref, scrollProgress: card5Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: ctaRef, scrollProgress: ctaProgress } = useScrollAnimation({ threshold: 0.15 });

  const valuePoints = [
    {
      icon: Compass,
      title: "Direction, Not Just Information",
      description: "The world is flooded with AI content. What's missing is a clear path forward tailored to you. We cut through the noise and give you strategic direction—specific to your goals, your situation, your timeline.",
      ref: card1Ref,
      progress: card1Progress,
    },
    {
      icon: Clock,
      title: "Months of Research in Minutes",
      description: "Skip the trial-and-error. Skip the endless YouTube tutorials. Skip the generic advice. Get a personalized AI implementation roadmap instantly—the same strategic clarity that would take months to develop on your own.",
      ref: card2Ref,
      progress: card2Progress,
    },
    {
      icon: Shield,
      title: "Confidence to Take Action",
      description: "AI can feel overwhelming, especially when you don't know where to start. We transform uncertainty into confidence—giving you not just a plan, but the exact tools, prompts, and steps to execute it.",
      ref: card3Ref,
      progress: card3Progress,
    },
    {
      icon: Rocket,
      title: "From Strategy to Execution",
      description: "Most platforms stop at advice. We go further. Build automated workflows and AI agents directly from your Jump—export to n8n or Make.com and deploy real solutions that work while you sleep.",
      ref: card4Ref,
      progress: card4Progress,
    },
    {
      icon: Zap,
      title: "Evolves With Your Progress",
      description: "Your needs change. Your Jump adapts. Clarify any step for deeper guidance. Reroute when circumstances shift. Explore alternative paths. This isn't a static document—it's a living strategic companion.",
      ref: card5Ref,
      progress: card5Progress,
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
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div 
          ref={headerRef}
          className="text-center mb-12 sm:mb-16 transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, headerProgress * 2),
            transform: `translateY(${(1 - Math.min(1, headerProgress * 2)) * 30}px)`
          }}
        >
          {/* Premium badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/5 rounded-full mb-6 border border-primary/20">
            <span className="text-sm font-semibold text-primary">Why JumpinAI</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 font-display px-4">
            <span className="text-foreground">AI Moves Fast.</span>{' '}
            <span className="gradient-text-primary">You Deserve to Move Faster.</span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            In an era where everyone talks about AI but few know how to actually use it strategically, 
            JumpinAI exists to bridge the gap between potential and execution.
          </p>
        </div>

        {/* Value Points Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16">
          {valuePoints.map((point, index) => {
            const Icon = point.icon;
            const isLargeCard = index < 2; // First two cards are larger on lg screens
            
            return (
              <div
                key={index}
                ref={point.ref}
                className={`group relative transition-all duration-700 ease-out ${
                  index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
                style={{
                  opacity: Math.min(1, point.progress * 1.8),
                  transform: `translateY(${(1 - Math.min(1, point.progress * 1.8)) * 40}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 sm:p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-primary/30 group-hover:-translate-y-1">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 font-display group-hover:text-primary transition-colors duration-300">
                      {point.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
                
                {/* Subtle back shadow on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div 
          ref={ctaRef}
          className="text-center transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, ctaProgress * 2),
            transform: `translateY(${(1 - Math.min(1, ctaProgress * 2)) * 30}px)`
          }}
        >
          <div className="relative inline-block">
            {/* Premium glow effect behind button */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-50"></div>
            
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="relative bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-6 text-base sm:text-lg font-semibold rounded-full transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Start Your Jump
              <Rocket className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
            No credit card required. Start with free credits and experience the clarity.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyJumpinAI;
