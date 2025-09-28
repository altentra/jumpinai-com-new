import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Zap, Users, Rocket, BookOpen, Settings, CheckCircle, Clock, TrendingUp, Shield, Star, Award } from "lucide-react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const { isAuthenticated } = useOptimizedAuth();
  const navigate = useNavigate();

  const painPoints = [
    "Drowning in AI hype but can't figure out how to actually use it in your business?",
    "Tried following generic AI guides but they don't fit your specific situation?", 
    "Spending hours researching AI tools but still feeling overwhelmed and confused?",
    "Watching competitors gain an edge while you're stuck on the sidelines?"
  ];

  const transformationSteps = [
    {
      number: "01",
      title: "Tell Us About You",
      description: "Share your role, industry, and goals in 60 seconds",
      icon: Target
    },
    {
      number: "02", 
      title: "AI Analyzes Everything",
      description: "Our advanced AI creates your personalized transformation strategy",
      icon: Zap
    },
    {
      number: "03",
      title: "Get Your Complete Jump",
      description: "Receive 16 ready-to-use resources tailored exactly to your needs",
      icon: Rocket
    },
    {
      number: "04",
      title: "Transform Your Business",
      description: "Implement immediately and see results within days, not months",
      icon: TrendingUp
    }
  ];

  const valueProps = [
    {
      icon: Clock,
      title: "Skip Months of Research",
      description: "Get personalized AI strategy in 2 minutes instead of spending months figuring it out yourself",
      value: "Save 200+ hours"
    },
    {
      icon: Target,
      title: "Zero Generic Advice",
      description: "Every strategy, prompt, and workflow is tailored to YOUR exact industry, role, and experience level",
      value: "100% Personalized"
    },
    {
      icon: Award,
      title: "Complete Implementation Kit",
      description: "16 ready-to-use resources: prompts, workflows, blueprints, and strategies in one package",
      value: "Everything Included"
    },
    {
      icon: TrendingUp,
      title: "Immediate Results",
      description: "Start seeing improvements in productivity and decision-making within days, not months",
      value: "Instant Impact"
    },
    {
      icon: Shield,
      title: "Risk-Free Investment",
      description: "Fraction of consultant cost ($10,000+) with immediate access and lifetime value",
      value: "97% Cost Savings"
    },
    {
      icon: Star,
      title: "Proven Success Framework", 
      description: "Based on strategies used by Fortune 500 companies, now accessible to everyone",
      value: "Enterprise-Grade"
    }
  ];

  const socialProof = [
    { metric: "10,000+", label: "Businesses Transformed" },
    { metric: "47x", label: "Average ROI" },
    { metric: "2 mins", label: "To Complete Strategy" },
    { metric: "98%", label: "Success Rate" }
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
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background via-muted/3 to-background">
      {/* Epic Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-secondary/6 via-secondary/2 to-transparent rounded-full blur-2xl animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-accent/3 via-primary/2 to-secondary/3 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Problem Agitation - Hook them immediately */}
        <div className="text-center mb-20 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-destructive/20">
            <Clock className="w-4 h-4" />
            STOP Wasting Time & Money on Generic AI Advice
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            <span className="text-foreground">Are You</span>{" "}
            <span className="bg-gradient-to-r from-destructive via-destructive/80 to-destructive bg-clip-text text-transparent relative">
              STUCK
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-destructive/80 to-destructive rounded-full"></div>
            </span>{" "}
            <br className="hidden md:block" />
            <span className="text-foreground">in AI Confusion?</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-12 max-w-4xl mx-auto">
            {painPoints.map((pain, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-left">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-destructive font-bold text-sm">!</span>
                </div>
                <p className="text-foreground/90 text-sm font-medium">{pain}</p>
              </div>
            ))}
          </div>

          <div className="relative p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 relative">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                What if you could transform confusion into competitive advantage 
              </span>
              <br />
              <span className="text-foreground">in just 2 minutes?</span>
            </h3>
          </div>
        </div>

        {/* Solution Introduction */}
        <div className="text-center mb-20 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-lg font-bold mb-8 border border-primary/20">
            <Star className="w-5 h-5" />
            INTRODUCING THE SOLUTION
          </div>
          
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              JumpinAI Studio
            </span>
            <br />
            <span className="text-foreground">Your Personal AI Transformation Engine</span>
          </h3>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
            The world's first AI-powered platform that creates completely personalized 
            AI implementation strategies in minutes, not months.
          </p>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {socialProof.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-background/80 border border-border/50 backdrop-blur-xl">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.metric}</div>
                <div className="text-sm text-muted-foreground font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How It Works: <span className="text-primary">From Confusion to Clarity in 4 Steps</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our proprietary AI analyzes thousands of data points to create your perfect AI transformation roadmap
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {transformationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative group">
                  {/* Connection Line */}
                  {index < transformationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/50 z-10"></div>
                  )}
                  
                  <div className="relative p-8 rounded-3xl bg-background/80 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg border border-primary/20">
                      {step.number}
                    </div>
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      <h4 className="text-xl font-bold mb-4 text-center text-foreground">{step.title}</h4>
                      <p className="text-muted-foreground text-center leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Value Propositions */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why <span className="text-primary">Thousands</span> Choose JumpinAI Over Expensive Consultants
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get enterprise-level AI strategy at a fraction of the cost, with instant results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => {
              const Icon = prop.icon;
              return (
                <div key={index} className="group relative p-8 rounded-3xl bg-background/80 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {prop.value}
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-4 text-foreground">{prop.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgency & CTA */}
        <div className="text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-xl mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6">
                <TrendingUp className="w-4 h-4" />
                LIMITED-TIME: AI ADVANTAGE IS DISAPPEARING FAST
              </div>
              
              <h3 className="text-3xl md:text-4xl font-black mb-6">
                <span className="text-foreground">Don't Let Your Competitors</span><br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Leave You Behind
                </span>
              </h3>
              
              <p className="text-lg text-foreground/80 max-w-3xl mx-auto mb-8 leading-relaxed">
                Every day you wait is another day your competitors gain an unfair advantage. 
                <strong className="text-primary"> The AI revolution is happening NOW</strong> - 
                and those who act fast will dominate their markets.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="inline-flex flex-col sm:flex-row gap-6 items-center justify-center mb-8">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="group relative bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:to-primary text-primary-foreground px-12 py-6 text-xl font-bold rounded-3xl transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-3xl border border-primary/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center">
                Start My AI Transformation NOW
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleViewPricing}
              className="border-2 border-primary/30 hover:border-primary/60 px-10 py-6 text-lg font-semibold rounded-3xl transition-all duration-500 hover:scale-105 backdrop-blur-md text-primary hover:text-primary shadow-xl hover:shadow-2xl bg-background/80 hover:bg-primary/5"
            >
              View Pricing Options
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>No Setup Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Results in 2 Minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;