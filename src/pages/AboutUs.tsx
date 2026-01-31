import { ArrowRight, Zap, Target, Users, Rocket, Download, Sparkles, Layers, Lightbulb, GitBranch, Wrench, Workflow, Brain, Bot } from "lucide-react";
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
const logo = "/logo.jpg";

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

  const jumpPackageSteps = [
    {
      icon: Sparkles,
      title: "Overview",
      description: "Comprehensive situation analysis, strategic vision with measurable success metrics, and clear understanding of your AI transformation path."
    },
    {
      icon: Layers,
      title: "Plan",
      description: "Detailed action roadmap organized into phases and milestones, with step-by-step implementation guidance tailored to your context."
    },
    {
      icon: Rocket,
      title: "Tools & Prompts",
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
            logo: 'https://jumpinai.com/logo.jpg',
            sameAs: ['https://twitter.com/jumpinai'],
            description: 'Pioneering personalized AI transformation through individualized learning paths, custom strategies, and human-centered AI implementation.'
          })}</script>
        </Helmet>
        <Navigation />
      {/* Hero Section - Glass Morphism */}
      <section className="relative px-0 pt-24 sm:pt-32 pb-4 sm:pb-6">
        <div className="relative flex items-center justify-center overflow-hidden">
          <div className="relative z-10 px-4 text-center max-w-6xl mx-auto">
            <div className="text-center animate-fade-in-up">
              <div className="space-y-3 sm:space-y-4">
                <div className="relative mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">About JumpinAI</h1>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">We are an AI Adaptation Studio that clarifies and builds your path forward. As AI reshapes every industry, we provide the strategic "jumps" to harness its power—personalized plans and automated workflows designed around your goals, transforming ambition into achievement through strategic clarity and executable implementation.</p>
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
                    We stand at the crossroads of human potential and AI.<br />
                    <strong className="text-foreground">JumpinAI</strong> was born from a profound realization: successful AI adaptation isn't about information—it's about clarity and execution. The clarity to see your path forward, the strategic insight to harness AI's power effectively, and the tools to transform your ambitions into automated reality.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    In a world overflowing with AI tools and generic solutions, what's missing isn't more options—it's clarity, actionable guidance, and the bridge to implementation. We believe true adaptation happens when technology meets the individual, when clear pathways cut through complexity, and when strategic plans become executable workflows and AI agents perfectly aligned with your unique context.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    We are <strong className="text-foreground">architects of personalized AI adaptation</strong>. We don't just craft strategic roadmaps—we build the automations that bring them to life. From clarity to execution, we bridge who you are today with who you can become when you harness AI strategically and deploy it confidently.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    As pioneers in the era of AI adaptation, we're not just navigating the revolution—we're shaping it with humanity at its core. Because the future is shaped by those who harness AI with clarity, implement it with automated precision, and make it truly their own.
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
              To democratize successful AI adoption by delivering personalized transformation plans and automated implementations that turn complexity into clarity and action. We empower individuals and organizations to confidently navigate their unique AI journey—from strategic vision to deployed workflows and AI agents—in minutes, not months.
            </p>
          </div>

          {/* Vision */}
          <div className="glass backdrop-blur-md bg-background/40 dark:bg-background/20 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
              To become the global standard for AI adaptation—a world where every individual and organization can seamlessly harness artificial intelligence in ways perfectly aligned with their context, capabilities, and ambitions. Where AI adoption is no longer a challenge, but a personalized journey from strategic clarity to automated execution.
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
                Generate your personalized AI transformation roadmap in 2 minutes, refine it in real-time, then build automated workflows and AI agents ready for deployment.
              </p>
            </div>

            {/* Your Complete Jump - 3 Steps */}
            <div className="mb-10 sm:mb-12">
              <h3 className="text-lg sm:text-xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                Your Complete Jump in 3 Steps
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {jumpPackageSteps.map((item, index) => (
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

      {/* Implementation Section - Dedicated Premium Frame */}
      <section className="px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-gradient-to-br from-green-500/5 via-background/30 to-emerald-500/5 dark:from-green-500/10 dark:via-background/15 dark:to-emerald-500/10 border border-green-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-green-500/10 hover:shadow-3xl hover:shadow-green-500/15 transition-all duration-500">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left side - Content */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-green-500" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-foreground via-green-500/90 to-emerald-500/80 bg-clip-text text-transparent">
                      Implementation
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Transform your strategic jump into executable automation. Build workflows and AI agents directly from your personalized plan—ready for real-world deployment.
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/30 group-hover:border-blue-500/40 transition-all duration-300">
                      <Workflow className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Automated Workflows</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Linear, step-by-step automation sequences that execute your strategic actions with precision and consistency.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-yellow-500/30 group-hover:border-yellow-500/40 transition-all duration-300">
                      <Brain className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">AI Agents</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Intelligent agents with reasoning capabilities that adapt and make decisions aligned with your strategic goals.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-orange-500/30 group-hover:border-orange-500/40 transition-all duration-300">
                      <Download className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Export to n8n</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Download ready-to-import JSON files for n8n—the powerful open-source automation platform for technical teams.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:border-purple-500/40 transition-all duration-300">
                      <Zap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Export to Make.com</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">One-click export to Make.com blueprints—perfect for non-technical users who want visual automation building.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Visual */}
              <div className="relative">
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-green-500/25 rounded-2xl p-6 sm:p-8 shadow-xl shadow-green-500/15">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                      <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-br from-foreground to-green-500/80 bg-clip-text text-transparent">
                        From Strategy to Execution
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Your personalized jump becomes a living automation—analyzing opportunities, building agents, and deploying workflows that work while you focus on what matters.
                      </p>
                    </div>
                    
                    {/* Flow visualization */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 pt-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">Jump</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">Analyze</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center">
                          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">Build</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">Deploy</span>
                      </div>
                    </div>
                  </div>
                </div>
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
              The AI era demands adaptation. Not someday—today. Those who succeed won't be the ones who wait, watch, or wonder. They'll be the ones who act with clarity, build with precision, and deploy AI to accelerate everything that matters. You know our purpose. You understand our approach. Now the question isn't what AI can do—it's what you'll build with it. <span className="text-primary font-semibold">Your clarity and execution start now.</span>
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