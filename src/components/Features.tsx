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
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
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
          
          <div className="bg-card border rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              Unlike generic advice or one-size-fits-all solutions, Jumps Studio creates an 
              <strong className="text-primary"> individually tailored implementation journey</strong> that 
              helps you <strong className="text-primary">implement AI in your life and business</strong>.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed">
              Each Jump includes personalized prompts, custom workflows, proven blueprints, 
              and strategic guidance - everything you need to <strong className="text-primary">literally Jump into AI fast</strong> and 
              start using it to your advantage ASAP in the most professional, efficient, and transformative way possible.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/20 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:from-primary/15 group-hover:to-primary/10 transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary/90 transition-colors duration-300">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleViewPricing}
              className="px-8 py-6 text-lg font-medium border-primary/20 hover:border-primary/40"
            >
              View Pricing
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Join thousands who've transformed their lives with personalized AI guidance
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;