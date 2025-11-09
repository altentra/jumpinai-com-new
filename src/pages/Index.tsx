import React, { useState, useEffect } from 'react';
import { Sparkles, GitBranch } from 'lucide-react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LeadMagnet from "@/components/LeadMagnet";
import BookPromotion from "@/components/BookPromotion";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { GoogleSheetsTest } from "@/components/GoogleSheetsTest";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { creditsService, type SubscriptionPlan } from '@/services/creditsService';

const Index = () => {
  const { user, isAuthenticated, subscription } = useAuth();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState<Record<string, boolean>>({});

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

  const handleSubscribe = async (planName: string) => {
    // Map plan names to loading keys
    const loadingKey = planName === 'Starter Plan' ? 'starter' : 
                      planName === 'Pro Plan' ? 'pro' : 
                      planName === 'Growth Plan' ? 'growth' : 'unknown';

    // Show immediate feedback
    setLoadingSubscription(prev => ({ ...prev, [loadingKey]: true }));
    toast.info('Processing your request...');

    if (!isAuthenticated) {
      setLoadingSubscription(prev => ({ ...prev, [loadingKey]: false }));
      toast.error('Please sign in first');
      window.location.href = '/auth';
      return;
    }

    const plan = subscriptionPlans.find(p => p.name === planName);
    if (!plan) {
      setLoadingSubscription(prev => ({ ...prev, [loadingKey]: false }));
      toast.error('Plan not found');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId: plan.id }
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
      setLoadingSubscription(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
      {/* Enhanced floating background elements - positioned to not interfere with hero */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Overview Tab */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300 border border-primary/10 hover:border-primary/20 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

            {/* Plan Tab */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300 border border-primary/10 hover:border-primary/20 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

            {/* Tools & Prompts Tab */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300 border border-primary/10 hover:border-primary/20 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <span className="font-semibold text-foreground">All three tabs work together seamlessly</span>—from strategic understanding (Overview), to adaptive execution (Plan), to practical implementation (Tools & Prompts). Everything you need in one complete Jump.
            </p>
          </div>
        </div>
      </section>

      {/* Trust by Association Section */}
      <section className="py-12 bg-muted/30 dark:bg-muted/10">
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

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <div className="text-center p-6 rounded-xl glass h-full flex flex-col">
                <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-lg font-bold mb-2 font-display">Describe Your Goal</h3>
                <p className="text-sm text-muted-foreground flex-1">Share your objectives, challenges, industry, and AI experience. Our AI analyzes your unique situation.</p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass h-full flex flex-col">
                <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-lg font-bold mb-2 font-display">Receive Your Jump</h3>
                <p className="text-sm text-muted-foreground flex-1">Get your complete 3-tab transformation package: Overview, Plan, and 9 Tools & Prompts combos—all personalized.</p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass h-full flex flex-col">
                <div className="w-10 h-10 mx-auto mb-4 backdrop-blur-xl bg-primary/5 ring-1 ring-primary/30 rounded-xl flex items-center justify-center text-primary text-sm font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-lg font-bold mb-2 font-display">Execute & Adapt</h3>
                <p className="text-sm text-muted-foreground flex-1">Follow your roadmap, clarify steps as needed, explore alternative routes, and use ready prompts to implement immediately.</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-primary/10 to-primary/10 rounded-xl border border-primary/20">
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

      {/* Multi-Level Clarification & Route Discovery Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-block mb-3">
              <span className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold shadow-sm">
                Breakthrough Feature
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-display">
              Adaptive Intelligence: <span className="gradient-text-primary">Multi-Level Clarification</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Never feel stuck with a vague step again. Our revolutionary system lets you drill down up to 4 levels deep into any step, or discover completely alternative routes to achieve your goals.
            </p>
          </div>

          {/* Visual Demonstration */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="glass rounded-2xl p-6 lg:p-8 border border-primary/20 shadow-lg backdrop-blur-xl">
              <h3 className="text-lg lg:text-xl font-bold mb-6 text-center font-display">
                How It Works: Interactive Step Controls
              </h3>
              
              {/* The Core Mechanic */}
              <div className="mb-6 p-4 sm:p-5 rounded-xl glass bg-muted/30 border border-primary/30 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                    </svg>
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className="font-bold text-sm sm:text-base lg:text-lg mb-3">Hover Over Any Step = Two Powerful Buttons Appear</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="glass bg-muted/30 p-3 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Clarify Button - Exact replica from JumpPlanDisplay */}
                          <div className="relative group/clarify">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10 cursor-default">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                              <Sparkles className="relative w-3.5 h-3.5 text-primary" />
                              <span className="relative text-sm font-bold text-foreground whitespace-nowrap">Clarify</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Generates <strong className="font-semibold text-foreground">5 detailed sub-steps</strong> that break down this step into actionable components
                        </p>
                      </div>
                      <div className="glass bg-muted/30 p-3 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Reroute Button - Exact replica from JumpPlanDisplay */}
                          <div className="relative group/reroute">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-md opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-background/40 via-background/30 to-background/40 backdrop-blur-xl rounded-[2rem] border border-primary/40 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/10 cursor-default">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-1000"></div>
                              <GitBranch className="relative w-3.5 h-3.5 text-primary" />
                              <span className="relative text-sm font-bold text-foreground whitespace-nowrap">Reroute</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Suggests <strong className="font-semibold text-foreground">3 alternative routes</strong> (each with 3 sub-steps) to achieve the same goal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Level Breakdown */}
              <div className="space-y-3 sm:space-y-4">
                {/* Level 0 */}
                <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/40">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary/90 ring-2 ring-primary/30 flex items-center justify-center text-xs font-bold text-primary-foreground">
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
                <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/30 ml-2 sm:ml-4">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary/80 ring-2 ring-primary/20 flex items-center justify-center text-xs font-bold text-primary-foreground">
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
                      <div className="p-2 rounded glass bg-muted/30 border border-primary/15 hover:border-primary/30 transition-colors backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span className="text-muted-foreground break-words">→ Define target audience & budget</span>
                        <div className="flex gap-1 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex-shrink-0">
                          <button className="px-1.5 py-0.5 rounded backdrop-blur-xl bg-primary/90 text-primary-foreground text-xs font-semibold">Clarify</button>
                          <button className="px-1.5 py-0.5 rounded backdrop-blur-xl bg-primary/90 text-primary-foreground text-xs font-semibold">Reroute</button>
                        </div>
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
                <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/20 ml-4 sm:ml-8">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary/70 ring-2 ring-primary/15 flex items-center justify-center text-xs font-bold text-primary-foreground">
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
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/15 hover:border-primary/30 transition-colors backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span className="text-muted-foreground break-words">→ Analyze current customer data</span>
                        <div className="flex gap-1 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex-shrink-0">
                          <button className="px-1.5 py-0.5 rounded backdrop-blur-xl bg-primary/90 text-primary-foreground text-xs font-semibold">Clarify</button>
                          <button className="px-1.5 py-0.5 rounded backdrop-blur-xl bg-primary/90 text-primary-foreground text-xs font-semibold">Reroute</button>
                        </div>
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
                <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/15 ml-6 sm:ml-12">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary/60 ring-2 ring-primary/10 flex items-center justify-center text-xs font-bold text-primary-foreground">
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
                      <div className="p-1.5 rounded glass bg-muted/30 border border-primary/15 hover:border-primary/30 transition-colors backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span className="text-muted-foreground break-words">→ Export customer purchase history from CRM</span>
                        <div className="flex gap-1 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex-shrink-0">
                          <button className="px-1.5 py-0.5 rounded backdrop-blur-xl bg-primary/90 text-primary-foreground text-xs font-semibold">Clarify</button>
                          <button className="px-1.5 py-0.5 rounded backdrop-blur-xl bg-primary/90 text-primary-foreground text-xs font-semibold">Reroute</button>
                        </div>
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
                <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/10 ml-8 sm:ml-16">
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full backdrop-blur-xl bg-primary/50 ring-2 ring-primary/5 flex items-center justify-center text-xs font-bold text-primary-foreground">
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

              {/* Reroute Feature */}
              <div className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-xl glass bg-muted/30 border border-primary/20 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg backdrop-blur-xl bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className="font-bold mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <span className="text-sm sm:text-base">Alternative Routes Discovery</span>
                      <span className="text-xs px-2 py-0.5 rounded-full backdrop-blur-xl bg-primary/90 text-primary-foreground font-semibold">REROUTE</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Not confident about a specific approach? Click <strong className="font-semibold text-foreground">Reroute</strong> on any step at any level to discover 3 completely different paths:
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="glass bg-muted/30 p-3 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                        <p className="text-xs font-bold text-primary mb-1.5">Route A: Premium</p>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p>• High-end tools</p>
                          <p>• Faster timeline</p>
                          <p>• Higher cost</p>
                        </div>
                      </div>
                      <div className="glass bg-muted/30 p-3 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                        <p className="text-xs font-bold text-primary mb-1.5">Route B: Budget-Friendly</p>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p>• Free/low-cost tools</p>
                          <p>• Gradual rollout</p>
                          <p>• Lower risk</p>
                        </div>
                      </div>
                      <div className="glass bg-muted/30 p-3 rounded-lg border border-primary/20 backdrop-blur-sm shadow-sm">
                        <p className="text-xs font-bold text-primary mb-1.5">Route C: Hybrid</p>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p>• Mix of approaches</p>
                          <p>• Balanced timeline</p>
                          <p>• Medium investment</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Each route comes with 3 sub-steps. Choose the one that fits your resources, risk tolerance, and timeline.
                    </p>
                  </div>
                </div>
              </div>
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
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Clarify & Reroute at any level</span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics Section */}
      <section className="py-12 bg-gradient-to-r from-muted/20 via-muted/5 to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 font-display">
              Proven Results Speak Louder Than Promises
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands who've transformed their AI journey from overwhelming to outstanding
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text-primary mb-1">15K+</div>
              <div className="text-sm font-semibold mb-1">Jump Plans Created</div>
              <div className="text-xs text-muted-foreground">Personalized strategies delivered</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold gradient-text-primary mb-1">94%</div>
              <div className="text-sm font-semibold mb-1">Implementation Rate</div>
              <div className="text-xs text-muted-foreground">Users deploy their plans</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold gradient-text-primary mb-1">3.2x</div>
              <div className="text-sm font-semibold mb-1">Faster Results</div>
              <div className="text-xs text-muted-foreground">vs DIY approaches</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold gradient-text-primary mb-1">4.8★</div>
              <div className="text-sm font-semibold mb-1">User Rating</div>
              <div className="text-xs text-muted-foreground">2,800+ reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose JumpinAI Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 font-display">
              The <span className="gradient-text-primary">JumpinAI Advantage</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Complete 3-tab system designed for clarity, adaptability, and immediate action
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            {/* Benefits List */}
            <div className="space-y-4 order-2 lg:order-1">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1 font-display">Strategic Overview Tab</h3>
                  <p className="text-sm text-muted-foreground">Executive summary, situation analysis with challenges & opportunities, strategic vision, and complete roadmap—understand your entire transformation at a glance.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1 font-display">Adaptive Plan Tab</h3>
                  <p className="text-sm text-muted-foreground">Phased steps with multi-level clarification (4 levels deep) and alternative routes (3 per step)—never feel stuck, always have options to move forward.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1 font-display">Tools & Prompts Tab</h3>
                  <p className="text-sm text-muted-foreground">9 curated tool-prompt combos correlated to your plan—each with main tool + 2 alternatives, ready-to-use prompts, and complete guidance for immediate execution.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1 font-display">Instant Personalization</h3>
                  <p className="text-sm text-muted-foreground">Your complete 3-tab Jump generated in 2 minutes—fully customized to your goals, industry, experience level, and specific situation.</p>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-xl blur-2xl opacity-40"></div>
              <div className="relative glass rounded-xl p-4 sm:p-6 border border-primary/10 shadow-md">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-center font-display">JumpinAI vs DIY Research</h3>
                
                <div className="space-y-2.5">
                  {/* Row 1 */}
                  <div className="glass bg-muted/20 rounded-lg p-3 border border-primary/10">
                    <div className="font-medium text-sm mb-2">Strategic Foundation</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Complete Overview</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Scattered Info</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="glass bg-muted/20 rounded-lg p-3 border border-primary/10">
                    <div className="font-medium text-sm mb-2">Plan Adaptability</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>4 Levels + 3 Routes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Static Steps</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="glass bg-muted/20 rounded-lg p-3 border border-primary/10">
                    <div className="font-medium text-sm mb-2">Execution Tools</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>9 Ready Combos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Find Your Own</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="glass bg-muted/20 rounded-lg p-3 border border-primary/10">
                    <div className="font-medium text-sm mb-2">Time to Start</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>2 Minutes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Weeks/Months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Complete Clone from Pricing Page */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text-primary mb-6 font-display">
              Choose Your AI Transformation Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
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
                const loadingKey = plan.name.toLowerCase().replace(' plan', '').replace(' ', '_');
                const isLoading = loadingSubscription[loadingKey];
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
                          onClick={() => isUsersPlan ? null : handleSubscribe(plan.name)}
                          disabled={isLoading || isUsersPlan}
                          className="relative group w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {/* Liquid glass glow effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                          
                          {/* Button */}
                          <div className={`relative flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border transition-all duration-300 overflow-hidden ${isUsersPlan ? 'border-border/30' : 'border-primary/30 group-hover:border-primary/50'}`}>
                            {/* Shimmer effect */}
                            {!isUsersPlan && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            )}
                            
                            {/* Content */}
                            <span className={`relative font-bold transition-colors duration-300 ${isUsersPlan ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                              {isLoading ? 'Processing...' : isUsersPlan ? 'Current Plan' : 'Get Started'}
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
      <section className="py-12 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about transforming your business with JumpinAI Studio
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 rounded-lg glass hover:glass-dark transition-all duration-300">
              <h3 className="text-base font-bold mb-1.5 font-display">What exactly is a "Jump" and what do I receive?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">A Jump is your complete AI transformation blueprint delivered in 3 comprehensive tabs: Overview (executive summary, situation analysis, strategic vision & roadmap), Plan (detailed action steps with multi-level clarification up to 4 levels deep and 3 alternative routes per step), and Tools & Prompts (9 tool-prompt combinations, each with a main tool plus 2 alternatives and ready-to-use prompts with guidance).</p>
            </div>

            <div className="p-4 rounded-lg glass hover:glass-dark transition-all duration-300">
              <h3 className="text-base font-bold mb-1.5 font-display">How does the multi-level clarification work in the Plan tab?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Each step in your action plan can be clarified up to 4 levels deep, breaking down complex tasks into granular, actionable sub-steps. You simply click on any step to reveal deeper layers of detail, ensuring you understand exactly what to do at every stage.</p>
            </div>

            <div className="p-4 rounded-lg glass hover:glass-dark transition-all duration-300">
              <h3 className="text-base font-bold mb-1.5 font-display">What are alternative routes and why do I need them?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Every step in your Plan offers 3 different implementation routes - giving you flexibility to choose the approach that best fits your resources, timeline, and constraints. If one path doesn't work, you have two more proven alternatives ready to go.</p>
            </div>

            <div className="p-4 rounded-lg glass hover:glass-dark transition-all duration-300">
              <h3 className="text-base font-bold mb-1.5 font-display">How do the 9 tool-prompt combinations work?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Each of the 9 combos in the Tools & Prompts tab is directly correlated to steps in your Plan. You get a main AI tool recommendation plus 2 alternatives, along with a ready-to-use, customized prompt with complete guidance on how to use it effectively for that specific step.</p>
            </div>

            <div className="p-4 rounded-lg glass hover:glass-dark transition-all duration-300">
              <h3 className="text-base font-bold mb-1.5 font-display">Is my Jump personalized to my specific situation?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Absolutely. Every Jump is fully customized based on your specific business context, industry, role, current AI experience level, resources, and goals. No generic templates - each Jump is uniquely crafted for your situation.</p>
            </div>

            <div className="p-4 rounded-lg glass hover:glass-dark transition-all duration-300">
              <h3 className="text-base font-bold mb-1.5 font-display">Do I need technical expertise to implement my Jump?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Not at all. Every component of your Jump - from the strategic roadmap to the tool-prompt combinations - is designed for business professionals without technical backgrounds. We provide clear, step-by-step guidance that anyone can follow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Major Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 font-display gradient-text-primary">
              Ready to Jump into AI Success?
            </h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 text-muted-foreground">
              Join 15,000+ professionals who've transformed their AI journey with personalized Jump plans
            </p>
            <p className="text-sm sm:text-base mb-8 sm:mb-10 text-muted-foreground max-w-3xl mx-auto px-4">
              Stop struggling with AI implementation. Get your complete transformation blueprint in 2 minutes, not months. Your competitive advantage starts today.
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
                    Start Your Jump Now - Free Try
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/10 to-muted-foreground/20 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/20 backdrop-blur-xl rounded-[2rem] border border-border/30 group-hover:border-border/50 transition-all duration-300 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative text-sm sm:text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    View Plans & Pricing
                  </span>
                  
                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-xl bg-muted-foreground/10 group-hover:bg-muted-foreground/20 transition-all duration-300">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                Free trial available
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                94% implementation success rate
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
    </div>
  );
};

export default Index;