import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Loader2, RefreshCw, X, CreditCard, Crown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

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
    "1000 credits monthly (rollover)",
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

export default function Subscription() {
  const { user, refreshSubscription, isAuthenticated, isLoading: authLoading, login, subscription } = useAuth();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        login('/dashboard/subscription');
      } else if (user) {
        setEmail(user.email || "");
        // Use cached subscription data from auth context
        setSubInfo(subscription || { subscribed: false });
        setLoading(false);
        
        // Show success message if user just returned from payment
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
          toast.success("Payment successful! Welcome to JumpinAI Pro!", {
            duration: 5000,
          });
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [isAuthenticated, authLoading, user, subscription, login]);

  // Use the cached refreshSubscription from auth context - this will update both cache and local state
  const handleRefreshSubscription = async () => {
    await refreshSubscription();
    // Update local state with the refreshed data
    setTimeout(() => {
      setSubInfo(subscription || { subscribed: false });
    }, 100);
  };

  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { source: 'dashboard-subscription' },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  const manage = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { source: 'dashboard-subscription' },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (error) throw error;
      const url = (data as any)?.url;
      
      if (url) {
        if (isMobile) {
          // Use placeholder window approach for mobile to avoid popup blockers
          const placeholder = window.open('', '_blank');
          if (placeholder && typeof placeholder.location !== 'undefined') {
            placeholder.location.href = url;
          } else {
            window.location.href = url;
          }
        } else {
          // Direct approach for desktop - much faster
          window.open(url, '_blank');
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to open customer portal");
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { source: 'dashboard-subscription' },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (error) throw error;
      const url = (data as any)?.url;
      
      if (url) {
        if (isMobile) {
          // Use placeholder window approach for mobile to avoid popup blockers
          const placeholder = window.open('', '_blank');
          if (placeholder && typeof placeholder.location !== 'undefined') {
            placeholder.location.href = url;
          } else {
            window.location.href = url;
          }
        } else {
          // Direct approach for desktop - much faster
          window.open(url, '_blank');
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to open billing portal");
    }
  };

  const proActive = useMemo(() => subInfo?.subscribed && subInfo.subscription_tier === "JumpinAI Pro", [subInfo]);

  if (loading) {
    return <div className="animate-fade-in">Loading...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header>
        <div className="rounded-2xl border border-border glass p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <CreditCard className="h-7 w-7 text-primary" />
                Subscription
              </h1>
              <p className="text-muted-foreground mt-2">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              {subInfo?.subscribed ? (
                <Badge className="bg-primary/10 text-primary">{subInfo.subscription_tier || 'Pro'} Active</Badge>
              ) : (
                <Badge variant="secondary">Free plan</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Current Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Current Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {subInfo?.subscribed
              ? `You're on ${subInfo.subscription_tier || 'JumpinAI Pro'}. Next renewal: ${subInfo.subscription_end ? new Date(subInfo.subscription_end).toLocaleString() : '—'}`
              : 'You are on the Free plan. Upgrade to JumpinAI Pro to unlock all blueprints and workflows.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          {!subInfo?.subscribed ? (
            <Button onClick={subscribe} className="hover-scale">
              <Crown className="mr-2 h-4 w-4" /> Get JumpinAI Pro
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={manage} className="hover-scale">
                <ExternalLink className="mr-2 h-4 w-4" /> Manage billing
              </Button>
              <Button variant="outline" onClick={handleRefreshSubscription} className="hover-scale">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh status
              </Button>
              <Button variant="destructive" onClick={cancelSubscription} className="hover-scale">
                <AlertTriangle className="mr-2 h-4 w-4" /> Cancel subscription
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card className="relative h-full border hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="text-center space-y-2">
              <CardTitle className="text-xl font-semibold">Free Plan</CardTitle>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 list-disc list-inside marker:text-foreground">
              {planFeatures.free.map((feature, index) => (
                <li key={index} className="text-sm text-foreground">
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <div className="w-full text-center">
              <div className="text-sm text-muted-foreground">Currently active</div>
            </div>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative h-full transition-all duration-200 ${subInfo?.subscribed ? 'ring-2 ring-primary/30 border-primary/50' : 'border-primary/30 hover:border-primary/50 hover:shadow-lg'}`}>
          {subInfo?.subscribed && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Your Plan</Badge>
            </div>
          )}
          {!subInfo?.subscribed && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
          )}
          <CardHeader>
            <div className="text-center space-y-2">
              <CardTitle className="text-xl font-semibold text-primary">JumpinAI Pro</CardTitle>
              <div className="text-2xl font-bold text-primary">$50</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 list-disc list-inside marker:text-primary">
              {planFeatures.pro.map((feature, index) => (
                <li key={index} className="text-sm text-foreground">
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto space-y-3">
            {!subInfo?.subscribed ? (
              <div className="w-full space-y-3 text-center">
                <Button 
                  onClick={subscribe} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Crown className="mr-2 h-4 w-4" /> 
                  Upgrade to Pro
                </Button>
                <div className="text-xs text-muted-foreground">
                  Cancel anytime
                </div>
              </div>
            ) : (
              <div className="space-y-2 w-full">
                <Button 
                  variant="secondary" 
                  onClick={manage} 
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> 
                  Manage Billing
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshSubscription} 
                    className="flex-1 text-xs"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> 
                    Refresh
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={cancelSubscription} 
                    className="flex-1 text-xs"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" /> 
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}