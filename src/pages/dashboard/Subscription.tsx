import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, RefreshCw, CreditCard, Crown, Zap, Star, Rocket, AlertTriangle, ArrowRight, Sparkles, TrendingUp, TrendingDown, Gift, Calendar, Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCredits } from "@/hooks/useCredits";
import { creditsService, type CreditPackage, type SubscriptionPlan, type CreditTransaction } from "@/services/creditsService";
import { Separator } from "@/components/ui/separator";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export default function Subscription() {
  const { user, refreshSubscription, isAuthenticated, isLoading: authLoading, login, subscription } = useAuth();
  const isMobile = useIsMobile();
  const { credits, isLoading: creditsLoading, fetchCredits } = useCredits();
  const [email, setEmail] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [packageLoading, setPackageLoading] = useState<Record<string, boolean>>({});
  const [planLoading, setPlanLoading] = useState<Record<string, boolean>>({});
  const [jumpTitles, setJumpTitles] = useState<Record<string, string>>({});
  const [jumpNumbers, setJumpNumbers] = useState<Record<string, number>>({});
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        login('/dashboard/subscription');
      } else if (user) {
        setEmail(user.email || "");
        setSubInfo(subscription || { subscribed: false });
        setLoading(false);
        fetchCreditPackages();
        fetchSubscriptionPlans();
        fetchCreditTransactions();
        
        // Show success message if user just returned from payment
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
          toast.success("Payment successful! Your account has been updated.", {
            duration: 5000,
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [isAuthenticated, authLoading, user, subscription, login]);

  const fetchCreditPackages = async () => {
    try {
      const packages = await creditsService.getCreditPackages();
      setCreditPackages(packages);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const plans = await creditsService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchCreditTransactions = async () => {
    if (!user?.id) return;
    try {
      setLoadingTransactions(true);
      const transactions = await creditsService.getCreditTransactions(user.id);
      setCreditTransactions(transactions);
      
      // Fetch jump titles and numbers for usage transactions
      const usageTransactions = transactions.filter(t => t.transaction_type === 'usage' && t.reference_id);
      if (usageTransactions.length > 0) {
        const jumpIds = usageTransactions.map(t => t.reference_id).filter(Boolean) as string[];
        
        // Get all user jumps ordered by creation date to assign sequential numbers
        const { data: allJumps } = await supabase
          .from('user_jumps')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (allJumps) {
          const titles: Record<string, string> = {};
          const numbers: Record<string, number> = {};
          
          allJumps.forEach((jump, index) => {
            titles[jump.id] = jump.title;
            numbers[jump.id] = index + 1; // Sequential number starting from 1
          });
          
          setJumpTitles(titles);
          setJumpNumbers(numbers);
        }
      }
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRefreshSubscription = async () => {
    await refreshSubscription();
    await fetchCredits();
    await fetchCreditTransactions();
    setTimeout(() => {
      setSubInfo(subscription || { subscribed: false });
    }, 100);
  };

  const handleSubscribe = async (planId: string) => {
    setPlanLoading(prev => ({ ...prev, [planId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setPlanLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    setPackageLoading(prev => ({ ...prev, [packageId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { packageId }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setPackageLoading(prev => ({ ...prev, [packageId]: false }));
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
          const placeholder = window.open('', '_blank');
          if (placeholder && typeof placeholder.location !== 'undefined') {
            placeholder.location.href = url;
          } else {
            window.location.href = url;
          }
        } else {
          window.open(url, '_blank');
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to open customer portal");
    }
  };

  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const downloadReceipt = async (stripeSessionId: string) => {
    if (!stripeSessionId) {
      toast.error("No receipt available for this transaction");
      return;
    }

    const placeholder = window.open('', '_blank');
    setDownloadingReceipt(stripeSessionId);
    try {
      const { data, error } = await supabase.functions.invoke("download-receipt", {
        body: { sessionId: stripeSessionId }
      });

      if (error) throw error;

      if (data?.receiptUrl) {
        if (placeholder && typeof placeholder.location !== 'undefined') {
          placeholder.location.href = data.receiptUrl;
        } else {
          const win = window.open(data.receiptUrl, '_blank');
          if (!win) {
            window.location.href = data.receiptUrl;
          }
        }
      } else {
        toast.error("Receipt not available");
        try { placeholder?.close(); } catch {}
      }
    } catch (error: any) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
      try { placeholder?.close(); } catch {}
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return Zap;
    if (name.includes('starter')) return Star;
    if (name.includes('pro')) return Crown;
    if (name.includes('growth')) return Rocket;
    return Zap;
  };

  const getPlanBadge = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('pro')) return { text: "Most Popular", color: "bg-primary text-primary-foreground" };
    if (name.includes('growth')) return { text: "Best Value", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" };
    return null;
  };

  const isCurrentPlan = (planName: string) => {
    if (!subInfo) return false;
    if (!subInfo.subscribed && planName.toLowerCase().includes('free')) return true;
    return subInfo.subscription_tier === planName;
  };

  if (loading) {
    return <div className="animate-fade-in">Loading...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header>
        <div className="rounded-2xl border border-border glass p-6 md:p-8 shadow-modern">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 gradient-text-primary">
                <CreditCard className="h-7 w-7" />
                Subscription & Credits
              </h1>
              <p className="text-muted-foreground mt-2">{email}</p>
            </div>
            <div className="flex items-center gap-3">
              {subInfo?.subscribed ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                  {subInfo.subscription_tier || 'Pro Plan'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="border-muted text-sm px-3 py-1">
                  Free Plan
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Credits Balance Card */}
      <Card className="glass border-primary/20 shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Your Credits Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold gradient-text-primary">
                {creditsLoading ? "..." : credits?.credits_balance || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Available credits for generating Jumps
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchCredits} 
              size="sm"
              className="backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credits Use History and Log */}
      <Card className="glass border-border/40 shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <span className="text-foreground">
              Credits Use History & Log
            </span>
          </CardTitle>
          <CardDescription>
            Track all your credit transactions, purchases, and usage history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : creditTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No transaction history yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Your credit activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {creditTransactions.map((transaction) => {
                const isPositive = transaction.credits_amount > 0;
                const typeConfig = {
                  purchase: { icon: Sparkles, label: 'Credit Purchase', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
                  usage: { icon: Zap, label: 'Credit Used', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                  welcome_bonus: { icon: Gift, label: 'Welcome Bonus', color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
                  monthly_allocation: { icon: Calendar, label: 'Monthly Credits', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
                  drip_credit: { icon: TrendingUp, label: 'Drip Credit', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
                };
                const config = typeConfig[transaction.transaction_type as keyof typeof typeConfig] || { 
                  icon: Coins, 
                  label: transaction.transaction_type, 
                  color: 'text-muted-foreground',
                  bgColor: 'bg-muted/10'
                };
                const Icon = config.icon;

                return (
                  <div
                    key={transaction.id}
                    className="group flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/5 transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-lg ${config.bgColor} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-foreground">{config.label}</p>
                        </div>
                        {transaction.transaction_type === 'usage' && transaction.reference_id && jumpTitles[transaction.reference_id] ? (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            Generated Jump #{jumpNumbers[transaction.reference_id] || '?'}: {jumpTitles[transaction.reference_id]}
                          </p>
                        ) : transaction.description && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(transaction.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPositive ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-sm text-emerald-500">
                            +{transaction.credits_amount}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                          <span className="font-bold text-sm text-rose-500">
                            {transaction.credits_amount}
                          </span>
                        </div>
                      )}
                      {transaction.transaction_type === 'purchase' && transaction.reference_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReceipt(transaction.reference_id!)}
                          disabled={downloadingReceipt === transaction.reference_id}
                          className="h-8 px-3 text-xs backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl transition-all duration-300"
                        >
                          {downloadingReceipt === transaction.reference_id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Receipt
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Subscription Overview */}
      <Card className="glass shadow-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Current Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {subInfo?.subscribed
              ? `You're currently on ${subInfo.subscription_tier || 'Pro Plan'}. Your subscription ${subInfo.subscription_end ? `renews on ${new Date(subInfo.subscription_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'is active'}.`
              : 'You are on the Free Plan. Upgrade to a paid plan to receive monthly credits and access advanced features.'}
          </p>
          {subInfo?.subscribed && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm text-foreground">
                Monthly credits automatically renew with your subscription
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3">
          {subInfo?.subscribed ? (
            <>
              <Button 
                onClick={manage}
                size="lg"
                className="w-full max-w-md text-lg py-6 backdrop-blur-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/40 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl font-semibold"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Manage Billing
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefreshSubscription}
                className="backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 shadow-lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a subscription plan below to get started with monthly credits.
            </p>
          )}
        </CardFooter>
      </Card>

      <Separator className="my-8" />

      {/* Subscription Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text-primary mb-3">
            Subscription Plans
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Get monthly credits that roll over, plus access to all our resources and tools. 
            <br />
            <span className="font-semibold text-foreground">1 credit = 1 comprehensive Jump generation</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {subscriptionPlans.map((plan) => {
            const PlanIcon = getPlanIcon(plan.name);
            const badge = getPlanBadge(plan.name);
            const isCurrent = isCurrentPlan(plan.name);
            const isFree = plan.price_cents === 0;
            const isLoading = planLoading[plan.id];

            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col glass transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl ${
                  isCurrent ? 'ring-2 ring-primary/40 border-primary/60' : 'border-border/40'
                }`}
              >
                {badge && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${badge.color} shadow-modern rounded-full px-3 py-1 text-xs`}>
                      {badge.text}
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground shadow-modern rounded-full px-3 py-1 text-xs">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 text-primary w-fit">
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs min-h-[40px]">{plan.description}</CardDescription>
                  <div className="mt-3">
                    <div className="text-3xl font-bold gradient-text-primary">
                      {isFree ? 'Free' : formatPrice(plan.price_cents)}
                      {!isFree && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {plan.credits_per_month} credits {!isFree && 'monthly'}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="mt-auto pt-4">
                  {isCurrent ? (
                    <Button 
                      className="w-full backdrop-blur-xl bg-primary/15 border-2 border-primary/40 text-primary rounded-2xl font-semibold shadow-md hover:bg-primary/15"
                      disabled
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : isFree ? (
                    <Button 
                      variant="outline" 
                      className="w-full backdrop-blur-xl bg-white/5 border border-muted/30 text-muted-foreground rounded-2xl font-medium hover:bg-white/5"
                      disabled
                    >
                      Free Forever
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading}
                      className="w-full backdrop-blur-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/40 text-primary-foreground font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upgrade Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Credit Packages */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text-primary mb-3">
            Need More Credits?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Purchase additional credits anytime to supplement your subscription or as a one-time boost.
          </p>
        </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {creditPackages.map((pkg) => {
            const isLoading = packageLoading[pkg.id];
            const isPopular = pkg.credits === 100;
            const isBestValue = pkg.credits === 250;

            return (
              <Card 
                key={pkg.id} 
                className="relative flex flex-col glass transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-border/40"
              >
                {(isPopular || isBestValue) && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge variant="secondary" className="text-xs shadow-modern rounded-full px-2 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isBestValue ? 'Best Value' : 'Popular'}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-base font-semibold">{pkg.name}</CardTitle>
                  <div className="mt-3">
                    <div className="text-3xl font-bold gradient-text-primary">
                      {pkg.credits} credits
                    </div>
                    <div className="text-base font-medium text-muted-foreground mt-1">
                      {formatPrice(pkg.price_cents)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-end">
                  <Button 
                    onClick={() => handleBuyCredits(pkg.id)}
                    disabled={isLoading}
                    className="w-full backdrop-blur-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/40 text-primary-foreground font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <Card className="glass border-border/40 shadow-modern">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">How Credits Work</h3>
                <p className="text-sm text-muted-foreground">
                  Each credit allows you to generate one comprehensive Jump in our AI Studio. 
                  Subscription credits roll over monthly, and purchased credits never expire.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Subscription Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribers get monthly credits that roll over, access to premium resources, 
                  priority support, and early access to new features. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
