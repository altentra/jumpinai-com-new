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

      <Features />

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
              <span className="font-semibold text-foreground">1 credit = 1 Jump generation</span> - each Jump includes a comprehensive AI transformation plan with strategies, tools, workflows, and actionable blueprints tailored to your business.
            </p>
          </div>

          {/* All 4 Subscription Plans */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 sm:gap-6 min-w-max px-2 sm:px-4 md:px-0 md:justify-center md:flex-wrap md:max-w-7xl md:mx-auto pt-4">
              {/* Free Plan */}
              <div className="relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                <div className="text-center pb-6 p-6">
                  <h3 className="text-xl font-bold">Free Plan</h3>
                  <p className="text-sm text-muted-foreground">Perfect for getting started with AI transformation</p>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">Free</div>
                    <div className="text-sm text-muted-foreground mt-1">5 credits</div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6 pt-0">
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>5 welcome credits</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Basic AI transformation plans</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Community support</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Access to free resources</span>
                    </li>
                  </ul>
                  
                  <div className="mt-auto">
                    <div className="w-full modern-button shadow-modern border border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground px-4 py-2 rounded-lg font-semibold cursor-pointer text-center">
                      Current Plan
                    </div>
                  </div>
                </div>
              </div>

              {/* Starter Plan */}
              <div className="relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                <div className="text-center pb-6 p-6">
                  <h3 className="text-xl font-bold">Starter Plan</h3>
                  <p className="text-sm text-muted-foreground">Ideal for individuals exploring AI solutions</p>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      $15
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">40 credits monthly</div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6 pt-0">
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>40 monthly credits</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Priority AI generation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Email support</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Access to all guides & resources</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Credit rollover</span>
                    </li>
                  </ul>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => handleSubscribe('Starter Plan')}
                      disabled={loadingSubscription['starter']}
                      className="w-full modern-button shadow-modern bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold cursor-pointer text-center transition-colors disabled:opacity-50"
                    >
                      {loadingSubscription['starter'] ? 'Processing...' : 'Get Started'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-steel rounded-2xl border-0">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-primary text-primary-foreground shadow-modern rounded-full px-3 py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
                
                <div className="text-center pb-6 p-6">
                  <h3 className="text-xl font-bold">Pro Plan</h3>
                  <p className="text-sm text-muted-foreground">Best for professionals and small teams</p>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      $39
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">150 credits monthly</div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6 pt-0">
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>150 monthly credits</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Priority processing</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Advanced AI models</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Phone & email support</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Custom workflows</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Credit rollover</span>
                    </li>
                  </ul>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => handleSubscribe('Pro Plan')}
                      disabled={loadingSubscription['pro']}
                      className="w-full modern-button shadow-modern bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold cursor-pointer text-center transition-colors disabled:opacity-50"
                    >
                      {loadingSubscription['pro'] ? 'Processing...' : 'Get Started'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Growth Plan */}
              <div className="relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-modern rounded-full px-3 py-1 text-sm font-semibold">
                    Best Value
                  </div>
                </div>
                
                <div className="text-center pb-6 p-6">
                  <h3 className="text-xl font-bold">Growth Plan</h3>
                  <p className="text-sm text-muted-foreground">Perfect for growing businesses and teams</p>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      $79
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">400 credits monthly</div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6 pt-0">
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>400 monthly credits</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Fastest processing</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Premium AI models</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Team collaboration tools</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Priority feature requests</span>
                    </li>
                  </ul>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => handleSubscribe('Growth Plan')}
                      disabled={loadingSubscription['growth']}
                      className="w-full modern-button shadow-modern bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold cursor-pointer text-center transition-colors disabled:opacity-50"
                    >
                      {loadingSubscription['growth'] ? 'Processing...' : 'Get Started'}
                    </button>
                  </div>
                </div>
              </div>
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
              <p className="text-sm text-muted-foreground">Every Jump includes a strategic action plan, curated AI tool list, 4 custom prompts, 4 workflows, 4 blueprints, and 4 strategies - all tailored to your specific goals and industry.</p>
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
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background/80 to-background dark:from-black dark:via-gray-950/80 dark:to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 font-display gradient-text-primary">
              Ready to Jump into AI Success?
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-muted-foreground">
              Join 15,000+ professionals who've transformed their AI journey with personalized Jump plans
            </p>
            <p className="text-lg mb-12 text-muted-foreground max-w-3xl mx-auto">
              Stop struggling with AI implementation. Get your complete transformation blueprint in minutes, not months. Your competitive advantage starts today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a href="/jumpinai-studio" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-bold hover:bg-primary/90 transition-colors shadow-2xl">
                Start Your Jump Now - Free Try
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </a>
              <a href="/pricing" className="inline-flex items-center gap-2 border border-border bg-card hover:bg-accent hover:text-accent-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                View Plans & Pricing
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
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