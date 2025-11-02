import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Zap, Users, Rocket, BookOpen, Settings } from "lucide-react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const { isAuthenticated } = useOptimizedAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Personalized AI Analysis",
      description: "Deep assessment tailored to your unique goals and circumstances"
    },
    {
      icon: Rocket,
      title: "Step-by-Step Journey",
      description: "Phase-by-phase implementation roadmap for your transformation"
    },
    {
      icon: BookOpen,
      title: "Complete Toolkit",
      description: "AI-powered prompts and tools tailored to your goals"
    },
    {
      icon: Settings,
      title: "AI-Powered Optimization",
      description: "Continuously refined plans that adapt to your progress"
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/jumpinai-studio');
    } else {
      navigate('/auth');
    }
  };

  const handleViewPricing = () => {
    navigate('/pricing');
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02]"></div>
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-secondary/8 via-secondary/4 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-5xl mx-auto px-4">
          {/* Premium floating elements */}
          <div className="absolute -top-8 left-1/4 w-24 h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-2xl animate-pulse opacity-60"></div>
          <div className="absolute -top-4 right-1/3 w-16 h-16 bg-gradient-to-bl from-secondary/15 via-secondary/8 to-transparent rounded-full blur-xl animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in">
            Introducing <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent relative">
              JumpinAI Studio
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg blur-lg opacity-30 animate-pulse"></div>
            </span>
          </h2>
          
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
            What is a <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Jump</span>?
          </h3>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6">
            A Jump is your personalized AI transformation plan - a complete, step-by-step journey 
            designed specifically for <em>your</em> unique goals, challenges, and circumstances.
          </p>
          
          <div className="relative border border-border/30 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl bg-background hover:bg-background transition-all duration-500 group overflow-hidden">
            {/* Premium animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Floating premium elements */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-tl from-secondary/15 to-transparent rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.03] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <p className="text-sm sm:text-base text-foreground leading-relaxed mb-3 sm:mb-4">
                Unlike generic advice or one-size-fits-all solutions, JumpinAI Studio creates an 
                <strong className="text-primary bg-primary/10 px-1 rounded"> individually tailored implementation journey</strong> that 
                helps you <strong className="text-primary bg-primary/10 px-1 rounded">implement AI in your life and business</strong>.
              </p>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                Each Jump includes personalized prompts, actionable tools, strategic plans, and strategic guidance. 
                You can <strong className="text-primary bg-primary/10 px-1 rounded">clarify any step for detailed sub-steps</strong> or 
                <strong className="text-primary bg-primary/10 px-1 rounded"> explore alternative routes</strong> for maximum flexibility—everything you need to 
                <strong className="text-primary bg-primary/10 px-1 rounded"> literally Jump into AI fast</strong> and 
                start using it to your advantage ASAP in the most professional, efficient, and transformative way possible.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative p-6 rounded-3xl border-2 border-border hover:border-primary hover:shadow-xl shadow-lg transition-all duration-300 bg-card overflow-hidden hover:scale-105">
                
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-2xl flex items-center justify-center hover:bg-accent transition-all duration-300 shadow-md border border-border">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors duration-300 leading-tight">{feature.title}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed ml-16 opacity-90 hover:opacity-100 transition-all duration-300">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center px-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center justify-center max-w-2xl mx-auto">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-3xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleViewPricing}
              className="border-2 border-border hover:border-primary/50 px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-3xl transition-all duration-500 hover:scale-105 backdrop-blur-md text-foreground hover:text-foreground shadow-xl hover:shadow-2xl bg-background hover:bg-muted w-full sm:w-auto"
            >
              View Pricing
            </Button>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 font-medium px-4">
            Join thousands who've transformed their lives with personalized AI guidance
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;