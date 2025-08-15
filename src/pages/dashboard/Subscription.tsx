import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, RefreshCcw, ExternalLink, AlertTriangle } from "lucide-react";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

const planFeatures = {
  free: [
    "📚 Access to 5 basic AI prompts",
    "📧 Weekly newsletter with AI insights", 
    "💬 Community support forum",
    "📖 Basic AI education resources",
    "🎯 3 simple workflow templates",
    "📝 Limited prompt library access"
  ],
  pro: [
    "🚀 Everything in Free plan",
    "📚 Access to 500+ premium AI prompts",
    "🔄 50+ advanced workflow templates", 
    "📋 Complete blueprints library (100+ blueprints)",
    "🎯 Custom strategy builder tool",
    "⚡ Early access to new AI tools & features",
    "📞 Priority email & chat support",
    "📊 Advanced analytics & insights",
    "🔗 API integrations & automations",
    "🎨 Custom prompt generator",
    "📱 Mobile app access",
    "🏆 Exclusive monthly AI masterclasses"
  ],
};

export default function Subscription() {
  const [email, setEmail] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setEmail(user.email || "");
      await refreshSubscription();
      setLoading(false);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubInfo(data as SubscriberInfo);
    } catch (e: any) {
      console.error(e);
      toast.error("Could not refresh subscription status");
    }
  };

  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  const manage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to open customer portal");
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, '_blank');
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
              <Button variant="outline" onClick={refreshSubscription} className="hover-scale">
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh status
              </Button>
              <Button variant="destructive" onClick={cancelSubscription} className="hover-scale">
                <AlertTriangle className="mr-2 h-4 w-4" /> Cancel subscription
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted to-muted-foreground/20"></div>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">Free Plan</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Perfect for getting started</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {planFeatures.free.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <div className="w-full text-center">
              <div className="text-sm text-muted-foreground mb-3">Currently active</div>
              <div className="text-xs text-muted-foreground">No commitment • Cancel anytime</div>
            </div>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 ${subInfo?.subscribed ? 'ring-2 ring-primary/30 border-primary/20' : 'border-primary/30 hover:border-primary/50'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary"></div>
          {subInfo?.subscribed && (
            <div className="absolute -top-3 -right-3">
              <Badge className="bg-primary text-primary-foreground shadow-lg px-3 py-1">Your Plan</Badge>
            </div>
          )}
          {!subInfo?.subscribed && (
            <div className="absolute -top-3 -right-3">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg px-3 py-1">Most Popular</Badge>
            </div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  JumpinAI Pro
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Unlock the full potential of AI</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">$10</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {planFeatures.pro.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <div className="text-sm font-medium text-primary mb-1">🎁 Limited Time Bonus</div>
              <div className="text-xs text-muted-foreground">First month includes personal AI strategy consultation ($200 value)</div>
            </div>
          </CardContent>
          <CardFooter className="pt-6 space-y-4">
            <div className="w-full space-y-3">
              {!subInfo?.subscribed ? (
                <>
                  <Button 
                    onClick={subscribe} 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
                  >
                    <Crown className="mr-2 h-5 w-5" /> 
                    Upgrade to Pro
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">
                    30-day money-back guarantee • Cancel anytime
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    onClick={manage} 
                    className="w-full hover-scale border-primary/20 hover:border-primary/40"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> 
                    Manage Billing
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={refreshSubscription} 
                      className="flex-1 hover-scale text-xs"
                    >
                      <RefreshCcw className="mr-1 h-3 w-3" /> 
                      Refresh
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={cancelSubscription} 
                      className="flex-1 hover-scale text-xs"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" /> 
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}