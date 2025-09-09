import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Zap, Users, Rocket, BookOpen, Settings } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Target,
      title: "Personalized AI Analysis",
      description: "Deep assessment of your current situation, goals, and unique circumstances"
    },
    {
      icon: Rocket,
      title: "Step-by-Step Journey",
      description: "Phase-by-phase implementation roadmap tailored specifically to your path"
    },
    {
      icon: BookOpen,
      title: "Complete Toolkit",
      description: "Prompts, workflows, blueprints, and strategies - everything you need in one place"
    },
    {
      icon: Settings,
      title: "AI-Powered Optimization",
      description: "Continuously refined plans that adapt to your progress and feedback"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Introducing Jumps Studio
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            What is a <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Jump</span>?
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            A Jump is your personalized AI transformation plan - a complete, step-by-step journey 
            designed specifically for <em>your</em> unique goals, challenges, and circumstances.
          </p>
          
          <div className="bg-card border rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-foreground/90 leading-relaxed">
              Unlike generic advice or one-size-fits-all solutions, Jumps Studio creates an 
              <strong className="text-primary"> individually tailored implementation journey</strong> that 
              evolves with you. Each Jump includes personalized prompts, custom workflows, proven blueprints, 
              and strategic guidance - all orchestrated by AI to maximize your transformation success.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium">
              Create Your Jump
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-medium border-primary/20 hover:border-primary/40">
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