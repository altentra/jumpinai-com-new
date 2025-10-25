import React, { useState, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuth();
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

      {/* What JumpinAI Studio Actually Does - Features Section */}
      <section className="py-12 sm:py-16 lg:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-3 sm:mb-4 font-display px-4">
              Ready to Make Your AI Jump?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              Don't wait months to see AI results. Get your personalized Jump plan in 2 minutes and start transforming your life and business today. Join 15,000+ professionals who've already made the leap.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Strategic Action Plans */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 font-display">Strategic Action Plans</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Clear, step-by-step roadmaps tailored to your exact goals, industry, and experience level.
              </p>
              <div className="text-xs text-primary space-y-1">
                <div>✓ Industry-specific strategies</div>
                <div>✓ Clear execution timelines</div>
                <div>✓ Risk-assessed recommendations</div>
              </div>
            </div>

            {/* AI Tool Selection */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 font-display">Curated AI Tool Lists</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hand-picked AI tools specifically chosen for your use case with setup guides and optimization tips.
              </p>
              <div className="text-xs text-white space-y-1">
                <div>✓ Pre-vetted tools only</div>
                <div>✓ Cost-benefit analysis</div>
                <div>✓ Integration guidance included</div>
              </div>
            </div>

            {/* Complete Resource Package */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 font-display">Ready Resources</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive analysis of your situation, strategic action plan, and 9 personalized batches of tools and prompts to get you started immediately.
              </p>
              <div className="text-xs text-white space-y-1">
                <div>✓ Situational analysis</div>
                <div>✓ Strategic action plan</div>
                <div>✓ 9 personalized tool & prompt batches</div>
              </div>
            </div>

            {/* AI Coach & Support */}
            <div className="group relative p-6 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 font-display">AI Coach & Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ongoing guidance with AI coach conversations and comprehensive support system.
              </p>
              <div className="text-xs text-white space-y-1">
                <div>✓ AI coaching sessions</div>
                <div>✓ Implementation support</div>
                <div>✓ Progress tracking</div>
              </div>
            </div>
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
              Skip months of research and trial-and-error. Our AI analyzes your situation and delivers your personalized Jump in AI plan.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              <div className="text-center p-6 rounded-xl glass h-full flex flex-col">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">01</div>
                <h3 className="text-lg font-bold mb-2 font-display">Share Your Goals</h3>
                <p className="text-sm text-muted-foreground flex-1">Tell us your objectives, challenges, industry, and AI experience level.</p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass h-full flex flex-col">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">02</div>
                <h3 className="text-lg font-bold mb-2 font-display">AI Analysis</h3>
                <p className="text-sm text-muted-foreground flex-1">Our AI generates your comprehensive Jump plan with roadmap, tools, and resources.</p>
              </div>
              
              <div className="text-center p-6 rounded-xl glass h-full flex flex-col">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">03</div>
                <h3 className="text-lg font-bold mb-2 font-display">Start Implementing</h3>
                <p className="text-sm text-muted-foreground flex-1">Follow your plan and use custom resources immediately with dashboard access.</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/10 rounded-xl border border-primary/20">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-semibold">Complete personalized plan generated in 2 minutes</span>
              </div>
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
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 font-display">
              The <span className="gradient-text-primary">JumpinAI Advantage</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Transform how you approach AI implementation with personalized strategies designed specifically for your business needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Benefits List */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 font-display">Personalized AI Roadmaps</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Every Jump plan is customized to your industry, role, experience level, and specific business goals—helping you cut through the noise and focus on what matters.</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 font-display">Complete Implementation Kit</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Receive a comprehensive package including situational analysis, strategic action plan, and 9 curated tool-prompt combinations ready to deploy immediately.</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 font-display">Rapid Implementation</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Get your complete AI transformation strategy in minutes instead of spending weeks researching. Start implementing immediately with clear, actionable steps.</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 font-display">Accessible & Affordable</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Professional AI strategy guidance at a fraction of traditional consulting costs, with flexible plans that scale with your needs.</p>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-3xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-background via-muted/30 to-background rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-border/50">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center font-display">JumpinAI vs Traditional Approaches</h3>
                
                {/* Mobile-optimized table */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Row 1 */}
                  <div className="glass rounded-lg p-3 sm:p-4">
                    <div className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Personalized Strategy</div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>JumpinAI</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Generic Guides</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="glass rounded-lg p-3 sm:p-4">
                    <div className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Implementation Resources</div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Complete Kit</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Self Research</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="glass rounded-lg p-3 sm:p-4">
                    <div className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Time to Start</div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>2 Minutes</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Weeks/Months</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="glass rounded-lg p-3 sm:p-4">
                    <div className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Cost</div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Affordable Plans</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>$10K+ Consulting</span>
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
                
                return (
                  <div key={plan.id} className={`relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0 ${isMostPopular ? 'shadow-steel' : ''}`}>
                    {(isMostPopular || isBestValue) && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className={`${isBestValue ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-primary'} text-${isBestValue ? 'white' : 'primary-foreground'} shadow-modern rounded-full px-3 py-1 text-sm font-semibold`}>
                          {isBestValue ? 'Best Value' : 'Most Popular'}
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
                          onClick={() => isFree ? null : handleSubscribe(plan.name)}
                          disabled={isLoading || isFree}
                          className={`w-full modern-button shadow-modern ${isFree ? 'border border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'} px-4 py-2 rounded-lg font-semibold cursor-pointer text-center transition-colors disabled:opacity-50`}
                        >
                          {isLoading ? 'Processing...' : isFree ? 'Current Plan' : 'Get Started'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-8">
            <a href="/pricing" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl">
              View All Plans & Pricing
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about transforming your business with JumpinAI Studio
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-5 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-2 font-display">How quickly can I see results from my Jump?</h3>
              <p className="text-sm text-muted-foreground">Most users see immediate clarity within minutes of receiving their Jump plan, with measurable improvements starting within 1-2 weeks of implementation.</p>
            </div>

            <div className="p-5 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-2 font-display">What exactly do I get in each Jump plan?</h3>
              <p className="text-sm text-muted-foreground">Every Jump includes a detailed analysis of your situation, a strategic action plan, and 9 personalized batches of tools and prompts to help you get started - all tailored to your specific goals and industry.</p>
            </div>

            <div className="p-5 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-2 font-display">Do I need technical expertise to implement the strategies?</h3>
              <p className="text-sm text-muted-foreground">Not at all. Every Jump includes step-by-step implementation guides, tool setup instructions, and clear timelines designed for business professionals.</p>
            </div>

            <div className="p-5 rounded-xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-lg font-bold mb-2 font-display">Can I customize my Jump based on my specific industry?</h3>
              <p className="text-sm text-muted-foreground">Absolutely. JumpinAI Studio creates completely customized strategies based on your specific business context, industry dynamics, role, and current AI experience level.</p>
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
              <a href="/jumpinai-studio" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-modern hover:shadow-modern-lg hover:scale-[1.02] group">
                <span className="gradient-text-primary transition-colors">Start Your Jump Now - Free Try</span>
                <svg className="w-4 h-4 text-primary transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </a>
              <a href="/pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 shadow-modern hover:shadow-modern-lg hover:scale-[1.02] group">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">View Plans & Pricing</span>
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
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