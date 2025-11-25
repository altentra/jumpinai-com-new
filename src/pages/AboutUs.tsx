import { ArrowRight, Zap, Target, Users, Rocket, Download, Sparkles, Layers, Lightbulb, GitBranch, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet, HelmetProvider } from "react-helmet-async";
import logo from "@/assets/logo.png";

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
        <button className="relative group overflow-hidden">
          {/* Liquid glass glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
          
          {/* Button */}
          <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Content */}
            <span className="relative text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">Get Your Free AI Jumpstart Guide</span>
            <ArrowRight className="relative w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1" />
          </div>
        </button>
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
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="relative group w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {isSubmitting ? "Sending..." : "Send Me The PDF"}
                  </span>
                  <Download className="relative h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
              </button>
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
            
            <button 
              onClick={handleDirectDownload}
              className="relative group w-full overflow-hidden"
            >
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              {/* Button */}
              <div className="relative flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Content */}
                <Download className="relative h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
                <span className="relative text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">Download PDF Now</span>
              </div>
            </button>
            
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

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      navigate('/jumpinai-studio');
    } else {
      navigate('/jumpinai-studio');
    }
  };

  const beliefs = [
    {
      title: "AI Empowers, Not Replaces",
      description: "We believe artificial intelligence exists to elevate human potential—not replace it. The measure of AI's success isn't in what it can do alone, but in how powerfully it enables people to achieve what matters most to them."
    },
    {
      title: "Direction Over Information",
      description: "In the AI era, information is abundant—strategic direction is rare. Anyone can learn what AI does; few know exactly what to do next. We believe true value lies not in explaining technology, but in providing the clarity that transforms understanding into confident, strategic action."
    },
    {
      title: "Clarity Drives Action",
      description: "Complexity is the enemy of progress. We transform AI's overwhelming possibilities into clear, actionable pathways. When you understand exactly what to do next, transformation becomes inevitable."
    },
    {
      title: "Adaptation is Everything",
      description: "Static plans fail in dynamic environments. Your AI journey will evolve—your roadmap should too. We build systems that grow with you, ensuring relevance at every stage of your transformation."
    }
  ];

  const jumpPackage = [
    {
      icon: Sparkles,
      title: "Overview Tab",
      description: "Comprehensive situation analysis, strategic vision with measurable success metrics, and clear understanding of your AI transformation path."
    },
    {
      icon: Layers,
      title: "Plan Tab",
      description: "Detailed action roadmap organized into phases and milestones, with step-by-step implementation guidance tailored to your context."
    },
    {
      icon: Rocket,
      title: "Tools & Prompts Tab",
      description: "Personalized AI tool recommendations and ready-to-use prompts, specifically selected and crafted for your unique situation and goals."
    }
  ];

  const adaptiveFeatures = [
    {
      icon: Sparkles,
      title: "Clarify",
      description: "Break down any step into detailed sub-steps for deeper understanding and granular action items at multiple levels of detail."
    },
    {
      icon: GitBranch,
      title: "Reroute",
      description: "Explore alternative approaches for any step, generating three different strategic paths to choose the one that fits best."
    },
    {
      icon: Wrench,
      title: "Equip",
      description: "Generate custom tool-prompt combinations on demand for any step, expanding beyond the initial set to match your evolving needs."
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
            logo: 'https://jumpinai.com/logo.png',
            sameAs: ['https://twitter.com/jumpinai'],
            description: 'Pioneering personalized AI transformation through individualized learning paths, custom strategies, and human-centered AI implementation.'
          })}</script>
        </Helmet>
        <Navigation />
      {/* Hero Section - Glass Morphism */}
      <section className="relative px-0 pt-24 sm:pt-28 pb-8 sm:pb-10">
        <div className="relative flex items-center justify-center overflow-hidden">
          <div className="relative z-10 px-4 text-center max-w-6xl mx-auto">
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="space-y-3 sm:space-y-4">
                <div className="relative mb-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">About JumpinAI</h1>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground/90 mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed">An AI Adaptation Studio built for a simple truth: the AI era has arrived, clarity hasn't. We deliver personalized implementation plans that transform strategic confusion into clear action for those ready to adapt and lead.</p>
              </div>
              <div className="flex justify-center mt-4 sm:mt-6">
                <button 
                  onClick={handleStartBuilding}
                  className="relative group overflow-hidden w-full sm:w-auto"
                >
                  {/* Liquid glass glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  
                  {/* Button */}
                  <div className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">Get Your Personal Jump</span>
                    <ArrowRight className="relative w-4 h-4 text-foreground group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section - Glass Morphism */}
      <section className="px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="grid md:grid-cols-5 gap-6 items-start">
              <div className="md:col-span-2 flex justify-center md:pt-12">
                <div className="relative glass backdrop-blur-sm bg-background/30 dark:bg-background/20 border border-primary/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105">
                  <img
                    src={logo}
                    alt="JumpinAI brand logo"
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-xl sm:rounded-2xl object-contain"
                    loading="lazy"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-primary/20"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <article className="md:col-span-3 space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">Who We Are</h2>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    We stand at the crossroads of human potential and artificial intelligence. <strong className="text-foreground">JumpinAI</strong> was born from a profound realization: the AI revolution isn't about replacing human intelligence—it's about amplifying it in ways uniquely meaningful to each individual.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    In a world drowning in generic AI solutions and one-size-fits-all approaches, we chose a different path. We believe that true transformation happens when technology meets the individual—when artificial intelligence becomes deeply personal, intimately relevant, and immediately actionable in your specific context.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    We are <strong className="text-foreground">architects of individual AI journeys</strong>. We don't just teach about artificial intelligence; we craft personalized bridges between who you are today and who you can become with AI as your ally. Every interaction, every solution, every moment of transformation is designed around one fundamental truth: your AI journey should be as unique as your fingerprint.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    As pioneers in this new era, we're not just riding the wave of the AI revolution—we're helping to shape it with humanity at its core. Because the future belongs not to those who simply adopt AI, but to those who make it truly their own.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision - Glass Morphism */}
      <section className="px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Mission */}
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
              To democratize successful AI adoption by delivering personalized, adaptive transformation plans that turn complexity into clarity. We empower individuals and organizations to confidently navigate their unique AI journey—from strategic vision to tactical execution—in minutes, not months.
            </p>
          </div>

          {/* Vision */}
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
              To become the global standard for AI adaptation—a world where every individual and organization can seamlessly harness artificial intelligence in ways perfectly aligned with their context, capabilities, and ambitions. Where AI adoption is no longer a challenge, but a personalized journey of empowerment.
            </p>
          </div>
        </div>
      </section>

      {/* What We Believe - Glass Morphism */}
      <section className="px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Our Core Beliefs
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The principles that guide everything we build and every transformation we enable.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {beliefs.map((belief, index) => (
                <div 
                  key={index}
                  className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/35 transition-all duration-300"
                >
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                    {belief.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {belief.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Glass Morphism */}
      <section className="px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                How JumpinAI Studio Works
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Generate your personalized AI transformation roadmap in 2 minutes, then adapt it in real-time as your needs evolve.
              </p>
            </div>

            {/* Your Complete Jump Package */}
            <div className="mb-10 sm:mb-12">
              <h3 className="text-lg sm:text-xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                Your Complete Jump Package
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {jumpPackage.map((item, index) => (
                  <div 
                    key={index}
                    className="text-center group glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-4 md:p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:from-primary/30 group-hover:to-primary/20 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                      <item.icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h4 className="text-[10px] sm:text-base md:text-lg font-bold mb-1 sm:mb-2 md:mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/60 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[8px] sm:text-xs md:text-sm text-muted-foreground leading-tight sm:leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligent Adaptation Features */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                Intelligent Adaptation Features
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {adaptiveFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="text-center group glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-4 md:p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:from-primary/30 group-hover:to-primary/20 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                      <feature.icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h4 className="text-[10px] sm:text-base md:text-lg font-bold mb-1 sm:mb-2 md:mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/60 leading-tight">
                      {feature.title}
                    </h4>
                    <p className="text-[8px] sm:text-xs md:text-sm text-muted-foreground leading-tight sm:leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action - Glass Morphism */}
      <section className="px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-br from-foreground via-primary to-primary/70 bg-clip-text text-transparent">
              Ready for Your Personal Jump?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              The AI era demands adaptation. Not someday—today. Those who succeed won't be the ones who wait, watch, or wonder. They'll be the ones who act with clarity, adapt with precision, and harness AI to accelerate everything that matters. You know our purpose. You understand our approach. Now the question isn't what AI can do—it's what you'll do with it. <span className="text-primary font-semibold">Your clarity starts now.</span>
            </p>
            
            <div className="flex justify-center">
              <button 
                onClick={handleStartBuilding}
                className="relative group overflow-hidden w-full sm:w-auto"
              >
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {isAuthenticated ? 'Create My Jump Plan' : 'Get My Personal Jump'}
                  </span>
                  <ArrowRight className="relative w-4 h-4 text-foreground group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1" />
                </div>
              </button>
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