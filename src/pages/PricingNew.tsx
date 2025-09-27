import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Rocket, Sparkles, Zap, Star, ArrowRight, Gift, CreditCard, Loader2 } from "lucide-react";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Helmet } from "react-helmet-async";
import { creditsService, type CreditPackage } from "@/services/creditsService";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export default function PricingNew() {
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [packageLoading, setPackageLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const { creditsBalance } = useCredits();
  const { getAuthHeaders } = useAuth0Token();

  useEffect(() => {
    fetchCreditPackages();
  }, []);

  const fetchCreditPackages = async () => {
    try {
      const packages = await creditsService.getCreditPackages();
      setCreditPackages(packages);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      toast.error('Failed to load credit packages');
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    if (!isAuthenticated) {
      login('/pricing');
      return;
    }

    try {
      setPackageLoading(packageId);
      const { data, error } = await supabase.functions.invoke("create-credit-checkout", {
        headers: await getAuthHeaders(),
        body: { packageId },
      });

      if (error) throw error;
      
      const url = (data as any)?.url;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setPackageLoading(null);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getValueBadge = (credits: number, price: number) => {
    const pricePerCredit = price / credits;
    if (pricePerCredit <= 0.35) return { text: "Best Value", color: "bg-green-500" };
    if (pricePerCredit <= 0.4) return { text: "Popular", color: "bg-blue-500" };
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Credits Pricing - JumpinAI | Buy AI Generation Credits</title>
        <meta name="description" content="Purchase JumpinAI credits to generate unlimited AI transformation plans. Get 5 welcome credits free when you sign up!" />
        <meta name="keywords" content="JumpinAI credits, AI generation, transformation plans, AI tools pricing" />
        <link rel="canonical" href="https://www.jumpinai.com/pricing" />
      </Helmet>
      
      <Navigation />
      
      <main className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <header className="text-center space-y-4 mb-12 animate-fade-in-down">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text-primary tracking-tight">
                JumpinAI Credits
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Purchase credits to generate unlimited AI transformation plans. Each credit = 1 complete Jump generation with tools, prompts, workflows, blueprints, and strategies.
              </p>
            </div>
            
            {/* Current Credits Display */}
            {isAuthenticated && (
              <div className="flex justify-center animate-scale-in animate-delay-300">
                <CreditsDisplay showBuyButton={false} className="bg-primary/10 border-primary/20 px-6 py-3 rounded-2xl" />
              </div>
            )}
          </header>

          {/* How It Works */}
          <div className="mb-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary mb-6">How Credits Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">1 Credit = 1 Generation</h3>
                  <p className="text-muted-foreground text-sm">Each credit generates a complete AI transformation plan</p>
                </div>
                
                <div className="text-center p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">5 Welcome Credits</h3>
                  <p className="text-muted-foreground text-sm">New users get 5 free credits when they sign up</p>
                </div>
                
                <div className="text-center p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Never Expire</h3>
                  <p className="text-muted-foreground text-sm">Credits never expire and are always available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary text-center mb-10">Choose Your Credit Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {creditPackages.map((pkg) => {
                const valueBadge = getValueBadge(pkg.credits, pkg.price_cents);
                const pricePerCredit = pkg.price_cents / pkg.credits / 100;
                
                return (
                  <Card key={pkg.id} className={`relative flex flex-col h-full glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 rounded-2xl overflow-hidden animate-fade-in-up group ${
                    valueBadge ? 'ring-2 ring-primary/40' : ''
                  }`}>
                    {/* Value Badge */}
                    {valueBadge && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <Badge className={`${valueBadge.color} text-white px-3 py-1 text-xs font-semibold rounded-lg shadow-lg border-0`}>
                          {valueBadge.text}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className={`text-center p-6 ${valueBadge ? 'pt-12' : ''}`}>
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-bold text-foreground">{pkg.name}</CardTitle>
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-primary">{formatPrice(pkg.price_cents)}</div>
                          <p className="text-muted-foreground text-sm">${pricePerCredit.toFixed(2)} per credit</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-6 pb-6 flex-1 flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Zap className="w-6 h-6 text-primary" />
                          <span className="text-2xl font-bold text-foreground">{pkg.credits}</span>
                          <span className="text-muted-foreground">credits</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generate {pkg.credits} complete AI transformation plans
                        </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-6 pt-0 mt-auto">
                      <Button
                        onClick={() => handleBuyCredits(pkg.id)}
                        disabled={loading || packageLoading === pkg.id}
                        className={`w-full py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 ${
                          valueBadge 
                            ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg'
                            : 'bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary/80 text-secondary-foreground'
                        }`}
                      >
                        {packageLoading === pkg.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Buy Credits
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Free Trial Section */}
          <div className="mb-16">
            <Card className="glass backdrop-blur-xl border border-primary/30 rounded-3xl overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold gradient-text-primary mb-4">
                      Try JumpinAI Free!
                    </h3>
                    <p className="text-muted-foreground text-lg mb-6">
                      Not sure yet? Try our JumpinAI Studio with 1 free generation as a guest, or sign up to get 5 welcome credits immediately!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Button 
                        onClick={() => navigate('/jumpinai-studio')}
                        variant="outline"
                        className="px-6 py-3 rounded-full border-2 hover:scale-105 transition-all duration-300"
                      >
                        Try Free (No Signup)
                      </Button>
                      {!isAuthenticated && (
                        <Button 
                          onClick={() => login('/jumpinai-studio')}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground hover:scale-105 transition-all duration-300"
                        >
                          <Gift className="mr-2 h-4 w-4" />
                          Sign Up for 5 Free Credits
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Rocket className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div className="p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                <h3 className="text-lg font-bold mb-3">Do credits expire?</h3>
                <p className="text-muted-foreground">No, your credits never expire. Use them whenever you need to generate AI transformation plans.</p>
              </div>
              <div className="p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                <h3 className="text-lg font-bold mb-3">What's included in each generation?</h3>
                <p className="text-muted-foreground">Each credit generates a complete plan with 4 AI tools, 4 prompts, 4 workflows, 4 blueprints, and 4 strategies.</p>
              </div>
              <div className="p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                <h3 className="text-lg font-bold mb-3">Can I get a refund?</h3>
                <p className="text-muted-foreground">Credits are non-refundable, but you can always try our free guest generation before purchasing.</p>
              </div>
              <div className="p-6 glass backdrop-blur-xl rounded-2xl border border-border/40">
                <h3 className="text-lg font-bold mb-3">How do welcome credits work?</h3>
                <p className="text-muted-foreground">New users automatically receive 5 free credits when they create an account. No purchase necessary!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}