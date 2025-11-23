import React, { useState, useEffect } from 'react';
import { Sparkles, GitBranch, Wrench, ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LeadMagnet from "@/components/LeadMagnet";
import BookPromotion from "@/components/BookPromotion";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { GoogleSheetsTest } from "@/components/GoogleSheetsTest";
import { useAuth } from '@/hooks/useAuth';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { creditsService, type SubscriptionPlan } from '@/services/creditsService';
import { SubscriptionUpgradeModal } from '@/components/SubscriptionUpgradeModal';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const { user, isAuthenticated, subscription } = useAuth();
  const navigate = useNavigate();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState<Record<string, boolean>>({});
  const [planLoading, setPlanLoading] = useState<Record<string, boolean>>({});
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<SubscriptionPlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Scroll animations for different sections
  const { elementRef: tabsRef, scrollProgress: tabsProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: stepsRef, scrollProgress: stepsProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: clarificationRef, scrollProgress: clarificationProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: level0Ref, scrollProgress: level0Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: level1Ref, scrollProgress: level1Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: level2Ref, scrollProgress: level2Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: level3Ref, scrollProgress: level3Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: level4Ref, scrollProgress: level4Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: rerouteRef, scrollProgress: rerouteProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: equipRef, scrollProgress: equipProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: rerouteCardsRef, scrollProgress: rerouteCardsProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: equipCardsRef, scrollProgress: equipCardsProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: conceptCardsRef, scrollProgress: conceptCardsProgress } = useScrollAnimation({ threshold: 0.2 });

  // Show test component only in development or when URL contains 'test'
  const showTest = window.location.hostname === 'localhost' || 
                   window.location.search.includes('test=true') ||
                   window.location.pathname.includes('test');

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const plans = await creditsService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    }
  };

  const isCurrentPlan = (planName: string) => {
    if (!subscription) return false;
    if (!subscription.subscribed && planName.toLowerCase().includes('free')) return true;
    return subscription.subscription_tier === planName;
  };

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      window.location.href = '/auth';
      return;
    }

    setPlanLoading(prev => ({ ...prev, [planId]: true }));
    toast.info('Processing your request...');

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId }
      });

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecting to checkout...');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      toast.error('Failed to create subscription checkout');
    } finally {
      setPlanLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const getPlanTier = (planName: string): number => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return 0;
    if (name.includes('starter')) return 1;
    if (name.includes('pro')) return 2;
    if (name.includes('growth')) return 3;
    return 0;
  };

  const getButtonAction = (plan: SubscriptionPlan) => {
    const isCurrent = isCurrentPlan(plan.name);
    const isFree = plan.price_cents === 0;
    const currentTier = getPlanTier(subscription?.subscription_tier || 'Free Plan');
    const planTier = getPlanTier(plan.name);
    const hasSubscription = subscription?.subscribed;

    if (isCurrent) {
      return { type: 'current' as const, label: isFree ? 'Free Forever' : 'Current Plan' };
    }

    if (!hasSubscription && !isFree) {
      return { type: 'subscribe' as const, label: 'Get Started' };
    }

    if (isFree) {
      return { type: 'free' as const, label: 'Free Forever' };
    }

    if (planTier > currentTier) {
      return { type: 'upgrade' as const, label: 'Upgrade Now' };
    }

    if (planTier < currentTier) {
      return { type: 'downgrade' as const, label: 'Downgrade' };
    }

    return { type: 'current' as const, label: 'Current Plan' };
  };

  const getCurrentPlanData = (): SubscriptionPlan | null => {
    return subscriptionPlans.find(p => p.name === subscription?.subscription_tier) || null;
  };

  const calculateUpgradeDetails = (newPlan: SubscriptionPlan) => {
    const currentPlan = getCurrentPlanData();
    if (!currentPlan) return { priceDifference: newPlan.price_cents / 100, creditDifference: newPlan.credits_per_month };
    
    return {
      priceDifference: (newPlan.price_cents - currentPlan.price_cents) / 100,
      creditDifference: newPlan.credits_per_month - currentPlan.credits_per_month,
    };
  };

  const handleUpgradeClick = (plan: SubscriptionPlan) => {
    setSelectedUpgradePlan(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    if (!selectedUpgradePlan) return;
    
    setPlanLoading(prev => ({ ...prev, [selectedUpgradePlan.id]: true }));
    try {
      const upgradeDetails = calculateUpgradeDetails(selectedUpgradePlan);
      if (!upgradeDetails) {
        throw new Error('Failed to calculate upgrade details');
      }

      const { data, error } = await supabase.functions.invoke('create-upgrade-checkout', {
        body: {
          newPlanId: selectedUpgradePlan.id,
          priceDifference: upgradeDetails.priceDifference,
          creditDifference: upgradeDetails.creditDifference,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (e: any) {
      console.error('Upgrade error:', e);
      toast.error(e.message || "Failed to create upgrade checkout");
      setPlanLoading(prev => ({ ...prev, [selectedUpgradePlan.id]: false }));
    }
  };

  const handleDowngradeClick = async (planId: string, planName: string) => {
    setPlanLoading(prev => ({ ...prev, [planId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('schedule-downgrade', {
        body: { newPlanId: planId }
      });
      
      if (error) throw error;
      
      toast.success(`Downgrade to ${planName} scheduled!`, {
        description: `Your subscription will change to ${planName} on ${new Date(data.effectiveDate).toLocaleDateString()}.`,
        duration: 7000,
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to schedule downgrade");
    } finally {
      setPlanLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  return (
    <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
      {/* Enhanced floating background elements - positioned to not interfere with hero */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-100">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
      </div>
      <Navigation />
      <Hero />

      {/* What You Get: Complete Jump Structure */}
      <section className="py-12 sm:py-16 lg:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display px-4">
              Your Complete AI Jump in 3 Powerful Tabs
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              Every Jump you generate is a comprehensive AI transformation package—strategically designed across three interconnected sections to take you from confusion to clarity to action.
            </p>
          </div>

          <div ref={tabsRef} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Overview Tab */}
            <div 
              className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
              style={{
                opacity: Math.min(1, tabsProgress * 3),
                transform: `translateY(${(1 - Math.min(1, tabsProgress * 3)) * 40}px)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative glass p-6 rounded-lg h-full">
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-display">Overview</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed relative">
                Your strategic foundation—deep situational analysis that defines where you are and where you're going.
              </p>
              <div className="text-xs text-muted-foreground space-y-2 font-medium relative">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Executive Summary</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Situation Analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Key Challenges & Opportunities</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Strategic Vision & Roadmap</span>
                </div>
              </div>
            </div>
            </div>

            {/* Plan Tab */}
            <div 
              className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
              style={{
                opacity: Math.max(0, Math.min(1, (tabsProgress - 0.35) * 3)),
                transform: `translateY(${(1 - Math.max(0, Math.min(1, (tabsProgress - 0.35) * 3))) * 40}px)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative glass p-6 rounded-lg h-full">
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-display">Plan</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed relative">
                Your adaptive action roadmap—detailed steps that you can clarify 4 levels deep or reroute with 3 alternatives per step.
              </p>
              <div className="text-xs text-muted-foreground space-y-2 font-medium relative">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Phased Implementation Steps</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Multi-Level Clarification (4 levels)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Alternative Routes (3 per step)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Never feel stuck again</span>
                </div>
              </div>
            </div>
            </div>

            {/* Tools & Prompts Tab */}
            <div 
              className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
              style={{
                opacity: Math.max(0, Math.min(1, (tabsProgress - 0.7) * 3)),
                transform: `translateY(${(1 - Math.max(0, Math.min(1, (tabsProgress - 0.7) * 3))) * 40}px)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative glass p-6 rounded-lg h-full">
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-display">Tools & Prompts</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed relative">
                Your execution toolkit—9 curated tool-prompt combinations perfectly correlated to your plan steps.
              </p>
              <div className="text-xs text-muted-foreground space-y-2 font-medium relative">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>9 Tool-Prompt Combos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Main Tool + 2 Alternatives Each</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ready-to-Use Prompts</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Complete Implementation Guidance</span>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <span className="font-semibold text-foreground">All three tabs work together seamlessly</span>—from strategic understanding (Overview), to adaptive execution (Plan), to practical implementation (Tools & Prompts). Everything you need in one complete Jump.
            </p>
          </div>
        </div>
      </section>

      {/* Trust by Association Section */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
              Powered by leading AI
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-70 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <img src="/images/xai-logo-official.png" alt="xAI Logo" className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" />
              xAI
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <img src="/images/openai-logo.png" alt="OpenAI Logo" className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" />
              OpenAI
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <img src="/images/anthropic-logo.png" alt="Anthropic Logo" className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" />
              Anthropic
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <img src="/images/gemini-logo.png" alt="Google Gemini Logo" className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" />
              Google Gemini
            </div>
          </div>
        </div>
      </section>

      {/* How JumpinAI Studio Works */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-display">
              From Confusion to <span className="gradient-text-primary">Clarity in Minutes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Skip months of research. Get your complete 3-tab Jump—strategic overview, adaptive plan, and execution toolkit—delivered instantly.
            </p>
          </div>

          <div ref={stepsRef} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <div 
                className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: Math.min(1, stepsProgress * 3),
                  transform: `translateY(${(1 - Math.min(1, stepsProgress * 3)) * 40}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative glass p-6 rounded-lg h-full flex flex-col">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative text-center">
                    <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                      1
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display">Describe Your Goal</h3>
                    <p className="text-sm text-muted-foreground flex-1">Answer 2 focused questions: your objectives and the challenges you're facing. Our AI analyzes your input to create your personalized transformation plan.</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: Math.max(0, Math.min(1, (stepsProgress - 0.35) * 3)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, (stepsProgress - 0.35) * 3))) * 40}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative glass p-6 rounded-lg h-full flex flex-col">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative text-center">
                    <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                      2
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display">Receive Your Jump</h3>
                    <p className="text-sm text-muted-foreground flex-1">Get your complete 3-tab transformation package: Overview, Plan, and 9 Tools & Prompts combos—all personalized.</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: Math.max(0, Math.min(1, (stepsProgress - 0.7) * 3)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, (stepsProgress - 0.7) * 3))) * 40}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative glass p-6 rounded-lg h-full flex flex-col">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative text-center">
                    <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                      3
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display">Execute & Adapt</h3>
                    <p className="text-sm text-muted-foreground flex-1">Follow your roadmap, clarify steps as needed, explore alternative routes, and use ready prompts to implement immediately.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-primary/10 to-primary/10 rounded-3xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-semibold">Complete 3-tab Jump generated in 2 minutes</span>
                </div>
                <p className="text-xs text-muted-foreground">Strategic overview + adaptive plan + 9 tool-prompt combos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Core Features Section */}
      <section className="py-10 sm:py-12 lg:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display">
              Intelligent Features That Evolve With Your Progress
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              JumpinAI empowers you to refine every step with precision. Go deeper, pivot strategically, or arm yourself with the exact resources you need—all seamlessly integrated into your workflow.
            </p>
          </div>

          {/* Feature 1: CLARIFY - Multi-Level Breakdown */}
          <div ref={clarificationRef} className="max-w-5xl mx-auto mb-12">
            <div 
              className="glass rounded-2xl p-6 lg:p-8 border border-primary/20 shadow-lg backdrop-blur-xl transition-all duration-700 ease-out"
              style={{
                opacity: Math.min(1, clarificationProgress * 1.3),
                transform: `translateY(${(1 - Math.min(1, clarificationProgress * 1.3)) * 40}px)`
              }}
            >
              {/* Feature Header */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  <div className="relative group/clarify">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2.5rem] blur-md opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-primary/40 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                      <Sparkles className="relative w-6 h-6 text-primary" />
                      <span className="relative text-2xl font-bold text-foreground whitespace-nowrap">Clarify</span>
                    </div>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-2">
                  Break down any step into 5 detailed sub-steps. Go up to 4 levels deep—from broad strategy to crystal-clear, actionable instructions you can execute today.
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto">
                  Hover over any step at any level to access multi-layered clarification
                </p>
              </div>

              {/* Multi-Level Breakdown */}
              <div className="space-y-3 sm:space-y-4">
                {/* Level 0 */}
                <div 
                  ref={level0Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-primary/40 transition-all duration-700 ease-out"
                  style={{
                    opacity: level0Progress,
                    transform: `translateX(${(1 - level0Progress) * 80}px) scale(${0.9 + level0Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary ring-2 ring-primary/30 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    0
                  </div>
                  <div className="glass bg-muted/30 p-3 sm:p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 0: Original Generated Plan</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full backdrop-blur-xl bg-primary/20 border border-primary/30 text-primary font-semibold">Your Jump</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Initial steps from your generated Jump plan
                    </p>
                    <div className="p-2.5 rounded-lg glass bg-muted/30 border border-primary/20 backdrop-blur-sm">
                      <p className="text-xs sm:text-sm font-medium break-words">Step: "Launch digital marketing campaign"</p>
                    </div>
                  </div>
                </div>

                {/* Level 1 */}
                <div 
                  ref={level1Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-primary/30 ml-2 sm:ml-4 transition-all duration-700 ease-out"
                  style={{
                    opacity: level1Progress,
                    transform: `translateX(${(1 - level1Progress) * 80}px) scale(${0.9 + level1Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary ring-2 ring-primary/20 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    1
                  </div>
                  <div className="glass bg-muted/30 p-3 sm:p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 1: First Clarification</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/90 text-white font-semibold border border-green-700/50">5 sub-steps</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      After clicking "Clarify" on the original step
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded glass bg-muted/30 border border-primary/15 hover:border-primary/30 transition-colors backdrop-blur-sm">
                        <span className="text-muted-foreground break-words">→ Define target audience & budget</span>
                      </div>
                      <div className="p-2 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Select marketing channels
                      </div>
                      <div className="p-2 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Create campaign content
                      </div>
                      <div className="p-2 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Set up tracking & analytics
                      </div>
                      <div className="p-2 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Launch & monitor performance
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 2 */}
                <div 
                  ref={level2Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-primary/20 ml-4 sm:ml-8 transition-all duration-700 ease-out"
                  style={{
                    opacity: level2Progress,
                    transform: `translateX(${(1 - level2Progress) * 80}px) scale(${0.9 + level2Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary ring-2 ring-primary/15 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    2
                  </div>
                  <div className="glass bg-muted/30 p-3 sm:p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 2: Clarify the Sub-Step</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/90 text-white font-semibold border border-green-700/50">5 more</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Clicked "Clarify" on "Define target audience & budget"
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/15 hover:border-primary/30 transition-colors backdrop-blur-sm">
                        <span className="text-muted-foreground break-words">→ Analyze current customer data</span>
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Research competitor targeting
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Calculate available marketing budget
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Create audience personas
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Allocate budget across channels
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 3 */}
                <div 
                  ref={level3Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-primary/15 ml-6 sm:ml-12 transition-all duration-700 ease-out"
                  style={{
                    opacity: level3Progress,
                    transform: `translateX(${(1 - level3Progress) * 80}px) scale(${0.9 + level3Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary ring-2 ring-primary/10 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    3
                  </div>
                  <div className="glass bg-muted/30 p-3 sm:p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 3: Clarify the Level 2 Sub-Step</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/90 text-white font-semibold border border-green-700/50">5 more</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Clicked "Clarify" on "Analyze current customer data"
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/15 hover:border-primary/30 transition-colors backdrop-blur-sm">
                        <span className="text-muted-foreground break-words">→ Export customer purchase history from CRM</span>
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Identify top 20% of customers by revenue
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Extract demographic & behavioral patterns
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Document common characteristics in spreadsheet
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Share findings with marketing team
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 4 */}
                <div 
                  ref={level4Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-primary/10 ml-8 sm:ml-16 transition-all duration-700 ease-out"
                  style={{
                    opacity: level4Progress,
                    transform: `translateX(${(1 - level4Progress) * 80}px) scale(${0.9 + level4Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary ring-2 ring-primary/30 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    4
                  </div>
                  <div className="glass bg-muted/30 p-3 sm:p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 4: Maximum Detail</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/90 text-white font-semibold border border-green-700/50">Crystal clear</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Clicked "Clarify" on "Export customer purchase history from CRM"
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Log into your CRM system (Salesforce/HubSpot)
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Navigate to Reports → Customer Purchase History
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Set date range to last 12 months
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Export as CSV with customer ID, purchase date, amount
                      </div>
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Save file to shared marketing folder
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Now you have specific, actionable steps you can execute immediately!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Feature 2: REROUTE - Alternative Routes */}
          <div 
            ref={rerouteRef}
            className="max-w-5xl mx-auto mb-12 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, rerouteProgress * 1.3),
              transform: `translateY(${(1 - Math.min(1, rerouteProgress * 1.3)) * 50}px)`
            }}
          >
            <div className="glass rounded-2xl p-6 lg:p-8 border border-primary/20 shadow-lg backdrop-blur-xl">
              {/* Feature Header */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  <div className="relative group/reroute">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2.5rem] blur-md opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-primary/40 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                      <GitBranch className="relative w-6 h-6 text-primary" />
                      <span className="relative text-2xl font-bold text-foreground whitespace-nowrap">Reroute</span>
                    </div>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-2">
                  Discover 3 completely different paths to achieve the same goal—each with its own strategy, timeline, and resource requirements.
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto mb-12">
                  Choose the route that aligns perfectly with your priorities and constraints
                </p>
              </div>

              {/* Route Examples */}
              <div ref={rerouteCardsRef} className="grid sm:grid-cols-3 gap-4 mb-6">
                <div 
                  className="glass bg-muted/30 p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate"
                  style={{
                    opacity: Math.max(0, Math.min(1, rerouteCardsProgress * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, rerouteCardsProgress * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-primary mb-2">Route A: Premium</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• High-end tools</p>
                    <p>• Faster timeline</p>
                    <p>• Higher investment</p>
                  </div>
                </div>
                <div 
                  className="glass bg-muted/30 p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate"
                  style={{
                    opacity: Math.max(0, Math.min(1, (rerouteCardsProgress - 0.3) * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, (rerouteCardsProgress - 0.3) * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-primary mb-2">Route B: Budget-Friendly</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• Free/low-cost tools</p>
                    <p>• Gradual rollout</p>
                    <p>• Lower risk</p>
                  </div>
                </div>
                <div 
                  className="glass bg-muted/30 p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate"
                  style={{
                    opacity: Math.max(0, Math.min(1, (rerouteCardsProgress - 0.6) * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, (rerouteCardsProgress - 0.6) * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-primary mb-2">Route C: Hybrid</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• Mix of approaches</p>
                    <p>• Balanced timeline</p>
                    <p>• Medium investment</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/80 text-center">
                Each alternative route includes 3 detailed sub-steps tailored to that approach
              </p>

            </div>
          </div>

          {/* Feature 3: EQUIP - On-Demand Tools & Prompts */}
          <div 
            ref={equipRef}
            className="max-w-5xl mx-auto mb-8 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, equipProgress * 1.3),
              transform: `translateY(${(1 - Math.min(1, equipProgress * 1.3)) * 50}px)`
            }}
          >
            <div className="glass rounded-2xl p-6 lg:p-8 border border-primary/20 shadow-lg backdrop-blur-xl">
              {/* Feature Header */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  <div className="relative group/equip">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2.5rem] blur-md opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-primary/40 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                      <Wrench className="relative w-6 h-6 text-primary" />
                      <span className="relative text-2xl font-bold text-foreground whitespace-nowrap">Equip</span>
                    </div>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-2">
                  Generate a custom tool-prompt combination on-demand—perfectly aligned with your step's requirements, budget, and technical level.
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto mb-8">
                  Implementation resources delivered exactly when you need them
                </p>
              </div>

              {/* Feature Highlights */}
              <div ref={equipCardsRef} className="grid sm:grid-cols-2 gap-4 mb-6">
                <div 
                  className="glass bg-muted/30 p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate"
                  style={{
                    opacity: Math.max(0, Math.min(1, equipCardsProgress * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, equipCardsProgress * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-primary mb-2">Curated Tool Selection</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Get a main tool recommendation plus 2 alternatives perfectly aligned to your step's requirements, budget, and technical level.
                  </p>
                </div>
                <div 
                  className="glass bg-muted/30 p-4 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate"
                  style={{
                    opacity: Math.max(0, Math.min(1, (equipCardsProgress - 0.4) * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, (equipCardsProgress - 0.4) * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-primary mb-2">Ready-to-Use Prompts</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Receive expertly crafted prompts designed specifically for your step—copy, paste, and execute immediately with any AI tool.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/80 text-center">
                Each equipped combo is automatically saved in your Tools & Prompts tab and linked to its originating step
              </p>
            </div>
          </div>

          {/* Availability Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl glass border border-primary/20 backdrop-blur-xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs sm:text-sm font-semibold">Available on Pro & Growth Plans</span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">|</span>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Clarify, Reroute & Equip at any level</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Concept of a Jump Section */}
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display">
              The Concept of a Jump
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              A jump is <span className="gradient-text-primary font-bold">commitment in motion</span>
            </p>
          </div>

          {/* Three Content Cards */}
          <div className="max-w-6xl mx-auto">
            <div ref={conceptCardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-8">
              {/* Card 1 */}
              <div 
                className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: Math.min(1, conceptCardsProgress * 3),
                  transform: `translateY(${(1 - Math.min(1, conceptCardsProgress * 3)) * 40}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative glass p-6 rounded-lg h-full flex flex-col">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 rounded-lg flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      When you jump, you leave hesitation behind. You cross the threshold from thinking to doing, from planning to acting. There's no pause button mid-air—only the certainty that you <strong className="text-foreground">will land somewhere</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div 
                className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: Math.max(0, Math.min(1, (conceptCardsProgress - 0.35) * 3)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, (conceptCardsProgress - 0.35) * 3))) * 40}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative glass p-6 rounded-lg h-full flex flex-col">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      That's the energy we channel. <strong className="text-foreground">Jump into AI</strong> isn't about casual exploration—it's about decisive action with a clear landing point. Your personalized plan ensures you don't leap blindly. You jump with <strong className="text-foreground">direction, precision, and purpose</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div 
                className="group relative rounded-xl overflow-hidden border border-white/25 shadow-2xl bg-gradient-to-br from-white/[0.01] via-black/[0.4] to-white/[0.01] backdrop-blur-sm p-1 transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: Math.max(0, Math.min(1, (conceptCardsProgress - 0.7) * 3)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, (conceptCardsProgress - 0.7) * 3))) * 40}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/15 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative glass p-6 rounded-lg h-full flex flex-col">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      Every Jump you create is your commitment to transformation. You're not testing the waters—you're <strong className="text-foreground">diving in with a plan</strong>. And we make sure you land exactly where you intended.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Quote */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative p-8 sm:p-10 rounded-2xl glass border border-primary/10 shadow-lg">
                {/* Decorative Quote Mark */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <blockquote className="text-center">
                  <p className="text-lg sm:text-xl lg:text-2xl text-foreground font-display leading-relaxed italic font-medium">
                    The moment you jump, momentum takes over. Gravity pulls you forward. There's no going back—only the landing ahead.{' '}
                    <span className="gradient-text-primary font-bold not-italic">Make it count.</span>
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>





      <section className="py-10 sm:py-14 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-primary mb-4 font-display">
              Why JumpinAI? Why Now?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              The clarity you need in a world full of AI noise
            </p>
          </div>

          {/* Content Cards */}
          <div className="max-w-6xl mx-auto space-y-5">
            {/* The Missing Piece */}
            <div className="glass rounded-2xl p-5 sm:p-6 border border-primary/20 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 font-display">The Missing Piece</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    AI tools are everywhere. Tutorials are endless. But a clear path forward? That's rare. Everyone talks about what AI can do—but few show you how to actually use it for your specific goals.
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    We give you a complete, structured plan—not generic advice, but a real roadmap built around what you're trying to achieve.
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column: Why Now + What Makes Us Different */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Why This Moment */}
              <div className="glass rounded-2xl p-6 border border-primary/20 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold font-display">From Exploration to Implementation</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI is everywhere, but knowing how to use it strategically? That's the real advantage. Success isn't about having the most tools—it's about having clear direction and a solid plan. Right now, most people are still figuring things out. We help you move from exploring to actually implementing—with confidence.
                </p>
              </div>

              {/* What Makes Us Different */}
              <div className="glass rounded-2xl p-6 border border-primary/20 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold font-display">What Makes Us Different</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We're not just another AI tool. We're a complete system for turning AI potential into real, measurable progress. Every Jump gives you strategic insights, clear steps, and the right tools—all in one structured 3-tab plan that adapts as you grow.
                </p>
              </div>
            </div>

            {/* Three Key Points */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-primary/20 hover:border-primary/30 transition-all duration-300">
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Clear Structure</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">
                    No scattered tips. Every Jump is a fully structured plan with strategic insights, clear steps, and the right tools.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Adapts With You</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">
                    Your plan isn't fixed. Clarify deeper, reroute when needed, equip steps with new resources—it grows as you do.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Built for Action</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">
                    This isn't just ideas. It's actionable strategy designed to help you make real progress on your goals.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA Message */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                While others talk about what's possible, <span className="font-semibold text-foreground">we show you exactly how to get there.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Complete Clone from Pricing Page */}
      <section className="py-10 lg:py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display">
              Choose Your AI Transformation Plan
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Flexible plans designed to accelerate your business growth
            </p>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              <span className="font-semibold text-foreground">1 credit = 1 Jump generation</span> - each Jump delivers a comprehensive transformation plan including situation analysis, strategic vision with success metrics, detailed action plan with phases and milestones, plus 9 AI tool-prompt combinations to execute your strategy.
            </p>
          </div>

          {/* All Subscription Plans - Dynamic from Database */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 sm:gap-6 min-w-max px-2 sm:px-4 md:px-0 md:justify-center md:flex-wrap md:max-w-7xl md:mx-auto pt-4">
              {subscriptionPlans.map((plan) => {
                const action = getButtonAction(plan);
                const isLoading = planLoading[plan.id];
                const isFree = plan.price_cents === 0;
                const isMostPopular = plan.name.toLowerCase().includes('pro');
                const isBestValue = plan.name.toLowerCase().includes('growth');
                const isUsersPlan = isCurrentPlan(plan.name);
                
                return (
                  <div key={plan.id} className={`relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0 ${isMostPopular ? 'shadow-steel' : ''}`}>
                    {(isMostPopular || isBestValue) && !isUsersPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className={`${isBestValue ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-primary'} text-${isBestValue ? 'white' : 'primary-foreground'} shadow-modern rounded-full px-3 py-1 text-sm font-semibold`}>
                          {isBestValue ? 'Best Value' : 'Most Popular'}
                        </div>
                      </div>
                    )}
                    {isUsersPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-primary text-primary-foreground shadow-modern rounded-full px-3 py-1 text-sm font-semibold">
                          Current Plan
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center pb-6 p-6">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="mt-4">
                        <div className="text-3xl font-bold">
                          {isFree ? 'Free' : `$${(plan.price_cents / 100).toFixed(0)}`}
                          {!isFree && <span className="text-base font-normal text-muted-foreground">/month</span>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {plan.credits_per_month} credits {!isFree && 'monthly'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between p-6 pt-0">
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-auto">
                        <button 
                          onClick={() => {
                            if (action.type === 'subscribe') handleSubscribe(plan.id);
                            else if (action.type === 'upgrade') handleUpgradeClick(plan);
                            else if (action.type === 'downgrade') handleDowngradeClick(plan.id, plan.name);
                          }}
                          disabled={isLoading || action.type === 'current' || action.type === 'free'}
                          className="relative group w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {/* Liquid glass glow effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                          
                          {/* Button */}
                          <div className={`relative flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border transition-all duration-300 overflow-hidden ${(action.type === 'current' || action.type === 'free') ? 'border-border/30' : 'border-primary/30 group-hover:border-primary/50'}`}>
                            {/* Shimmer effect */}
                            {action.type !== 'current' && action.type !== 'free' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            )}
                            
                            {/* Content */}
                            <span className={`relative font-bold transition-colors duration-300 ${(action.type === 'current' || action.type === 'free') ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                              {isLoading ? 'Processing...' : action.label}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-8">
            <a href="/pricing" className="relative group inline-block">
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              {/* Button */}
              <div className="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Content */}
                <span className="relative text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  View All Plans & Pricing
                </span>
                
                {/* Arrow icon */}
                <div className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                  <svg className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-6 sm:py-7">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about transforming your business with JumpinAI Studio
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="rounded-2xl glass border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg overflow-hidden">
                  <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline group">
                    <h3 className="text-base font-bold font-display text-left group-hover:text-primary transition-colors">
                      What exactly is a "Jump" and what do I receive?
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A Jump is your complete AI transformation blueprint delivered in 3 comprehensive tabs: Overview (executive summary, situation analysis, strategic vision & roadmap), Plan (detailed action steps with multi-level clarification up to 4 levels deep and 3 alternative routes per step), and Tools & Prompts (9 tool-prompt combinations, each with a main tool plus 2 alternatives and ready-to-use prompts with guidance).
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="rounded-2xl glass border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg overflow-hidden">
                  <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline group">
                    <h3 className="text-base font-bold font-display text-left group-hover:text-primary transition-colors">
                      How does the multi-level clarification work in the Plan tab?
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Each step in your action plan can be clarified up to 4 levels deep, breaking down complex tasks into granular, actionable sub-steps. You simply click on any step to reveal deeper layers of detail, ensuring you understand exactly what to do at every stage.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="rounded-2xl glass border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg overflow-hidden">
                  <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline group">
                    <h3 className="text-base font-bold font-display text-left group-hover:text-primary transition-colors">
                      What are alternative routes and why do I need them?
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every step in your Plan offers 3 different implementation routes - giving you flexibility to choose the approach that best fits your resources, timeline, and constraints. If one path doesn't work, you have two more proven alternatives ready to go.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-4" className="rounded-2xl glass border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg overflow-hidden">
                  <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline group">
                    <h3 className="text-base font-bold font-display text-left group-hover:text-primary transition-colors">
                      How do the 9 tool-prompt combinations work?
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Each of the 9 combos in the Tools & Prompts tab is directly correlated to steps in your Plan. You get a main AI tool recommendation plus 2 alternatives, along with a ready-to-use, customized prompt with complete guidance on how to use it effectively for that specific step.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="rounded-2xl glass border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg overflow-hidden">
                  <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline group">
                    <h3 className="text-base font-bold font-display text-left group-hover:text-primary transition-colors">
                      Is my Jump personalized to my specific situation?
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Absolutely. Every Jump is fully customized based on your specific business context, industry, role, current AI experience level, resources, and goals. No generic templates - each Jump is uniquely crafted for your situation.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="rounded-2xl glass border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg overflow-hidden">
                  <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline group">
                    <h3 className="text-base font-bold font-display text-left group-hover:text-primary transition-colors">
                      Do I need technical expertise to implement my Jump?
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Not at all. Every component of your Jump - from the strategic roadmap to the tool-prompt combinations - is designed for business professionals without technical backgrounds. We provide clear, step-by-step guidance that anyone can follow.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Major Final CTA Section */}
      <section className="py-4 sm:py-5 lg:py-8 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 font-display gradient-text-primary">
              Ready to Jump into AI Success?
            </h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 text-muted-foreground">
              Your AI transformation starts with a single decisive step
            </p>
            <p className="text-sm sm:text-base mb-8 sm:mb-10 text-muted-foreground max-w-3xl mx-auto px-4">
              Stop second-guessing your AI strategy. Get a clear, actionable plan with tools, prompts, and adaptive intelligence to guide your transformation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10 px-4">
              <a href="/jumpinai-studio" className="relative group w-full sm:w-auto inline-block">
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    Start Your Jump Now - 3 Free Jumps
                  </span>
                  
                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
              </a>
              <a href="/pricing" className="relative group w-full sm:w-auto inline-block">
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    View Plans & Pricing
                  </span>
                  
                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary group-hover:translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </div>
                </div>
              </a>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                3 free Jumps to start
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Flexible plans
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Adaptive to your progress
              </div>
            </div>
          </div>
        </div>
      </section>

      {showTest && (
        <GoogleSheetsTest />
      )}
      <Newsletter />
      <Footer />

      {selectedUpgradePlan && (
        <SubscriptionUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedUpgradePlan(null);
          }}
          onConfirm={handleUpgradeConfirm}
          currentPlan={getCurrentPlanData()?.name || 'Free Plan'}
          newPlan={selectedUpgradePlan.name}
          priceDifference={calculateUpgradeDetails(selectedUpgradePlan).priceDifference}
          creditDifference={calculateUpgradeDetails(selectedUpgradePlan).creditDifference}
          newPlanFeatures={selectedUpgradePlan.features}
          isLoading={planLoading[selectedUpgradePlan.id]}
        />
      )}
    </div>
  );
};

export default Index;