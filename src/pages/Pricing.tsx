import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Rocket, Sparkles } from "lucide-react";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

const planFeatures = {
  free: [
    "Create 1 comprehensive Jump plan",
    "Step clarification and alternative route discovery",
    "Access to JumpinAI Studio",
    "Basic AI transformation planning",
    "Download your Jump as PDF",
    "Community support forum",
    "Weekly AI insights newsletter"
  ],
  pro: [
    "Everything in Free plan",
    "Unlimited Jump creations",
    "Clarify and reroute steps up to 3 levels deep",
    "AI Coach Chat for continuous editing",
    "Advanced Jump refinement & optimization",
    "Priority prompts, workflows & blueprints library",
    "Real-time collaboration features",
    "Advanced analytics & progress tracking",
    "Priority email support",
    "Early access to new AI features"
  ],
};

export default function Pricing() {
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const { getAuthHeaders } = useAuth0Token();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated, user]);

  const checkSubscriptionStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: await getAuthHeaders(),
      });
      if (error) throw error;
      setSubInfo(data as SubscriberInfo);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign up or log in to subscribe to a plan');
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: await getAuthHeaders(),
        body: { source: 'pricing' },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleManageDashboard = () => {
    // Redirect to the new credits-based pricing page
    navigate('/pricing');
  };

  return (
    <>
      <Helmet>
        <title>Pricing - JumpinAI | Choose Your Plan</title>
        <meta name="description" content="Choose the perfect JumpinAI plan for your AI journey. Start free or upgrade to Pro for advanced features and priority support." />
        <meta name="keywords" content="JumpinAI pricing, AI subscription, pro plan, AI tools pricing" />
        <link rel="canonical" href="https://www.jumpinai.com/pricing" />
      </Helmet>
      
      <Navigation />
      
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

        <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Premium Hero Section with enhanced gradients */}
            <div className="text-center mb-12 sm:mb-20 animate-fade-in-up">
              {/* Liquid glass backdrop for title */}
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/8 blur-3xl transform -translate-y-4"></div>
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-4 sm:px-0">
                  Choose Your AI Journey
                </h1>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
              </div>
              
              <div className="relative px-4 sm:px-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-2xl"></div>
                <p className="relative text-base sm:text-lg md:text-xl text-muted-foreground/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                  Transform your vision into reality with our AI-powered JumpinAI Studio. 
                  Start creating comprehensive transformation plans today.
                </p>
              </div>
            </div>

            {isAuthenticated && subInfo?.subscribed && (
              <div className="flex justify-center animate-scale-in animate-delay-300 mb-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm rounded-xl shadow-md">
                  <Crown className="mr-2 h-4 w-4" />
                  Current Plan: {subInfo.subscription_tier || 'Pro'}
                </Badge>
              </div>
            )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 max-w-4xl mx-auto mb-16">
            {/* Free Plan */}
            <Card className="relative flex flex-col h-full glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 rounded-2xl overflow-hidden animate-fade-in-up group bg-gradient-to-br from-card/80 to-card/60">
              {/* Subtle floating elements */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-primary/8 to-primary/3 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-tr from-secondary/6 to-secondary/2 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{transitionDelay: '200ms'}}></div>
              
              <CardHeader className="text-center p-3 md:p-5 pb-2">
                <div className="space-y-2">
                  <CardTitle className="text-base md:text-lg font-bold text-foreground">Free Starter</CardTitle>
                  <div className="space-y-1">
                    <div className="text-xl md:text-2xl font-bold text-foreground">$0</div>
                    <p className="text-muted-foreground text-xs">Perfect for getting started</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-3 md:px-5 pb-3 flex-1">
                <ul className="space-y-1.5 md:space-y-2">
                  {planFeatures.free.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 animate-fade-in-up text-xs" style={{animationDelay: `${index * 100}ms`}}>
                      <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90 leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="p-3 md:p-5 pt-0 mt-auto">
                <div className="w-full">
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => login('/pricing')}
                        className="relative group w-full overflow-hidden"
                      >
                        {/* Liquid glass glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        
                        {/* Button */}
                        <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          {/* Content */}
                          <span className="relative font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-xs md:text-sm">
                            Get Started Free
                          </span>
                        </div>
                      </button>
                      <p className="text-xs text-center text-muted-foreground invisible" aria-hidden="true">
                        helper
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2.5 text-muted-foreground text-xs font-medium">
                      {subInfo?.subscribed ? 'Always available as fallback' : 'Currently active plan'}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className={`relative flex flex-col h-full transition-all duration-500 rounded-2xl overflow-hidden animate-fade-in-up animate-delay-200 group ${
              subInfo?.subscribed 
                ? 'ring-2 ring-primary/40 border-primary/60 glass backdrop-blur-xl shadow-2xl shadow-primary/25' 
                : 'glass backdrop-blur-xl border border-primary/40 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/25 hover:ring-2 hover:ring-primary/30'
            } bg-gradient-to-br from-card/90 to-primary/5`}>
              {/* Premium badge - Fixed positioning */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-2 md:px-3 py-0.5 text-xs font-semibold rounded-lg shadow-lg border-0">
                  {subInfo?.subscribed ? '✨ Your Plan' : 'Most Popular'}
                </Badge>
              </div>

              {/* Enhanced floating elements - premium gradients */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/8 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-secondary/15 to-secondary/5 rounded-full blur-2xl"></div>
              
              <CardHeader className="text-center p-3 md:p-5 pb-2 pt-8 md:pt-9">
                <div className="space-y-2">
                  <CardTitle className="text-base md:text-lg font-bold text-primary flex items-center justify-center gap-1.5">
                    <Crown className="h-4 w-4" />
                    JumpinAI Pro
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-xl md:text-2xl font-bold text-primary">$10</div>
                    <p className="text-muted-foreground text-xs">per month • Unlimited AI power</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-3 md:px-5 pb-3 flex-1">
                <ul className="space-y-1.5 md:space-y-2">
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 animate-fade-in-up text-xs" style={{animationDelay: `${index * 100 + 200}ms`}}>
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90 font-medium leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="p-3 md:p-5 pt-0 mt-auto">
                {!isAuthenticated ? (
                  <div className="w-full space-y-2">
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="relative group w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Liquid glass glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                      
                      {/* Button */}
                      <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        {/* Content */}
                        <Crown className="relative h-3.5 w-3.5 text-foreground group-hover:text-primary transition-colors duration-300" />
                        <span className="relative font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-xs md:text-sm">
                          {loading ? 'Processing...' : 'Start Pro Journey'}
                        </span>
                      </div>
                    </button>
                    <p className="text-xs text-center text-muted-foreground">
                      Create account and upgrade to Pro instantly
                    </p>
                  </div>
                ) : !subInfo?.subscribed ? (
                  <div className="w-full space-y-2">
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="relative group w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Liquid glass glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                      
                      {/* Button */}
                      <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        {/* Content */}
                        <Crown className="relative h-3.5 w-3.5 text-foreground group-hover:text-primary transition-colors duration-300" />
                        <span className="relative font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-xs md:text-sm">
                          {loading ? 'Processing...' : 'Upgrade to Pro'}
                        </span>
                      </div>
                    </button>
                    <p className="text-xs text-center text-muted-foreground">
                      Cancel anytime • No long-term commitment
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    <button
                      onClick={handleManageDashboard}
                      className="relative group w-full overflow-hidden"
                    >
                      {/* Liquid glass glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                      
                      {/* Button */}
                      <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        {/* Content */}
                        <span className="relative font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-xs md:text-sm">
                          Manage Subscription
                        </span>
                      </div>
                    </button>
                    <p className="text-xs text-center text-muted-foreground">
                      Next renewal: {subInfo.subscription_end ? new Date(subInfo.subscription_end).toLocaleDateString() : '—'}
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Feature Comparison Section */}
          <div className="mb-16">
            <div className="text-center mb-10 animate-fade-in-up">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary mb-3">
                What makes JumpinAI Studio special?
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered transformation planning goes beyond simple advice. Create comprehensive, 
                actionable roadmaps that bridge where you are today with where you want to be tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              <div className="text-center p-4 md:p-5 glass backdrop-blur-xl rounded-3xl border border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 animate-fade-in-up bg-gradient-to-br from-card/70 to-card/50">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">AI-Powered Planning</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Create comprehensive transformation plans with AI that understands your unique situation and goals.
                </p>
              </div>

              <div className="text-center p-4 md:p-5 glass backdrop-blur-xl rounded-3xl border border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 dark:shadow-lg dark:shadow-black/10 animate-fade-in-up animate-delay-200 bg-gradient-to-br from-background/50 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/15 to-primary/5 dark:bg-gradient-to-br dark:from-gray-700/30 dark:to-gray-800/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">Complete Toolkit</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Get prompts, workflows, blueprints, and strategies all integrated into your personalized Jump plan.
                </p>
              </div>

              <div className="text-center p-4 md:p-5 glass backdrop-blur-xl rounded-3xl border border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 dark:shadow-lg dark:shadow-black/10 animate-fade-in-up animate-delay-400 bg-gradient-to-br from-background/50 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/15 to-primary/5 dark:bg-gradient-to-br dark:from-gray-700/30 dark:to-gray-800/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">Continuous Refinement</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Pro users get AI Chat to continuously refine and optimize their transformation plans in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="glass backdrop-blur-xl rounded-2xl border border-border/50 p-6 md:p-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-muted-foreground">
                Everything you need to know about JumpinAI pricing and features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="space-y-3 p-4 md:p-5 bg-background/50 rounded-xl border border-border/30">
                <h3 className="font-bold text-base text-foreground">What exactly is a "Jump"?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A Jump is a comprehensive AI transformation plan that includes strategic analysis, action phases, 
                  tools & prompts, workflows, and success metrics - all personalized to your unique situation.
                </p>
              </div>
              
              <div className="space-y-3 p-4 md:p-5 bg-background/50 rounded-xl border border-border/30">
                <h3 className="font-bold text-base text-foreground">Can I cancel anytime?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the 
                  end of your billing period, and your existing Jumps remain accessible.
                </p>
              </div>
              
              <div className="space-y-3 p-4 md:p-5 bg-background/50 rounded-xl border border-border/30">
                <h3 className="font-bold text-base text-foreground">What's the difference between Free and Pro?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Free users can create 1 Jump plan. Pro users get unlimited Jumps plus AI Chat for continuous 
                  refinement, advanced features, and priority support.
                </p>
              </div>
              
              <div className="space-y-3 p-4 md:p-5 bg-background/50 rounded-xl border border-border/30">
                <h3 className="font-bold text-base text-foreground">What payment methods do you accept?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We accept all major credit cards through our secure Stripe payment processing. 
                  All transactions are encrypted and secure.
                </p>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </>
  );
}