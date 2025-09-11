import { ArrowRight, Zap, Target, Users, Rocket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Component to handle lead magnet functionality
const LeadMagnetButton = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to download the PDF.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: insertError } = await supabase
        .from('lead_magnet_downloads')
        .insert({
          email: email,
          ip_address: null,
          user_agent: navigator.userAgent
        });

      if (insertError) {
        console.error("Database insert error:", insertError);
      }

      const { data, error } = await supabase.functions.invoke('send-lead-magnet-email', {
        body: { email }
      });

      if (error) {
        console.error("Email function error:", error);
        
        if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
          setDownloadReady(true);
          toast({
            title: "Download Ready! 📥",
            description: "There was a network issue with email delivery, but you can download the PDF directly below.",
          });
          return;
        }
        
        throw error;
      }
      
      toast({
        title: "Success! 🎉",
        description: "Check your inbox for the PDF download link. You can also download it directly below.",
      });
      
      setDownloadReady(true);
      setEmail("");
    } catch (error) {
      console.error("Error processing lead magnet request:", error);
      setDownloadReady(true);
      
      toast({
        title: "Download Ready! 📥",
        description: "Your PDF is ready for download below. We'll also try to send it to your email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectDownload = () => {
    const downloadUrl = "https://jumpinai.com/download/ai-guide";
    window.open(downloadUrl, '_blank');
    
    toast({
      title: "Download Started! 📥",
      description: "Your PDF is opening in a new tab. Enjoy your AI fast wins!",
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm">
          Get Your Free AI Jumpstart Guide
          <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass backdrop-blur-md bg-background/95 dark:bg-background/90 border border-primary/30 rounded-3xl shadow-2xl shadow-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
            Download Your Free AI Guide
          </DialogTitle>
        </DialogHeader>
        
        {!downloadReady ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-2xl p-6 text-center space-y-2 shadow-lg shadow-primary/10">
              <p className="text-muted-foreground leading-relaxed">
                Enter your email to get instant access to "Jumpstart AI: 7 Fast Wins You Can Use Today"
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-base rounded-xl glass backdrop-blur-sm bg-background/50 border-primary/30 focus:border-primary/50 shadow-lg shadow-primary/5"
              />
              
              <Button 
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground py-3 text-base font-semibold rounded-2xl border border-primary/30 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 backdrop-blur-sm"
              >
                {isSubmitting ? "Sending..." : "Send Me The PDF"}
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center opacity-70">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 glass backdrop-blur-sm bg-green-100/80 dark:bg-green-900/30 border border-green-500/20 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold bg-gradient-to-br from-foreground to-green-600 bg-clip-text text-transparent">Success! 🎉</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your PDF is ready! Download it directly below:
              </p>
            </div>
            
            <Button 
              onClick={handleDirectDownload}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600/90 to-green-600 hover:from-green-600 hover:to-green-600/80 text-white py-3 text-base font-semibold rounded-2xl border border-green-500/30 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF Now
            </Button>
            
            <Button 
              onClick={() => {
                setIsDialogOpen(false);
                setDownloadReady(false);
              }}
              variant="outline"
              className="w-full glass backdrop-blur-sm bg-background/20 border-primary/30 hover:bg-primary/10 hover:border-primary/40 rounded-xl"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AboutUs = () => {
  const beliefs = [
    {
      title: "AI is for Everyone",
      description: "You don't need a computer science degree. You need the right guidance and blueprints."
    },
    {
      title: "Speed Beats Perfection",
      description: "Launch fast, learn faster. Perfect is the enemy of profitable."
    },
    {
      title: "Applied Over Theory",
      description: "We teach real strategies for real problems. No fluff, no academic exercises."
    },
    {
      title: "Action Creates Opportunity",
      description: "While others debate AI's future, we're educating the builders. Join the movement."
    }
  ];

  const offerings = [
    {
      icon: Zap,
      title: "AI Implementation Guides",
      description: "Learn which AI tools to use and exactly how to use them for real business results."
    },
    {
      icon: Target,
      title: "Strategic Blueprints",
      description: "Step-by-step workflows that turn AI concepts into profitable actions."
    },
    {
      icon: Rocket,
      title: "Educational Resources",
      description: "Prompts, guides, and educational materials to start generating AI-powered income streams today."
    }
  ];

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
        </div>
        <Helmet>
          <title>About JumpinAI | AI Strategy, Tools and Implementation</title>
          <meta name="description" content="Learn who JumpinAI is: an AI education and implementation studio helping teams turn AI into measurable results with clarity, speed, and impact." />
          <link rel="canonical" href="https://jumpinai.com/about-us" />
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'JumpinAI',
            url: 'https://jumpinai.com',
            logo: 'https://jumpinai.com/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png',
            sameAs: ['https://twitter.com/jumpinai']
          })}</script>
        </Helmet>
        <Navigation />
      {/* Hero Section - Glass Morphism */}
      <section className="relative px-0 mt-20">
        <div className="relative min-h-[60svh] md:min-h-[65svh] flex items-center justify-center overflow-hidden">
          {/* Premium glass container */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/80 to-background/90 backdrop-blur-sm pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-secondary/5 pointer-events-none" />

          <div className="relative z-10 px-6 text-center">
            <div className="glass backdrop-blur-md bg-background/20 dark:bg-background/10 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">About JumpinAI</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">For creators, founders, and teams who want results—not research. Learn the right tools, then ship real automations in days.</p>
              <div className="flex justify-center">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm" asChild>
                  <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                    Start Building Now
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Intro Section - Glass Morphism */}
      <section className="px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="grid md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-2 flex justify-center">
                <div className="relative glass backdrop-blur-sm bg-background/30 dark:bg-background/20 border border-primary/30 rounded-3xl p-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105">
                  <img
                    src="/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png"
                    alt="JumpinAI brand logo"
                    className="w-48 h-48 rounded-2xl object-contain"
                    loading="lazy"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-primary/20"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <article className="md:col-span-3 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">Who We Are</h2>
                <div className="space-y-5">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    JumpinAI is a modern AI education and implementation studio. We help creators, entrepreneurs, and teams turn
                    artificial intelligence into an unfair advantage—quickly and responsibly.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We cut through the noise with clarity, curate the right tools, and provide step-by-step blueprints that move you from
                    idea to deployed workflows in days, not months.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our promise is simple: less theory, more outcomes. Clear guidance, fast execution, and measurable results—so you can
                    build with confidence.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe - Glass Morphism */}
      <section className="px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                What We Believe
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                These aren't just values. They're the principles that drive every guide we create and every strategy we teach.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {beliefs.map((belief, index) => (
                <div 
                  key={index}
                  className="glass backdrop-blur-sm bg-background/40 dark:bg-background/25 border border-primary/30 rounded-2xl p-8 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/50 transition-all duration-300 group hover:scale-105 hover:-translate-y-2"
                >
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/60">
                    {belief.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {belief.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Glass Morphism */}
      <section className="px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                What We Do
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We provide education and guidance that bridges AI potential with real-world profit. 
                No technical background required. No months of learning. Just clear, actionable guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {offerings.map((offering, index) => (
                <div 
                  key={index}
                  className="text-center group glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-8 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-primary/30 group-hover:to-primary/20 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                    <offering.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/60">
                    {offering.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {offering.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="glass backdrop-blur-sm bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/8 border border-primary/30 rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-foreground to-primary/70 bg-clip-text text-transparent">
                From Zero to AI-Powered in Days, Not Months
              </h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Whether you're a creator looking to automate your workflow, an entrepreneur building your next venture, 
                or simply curious about AI's potential—we provide the education and strategies to get you there fast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <LeadMagnetButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Glass Morphism */}
      <section className="px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-foreground via-primary to-primary/70 bg-clip-text text-transparent">
              The Time to Build is Now
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              While others are still figuring out what AI can do, you could already be using it to create real value. 
              <span className="text-primary font-semibold"> We've done the research</span> — the blueprints are ready, 
              the strategies are proven, and the opportunity is massive.
            </p>
            
            <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/30 rounded-2xl p-8 mb-8 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                Why Choose JumpinAI?
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-xl p-4 hover:border-primary/30 transition-all duration-300">
                  <h4 className="font-bold text-primary mb-2">Speed</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Get results in days, not months. Our guides provide immediate actionable steps.</p>
                </div>
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-xl p-4 hover:border-primary/30 transition-all duration-300">
                  <h4 className="font-bold text-primary mb-2">Clarity</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">No confusing jargon. Clear instructions for real outcomes.</p>
                </div>
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-xl p-4 hover:border-primary/30 transition-all duration-300">
                  <h4 className="font-bold text-primary mb-2">Results</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Created by practitioners who've generated real AI-powered revenue.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                asChild
              >
                <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                  Join Our Whop
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </HelmetProvider>
  );
};

export default AboutUs;