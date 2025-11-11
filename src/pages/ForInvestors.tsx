import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { InvestmentDeckModal } from "@/components/InvestmentDeckModal";
import { TrendingUp, Users, Globe, DollarSign, Target, Lightbulb, Rocket, Mail, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { sendInvestorContactEmail } from "@/services/investorService";
import { Helmet } from "react-helmet-async";

const ForInvestors = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    investmentLevel: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const scrollToContactForm = () => {
    const contactSection = document.getElementById('contact-form-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendInvestorContactEmail(formData);
      toast({
        title: "Message Sent Successfully",
        description: "We'll respond to your inquiry within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        investmentLevel: '',
        message: ''
      });
    } catch (error: any) {
      console.error("Error sending investor contact:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
      <Helmet>
        <title>For Investors | JumpinAI Investment Opportunities</title>
        <meta name="description" content="Invest in JumpinAI - the future of AI education. Positioned at the intersection of AI, education, and the future of work with high growth potential." />
        <link rel="canonical" href={`${window.location.origin}/for-investors`} />
      </Helmet>
      
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-100">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
      </div>
      <Navigation />
      
      {/* Premium Hero Section - Glass Morphism */}
      <section className="relative pt-32 pb-12 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="relative inline-block">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
                For Investors
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
            </div>
          </div>
          
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Invest in the Future of
                  <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Personalized AI Transformation
                  </span>
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
                  JumpinAI Studio empowers professionals and entrepreneurs to confidently navigate AI transformation—generating complete 3-tab transformation blueprints in 2 minutes. Each Jump includes: strategic Overview (executive summary, situation analysis, vision & roadmap), adaptive Plan (multi-level clarification up to 4 levels deep + 3 alternative routes per step), and Tools & Prompts (9 tool-prompt combinations with ready-to-use prompts). All from answering just 2 questions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => window.location.href = '/pitch-deck'}
                  className="relative group overflow-hidden w-full sm:w-auto"
                >
                  {/* Liquid glass glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  
                  {/* Button */}
                  <div className="relative flex items-center justify-center gap-2 px-8 sm:px-10 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">View our Pitch Deck</span>
                  </div>
                </button>
                
                <button
                  onClick={scrollToContactForm}
                  className="relative group overflow-hidden w-full sm:w-auto"
                >
                  {/* Liquid glass glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  
                  {/* Button */}
                  <div className="relative flex items-center justify-center gap-2 px-8 sm:px-10 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Content */}
                    <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">Contact Our Team</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest Section - Premium Glass Morphism */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Why Invest in JumpinAI
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The world's first platform for truly personalized AI transformation at scale
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Massive Untapped Market</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Millions of professionals and businesses struggle with generic AI advice and cookie-cutter solutions. We're first to deliver truly personalized AI transformation at scale—each Jump uniquely tailored to user's specific goals, challenges, industry, and context.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Target className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Breakthrough Innovation</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Revolutionary 3-tab transformation system: Strategic Overview for understanding, Adaptive Plan with multi-level clarification (4 levels deep) and alternative routes (3 per step), plus 9 tool-prompt combinations for execution. No competitor offers this depth of adaptive personalization at scale.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Scalable AI Engine</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Our AI-powered personalization engine generates unlimited unique transformations with minimal marginal cost per Jump. Unlike traditional consulting models with linear cost scaling, our technology enables exponential growth without proportional expense increases, creating exceptional unit economics and sustainable competitive advantages.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Rocket className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Perfect Timing</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  The AI revolution is creating unprecedented demand for personalized transformation solutions. We're first-to-market with this adaptive approach, capturing early-mover advantages before competitors can replicate our depth of personalization. The convergence of AI maturity and market readiness creates a unique window for exponential growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Unique - Premium Glass Morphism */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                What Makes Us Unique
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The world's first platform to deliver truly personalized AI transformation at enterprise scale
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Simplicity Meets Depth</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Users answer just 2 questions (goals & challenges). Our AI engine generates a complete 3-tab transformation blueprint in 2 minutes—joining 15,000+ professionals who've already experienced instant clarity. Low friction, high value.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Globe className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Adaptive Intelligence System</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Revolutionary Plan tab never leaves users stuck: clarify any step up to 4 levels deep for granular detail, or discover 3 alternative routes if a path doesn't fit. Plus Overview tab for strategic context and Tools & Prompts tab with 9 ready-to-execute tool-prompt combinations. Complete ecosystem for transformation.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">AI Coach Integration</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Our intelligent AI Coach provides ongoing personalized guidance throughout the transformation journey, creating deeper user engagement and exceptional retention rates. This continuous support system learns from each interaction, offering contextual assistance that evolves with user needs, transforming one-time users into long-term subscribers.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Lightbulb className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Human-Centered AI Architecture</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Our platform is designed with a human-first philosophy where AI amplifies human potential rather than replacing it. This approach creates sustainable transformation outcomes and builds deep user loyalty. By empowering users to make informed decisions while providing AI-powered support, we foster trust and long-term relationships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds - Premium Glass Morphism */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Use of Funds
              </h2>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
                Strategic investment in AI technology, platform expansion, and market leadership
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-5 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-10 h-10 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">AI Engine Enhancement</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Advanced personalization algorithms, multi-language support, and enterprise-grade AI capabilities
                </p>
                <div className="text-xl font-bold text-primary">40%</div>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-5 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-10 h-10 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Market Expansion</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Strategic partnerships, enterprise sales, and global market penetration initiatives
                </p>
                <div className="text-xl font-bold text-primary">30%</div>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-5 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-10 h-10 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Technology Infrastructure</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Scalable cloud architecture, security enhancements, and enterprise-level platform reliability
                </p>
                <div className="text-xl font-bold text-primary">20%</div>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-5 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-10 h-10 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Talent & Operations</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  World-class AI talent acquisition, operational excellence, and strategic leadership expansion
                </p>
                <div className="text-xl font-bold text-primary">10%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crunchbase Profile */}
      <section className="py-6 px-4 relative z-10">
        <div className="max-w-2xl mx-auto flex justify-center">
          <button 
            onClick={() => window.open('https://www.crunchbase.com/organization/jumpinai', '_blank')}
            className="relative group overflow-hidden"
          >
            {/* Liquid glass glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
            
            {/* Button */}
            <div className="relative flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Content */}
              <Globe className="relative h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">View Our Profile & Metrics on Crunchbase</span>
              <ExternalLink className="relative h-4 w-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </button>
        </div>
      </section>

      {/* Wefunder Campaign */}
      <section className="py-6 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-sm md:text-base text-muted-foreground">
              We're currently raising funds on <span className="font-bold text-foreground">Wefunder</span> to accelerate our growth and expand our impact.
            </p>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => window.open('https://wefunder.com/jumpinai', '_blank')}
              className="relative group overflow-hidden"
            >
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              {/* Button */}
              <div className="relative flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Content */}
                <TrendingUp className="relative h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">View Our Campaign on Wefunder</span>
                <ExternalLink className="relative h-4 w-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action - Premium Glass Morphism */}
      <section id="contact-form-section" className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Ready to Lead the AI Transformation Revolution?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Partner with us to scale the world's first truly personalized AI transformation platform and define the future of human-AI collaboration.
              </p>
            </div>
            
            <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/25 rounded-2xl p-8 shadow-xl shadow-primary/15">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-10 glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-10 glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="investmentLevel" className="block text-sm font-bold text-foreground mb-2">
                    Investment Interest Level
                  </label>
                  <select
                    id="investmentLevel"
                    name="investmentLevel"
                    value={formData.investmentLevel}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border border-primary/30 rounded-xl text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10 transition-all duration-300"
                  >
                    <option value="">Select an option</option>
                    <option value="angel">Angel Investor ($25K - $100K)</option>
                    <option value="strategic">Strategic Partner ($100K - $500K)</option>
                    <option value="institutional">Institutional Investor ($500K+)</option>
                    <option value="advisory">Advisory Role</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-foreground mb-2">
                    Message (Optional)
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your investment interests and any questions you have..."
                    className="w-full glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl resize-none shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
                  />
                </div>
                
                <div className="text-center">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Liquid glass glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    
                    {/* Button */}
                    <div className="relative flex items-center justify-center gap-2 px-12 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Content */}
                      {isSubmitting ? (
                        <>
                          <Loader2 className="relative h-5 w-5 animate-spin text-foreground group-hover:text-primary transition-colors duration-300" />
                          <span className="relative text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">Sending...</span>
                        </>
                      ) : (
                        <span className="relative text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">Invest or Partner With Us</span>
                      )}
                    </div>
                  </button>
                  <p className="text-sm text-muted-foreground mt-4">
                    We'll respond within 24 hours to discuss opportunities and next steps.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      <InvestmentDeckModal 
        isOpen={isDeckModalOpen} 
        onClose={() => setIsDeckModalOpen(false)} 
      />
    </div>
  );
};

export default ForInvestors;