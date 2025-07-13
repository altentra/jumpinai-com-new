import { ArrowRight, Zap, Target, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AboutUs = () => {
  const beliefs = [
    {
      title: "AI is for Everyone",
      description: "You don't need a computer science degree. You need the right tools and guidance."
    },
    {
      title: "Speed Beats Perfection",
      description: "Launch fast, learn faster. Perfect is the enemy of profitable."
    },
    {
      title: "Applied Over Theory",
      description: "We build real tools for real problems. No fluff, no academic exercises."
    },
    {
      title: "Action Creates Opportunity",
      description: "While others debate AI's future, we're building it. Join the builders."
    }
  ];

  const offerings = [
    {
      icon: Zap,
      title: "Ready-to-Use AI Tools",
      description: "Skip the learning curve. Our tools work out of the box for real business needs."
    },
    {
      icon: Target,
      title: "Strategic Blueprints",
      description: "Step-by-step guides that turn AI concepts into profitable actions."
    },
    {
      icon: Rocket,
      title: "Fast-Track Resources",
      description: "Everything you need to start generating AI-powered income streams today."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Built for the Speed of Opportunity
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            We Turn AI Curiosity Into Real Results
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            JumpinAI exists for one reason: to get you building with AI <span className="text-primary font-semibold">today</span>, not tomorrow. 
            We're done with the theory. It's time to build, ship, and profit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                Start Building Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What We Believe
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These aren't just values. They're the principles that drive every tool we build and every strategy we share.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {beliefs.map((belief, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {belief.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {belief.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What We Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We create the bridge between AI potential and real-world profit. 
              No technical background required. No months of learning. Just results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {offerings.map((offering, index) => (
              <div 
                key={index}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <offering.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {offering.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {offering.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              From Zero to AI-Powered in Days, Not Months
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Whether you're a creator looking to automate your workflow, an entrepreneur building your next venture, 
              or simply curious about AI's potential—we've got the tools and strategies to get you there fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => {
                  const leadMagnetSection = document.querySelector('#lead-magnet');
                  if (leadMagnetSection) {
                    // Navigate to home page first if not already there
                    if (window.location.pathname !== '/') {
                      window.location.href = '/#lead-magnet';
                    } else {
                      leadMagnetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    // Fallback to navigate to home page with hash
                    window.location.href = '/#lead-magnet';
                  }
                }}
              >
                Get Your Free AI Jumpstart Guide
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            The Time to Build is Now
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            While others are still figuring out what AI can do, you could already be using it to create real value. 
            <span className="text-primary font-semibold"> We've done the heavy lifting</span> — the tools are ready, 
            the strategies are proven, and the opportunity is massive.
          </p>
          
          <div className="bg-card rounded-2xl p-8 mb-8 border border-border/50">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Why Choose JumpinAI?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-bold text-primary mb-2">Speed</h4>
                <p className="text-muted-foreground text-sm">Get results in days, not months. Our tools work immediately.</p>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-2">Clarity</h4>
                <p className="text-muted-foreground text-sm">No confusing jargon. Clear instructions for real outcomes.</p>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-2">Results</h4>
                <p className="text-muted-foreground text-sm">Built by practitioners who've generated real AI-powered revenue.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              asChild
            >
              <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                Access Our AI PowerStack
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => {
                const leadMagnetSection = document.querySelector('#lead-magnet');
                if (leadMagnetSection) {
                  if (window.location.pathname !== '/') {
                    window.location.href = '/#lead-magnet';
                  } else {
                    leadMagnetSection.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  window.location.href = '/#lead-magnet';
                }
              }}
            >
              Start with Free Guide
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;