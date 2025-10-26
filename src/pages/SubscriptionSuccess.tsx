import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Crown, ArrowRight, Sparkles, Zap, Loader2, CreditCard } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { credits, fetchCredits, isLoading } = useCredits();
  const [planName, setPlanName] = useState("JumpinAI Subscription");
  const [monthlyCredits, setMonthlyCredits] = useState(0);
  const [verifying, setVerifying] = useState(true);

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
    const plan = searchParams.get('plan');
    const creditsParam = searchParams.get('credits');
    
    if (plan) setPlanName(plan);
    if (creditsParam) setMonthlyCredits(parseInt(creditsParam));

    const refreshCredits = async () => {
      if (user?.id) {
        // Wait longer for webhook to fully process (4 seconds)
        await new Promise(resolve => setTimeout(resolve, 4000));
        await fetchCredits();
        setVerifying(false);
      }
    };

    refreshCredits();
    
    const urlTimer = setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 6000);

    return () => {
      clearTimeout(urlTimer);
    };
  }, [user?.id]);

  return (
    <>
      <Helmet>
        <title>Subscription Successful - Welcome to {planName}</title>
        <meta name="description" content={`Welcome to ${planName}. Your subscription is active and ${monthlyCredits} credits have been added to your account.`} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Glassmorphism background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        </div>
        
        <Navigation />
        
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/20">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-4">
                Welcome to {planName}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your subscription is now active
              </p>
            </div>

            {/* Credits Balance Card */}
            <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Zap className="h-6 w-6" />
                  Credits Added to Your Account
                </CardTitle>
                <CardDescription>
                  Start creating comprehensive transformation plans with JumpinAI Studio
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {verifying || isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Activating your subscription...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-8 border border-primary/10">
                      <div className="mb-4">
                        <div className="text-5xl font-bold text-primary mb-2">
                          +{monthlyCredits}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Credits Added
                        </div>
                      </div>
                      <div className="pt-4 border-t border-primary/10">
                        <div className="text-4xl font-bold text-foreground mb-2">
                          {credits?.credits_balance || monthlyCredits}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Balance
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <p className="text-sm text-muted-foreground">
                          Get {monthlyCredits} new credits every month · Credits roll over if unused
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  What You Get with {planName}
                </CardTitle>
                <CardDescription>
                  Everything you need to transform your business with AI
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">{monthlyCredits} Monthly Credits</h3>
                        <p className="text-sm text-muted-foreground">Credits roll over if unused - never lose your investment</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">JumpinAI Studio Access</h3>
                        <p className="text-sm text-muted-foreground">Create comprehensive transformation plans with AI</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Complete Resource Library</h3>
                        <p className="text-sm text-muted-foreground">Access all guides, blueprints, and templates</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Priority Support</h3>
                        <p className="text-sm text-muted-foreground">Get help faster with priority email support</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">AI Tool & Prompt Combinations</h3>
                        <p className="text-sm text-muted-foreground">Each Jump includes 9 ready-to-use AI solutions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Downloadable PDF Plans</h3>
                        <p className="text-sm text-muted-foreground">Save and share your transformation plans</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Early Access</h3>
                        <p className="text-sm text-muted-foreground">Be first to try new features and content</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Cancel Anytime</h3>
                        <p className="text-sm text-muted-foreground">No long-term commitment required</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Button asChild size="lg" className="w-full">
                <Link to="/jumpinai-studio">
                  <Sparkles className="h-5 w-5 mr-2" />
                  JumpinAI Studio
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/dashboard">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  My Dashboard
                </Link>
              </Button>

              <Button 
                onClick={async () => {
                  try {
                    const { supabase } = await import('@/integrations/supabase/client');
                    const { data: session } = await supabase.auth.getSession();
                    const accessToken = session.session?.access_token;
                    
                    const { data, error } = await supabase.functions.invoke("customer-portal", {
                      body: { source: 'subscription-success' },
                      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                    });
                    
                    if (error) throw error;
                    const url = (data as any)?.url;
                    if (url) window.open(url, '_blank');
                  } catch (e: any) {
                    console.error(e);
                  }
                }}
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Billing Portal
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/dashboard/subscription">
                  <Crown className="h-5 w-5 mr-2" />
                  Subscription
                </Link>
              </Button>
            </div>

            {/* Support Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-6">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">
                    A confirmation email has been sent to your inbox
                  </p>
                  <p>
                    Questions about your subscription? Email us at <a href="mailto:support@jumpinai.com" className="text-primary hover:underline font-semibold">support@jumpinai.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <Footer />
      </div>
    </>
  );
};

export default SubscriptionSuccess;
