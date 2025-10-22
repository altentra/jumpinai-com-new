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

  const getValueBadge = (credits: number) => {
    if (credits === 250) return "Best Value";
    if (credits === 100) return "Popular";
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
        
        <Navigation />
        
        <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-12 text-center">
            <div className="max-w-4xl mx-auto">
                {/* Premium Hero Section with enhanced gradients */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-20 animate-fade-in-up">
                  {/* Liquid glass backdrop for title */}
                  <div className="relative mb-4 sm:mb-6 lg:mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/8 blur-3xl transform -translate-y-4"></div>
                    <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-4 sm:px-0">
                      JumpinAI Pricing
                    </h1>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
                  </div>
                  
                  <div className="relative px-4 sm:px-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-2xl"></div>
                    <p className="relative text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground/90 mb-2 sm:mb-3 max-w-4xl mx-auto leading-relaxed font-light">
                      Choose the perfect plan for your needs.
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground/90 max-w-3xl mx-auto mb-4 leading-relaxed px-4">
                  <span className="font-semibold text-foreground">1 credit = 1 jump generation</span> - each jump includes a comprehensive AI transformation plan with strategies, tools, workflows, and actionable blueprints tailored to your business.
                </p>
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="container mx-auto px-4 py-2">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Get monthly credits that roll over, plus access to all our resources and tools
              </p>
            </div>

            <div className="w-full overflow-x-auto pb-4">
              <div className="flex gap-4 sm:gap-6 min-w-max px-2 sm:px-4 md:px-0 md:justify-center md:flex-wrap md:max-w-7xl md:mx-auto pt-4">
                {subscriptionPlans.map((plan) => {
                const badge = getPlanBadge(plan.name);
                const isLoading = loadingSubscription[plan.id];
                const isFree = plan.price_cents === 0;
                
                return (
                  <Card key={plan.id} className={`relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0 ${plan.name.toLowerCase().includes('pro') ? 'shadow-steel' : ''}`}>
                    {badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className={`${badge.color} shadow-modern rounded-full px-3 py-1`}>
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
                    
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-auto">
                        <Button
                         onClick={() => isFree ? null : handleSubscribe(plan.id)}
                         disabled={isLoading || isFree}
                         className={`w-full modern-button shadow-modern ${isFree ? '' : 'bg-foreground hover:bg-foreground/90'}`}
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
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </div>
          </section>

          {/* Credit Packages */}
          <section className="container mx-auto px-4 py-8 sm:py-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Need More Credits?</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Top up your account with additional credits anytime. Perfect for busy periods or special projects.
              </p>
            </div>

            {/* First row - 2 packages */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto mb-4">
            {creditPackages.slice(0, 2).map((pkg) => {
                const isLoading = packageLoading[pkg.id];
                const valueBadge = getValueBadge(pkg.credits);
                
                return (
                  <Card key={pkg.id} className="relative h-full flex flex-col glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                    {valueBadge && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge variant="secondary" className="text-xs shadow-modern rounded-full px-2 py-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {valueBadge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg font-semibold min-h-[3rem] flex items-center justify-center">{pkg.name}</CardTitle>
                      <div className="mt-3">
                        <div className="text-lg sm:text-xl font-bold gradient-text-primary mb-1">
                          {pkg.credits} credits
                        </div>
                        <div className="text-base font-medium text-muted-foreground">
                          {formatPrice(pkg.price_cents)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <Button 
                        onClick={() => handleBuyCredits(pkg.id)}
                        disabled={isLoading}
                        className="w-full modern-button shadow-modern bg-foreground hover:bg-foreground/90"
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
            
            {/* Second row - 2 packages */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto mb-4">
            {creditPackages.slice(2, 4).map((pkg) => {
                const isLoading = packageLoading[pkg.id];
                const valueBadge = getValueBadge(pkg.credits);
                
                return (
                  <Card key={pkg.id} className="relative h-full flex flex-col glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                    {valueBadge && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge variant="secondary" className="text-xs shadow-modern rounded-full px-2 py-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {valueBadge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg font-semibold min-h-[3rem] flex items-center justify-center">{pkg.name}</CardTitle>
                      <div className="mt-3">
                        <div className="text-lg sm:text-xl font-bold gradient-text-primary mb-1">
                          {pkg.credits} credits
                        </div>
                        <div className="text-base font-medium text-muted-foreground">
                          {formatPrice(pkg.price_cents)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-end">
                      <Button 
                        onClick={() => handleBuyCredits(pkg.id)}
                        disabled={isLoading}
                        className="w-full modern-button shadow-modern bg-foreground hover:bg-foreground/90"
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

            {/* Third row - 1 package centered */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                {creditPackages.slice(4, 5).map((pkg) => {
                  const isLoading = packageLoading[pkg.id];
                  const valueBadge = getValueBadge(pkg.credits);
                  
                  return (
                    <Card key={pkg.id} className="relative h-full flex flex-col glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                      {valueBadge && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge variant="secondary" className="text-xs shadow-modern rounded-full px-2 py-1">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {valueBadge}
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-lg font-semibold min-h-[3rem] flex items-center justify-center">{pkg.name}</CardTitle>
                        <div className="mt-3">
                          <div className="text-lg sm:text-xl font-bold gradient-text-primary mb-1">
                            {pkg.credits} credits
                          </div>
                          <div className="text-base font-medium text-muted-foreground">
                            {formatPrice(pkg.price_cents)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <Button 
                          onClick={() => handleBuyCredits(pkg.id)}
                          disabled={isLoading}
                          className="w-full modern-button shadow-modern bg-foreground hover:bg-foreground/90"
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
          <section className="container mx-auto px-4 py-8 sm:py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">How Credits Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
          <section className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Frequently Asked Questions</h2>
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