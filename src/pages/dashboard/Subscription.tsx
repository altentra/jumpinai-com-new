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
    "Access to public resources",
    "Weekly newsletter",
    "Community support",
  ],
  pro: [
    "Everything in Free",
    "Full Blueprints library",
    "Advanced Workflows & Prompts",
    "Early access to new tools",
    "Priority support",
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <p className="text-muted-foreground">$0 / month</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              {planFeatures.free.map((f) => (<li key={f}>{f}</li>))}
            </ul>
          </CardContent>
        </Card>

        <Card className={`h-full ${subInfo?.subscribed ? 'ring-1 ring-primary/30' : ''}`}>
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>JumpinAI Pro</CardTitle>
              <p className="text-muted-foreground">$10 / month</p>
            </div>
            {subInfo?.subscribed && (
              <Badge className="bg-primary/10 text-primary">Your plan</Badge>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              {planFeatures.pro.map((f) => (<li key={f}>{f}</li>))}
            </ul>
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
      </div>
    </div>
  );
}