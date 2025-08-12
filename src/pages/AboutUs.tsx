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
        <Button size="lg" className="text-lg px-8 modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black transition-all duration-300 hover:scale-105 group">
          Get Your Free AI Jumpstart Guide
          <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Download Your Free AI Guide
          </DialogTitle>
        </DialogHeader>
        
        {!downloadReady ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
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
                className="w-full px-4 py-3 text-base rounded-xl"
              />
              
              <Button 
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-xl"
              >
                {isSubmitting ? "Sending..." : "Send Me The PDF"}
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Success! 🎉</h3>
              <p className="text-muted-foreground">
                Your PDF is ready! Download it directly below:
              </p>
            </div>
            
            <Button 
              onClick={handleDirectDownload}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-xl"
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
              className="w-full"
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
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>About JumpinAI | AI Strategy, Tools and Implementation</title>
          <meta name="description" content="Learn who JumpinAI is: an AI education and implementation studio helping teams turn AI into measurable results with clarity, speed, and impact." />
          <link rel="canonical" href="https://jumpinai.com/about-us" />
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'JumpinAI',
            url: 'https://jumpinai.com',
            logo: 'https://jumpinai.com/lovable-uploads/74bafbff-f098-4d0a-9180-b4923d3d9616.png',
            sameAs: ['https://twitter.com/jumpinai']
          })}</script>
        </Helmet>
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
            JumpinAI exists for one reason: to get you implementing AI <span className="text-primary font-semibold">today</span>, not tomorrow. 
            We provide the education, blueprints, and guidance you need to succeed. No theory—just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black transition-all duration-300 hover:scale-105 group" asChild>
              <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                Start Building Now
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
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
              These aren't just values. They're the principles that drive every guide we create and every strategy we teach.
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
              We provide education and guidance that bridges AI potential with real-world profit. 
              No technical background required. No months of learning. Just clear, actionable guidance.
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
              or simply curious about AI's potential—we provide the education and strategies to get you there fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LeadMagnetButton />
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
            <span className="text-primary font-semibold"> We've done the research</span> — the blueprints are ready, 
            the strategies are proven, and the opportunity is massive.
          </p>
          
          <div className="bg-card rounded-2xl p-8 mb-8 border border-border/50">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Why Choose JumpinAI?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-bold text-primary mb-2">Speed</h4>
                <p className="text-muted-foreground text-sm">Get results in days, not months. Our guides provide immediate actionable steps.</p>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-2">Clarity</h4>
                <p className="text-muted-foreground text-sm">No confusing jargon. Clear instructions for real outcomes.</p>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-2">Results</h4>
                <p className="text-muted-foreground text-sm">Created by practitioners who've generated real AI-powered revenue.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black transition-all duration-300 hover:scale-105 group"
              asChild
            >
              <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                Join Our Whop
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </HelmetProvider>
  );
};

export default AboutUs;