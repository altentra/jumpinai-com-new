import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star, Crown, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { creditsService, type CreditPackage, type SubscriptionPlan } from '@/services/creditsService';

const PricingNew = () => {
  const { user, isAuthenticated } = useAuth();
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState<Record<string, boolean>>({});
  const [packageLoading, setPackageLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCreditPackages();
    fetchSubscriptionPlans();
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

  const fetchSubscriptionPlans = async () => {
    try {
      const plans = await creditsService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase credits');
      return;
    }

    setPackageLoading(prev => ({ ...prev, [packageId]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { packageId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setPackageLoading(prev => ({ ...prev, [packageId]: false }));
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoadingSubscription(prev => ({ ...prev, [planId]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      toast.error('Failed to create subscription checkout');
    } finally {
      setLoadingSubscription(prev => ({ ...prev, [planId]: false }));
    }
  };

  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getValueBadge = (credits: number, price_cents: number) => {
    const pricePerCredit = price_cents / credits;
    if (pricePerCredit <= 30) return "Best Value";
    if (pricePerCredit <= 40) return "Popular";
    return null;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free plan': return <Zap className="w-6 h-6" />;
      case 'starter plan': return <Star className="w-6 h-6" />;
      case 'pro plan': return <Crown className="w-6 h-6" />;
      case 'growth plan': return <Rocket className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanBadge = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro plan': return { text: "Most Popular", color: "bg-primary text-primary-foreground" };
      case 'growth plan': return { text: "Best Value", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" };
      default: return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Pricing - JumpinAI | AI Transformation Plans & Credits</title>
        <meta 
          name="description" 
          content="Choose the perfect plan for your AI transformation journey. Flexible subscription plans and credit packages to power your business growth with AI." 
        />
        <meta name="keywords" content="AI pricing, subscription plans, credits, transformation, business AI" />
        <link rel="canonical" href="https://jumpinai.com/pricing" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        <Navigation />
        
        <main className="pt-20 pb-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Transform Your Business with AI
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Choose the perfect plan for your AI transformation journey. Get access to powerful AI tools, expert guidance, and comprehensive resources.
              </p>
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get monthly credits that roll over, plus access to all our resources and tools
              </p>
            </div>

            <div className="w-full overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max px-4 md:px-0 md:justify-center md:flex-wrap md:max-w-7xl md:mx-auto">
                {subscriptionPlans.map((plan) => {
                const badge = getPlanBadge(plan.name);
                const isLoading = loadingSubscription[plan.id];
                const isFree = plan.price_cents === 0;
                
                return (
                  <Card key={plan.id} className={`relative h-full flex flex-col w-72 md:w-auto flex-shrink-0 ${plan.name.toLowerCase().includes('pro') ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
                    {badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className={badge.color}>
                          {badge.text}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-6">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary">
                        {getPlanIcon(plan.name)}
                      </div>
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                      <div className="mt-4">
                        <div className="text-3xl font-bold">
                          {isFree ? 'Free' : formatPrice(plan.price_cents)}
                          {!isFree && <span className="text-base font-normal text-muted-foreground">/month</span>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {plan.credits_per_month} credits {!isFree && 'monthly'}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        onClick={() => isFree ? null : handleSubscribe(plan.id)}
                        disabled={isLoading || isFree}
                        className="w-full"
                        variant={isFree ? "outline" : "default"}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : isFree ? (
                          'Current Plan'
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </div>
          </section>

          {/* Credit Packages */}
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Need More Credits?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Top up your account with additional credits anytime. Perfect for busy periods or special projects.
              </p>
            </div>

            <div className="w-full overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max px-4 md:px-0 md:justify-center md:flex-wrap md:max-w-6xl md:mx-auto">
                {creditPackages.map((pkg) => {
                const isLoading = packageLoading[pkg.id];
                const valueBadge = getValueBadge(pkg.credits, pkg.price_cents);
                
                return (
                  <Card key={pkg.id} className="relative h-full flex flex-col hover:shadow-lg transition-shadow w-56 md:w-auto flex-shrink-0">
                    {valueBadge && (
                      <div className="absolute -top-2 -right-2">
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {valueBadge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg font-semibold">{pkg.name}</CardTitle>
                      <div className="mt-2">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(pkg.price_cents)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pkg.credits} credits
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ${(pkg.price_cents / pkg.credits / 100).toFixed(2)} per credit
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <Button 
                        onClick={() => handleBuyCredits(pkg.id)}
                        disabled={isLoading}
                        className="w-full"
                        size="sm"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Buy Credits
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </div>
          </section>

          {/* How Credits Work */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">How Credits Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">One Credit Per Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Each AI transformation plan, strategy, or workflow costs 1 credit to generate
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Credits Roll Over</h3>
                  <p className="text-sm text-muted-foreground">
                    Unused monthly credits carry forward to the next month. No credits go to waste
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Access Everything</h3>
                  <p className="text-sm text-muted-foreground">
                    All plans include access to our complete library of guides, resources, and tools
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-2">What can I do with credits?</h3>
                  <p className="text-muted-foreground">
                    Credits are used to generate AI transformation plans, strategies, workflows, and other AI-powered content through our JumpinAI Studio.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Do credits expire?</h3>
                  <p className="text-muted-foreground">
                    Monthly subscription credits roll over to the next month, so you never lose them. Purchased credit packages also never expire.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What's included with all plans?</h3>
                  <p className="text-muted-foreground">
                    All paid plans include access to our complete resource library, guides, templates, and priority support. Higher tier plans include additional features like phone support and custom workflows.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PricingNew;