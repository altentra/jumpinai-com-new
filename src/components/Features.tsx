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
      description: "Prompts, workflows, blueprints, and strategies in one package"
    },
    {
      icon: Settings,
      title: "AI-Powered Optimization",
      description: "Continuously refined plans that adapt to your progress"
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard/jumps-studio');
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
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Introducing <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Jumps Studio</span>
          </h2>
          
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            What is a <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Jump</span>?
          </h3>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            A Jump is your personalized AI transformation plan - a complete, step-by-step journey 
            designed specifically for <em>your</em> unique goals, challenges, and circumstances.
          </p>
          
          <div className="glass-dark border border-border/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl bg-background/95 hover:bg-background transition-all duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.03] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <p className="text-lg text-foreground leading-relaxed mb-4">
                Unlike generic advice or one-size-fits-all solutions, Jumps Studio creates an 
                <strong className="text-primary"> individually tailored implementation journey</strong> that 
                helps you <strong className="text-primary">implement AI in your life and business</strong>.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                Each Jump includes personalized prompts, custom workflows, proven blueprints, 
                and strategic guidance - everything you need to <strong className="text-primary">literally Jump into AI fast</strong> and 
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
              <div key={index} className="group relative p-6 rounded-3xl border border-border/30 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 backdrop-blur-xl bg-background/95 hover:bg-background overflow-hidden hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                <div className="relative flex items-center gap-4 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/12 to-primary/6 rounded-2xl flex items-center justify-center group-hover:from-primary/18 group-hover:to-primary/9 transition-all duration-300 shadow-lg border border-primary/10 group-hover:scale-110">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary/90 transition-colors duration-300 leading-tight">{feature.title}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed ml-16 group-hover:text-foreground/80 transition-colors duration-300">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-6 items-center justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-10 py-6 text-lg font-semibold rounded-3xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl border border-white/10 dark:border-black/10"
            >
              Get Started
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleViewPricing}
              className="border-2 border-border hover:border-primary/50 px-10 py-6 text-lg font-semibold rounded-3xl transition-all duration-500 hover:scale-105 backdrop-blur-md text-foreground hover:text-foreground shadow-xl hover:shadow-2xl bg-background hover:bg-muted"
            >
              View Pricing
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 font-medium">
            Join thousands who've transformed their lives with personalized AI guidance
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;