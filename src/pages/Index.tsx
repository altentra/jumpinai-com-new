import React, { useState, useEffect } from 'react';
import { Sparkles, GitBranch, Wrench, ArrowRight, ChevronDown, Route, Compass, Bot, Workflow, Zap, Target, Cog, Play, Brain, Settings, CheckCircle2, Clock, Shield, Download } from 'lucide-react';
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
  const { elementRef: quoteCardRef, scrollProgress: quoteCardProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: clarityMiniFrameRef, scrollProgress: clarityMiniFrameProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: whyMissingRef, scrollProgress: whyMissingProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: whyCriticalRef, scrollProgress: whyCriticalProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: whyDifferentRef, scrollProgress: whyDifferentProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: whyKeyPointsRef, scrollProgress: whyKeyPointsProgress } = useScrollAnimation({ threshold: 0.2 });
  
  // Explore Alternative Routes section refs - sequential cascade animation
  const { elementRef: exploreHeaderRef, scrollProgress: exploreHeaderProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: exploreCardRef, scrollProgress: exploreCardProgress } = useScrollAnimation({ threshold: 0.1 });
  const { elementRef: exploreButtonRef, scrollProgress: exploreButtonProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: exploreDescRef, scrollProgress: exploreDescProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: exploreFlow1Ref, scrollProgress: exploreFlow1Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: exploreFlow2Ref, scrollProgress: exploreFlow2Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: exploreFlow3Ref, scrollProgress: exploreFlow3Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: exploreBenefitRef, scrollProgress: exploreBenefitProgress } = useScrollAnimation({ threshold: 0.15 });
  
  // Implementation section refs
  const { elementRef: implementRef, scrollProgress: implementProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: implementCard1Ref, scrollProgress: implementCard1Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: implementCard2Ref, scrollProgress: implementCard2Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: implementCard3Ref, scrollProgress: implementCard3Progress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: implementSummaryRef, scrollProgress: implementSummaryProgress } = useScrollAnimation({ threshold: 0.15 });
  const { elementRef: implementClosingRef, scrollProgress: implementClosingProgress } = useScrollAnimation({ threshold: 0.15 });
  
  
  // Individual refs for mobile animations
  const { elementRef: tab1Ref, scrollProgress: tab1Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: tab2Ref, scrollProgress: tab2Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: tab3Ref, scrollProgress: tab3Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: step1Ref, scrollProgress: step1Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: step2Ref, scrollProgress: step2Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: step3Ref, scrollProgress: step3Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: concept1Ref, scrollProgress: concept1Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: concept2Ref, scrollProgress: concept2Progress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: concept3Ref, scrollProgress: concept3Progress } = useScrollAnimation({ threshold: 0.2 });

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
    <div className="min-h-screen scroll-snap-container overflow-x-hidden bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
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
              ref={tab1Ref}
              className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
              style={{
                opacity: window.innerWidth < 768 ? Math.min(1, tab1Progress * 1.5) : Math.min(1, tabsProgress * 3),
                transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, tab1Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, tab1Progress * 1.5)) * 40) : (Math.min(1, tabsProgress * 3) >= 0.99 ? 0 : (1 - Math.min(1, tabsProgress * 3)) * 40))}px)`
              }}
            >
              {/* Liquid glass border wrapper */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                <div className="absolute inset-0 rounded-3xl bg-card"></div>
              </div>
              
              <div className="relative bg-card rounded-3xl p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-display">Overview</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed relative">
                Your strategic launchpad—a focused 4-frame system that captures the essence of your AI transformation in moments.
              </p>
              <div className="text-xs text-muted-foreground space-y-2 font-medium relative">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>The Jump Forward</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Strategic Edge</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Flight Path</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>New Baseline</span>
                  </div>
                </div>
              </div>
              </div>
              
              {/* Subtle white back shadow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
            </div>

            {/* Plan Tab */}
            <div 
              ref={tab2Ref}
              className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
              style={{
                opacity: window.innerWidth < 768 ? Math.min(1, tab2Progress * 1.5) : Math.max(0, Math.min(1, (tabsProgress - 0.25) * 3)),
                transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, tab2Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, tab2Progress * 1.5)) * 40) : (Math.max(0, Math.min(1, (tabsProgress - 0.25) * 3)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (tabsProgress - 0.25) * 3))) * 40))}px)`
              }}
            >
              {/* Liquid glass border wrapper */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                <div className="absolute inset-0 rounded-3xl bg-card"></div>
              </div>
              
              <div className="relative bg-card rounded-3xl p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
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
              
              {/* Subtle white back shadow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
            </div>

            {/* Tools & Prompts Tab */}
            <div 
              ref={tab3Ref}
              className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
              style={{
                opacity: window.innerWidth < 768 ? Math.min(1, tab3Progress * 1.5) : Math.max(0, Math.min(1, (tabsProgress - 0.5) * 3)),
                transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, tab3Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, tab3Progress * 1.5)) * 40) : (Math.max(0, Math.min(1, (tabsProgress - 0.5) * 3)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (tabsProgress - 0.5) * 3))) * 40))}px)`
              }}
            >
              {/* Liquid glass border wrapper */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                <div className="absolute inset-0 rounded-3xl bg-card"></div>
              </div>
              
              <div className="relative bg-card rounded-3xl p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-display">Tools & Prompts</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed relative">
                Your execution toolkit—tool-prompt combinations aligned to your plan, expandable with custom combos for any step.
              </p>
              <div className="text-xs text-muted-foreground space-y-2 font-medium relative">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>9 Initial Combos + Generate More</span>
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
                  <span>Implementation Guidance</span>
                  </div>
                </div>
              </div>
              </div>
              
              {/* Subtle white back shadow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
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
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground select-none pointer-events-none">
              <img 
                src="/images/xai-logo-official.png" 
                alt="" 
                className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" 
                data-nosnippet
                loading="lazy"
                draggable="false"
              />
              xAI
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground select-none pointer-events-none">
              <img 
                src="/images/openai-logo.png" 
                alt="" 
                className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" 
                data-nosnippet
                loading="lazy"
                draggable="false"
              />
              OpenAI
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground select-none pointer-events-none">
              <img 
                src="/images/anthropic-logo.png" 
                alt="" 
                className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" 
                data-nosnippet
                loading="lazy"
                draggable="false"
              />
              Anthropic
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground select-none pointer-events-none">
              <img 
                src="/images/gemini-logo.png" 
                alt="" 
                className="w-6 h-6 lg:w-8 lg:h-8 object-contain filter dark:invert" 
                data-nosnippet
                loading="lazy"
                draggable="false"
              />
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
                ref={step1Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: window.innerWidth < 768 ? Math.min(1, step1Progress * 1.5) : Math.min(1, stepsProgress * 3),
                  transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, step1Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, step1Progress * 1.5)) * 40) : (Math.min(1, stepsProgress * 3) >= 0.99 ? 0 : (1 - Math.min(1, stepsProgress * 3)) * 40))}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                      1
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display">Describe Your Goal</h3>
                    <p className="text-sm text-muted-foreground flex-1">Answer 2 focused questions: your objectives and the challenges you're facing. Our AI analyzes your input to create your personalized transformation plan.</p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>
              
              <div 
                ref={step2Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: window.innerWidth < 768 ? Math.min(1, step2Progress * 1.5) : Math.max(0, Math.min(1, (stepsProgress - 0.25) * 3)),
                  transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, step2Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, step2Progress * 1.5)) * 40) : (Math.max(0, Math.min(1, (stepsProgress - 0.25) * 3)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (stepsProgress - 0.25) * 3))) * 40))}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                      2
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display">Receive Your Jump</h3>
                    <p className="text-sm text-muted-foreground flex-1">Get your complete 3-tab transformation package: Overview, Plan, and 9 Tools & Prompts combos—all personalized.</p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>
              
              <div 
                ref={step3Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: window.innerWidth < 768 ? Math.min(1, step3Progress * 1.5) : Math.max(0, Math.min(1, (stepsProgress - 0.5) * 3)),
                  transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, step3Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, step3Progress * 1.5)) * 40) : (Math.max(0, Math.min(1, (stepsProgress - 0.5) * 3)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (stepsProgress - 0.5) * 3))) * 40))}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                      3
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display">Execute & Adapt</h3>
                    <p className="text-sm text-muted-foreground flex-1">Follow your roadmap, clarify steps as needed, explore alternative routes, generate custom tool-prompt combos on demand, and implement immediately.</p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div 
                ref={clarityMiniFrameRef}
                className="inline-block transition-all duration-700 ease-out"
                style={{
                  opacity: Math.max(0, Math.min(1, clarityMiniFrameProgress * 2)),
                  transform: `translateX(${(1 - Math.max(0, Math.min(1, clarityMiniFrameProgress * 2))) * -60}px)`
                }}
              >
                <div className="group relative rounded-3xl">
                  {/* Liquid glass border wrapper */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                    <div className="absolute inset-0 rounded-3xl bg-card"></div>
                  </div>
                  
                  <div className="relative bg-card rounded-3xl p-6 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                    {/* Subtle glass overlay */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-semibold">Complete 3-tab Jump generated in 2 minutes</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Strategic overview + adaptive plan + 9 tool-prompt combos</p>
                    </div>
                  </div>
                  
                  {/* Subtle white back shadow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation - Agentic Automation Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div 
            ref={implementRef}
            className="text-center mb-10 sm:mb-14 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, implementProgress * 1.5),
              transform: `translateY(${(1 - Math.min(1, implementProgress * 1.5)) * 40}px)`
            }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative group/implement">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-emerald-500/40 rounded-[2.5rem] blur-md opacity-50 transition duration-500"></div>
                <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-emerald-500/40 transition-all duration-300 overflow-hidden shadow-lg shadow-emerald-500/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                  <Bot className="relative w-6 h-6 text-emerald-500" />
                  <span className="relative text-2xl font-bold text-foreground whitespace-nowrap">Implementation</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-4 font-display px-4">
              From Strategy to Automation—In One Platform
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
              Your Jump doesn't end at a plan. JumpinAI analyzes your strategy, discovers automation opportunities, and builds ready-to-deploy systems—whether you need a streamlined <span className="text-blue-500 font-medium">Workflow</span> or an intelligent <span className="text-yellow-500 font-medium">AI Agent</span>.
            </p>
          </div>

          {/* How It Works - 3 Step Flow */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1: Analyze */}
              <div 
                ref={implementCard1Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.min(1, implementCard1Progress * 1.5),
                  transform: `translateY(${(1 - Math.min(1, implementCard1Progress * 1.5)) * 50}px)`
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-teal-500/[0.05] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 lg:p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-emerald-500/20 hover:border-emerald-500/40">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-emerald-500">1</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold font-display mb-3">Analyze Your Jump</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI scans your entire plan to identify 3-5 high-impact processes that can be automated—ranked by time savings, complexity, and business impact.
                    </p>
                  </div>
                </div>
                
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>

              {/* Step 2: Choose */}
              <div 
                ref={implementCard2Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.max(0, Math.min(1, (implementCard2Progress - 0.1) * 1.5)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, (implementCard2Progress - 0.1) * 1.5))) * 50}px)`
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/[0.08] via-transparent to-cyan-500/[0.05] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 lg:p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-teal-500/20 hover:border-teal-500/40">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/[0.03] via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-teal-500">2</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-teal-500/30 to-transparent"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold font-display mb-3">Choose Your Type</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Select a <span className="text-blue-500 font-medium">Workflow</span> for predictable, step-by-step automation or an <span className="text-yellow-500 font-medium">AI Agent</span> for intelligent, context-aware systems that reason and adapt.
                    </p>
                  </div>
                </div>
                
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-600 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>

              {/* Step 3: Build & Deploy */}
              <div 
                ref={implementCard3Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.max(0, Math.min(1, (implementCard3Progress - 0.2) * 1.5)),
                  transform: `translateY(${(1 - Math.max(0, Math.min(1, (implementCard3Progress - 0.2) * 1.5))) * 50}px)`
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-blue-500/[0.05] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 lg:p-8 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-cyan-500/20 hover:border-cyan-500/40">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-cyan-500">3</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold font-display mb-3">Build & Deploy</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      One click generates a complete, ready-to-deploy automation with detailed instructions, testing guides, and troubleshooting tips—yours to own and customize.
                    </p>
                  </div>
                </div>
                
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-500 opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Workflows vs AI Agents - The Core Differentiation */}
          <div 
            ref={implementSummaryRef}
            className="max-w-5xl mx-auto mb-10 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, implementSummaryProgress * 1.5),
              transform: `translateY(${(1 - Math.min(1, implementSummaryProgress * 1.5)) * 40}px)`
            }}
          >
            {/* Section Title */}
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold font-display mb-2">Two Types of Automation</h3>
              <p className="text-sm text-muted-foreground">Choose the right tool for your automation needs</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Workflows Card */}
              <div className="group relative rounded-3xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/[0.08] via-transparent to-blue-400/[0.05] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-blue-500/20 hover:border-blue-500/40">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/[0.03] via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/10 border border-blue-500/30 flex items-center justify-center">
                        <Workflow className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-display text-blue-500">Workflows</h4>
                        <span className="text-xs text-muted-foreground">1 Credit per Build</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Linear, step-by-step automations that execute a <span className="text-foreground font-medium">predefined sequence</span> of actions. Perfect for predictable, repeatable processes.
                    </p>
                    
                    {/* Characteristics */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Fixed trigger → Fixed sequence → Fixed output</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Predictable execution every time</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Ideal for data syncing, notifications, reports</span>
                      </div>
                    </div>
                    
                    {/* Use Cases Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {['Form Processing', 'Email Sequences', 'Data Sync', 'Scheduled Reports'].map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-400 opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>

              {/* AI Agents Card */}
              <div className="group relative rounded-3xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/[0.08] via-transparent to-amber-400/[0.05] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-yellow-500/20 hover:border-yellow-500/40">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/[0.03] via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-400/10 border border-yellow-500/30 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-display text-yellow-500">AI Agents</h4>
                        <span className="text-xs text-muted-foreground">2 Credits per Build</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Autonomous systems that <span className="text-foreground font-medium">reason, decide, and adapt</span> based on context. Perfect for complex tasks requiring intelligence.
                    </p>
                    
                    {/* Characteristics */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Context-aware decision making</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Dynamic responses to variable inputs</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Handles ambiguity and edge cases</span>
                      </div>
                    </div>
                    
                    {/* Use Cases Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {['Lead Qualification', 'Content Creation', 'Customer Support', 'Research Tasks'].map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-600 dark:text-yellow-400">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-600 to-amber-400 opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </div>

            {/* Platform Selection - n8n vs Make.com */}
            <div className="glass rounded-2xl p-6 lg:p-8 border border-emerald-500/20 shadow-lg backdrop-blur-xl">
              {/* Section Title */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold font-display mb-1">Choose Your Platform</h3>
                <p className="text-xs text-muted-foreground">Both Workflows and AI Agents can be built for either platform—or both at once</p>
              </div>

              {/* Two Platforms - Enhanced */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* n8n */}
                <div className="relative rounded-2xl p-5 bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.02] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Workflow className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">n8n</h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 font-medium">Technical</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Open-source, self-hosted option with unlimited customization. Ideal for developers and power users who want full control.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">Self-Hosted</span>
                        <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">400+ Integrations</span>
                        <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">Code Nodes</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Make.com */}
                <div className="relative rounded-2xl p-5 bg-gradient-to-br from-violet-500/[0.05] to-purple-500/[0.02] border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">Make.com</h4>
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-600 dark:text-violet-400 font-medium">Non-Technical</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Cloud-based with a visual, drag-and-drop interface. Perfect for non-technical users who want powerful automation without code.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">Cloud-Hosted</span>
                        <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">1500+ Apps</span>
                        <span className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">Visual Builder</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-6"></div>
              
              {/* What's Included - Enhanced */}
              <div className="text-center mb-4">
                <p className="text-xs text-muted-foreground mb-3">Every automation you build includes:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-white/10 text-xs">
                    <Play className="w-3 h-3 text-emerald-500" />
                    <span className="text-foreground font-medium">Quick Start Guide</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-white/10 text-xs">
                    <Settings className="w-3 h-3 text-emerald-500" />
                    <span className="text-foreground font-medium">Configuration Steps</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-white/10 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-foreground font-medium">Testing Checklist</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-white/10 text-xs">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-foreground font-medium">Troubleshooting Tips</span>
                  </span>
                </div>
              </div>
              
              {/* Generate Both Option */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Pro Tip:</span> Generate for both platforms at once to compare and choose the best fit for your needs
                </p>
              </div>
            </div>
          </div>

          {/* Closing Argument - Why Implementation Matters */}
          <div 
            ref={implementClosingRef}
            className="max-w-4xl mx-auto mt-12 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, implementClosingProgress * 1.5),
              transform: `translateY(${(1 - Math.min(1, implementClosingProgress * 1.5)) * 40}px)`
            }}
          >
            <div className="relative group">
              {/* Subtle glow effect - neutral/white like other sections */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/5 to-white/10 dark:from-white/5 dark:via-white/[0.02] dark:to-white/5 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              
              <div className="relative bg-card rounded-3xl p-8 lg:p-10 border border-white/10 hover:border-white/20 shadow-modern backdrop-blur-xl text-center transition-all duration-500">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                
                <div className="relative z-10">
                  {/* Main Statement */}
                  <h3 className="text-xl sm:text-2xl font-bold font-display mb-4 gradient-text-primary">
                    Turn Your Plan Into a Force That Never Stops
                  </h3>
                  
                  {/* Supporting Text */}
                  <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
                    A plan on paper is potential. A <span className="text-blue-500 font-medium">Workflow</span> or <span className="text-yellow-500 font-medium">AI Agent</span> in motion is <span className="text-foreground font-medium">power</span>. When you implement your Jump, you transform strategic insight into systems that work for you—24/7, without hesitation, with precision you control.
                  </p>
                  
                  {/* Key Benefits - Horizontal */}
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></span>
                      <span>Full ownership of your automations</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60"></span>
                      <span>Intelligent or linear—your choice</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>
                      <span>Scale as you grow</span>
                    </span>
                  </div>
                  
                  {/* Final Line */}
                  <p className="text-sm text-muted-foreground/80 italic">
                    This is where strategy meets execution—where your Jump in AI becomes reality.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display">
              Intelligent Features That Evolve With Your Progress
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Shape every Jump with precision. These adaptive tools help you refine your strategic plan—go deeper, pivot directions, or generate the exact resources you need at any step.
            </p>
            
            {/* Explore Alternative Routes Feature - Relocated */}
            <div className="max-w-4xl mx-auto mb-10">
              <p className="text-sm sm:text-base text-muted-foreground/80 max-w-2xl mx-auto mb-6">
                Seeking a different strategic direction? Instantly explore alternative approaches directly from your Overview tab—generate up to 12 distinct pathways and select the one that perfectly aligns with your vision.
              </p>
              
              {/* Main Card Frame - CYAN color theme for Alternative Routes */}
              <div 
                ref={exploreCardRef}
                className="group relative rounded-3xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.min(1, exploreCardProgress * 1.5),
                  transform: `translateY(${(1 - Math.min(1, exploreCardProgress * 1.5)) * 50}px) scale(${0.95 + Math.min(1, exploreCardProgress * 1.5) * 0.05})`
                }}
              >
                {/* Liquid glass border wrapper - Cyan accent */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/[0.08] via-cyan-400/[0.03] to-cyan-500/[0.08] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 lg:p-8 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-cyan-500/20 hover:border-cyan-500/40 overflow-hidden">
                  {/* Subtle glass overlay - Cyan tint */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-cyan-400/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Feature Button Display */}
                    <div 
                      ref={exploreButtonRef}
                      className="flex justify-center mb-6 transition-all duration-700 ease-out"
                      style={{
                        opacity: Math.max(0, Math.min(1, (exploreButtonProgress - 0.1) * 2.5)),
                        transform: `translateY(${(1 - Math.max(0, Math.min(1, (exploreButtonProgress - 0.1) * 2.5))) * 30}px) scale(${0.9 + Math.max(0, Math.min(1, (exploreButtonProgress - 0.1) * 2.5)) * 0.1})`
                      }}
                    >
                      <div className="relative group/explore">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/40 via-cyan-400/30 to-cyan-500/40 rounded-[2.5rem] blur-md opacity-40 group-hover/explore:opacity-60 transition duration-500"></div>
                        <div className="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-cyan-500/40 transition-all duration-300 overflow-hidden shadow-lg shadow-cyan-500/10 group-hover/explore:shadow-xl group-hover/explore:shadow-cyan-500/20 group-hover/explore:border-cyan-500/60">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/explore:translate-x-full transition-transform duration-1000"></div>
                          <Route className="relative w-5 h-5 text-cyan-500" />
                          <span className="relative text-lg font-bold text-foreground whitespace-nowrap">Explore Alternative Routes</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div
                      ref={exploreDescRef}
                      className="transition-all duration-700 ease-out"
                      style={{
                        opacity: Math.max(0, Math.min(1, (exploreDescProgress - 0.15) * 2.5)),
                        transform: `translateY(${(1 - Math.max(0, Math.min(1, (exploreDescProgress - 0.15) * 2.5))) * 25}px)`
                      }}
                    >
                      <p className="text-center text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
                        This feature instantly generates <span className="text-foreground font-medium">3 alternative strategic approaches</span>. 
                        Select your preferred path and generate a complete new Jump—then explore further from there.
                      </p>
                    </div>
                    
                    {/* Visual Flow - Cards appear sequentially from right to left - Cyan theme */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {/* Card 1 - Generate Alternatives */}
                      <div 
                        ref={exploreFlow1Ref}
                        className="glass bg-cyan-500/[0.05] p-4 rounded-xl border border-cyan-500/15 backdrop-blur-sm text-center transition-all duration-700 ease-out hover:border-cyan-500/30 hover:bg-cyan-500/[0.08] hover:shadow-lg hover:shadow-cyan-500/5"
                        style={{
                          opacity: Math.max(0, Math.min(1, (exploreFlow1Progress - 0.2) * 3)),
                          transform: `translateX(${(1 - Math.max(0, Math.min(1, (exploreFlow1Progress - 0.2) * 3))) * 120}px) scale(${0.9 + Math.max(0, Math.min(1, (exploreFlow1Progress - 0.2) * 3)) * 0.1})`
                        }}
                      >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-cyan-500/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                          <Route className="w-4 h-4 text-cyan-500" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Generate Alternatives</h4>
                        <p className="text-xs text-muted-foreground">Click to get 3 distinct strategic paths</p>
                      </div>
                      
                      {/* Card 2 - Select & Generate */}
                      <div 
                        ref={exploreFlow2Ref}
                        className="glass bg-cyan-500/[0.05] p-4 rounded-xl border border-cyan-500/15 backdrop-blur-sm text-center transition-all duration-700 ease-out hover:border-cyan-500/30 hover:bg-cyan-500/[0.08] hover:shadow-lg hover:shadow-cyan-500/5"
                        style={{
                          opacity: Math.max(0, Math.min(1, (exploreFlow2Progress - 0.3) * 3)),
                          transform: `translateX(${(1 - Math.max(0, Math.min(1, (exploreFlow2Progress - 0.3) * 3))) * 120}px) scale(${0.9 + Math.max(0, Math.min(1, (exploreFlow2Progress - 0.3) * 3)) * 0.1})`
                        }}
                      >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-cyan-500/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                          <Sparkles className="w-4 h-4 text-cyan-500" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Select & Generate</h4>
                        <p className="text-xs text-muted-foreground">One click creates a complete new Jump</p>
                      </div>
                      
                      {/* Card 3 - Infinite Exploration */}
                      <div 
                        ref={exploreFlow3Ref}
                        className="glass bg-cyan-500/[0.05] p-4 rounded-xl border border-cyan-500/15 backdrop-blur-sm text-center transition-all duration-700 ease-out hover:border-cyan-500/30 hover:bg-cyan-500/[0.08] hover:shadow-lg hover:shadow-cyan-500/5"
                        style={{
                          opacity: Math.max(0, Math.min(1, (exploreFlow3Progress - 0.4) * 3)),
                          transform: `translateX(${(1 - Math.max(0, Math.min(1, (exploreFlow3Progress - 0.4) * 3))) * 120}px) scale(${0.9 + Math.max(0, Math.min(1, (exploreFlow3Progress - 0.4) * 3)) * 0.1})`
                        }}
                      >
                        <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-cyan-500/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                          <GitBranch className="w-4 h-4 text-cyan-500" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Infinite Exploration</h4>
                        <p className="text-xs text-muted-foreground">Keep branching to find your optimal path</p>
                      </div>
                    </div>
                    
                    {/* Key Benefit */}
                    <div 
                      ref={exploreBenefitRef}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-700 ease-out"
                      style={{
                        opacity: Math.max(0, Math.min(1, (exploreBenefitProgress - 0.5) * 3)),
                        transform: `translateX(${(1 - Math.max(0, Math.min(1, (exploreBenefitProgress - 0.5) * 3))) * 60}px)`
                      }}
                    >
                      <Compass className="w-4 h-4 text-cyan-500" />
                      <span>Your exploration trail is tracked—never lose sight of where you've been</span>
                    </div>
                  </div>
                </div>
                
                {/* Subtle cyan back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </div>
            
          </div>

          {/* Feature 1: CLARIFY - Multi-Level Breakdown - ORANGE color theme */}
          <div ref={clarificationRef} className="max-w-5xl mx-auto mb-12">
            <div 
              className="glass rounded-2xl p-6 lg:p-8 border border-orange-500/20 shadow-lg backdrop-blur-xl transition-all duration-700 ease-out"
              style={{
                opacity: Math.min(1, clarificationProgress * 1.3),
                transform: `translateY(${(1 - Math.min(1, clarificationProgress * 1.3)) * 40}px)`
              }}
            >
              {/* Subtle orange glass overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/[0.02] via-transparent to-orange-400/[0.01] pointer-events-none"></div>
              
              {/* Feature Header */}
              <div className="text-center mb-10 relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="relative group/clarify">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/40 via-orange-400/30 to-orange-500/40 rounded-[2.5rem] blur-md opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-orange-500/40 transition-all duration-300 overflow-hidden shadow-lg shadow-orange-500/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                      <Sparkles className="relative w-6 h-6 text-orange-500" />
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

              {/* Multi-Level Breakdown - Orange theme */}
              <div className="space-y-3 sm:space-y-4 relative z-10">
                {/* Level 0 */}
                <div 
                  ref={level0Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-orange-500/40 transition-all duration-700 ease-out"
                  style={{
                    opacity: level0Progress,
                    transform: `translateX(${(1 - level0Progress) * 80}px) scale(${0.9 + level0Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-orange-500 ring-2 ring-orange-500/30 flex items-center justify-center text-xs font-bold text-white">
                    0
                  </div>
                  <div className="glass bg-orange-500/[0.05] p-3 sm:p-4 rounded-lg border border-orange-500/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 0: Original Generated Plan</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full backdrop-blur-xl bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold">Your Jump</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Initial steps from your generated Jump plan
                    </p>
                    <div className="p-2.5 rounded-lg glass bg-orange-500/[0.05] border border-orange-500/20 backdrop-blur-sm">
                      <p className="text-xs sm:text-sm font-medium break-words">Step: "Launch digital marketing campaign"</p>
                    </div>
                  </div>
                </div>

                {/* Level 1 */}
                <div 
                  ref={level1Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-orange-500/30 ml-2 sm:ml-4 transition-all duration-700 ease-out"
                  style={{
                    opacity: level1Progress,
                    transform: `translateX(${(1 - level1Progress) * 80}px) scale(${0.9 + level1Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-orange-500 ring-2 ring-orange-500/20 flex items-center justify-center text-xs font-bold text-white">
                    1
                  </div>
                  <div className="glass bg-orange-500/[0.05] p-3 sm:p-4 rounded-lg border border-orange-500/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 1: First Clarification</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/90 text-white font-semibold border border-orange-600/50">5 sub-steps</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      After clicking "Clarify" on the original step
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded glass bg-orange-500/[0.05] border border-orange-500/15 hover:border-orange-500/30 transition-colors backdrop-blur-sm">
                        <span className="text-muted-foreground break-words">→ Define target audience & budget</span>
                      </div>
                      <div className="p-2 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Select marketing channels
                      </div>
                      <div className="p-2 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Create campaign content
                      </div>
                      <div className="p-2 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Set up tracking & analytics
                      </div>
                      <div className="p-2 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Launch & monitor performance
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 2 */}
                <div 
                  ref={level2Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-orange-500/20 ml-4 sm:ml-8 transition-all duration-700 ease-out"
                  style={{
                    opacity: level2Progress,
                    transform: `translateX(${(1 - level2Progress) * 80}px) scale(${0.9 + level2Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-orange-500 ring-2 ring-orange-500/15 flex items-center justify-center text-xs font-bold text-white">
                    2
                  </div>
                  <div className="glass bg-orange-500/[0.05] p-3 sm:p-4 rounded-lg border border-orange-500/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 2: Clarify the Sub-Step</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/90 text-white font-semibold border border-orange-600/50">5 more</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Clicked "Clarify" on "Define target audience & budget"
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 rounded glass bg-orange-500/[0.05] border border-orange-500/15 hover:border-orange-500/30 transition-colors backdrop-blur-sm">
                        <span className="text-muted-foreground break-words">→ Analyze current customer data</span>
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Research competitor targeting
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Calculate available marketing budget
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Create audience personas
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Allocate budget across channels
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 3 */}
                <div 
                  ref={level3Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-orange-500/15 ml-6 sm:ml-12 transition-all duration-700 ease-out"
                  style={{
                    opacity: level3Progress,
                    transform: `translateX(${(1 - level3Progress) * 80}px) scale(${0.9 + level3Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-orange-500 ring-2 ring-orange-500/10 flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                  <div className="glass bg-orange-500/[0.05] p-3 sm:p-4 rounded-lg border border-orange-500/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 3: Clarify the Level 2 Sub-Step</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/90 text-white font-semibold border border-orange-600/50">5 more</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Clicked "Clarify" on "Analyze current customer data"
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 rounded glass bg-orange-500/[0.05] border border-orange-500/15 hover:border-orange-500/30 transition-colors backdrop-blur-sm">
                        <span className="text-muted-foreground break-words">→ Export customer purchase history from CRM</span>
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Identify top 20% of customers by revenue
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Extract demographic & behavioral patterns
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Document common characteristics in spreadsheet
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Share findings with marketing team
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 4 */}
                <div 
                  ref={level4Ref}
                  className="relative pl-4 sm:pl-6 border-l-2 border-orange-500/10 ml-8 sm:ml-16 transition-all duration-700 ease-out"
                  style={{
                    opacity: level4Progress,
                    transform: `translateX(${(1 - level4Progress) * 80}px) scale(${0.9 + level4Progress * 0.1})`
                  }}
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-orange-500 ring-2 ring-orange-500/30 flex items-center justify-center text-xs font-bold text-white">
                    4
                  </div>
                  <div className="glass bg-orange-500/[0.05] p-3 sm:p-4 rounded-lg border border-orange-500/20 backdrop-blur-sm shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-xs sm:text-sm">Level 4: Maximum Detail</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/90 text-white font-semibold border border-orange-600/50">Crystal clear</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Clicked "Clarify" on "Export customer purchase history from CRM"
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Log into your CRM system (Salesforce/HubSpot)
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Navigate to Reports → Customer Purchase History
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Set date range to last 12 months
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
                        → Export as CSV with customer ID, purchase date, amount
                      </div>
                      <div className="p-1.5 rounded glass bg-orange-500/[0.03] border border-orange-500/10 text-muted-foreground backdrop-blur-sm break-words">
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

          {/* Feature 2: REROUTE - Alternative Routes - PURPLE color theme */}
          <div 
            ref={rerouteRef}
            className="max-w-5xl mx-auto mb-12 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, rerouteProgress * 1.3),
              transform: `translateY(${(1 - Math.min(1, rerouteProgress * 1.3)) * 50}px)`
            }}
          >
            <div className="glass rounded-2xl p-6 lg:p-8 border border-purple-500/20 shadow-lg backdrop-blur-xl relative overflow-hidden">
              {/* Subtle purple glass overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/[0.02] via-transparent to-purple-400/[0.01] pointer-events-none"></div>
              
              {/* Feature Header */}
              <div className="text-center mb-10 relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="relative group/reroute">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/40 via-purple-400/30 to-purple-500/40 rounded-[2.5rem] blur-md opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-purple-500/40 transition-all duration-300 overflow-hidden shadow-lg shadow-purple-500/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                      <GitBranch className="relative w-6 h-6 text-purple-500" />
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

              {/* Route Examples - Purple theme */}
              <div ref={rerouteCardsRef} className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 relative z-10">
                <div 
                  className="glass bg-purple-500/[0.05] p-3 sm:p-4 rounded-lg border border-purple-500/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate hover:border-purple-500/40 hover:bg-purple-500/[0.08]"
                  style={{
                    opacity: Math.max(0, Math.min(1, rerouteCardsProgress * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, rerouteCardsProgress * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-purple-500 mb-2">Route A: Premium</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• High-end tools</p>
                    <p>• Faster timeline</p>
                    <p>• Higher investment</p>
                  </div>
                </div>
                <div 
                  className="glass bg-purple-500/[0.05] p-3 sm:p-4 rounded-lg border border-purple-500/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate hover:border-purple-500/40 hover:bg-purple-500/[0.08]"
                  style={{
                    opacity: Math.max(0, Math.min(1, (rerouteCardsProgress - 0.3) * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, (rerouteCardsProgress - 0.3) * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-purple-500 mb-2">Route B: Budget-Friendly</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• Free/low-cost tools</p>
                    <p>• Gradual rollout</p>
                    <p>• Lower risk</p>
                  </div>
                </div>
                <div 
                  className="glass bg-purple-500/[0.05] p-3 sm:p-4 rounded-lg border border-purple-500/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate hover:border-purple-500/40 hover:bg-purple-500/[0.08]"
                  style={{
                    opacity: Math.max(0, Math.min(1, (rerouteCardsProgress - 0.6) * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, (rerouteCardsProgress - 0.6) * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-purple-500 mb-2">Route C: Hybrid</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>• Mix of approaches</p>
                    <p>• Balanced timeline</p>
                    <p>• Medium investment</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/80 text-center relative z-10">
                Each alternative route includes 3 detailed sub-steps tailored to that approach
              </p>

            </div>
          </div>

          {/* Feature 3: EQUIP - On-Demand Tools & Prompts - RED color theme */}
          <div 
            ref={equipRef}
            className="max-w-5xl mx-auto mb-8 transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, equipProgress * 1.3),
              transform: `translateY(${(1 - Math.min(1, equipProgress * 1.3)) * 50}px)`
            }}
          >
            <div className="glass rounded-2xl p-6 lg:p-8 border border-red-500/20 shadow-lg backdrop-blur-xl relative overflow-hidden">
              {/* Subtle red glass overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/[0.02] via-transparent to-red-400/[0.01] pointer-events-none"></div>
              
              {/* Feature Header */}
              <div className="text-center mb-10 relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="relative group/equip">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/40 via-red-400/30 to-red-500/40 rounded-[2.5rem] blur-md opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2.5rem] border border-red-500/40 transition-all duration-300 overflow-hidden shadow-lg shadow-red-500/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                      <Wrench className="relative w-6 h-6 text-red-500" />
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

              {/* Feature Highlights - Red theme */}
              <div ref={equipCardsRef} className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 relative z-10">
                <div 
                  className="glass bg-red-500/[0.05] p-3 sm:p-4 rounded-lg border border-red-500/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate hover:border-red-500/40 hover:bg-red-500/[0.08]"
                  style={{
                    opacity: Math.max(0, Math.min(1, equipCardsProgress * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, equipCardsProgress * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-red-500 mb-2">Curated Tool Selection</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Get a main tool recommendation plus 2 alternatives perfectly aligned to your step's requirements, budget, and technical level.
                  </p>
                </div>
                <div 
                  className="glass bg-red-500/[0.05] p-3 sm:p-4 rounded-lg border border-red-500/20 backdrop-blur-sm shadow-sm transition-all duration-700 ease-out scroll-animate hover:border-red-500/40 hover:bg-red-500/[0.08]"
                  style={{
                    opacity: Math.max(0, Math.min(1, (equipCardsProgress - 0.4) * 3)),
                    transform: `translateY(${(1 - Math.max(0, Math.min(1, (equipCardsProgress - 0.4) * 3))) * 40}px)`
                  }}
                >
                  <p className="text-sm font-bold text-red-500 mb-2">Ready-to-Use Prompts</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Receive expertly crafted prompts designed specifically for your step—copy, paste, and execute immediately with any AI tool.
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/80 text-center relative z-10">
                Each equipped combo is automatically saved in your Tools & Prompts tab and linked to its originating step
              </p>
            </div>
          </div>

          {/* Availability Info - Color coded */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl glass border border-white/10 backdrop-blur-xl shadow-lg">
              <div className="text-xs sm:text-sm text-foreground/90">
                <span className="font-bold text-orange-500">Clarify</span> feature availability varies by clarification depth level and subscription plan
              </div>
              <div className="text-xs sm:text-sm text-foreground/80">
                <span className="font-bold text-purple-500">Reroute</span> & <span className="font-bold text-red-500">Equip</span> available on any existing step
              </div>
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
                ref={concept1Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: window.innerWidth < 768 ? Math.min(1, concept1Progress * 1.5) : Math.min(1, conceptCardsProgress * 3),
                  transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, concept1Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, concept1Progress * 1.5)) * 40) : (Math.min(1, conceptCardsProgress * 3) >= 0.99 ? 0 : (1 - Math.min(1, conceptCardsProgress * 3)) * 40))}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
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
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>

              {/* Card 2 */}
              <div 
                ref={concept2Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: window.innerWidth < 768 ? Math.min(1, concept2Progress * 1.5) : Math.max(0, Math.min(1, (conceptCardsProgress - 0.25) * 3)),
                  transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, concept2Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, concept2Progress * 1.5)) * 40) : (Math.max(0, Math.min(1, (conceptCardsProgress - 0.25) * 3)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (conceptCardsProgress - 0.25) * 3))) * 40))}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      That's the energy we channel. <strong className="text-foreground">Jump in AI</strong> isn't about casual exploration—it's about decisive action with a clear landing point. Your personalized plan ensures you don't leap blindly. You jump with <strong className="text-foreground">direction, precision, and purpose</strong>.
                    </p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>

              {/* Card 3 */}
              <div 
                ref={concept3Ref}
                className="group relative rounded-3xl transition-all duration-700 ease-out scroll-animate"
                style={{
                  opacity: window.innerWidth < 768 ? Math.min(1, concept3Progress * 1.5) : Math.max(0, Math.min(1, (conceptCardsProgress - 0.5) * 3)),
                  transform: `translateY(${(window.innerWidth < 768 ? (Math.min(1, concept3Progress * 1.5) >= 0.99 ? 0 : (1 - Math.min(1, concept3Progress * 1.5)) * 40) : (Math.max(0, Math.min(1, (conceptCardsProgress - 0.5) * 3)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (conceptCardsProgress - 0.5) * 3))) * 40))}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-3xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-3xl p-6 h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                      Every Jump you create is your commitment to transformation. You're not testing the waters—you're <strong className="text-foreground">diving in with a plan</strong>. And when you're ready, we help you turn that plan into automated workflows and AI agents that work for you.
                    </p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>
            </div>

            {/* Featured Quote */}
            <div className="relative max-w-4xl mx-auto">
              <div 
                ref={quoteCardRef}
                className="group relative rounded-2xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.max(0, Math.min(1, quoteCardProgress * 2)),
                  transform: `translateX(${(1 - Math.max(0, Math.min(1, quoteCardProgress * 2))) * -60}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-2xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-2xl p-8 sm:p-10 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  {/* Decorative Quote Mark */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/20 flex items-center justify-center z-20">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <blockquote className="text-center">
                      <p className="text-lg sm:text-xl lg:text-2xl text-foreground font-display leading-relaxed italic font-medium">
                        The moment you jump, momentum takes over. From strategy to implementation, from plan to automation—there's no going back, only the landing ahead.{' '}
                        <span className="gradient-text-primary font-bold not-italic">Make it count.</span>
                      </p>
                    </blockquote>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
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
            <div 
              ref={whyMissingRef}
              className="group relative rounded-2xl transition-all duration-700 ease-out"
              style={{
                opacity: Math.min(1, whyMissingProgress * 1.3),
                transform: `translateY(${(1 - Math.min(1, whyMissingProgress * 1.3)) * 40}px)`
              }}
            >
              {/* Liquid glass border wrapper */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                <div className="absolute inset-0 rounded-2xl bg-card"></div>
              </div>
              
              <div className="relative bg-card rounded-2xl p-5 sm:p-6 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                
                <div className="relative z-10">
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
                        We give you a complete, structured plan—not generic advice, but a real roadmap built around what you're trying to achieve. And when you're ready, we help you implement it with automated workflows and AI agents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subtle white back shadow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
            </div>

            {/* Two-Column: Why Now + What Makes Us Different */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* The Critical Window */}
              <div 
                ref={whyCriticalRef}
                className="group relative rounded-2xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.min(1, whyCriticalProgress * 1.5),
                  transform: `translateY(${(1 - Math.min(1, whyCriticalProgress * 1.5)) * 40}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-2xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-2xl p-6 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20 h-full">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold font-display">The Critical Window</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We're at an inflection point. AI is shifting from experimentation to essential infrastructure—but most people are still paralyzed by choice overload. The ones who act now, with clarity and strategy, will define the next decade. JumpinAI gives you that clarity when it matters most—before the window closes and strategic advantage becomes competitive necessity.
                    </p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>

              {/* What Makes Us Different */}
              <div 
                ref={whyDifferentRef}
                className="group relative rounded-2xl transition-all duration-700 ease-out"
                style={{
                  opacity: Math.max(0, Math.min(1, (whyDifferentProgress - 0.2) * 2)),
                  transform: `translateY(${Math.max(0, Math.min(1, (whyDifferentProgress - 0.2) * 2)) >= 0.99 ? 0 : (1 - Math.max(0, Math.min(1, (whyDifferentProgress - 0.2) * 2))) * 40}px)`
                }}
              >
                {/* Liquid glass border wrapper */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                  <div className="absolute inset-0 rounded-2xl bg-card"></div>
                </div>
                
                <div className="relative bg-card rounded-2xl p-6 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20 h-full">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold font-display">What Makes Us Different</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Others give you tools and leave you to figure out the rest. We give you direction—and execution. Every Jump is a complete strategic framework—overview, adaptive plan, and curated resources—designed to eliminate guesswork and accelerate implementation. Then we help you build automated workflows and AI agents that turn your strategy into systems that work for you. It's not about having more options; it's about making the right moves and automating them.
                    </p>
                  </div>
                </div>
                
                {/* Subtle white back shadow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
              </div>
            </div>

            {/* Three Key Points */}
            <div 
              ref={whyKeyPointsRef}
              className="group relative rounded-2xl transition-all duration-700 ease-out"
              style={{
                opacity: Math.min(1, whyKeyPointsProgress * 1.3),
                transform: `translateY(${(1 - Math.min(1, whyKeyPointsProgress * 1.3)) * 40}px)`
              }}
            >
              {/* Liquid glass border wrapper */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-white/[0.03] p-[1px]">
                <div className="absolute inset-0 rounded-2xl bg-card"></div>
              </div>
              
              <div className="relative bg-card rounded-2xl p-6 sm:p-8 shadow-modern hover:shadow-modern-lg transition-all duration-500 border border-white/10 hover:border-white/20">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none"></div>
                
                <div className="relative z-10">
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
                        This isn't just ideas. It's actionable strategy with implementation built in—from planning to automated workflows and AI agents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subtle white back shadow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10 blur-lg"></div>
            </div>

            {/* Bottom CTA Message */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                While others talk about what's possible, <span className="font-semibold text-foreground">we show you exactly how to get there—and build the systems to make it happen.</span>
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
              Flexible plans designed to accelerate your personal and business growth
            </p>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              <span className="font-semibold text-foreground">Credit costs:</span> 1 credit per Jump generation, 1 credit per Workflow build, 2 credits per AI Agent build. Each Jump is a complete AI adaptation plan—then build Workflows or AI Agents to automate your execution.
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
                      A Jump is your complete AI adaptation blueprint delivered in 3 comprehensive tabs: Overview (executive summary, situation analysis, strategic vision & roadmap), Plan (detailed action steps with multi-level clarification up to 4 levels deep and 3 alternative routes per step), and Tools & Prompts (9 tool-prompt combinations, each with a main tool plus 2 alternatives and ready-to-use prompts with guidance). Plus, our Implementation feature lets you build automated workflows and AI agents from your plan, exportable to n8n or Make.com.
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
                      Not at all. Every component of your Jump - from the strategic roadmap to the tool-prompt combinations and even building automated workflows and AI agents - is designed for business professionals without technical backgrounds. We provide clear, step-by-step guidance that anyone can follow, and exports work seamlessly with visual platforms like n8n and Make.com.
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