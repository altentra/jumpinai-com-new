import { ArrowRight, Zap, Target, Users, Rocket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-2xl border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      navigate('/jumpinai-studio');
    } else {
      navigate('/jumpinai-studio');
    }
  };

  const beliefs = [
    {
      title: "Human-Centered AI Revolution",
      description: "We believe the AI revolution succeeds only when it amplifies human potential, not replaces it. Every breakthrough should make us more human, not less."
    },
    {
      title: "Individuality Over Uniformity",
      description: "In a world pushing toward standardization, we champion the unique. Your AI journey should be as distinctive as your dreams, challenges, and aspirations."
    },
    {
      title: "Transformation Through Connection",
      description: "True AI transformation happens at the intersection of cutting-edge technology and deep human understanding. We build bridges, not barriers."
    },
    {
      title: "Purpose-Driven Innovation",
      description: "We don't innovate for innovation's sake. Every solution we create serves a higher purpose: unlocking human potential and making AI accessible to all who seek growth."
    }
  ];

  const offerings = [
    {
      icon: Zap,
      title: "Personalized Jump Plans",
      description: "Your unique AI transformation roadmap created in 5 minutes, complete with custom prompts, workflows, and strategies tailored to your specific goals."
    },
    {
      icon: Target,
      title: "16 Ready-to-Use Resources",
      description: "Each Jump includes 4 custom prompts, 4 workflows, 4 blueprints, and 4 strategies - all designed specifically for your situation and ready to implement immediately."
    },
    {
      icon: Rocket,
      title: "AI Coach & Support",
      description: "Ongoing personalized guidance through AI coach conversations, implementation support, and progress tracking throughout your transformation journey."
    }
  ];

  return (
    <HelmetProvider>
      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background/95 via-background to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative overflow-hidden">
        {/* Premium floating background elements with liquid glass effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs with enhanced blur and liquid animation */}
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          
          {/* Liquid glass floating elements */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
          
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent opacity-40"></div>
        </div>
        <Helmet>
          <title>About JumpinAI</title>
          <meta name="description" content="Discover JumpinAI - pioneering the future of personalized AI transformation. We're more than a platform; we're architects of individual AI journeys, building bridges between human potential and artificial intelligence." />
          <link rel="canonical" href="https://jumpinai.com/about-us" />
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'JumpinAI',
            url: 'https://jumpinai.com',
            logo: 'https://jumpinai.com/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png',
            sameAs: ['https://twitter.com/jumpinai'],
            description: 'Pioneering personalized AI transformation through individualized learning paths, custom strategies, and human-centered AI implementation.'
          })}</script>
        </Helmet>
        <Navigation />
      {/* Hero Section - Glass Morphism */}
      <section className="relative px-0 pt-32 pb-12">
        <div className="relative flex items-center justify-center overflow-hidden">
          <div className="relative z-10 px-6 text-center max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20 animate-fade-in-up">
              <div className="space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-4 sm:px-0">About JumpinAI</h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light">Pioneering the future of human-AI collaboration. We're not just building tools—we're architecting the bridge between human potential and artificial intelligence, one personalized journey at a time.</p>
              </div>
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg" 
                  onClick={handleStartBuilding}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                >
                  Get Your Personal Jump
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section - Glass Morphism */}
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
                    We stand at the crossroads of human potential and artificial intelligence. <strong className="text-foreground">JumpinAI</strong> was born from a profound realization: the AI revolution isn't about replacing human intelligence—it's about amplifying it in ways uniquely meaningful to each individual.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    In a world drowning in generic AI solutions and one-size-fits-all approaches, we chose a different path. We believe that true transformation happens when technology meets the individual—when artificial intelligence becomes deeply personal, intimately relevant, and immediately actionable in your specific context.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We are <strong className="text-foreground">architects of individual AI journeys</strong>. We don't just teach about artificial intelligence; we craft personalized bridges between who you are today and who you can become with AI as your ally. Every interaction, every solution, every moment of transformation is designed around one fundamental truth: your AI journey should be as unique as your fingerprint.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    As pioneers in this new era, we're not just riding the wave of the AI revolution—we're helping to shape it with humanity at its core. Because the future belongs not to those who simply adopt AI, but to those who make it truly their own.
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
                Our Core Beliefs
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                These principles shape every personalized Jump plan we create and every individual transformation we guide.
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
                How JumpinAI Studio Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We don't offer generic AI education. Instead, we create your personalized Jump plan - a complete AI transformation roadmap designed uniquely for your goals, industry, and experience level.
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
                From Confusion to Your Personal Jump in 5 Minutes
              </h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Whether you're an entrepreneur, professional, creator, or simply curious about AI—we create your personalized transformation plan in minutes, not months. Your unique Jump plan includes everything you need to start implementing AI immediately.
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
              Ready for Your Personal Jump?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              While others are still offering generic AI courses, you could have your personalized Jump plan in 5 minutes. 
              <span className="text-primary font-semibold"> Your transformation starts now</span> — with custom strategies, 
              proven workflows, and personalized guidance designed specifically for your success.
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
                onClick={handleStartBuilding}
                className="text-lg px-8 py-4 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
              >
                {isAuthenticated ? 'Create My Jump Plan' : 'Get My Personal Jump'}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
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