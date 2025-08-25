import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check } from "lucide-react";
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
    "Access to basic AI resources",
    "Weekly newsletter with AI insights", 
    "Community support forum",
    "Basic workflow templates",
    "Limited prompt library access"
  ],
  pro: [
    "Everything in Free plan",
    "Full blueprints library access",
    "Advanced workflow templates", 
    "Premium prompt collection",
    "Priority email support",
    "Early access to new features",
    "Advanced analytics dashboard",
    "Custom strategy tools",
    "Monthly AI training sessions"
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
      
      <main className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your AI journey with our free plan or unlock advanced features with JumpinAI Pro
            </p>
            {isAuthenticated && subInfo?.subscribed && (
              <div className="flex justify-center">
                <Badge className="bg-primary/10 text-primary px-4 py-2">
                  Current Plan: {subInfo.subscription_tier || 'Pro'}
                </Badge>
              </div>
            )}
          </header>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative h-full border hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="text-center space-y-3">
                  <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">$0</div>
                    <p className="text-muted-foreground">per month</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {planFeatures.free.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <div className="w-full text-center">
                  {!isAuthenticated ? (
                    <Button 
                      onClick={() => login('/pricing')}
                      variant="outline" 
                      className="w-full"
                    >
                      Get Started Free
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {subInfo?.subscribed ? 'Available anytime' : 'Currently active'}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className={`relative h-full transition-all duration-300 ${
              subInfo?.subscribed 
                ? 'ring-2 ring-primary/30 border-primary/50' 
                : 'border-primary/30 hover:border-primary/50 hover:shadow-xl'
            }`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  {subInfo?.subscribed ? 'Your Plan' : 'Most Popular'}
                </Badge>
              </div>
              <CardHeader>
                <div className="text-center space-y-3">
                  <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                    <Crown className="h-6 w-6" />
                    JumpinAI Pro
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-primary">$10</div>
                    <p className="text-muted-foreground">per month</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto space-y-4">
                {!isAuthenticated ? (
                  <div className="w-full space-y-3">
                    <Button 
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      {loading ? 'Processing...' : 'Start Pro Trial'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Create account and upgrade to Pro
                    </p>
                  </div>
                ) : !subInfo?.subscribed ? (
                  <div className="w-full space-y-3">
                    <Button 
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      {loading ? 'Processing...' : 'Upgrade to Pro'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Cancel anytime • No long-term contracts
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <Button 
                      onClick={handleManageDashboard}
                      variant="secondary"
                      className="w-full text-lg py-6"
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

          {/* FAQ Section */}
          <div className="mt-16 text-center space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div className="space-y-2">
                <h3 className="font-semibold">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  You can start with our free plan immediately. When you're ready, upgrade to Pro to access all premium features.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards through our secure Stripe payment processing.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Can I change plans later?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time through your account dashboard.
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