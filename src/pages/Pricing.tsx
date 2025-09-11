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
    "Access to Jumps Studio",
    "Basic AI transformation planning",
    "Download your Jump as PDF",
    "Community support forum",
    "Weekly AI insights newsletter"
  ],
  pro: [
    "Everything in Free plan",
    "Unlimited Jump creations",
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
      login('/pricing');
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
    if (isAuthenticated) {
      navigate('/dashboard/subscription');
    } else {
      login('/dashboard/subscription');
    }
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
      
      <main className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <header className="text-center space-y-6 mb-16 animate-fade-in-down">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text-primary tracking-tight">
                Choose Your AI Journey
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
                Transform your vision into reality with our AI-powered Jumps Studio. 
                Start creating comprehensive transformation plans today.
              </p>
            </div>
            {isAuthenticated && subInfo?.subscribed && (
              <div className="flex justify-center animate-scale-in animate-delay-300">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-3 text-lg rounded-2xl shadow-lg">
                  <Crown className="mr-2 h-5 w-5" />
                  Current Plan: {subInfo.subscription_tier || 'Pro'}
                </Badge>
              </div>
            )}
          </header>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
            {/* Free Plan */}
            <Card className="relative h-full glass backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 rounded-3xl overflow-hidden animate-fade-in-up group">
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{transitionDelay: '200ms'}}></div>
              
              <CardHeader className="text-center p-8 pb-6">
                <div className="space-y-4">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">Free Starter</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl md:text-5xl font-bold text-foreground">$0</div>
                    <p className="text-muted-foreground text-lg">Perfect for getting started</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4">
                  {planFeatures.free.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="p-8 pt-0 mt-auto">
                <div className="w-full">
                  {!isAuthenticated ? (
                    <Button 
                      onClick={() => login('/pricing')}
                      variant="outline" 
                      className="w-full py-4 text-lg rounded-2xl border-2 hover:scale-105 transition-all duration-300 font-semibold"
                    >
                      Get Started Free
                    </Button>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground font-medium">
                      {subInfo?.subscribed ? 'Always available as fallback' : 'Currently active plan'}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className={`relative h-full transition-all duration-500 rounded-3xl overflow-hidden animate-fade-in-up animate-delay-200 group ${
              subInfo?.subscribed 
                ? 'ring-4 ring-primary/30 border-primary/50 glass backdrop-blur-xl shadow-2xl shadow-primary/20' 
                : 'glass backdrop-blur-xl border border-primary/30 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:ring-2 hover:ring-primary/20'
            }`}>
              {/* Premium badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 text-sm font-semibold rounded-2xl shadow-lg animate-pulse">
                  {subInfo?.subscribed ? '✨ Your Plan' : '🚀 Most Popular'}
                </Badge>
              </div>

              {/* Enhanced floating elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 right-4 w-20 h-20 bg-accent/10 rounded-full blur-xl opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>

              <CardHeader className="text-center p-8 pb-6 pt-12">
                <div className="space-y-4">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center gap-3">
                    <Crown className="h-7 w-7" />
                    JumpinAI Pro
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl md:text-5xl font-bold text-primary">$10</div>
                    <p className="text-muted-foreground text-lg">per month • Unlimited AI power</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4">
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 animate-fade-in-up" style={{animationDelay: `${index * 100 + 200}ms`}}>
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="p-8 pt-0 mt-auto">
                {!isAuthenticated ? (
                  <div className="w-full space-y-4">
                    <Button 
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground text-lg py-6 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      {loading ? 'Processing...' : 'Start Pro Journey'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Create account and upgrade to Pro instantly
                    </p>
                  </div>
                ) : !subInfo?.subscribed ? (
                  <div className="w-full space-y-4">
                    <Button 
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground text-lg py-6 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      {loading ? 'Processing...' : 'Upgrade to Pro'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Cancel anytime • No long-term commitment
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <Button 
                      onClick={handleManageDashboard}
                      variant="secondary"
                      className="w-full text-lg py-6 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
                    >
                      Manage Subscription
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Next renewal: {subInfo.subscription_end ? new Date(subInfo.subscription_end).toLocaleDateString() : '—'}
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Feature Comparison Section */}
          <div className="mb-20">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text-primary mb-4">
                What makes Jumps Studio special?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our AI-powered transformation planning goes beyond simple advice. Create comprehensive, 
                actionable roadmaps that bridge where you are today with where you want to be tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 glass backdrop-blur-xl rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 animate-fade-in-up">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">AI-Powered Planning</h3>
                <p className="text-muted-foreground">
                  Create comprehensive transformation plans with AI that understands your unique situation and goals.
                </p>
              </div>

              <div className="text-center p-8 glass backdrop-blur-xl rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 animate-fade-in-up animate-delay-200">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Complete Toolkit</h3>
                <p className="text-muted-foreground">
                  Get prompts, workflows, blueprints, and strategies all integrated into your personalized Jump plan.
                </p>
              </div>

              <div className="text-center p-8 glass backdrop-blur-xl rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 animate-fade-in-up animate-delay-400">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Continuous Refinement</h3>
                <p className="text-muted-foreground">
                  Pro users get AI Chat to continuously refine and optimize their transformation plans in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="glass backdrop-blur-xl rounded-3xl border border-border/50 p-8 md:p-12 animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text-primary mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about JumpinAI pricing and features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="space-y-4 p-6 bg-background/50 rounded-2xl border border-border/30">
                <h3 className="font-bold text-lg text-foreground">What exactly is a "Jump"?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A Jump is a comprehensive AI transformation plan that includes strategic analysis, action phases, 
                  tools & prompts, workflows, and success metrics - all personalized to your unique situation.
                </p>
              </div>
              
              <div className="space-y-4 p-6 bg-background/50 rounded-2xl border border-border/30">
                <h3 className="font-bold text-lg text-foreground">Can I cancel anytime?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the 
                  end of your billing period, and your existing Jumps remain accessible.
                </p>
              </div>
              
              <div className="space-y-4 p-6 bg-background/50 rounded-2xl border border-border/30">
                <h3 className="font-bold text-lg text-foreground">What's the difference between Free and Pro?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Free users can create 1 Jump plan. Pro users get unlimited Jumps plus AI Chat for continuous 
                  refinement, advanced features, and priority support.
                </p>
              </div>
              
              <div className="space-y-4 p-6 bg-background/50 rounded-2xl border border-border/30">
                <h3 className="font-bold text-lg text-foreground">What payment methods do you accept?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We accept all major credit cards through our secure Stripe payment processing. 
                  All transactions are encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}