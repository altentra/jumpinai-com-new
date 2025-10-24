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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Invest in the Future of
                  <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Personalized AI Transformation
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
                  JumpinAI Studio empowers creators, professionals, and entrepreneurs to confidently adapt to the AI era—generating comprehensive transformation plans in just 2 minutes with situation analysis, strategic vision with success metrics, detailed action plans, and 9 personalized AI tool-prompt combinations.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-sm sm:text-base px-6 sm:px-8 py-3 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm w-full sm:w-auto"
                  onClick={() => setIsDeckModalOpen(true)}
                >
                  Explore Investment Deck
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-sm sm:text-base px-6 sm:px-8 py-3 glass backdrop-blur-sm bg-background/20 border-primary/30 hover:bg-primary/10 hover:border-primary/40 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 w-full sm:w-auto"
                  onClick={scrollToContactForm}
                >
                  Contact Our Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest Section - Premium Glass Morphism */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Why Invest in JumpinAI
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The world's first platform for truly personalized AI transformation at scale
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Massive Untapped Market</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Billions struggle with generic AI solutions. We're the first to deliver truly personalized AI transformation at scale.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Target className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Breakthrough Innovation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  2-minute AI-powered process delivers comprehensive transformation plans with situational analysis, strategic roadmaps, and 9 personalized tool-prompt batches. No competitor offers this depth of individualization at scale.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <DollarSign className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Scalable AI Engine</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI-powered personalization engine generates unlimited unique transformations with minimal marginal cost.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <Rocket className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Perfect Timing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI revolution creating demand for personalized transformation. We're first-to-market with this approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Unique - Premium Glass Morphism */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                What Makes Us Unique
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The world's first platform to deliver truly personalized AI transformation at enterprise scale
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/25 rounded-2xl p-6 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">2-Minute Personalization</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Proprietary AI engine creates complete personalized transformation roadmaps with comprehensive analysis in 2 minutes, not months—joining 15,000+ professionals who've already made the leap.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/25 rounded-2xl p-6 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Comprehensive Transformation Package</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Each Jump delivers a complete transformation plan: situation analysis, strategic vision with success metrics, detailed action plan with phases and milestones, plus 9 personalized batches of AI tools and prompts—all implementation-ready.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/25 rounded-2xl p-6 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">AI Coach Integration</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Ongoing personalized guidance through intelligent coaching, creating deeper engagement and retention.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/25 rounded-2xl p-6 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Human-Centered AI Architecture</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        AI amplifies human potential rather than replacing it, creating sustainable transformation and loyalty.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds - Premium Glass Morphism */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Use of Funds
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Strategic investment in AI technology, platform expansion, and market leadership
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-14 h-14 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">AI Engine Enhancement</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Advanced personalization algorithms, multi-language support, and enterprise-grade AI capabilities
                </p>
                <div className="text-2xl font-bold text-primary">40%</div>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-14 h-14 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Market Expansion</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Strategic partnerships, enterprise sales, and global market penetration initiatives
                </p>
                <div className="text-2xl font-bold text-primary">30%</div>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-14 h-14 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Technology Infrastructure</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Scalable cloud architecture, security enhancements, and enterprise-level platform reliability
                </p>
                <div className="text-2xl font-bold text-primary">20%</div>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-2 text-center">
                <div className="w-14 h-14 glass backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">Talent & Operations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  World-class AI talent acquisition, operational excellence, and strategic leadership expansion
                </p>
                <div className="text-2xl font-bold text-primary">10%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crunchbase Profile - Premium Glass */}
      <section className="py-8 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center gap-4">
              <Globe className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">View our company profile</p>
                <p className="text-xs text-muted-foreground">Detailed metrics on Crunchbase</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="text-sm px-4 py-2 glass backdrop-blur-sm bg-background/20 border-primary/30 hover:border-primary hover:bg-primary/10 rounded-xl shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300"
                onClick={() => window.open('https://www.crunchbase.com/organization/jumpinai', '_blank')}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Premium Glass Morphism */}
      <section id="contact-form-section" className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                Ready to Lead the AI Transformation Revolution?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
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
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="text-base px-12 py-3 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Invest or Partner With Us
                      </>
                    )}
                  </Button>
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