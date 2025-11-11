import { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Mail } from 'lucide-react';
import { Helmet } from "react-helmet-async";

const PitchDeck = () => {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleDownloadPDF = () => {
    // Functionality to be implemented later
    console.log("Download PDF clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
      <Helmet>
        <title>JumpinAI Pitch Deck | Investment Opportunity</title>
        <meta name="description" content="Investment pitch deck for JumpinAI - The world's first platform for truly adaptive AI transformation with complete 3-tab blueprints in 2 minutes." />
        <link rel="canonical" href={`${window.location.origin}/pitch-deck`} />
      </Helmet>
      
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-100">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
      </div>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
                Pitch Deck
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Personalized AI Transformation at Scale
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The World's First Platform for Truly Adaptive AI Transformation — Complete 3-Tab Blueprints in 2 Minutes
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                The Problem
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Generic AI Advice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Current AI solutions provide one-size-fits-all recommendations that don't account for specific business contexts, industries, team capabilities, or unique challenges.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Paralysis by Information</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Professionals spend countless hours researching, but still feel overwhelmed and unsure where to start their AI transformation journey.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Lack of Adaptability</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Existing solutions can't adjust when users hit roadblocks or need alternative approaches, leaving them stuck without support.
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
              <p className="text-sm font-semibold text-foreground text-center">
                <span className="text-primary">$12.4B</span> AI education market by 2027 — with millions struggling to implement personalized AI strategies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Our Solution
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                  Revolutionary 3-Tab Transformation System
                </h3>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  From 2 questions to complete transformation blueprint in 2 minutes
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
                    <h3 className="text-base font-bold text-foreground">Overview Tab</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Executive summary of transformation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Current situation analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Vision & strategic roadmap</span>
                    </li>
                  </ul>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold">2</div>
                    <h3 className="text-base font-bold text-foreground">Adaptive Plan Tab</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Step-by-step action plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Clarify any step up to 4 levels deep</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>3 alternative routes per step</span>
                    </li>
                  </ul>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold">3</div>
                    <h3 className="text-base font-bold text-foreground">Tools & Prompts Tab</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>9 tool-prompt combinations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Ready-to-use custom prompts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>AI Coach for ongoing guidance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Market Opportunity
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">Massive Addressable Market</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">$12.4B</div>
                    <p className="text-sm text-muted-foreground">AI Education Market by 2027</p>
                    <p className="text-xs text-muted-foreground mt-1">CAGR: 45.2%</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">500M+</div>
                    <p className="text-sm text-muted-foreground">Knowledge Workers Globally</p>
                    <p className="text-xs text-muted-foreground mt-1">Potential users seeking AI transformation</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">84%</div>
                    <p className="text-sm text-muted-foreground">Organizations Adopting AI</p>
                    <p className="text-xs text-muted-foreground mt-1">All requiring employee transformation</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">Target Segments</h3>
                <div className="space-y-3">
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">Individual Professionals</h4>
                    <p className="text-xs text-muted-foreground">Seeking personal AI upskilling and career advancement</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">Small-Medium Businesses</h4>
                    <p className="text-xs text-muted-foreground">Need affordable AI transformation without consultants</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">Enterprise Teams</h4>
                    <p className="text-xs text-muted-foreground">Scaling AI adoption across departments and divisions</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">Educational Institutions</h4>
                    <p className="text-xs text-muted-foreground">Preparing students for AI-driven workforce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Business Model
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-foreground mb-1">Freemium</h3>
                  <div className="text-xs text-muted-foreground">Growth Engine</div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>1 free Jump to experience value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Viral acquisition through free tier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Low CAC, high conversion potential</span>
                  </li>
                </ul>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-foreground mb-1">Subscription</h3>
                  <div className="text-xl font-bold text-primary">$29/month</div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Unlimited Jumps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Priority AI Coach access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Advanced analytics & insights</span>
                  </li>
                </ul>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-foreground mb-1">Enterprise</h3>
                  <div className="text-xl font-bold text-primary">Custom</div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Team collaboration tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Custom integrations & SSO</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Dedicated success manager</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="text-base font-bold text-foreground mb-3 text-center">Growth Strategy</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Phase 1: Launch</h5>
                  <p className="text-xs text-muted-foreground">Free tier viral growth, build user base, gather feedback and iterate</p>
                </div>
                <div className="text-center">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Phase 2: Scale</h5>
                  <p className="text-xs text-muted-foreground">Convert free users to paid, expand features, optimize conversion funnel</p>
                </div>
                <div className="text-center">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Phase 3: Enterprise</h5>
                  <p className="text-xs text-muted-foreground">Launch team features, enterprise sales, strategic partnerships</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Innovation & Development Stage */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Current Stage & Product Readiness
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold mb-3 text-foreground">Product Status</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Fully functional platform developed and tested</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Complete 3-tab transformation system operational</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>AI engine capable of generating personalized Jumps in ~2 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Multi-level clarification (4 deep) and rerouting (3 alternatives) proven</span>
                  </li>
                </ul>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold mb-3 text-foreground">Pre-Launch Phase</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Internal testing and refinement completed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Beta program with select early adopters underway</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Preparing for public launch with marketing infrastructure ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Validated product-market fit through early user feedback</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="text-base font-bold text-foreground mb-3 text-center">Technology Foundation</h4>
              <p className="text-center text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Built on robust, scalable architecture ready for millions of users. Our proprietary AI orchestration system integrates multiple LLM models (GPT-4o, Claude, Gemini) to deliver optimal personalization. Infrastructure tested and proven to handle enterprise-scale demand with minimal latency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Competitive Advantage
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold mb-3 text-foreground">
                  Truly Adaptive Personalization
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unlike competitors offering static templates or one-time assessments, our platform adapts in real-time with multi-level clarifications (4 deep) and alternative routes (3 per step). Every Jump is uniquely tailored to specific context, goals, and constraints.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold mb-3 text-foreground">
                  Complete Transformation Ecosystem
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We're the only solution combining strategic overview, adaptive planning, execution tools, and ongoing AI coaching in one integrated platform. Competitors offer pieces; we deliver the complete journey from insight to implementation.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold mb-3 text-foreground">
                  Speed + Simplicity + Depth
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate comprehensive 3-tab transformation blueprints in 2 minutes from just 2 questions. No competitor matches this combination of speed, ease-of-use, and depth of personalization. We've cracked the code on making sophistication simple.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold mb-3 text-foreground">
                  Scalable AI Architecture
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our proprietary AI engine generates unlimited unique transformations with minimal marginal cost. Traditional consulting scales linearly; our technology enables exponential growth with superior unit economics and defensible moats through network effects.
                </p>
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="text-base font-bold text-foreground mb-3 text-center">Why We Win</h4>
              <p className="text-center text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                We're first-to-market with adaptive AI transformation at scale. Our technology creates compounding advantages: every Jump improves our AI, every user interaction strengthens our network effects, and our data moat deepens daily. By the time competitors catch up, we'll be years ahead with millions of transformation journeys powering an unbeatable platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Our Team
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Lean, focused team with complementary expertise in AI, product development, and market strategy
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 text-center hover:border-primary/40 transition-all duration-300">
                <h3 className="text-base font-bold text-foreground mb-2">Technical Leadership</h3>
                <p className="text-xs text-muted-foreground">
                  Deep expertise in AI systems architecture, LLM orchestration, and scalable platform development with proven track record
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 text-center hover:border-primary/40 transition-all duration-300">
                <h3 className="text-base font-bold text-foreground mb-2">Product & Design</h3>
                <p className="text-xs text-muted-foreground">
                  Experience building intuitive, user-centered products with focus on simplifying complex technical capabilities
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 text-center hover:border-primary/40 transition-all duration-300">
                <h3 className="text-base font-bold text-foreground mb-2">Strategy & Growth</h3>
                <p className="text-xs text-muted-foreground">
                  Background in go-to-market strategy, business development, and scaling early-stage technology companies
                </p>
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Commitment:</span> Dedicated full-time to building the category-defining platform for personalized AI transformation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Use of Funds
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">Allocation Breakdown</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">Product Development</span>
                      <span className="text-primary font-bold">40%</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-primary/20">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 w-[40%]"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">Customer Acquisition</span>
                      <span className="text-primary font-bold">30%</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-primary/20">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 w-[30%]"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">Team Expansion</span>
                      <span className="text-primary font-bold">20%</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-primary/20">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 w-[20%]"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">Operations & Infrastructure</span>
                      <span className="text-primary font-bold">10%</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden border border-primary/20">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 w-[10%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">Key Milestones</h3>
                <div className="space-y-3">
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">Q1</div>
                      <h4 className="text-sm font-bold text-foreground">Launch Enterprise Features</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Team collaboration, SSO, advanced analytics</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">Q2</div>
                      <h4 className="text-sm font-bold text-foreground">Scale to 100K Users</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Aggressive growth marketing and partnerships</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">Q3</div>
                      <h4 className="text-sm font-bold text-foreground">International Expansion</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Multi-language support, regional customization</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">Q4</div>
                      <h4 className="text-sm font-bold text-foreground">API & Integration Platform</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Enable third-party integrations and ecosystem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Investment Opportunity
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary/60 to-transparent mx-auto"></div>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Raising</div>
                  <div className="text-3xl font-bold text-primary mb-2">$3M</div>
                  <div className="text-xs text-muted-foreground">Seed Round</div>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Valuation</div>
                  <div className="text-3xl font-bold text-primary mb-2">$15M</div>
                  <div className="text-xs text-muted-foreground">Pre-money</div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mb-6">
                <h3 className="text-lg font-bold text-foreground mb-4 text-center">Why Invest Now</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-1">First-Mover Advantage</div>
                      <div className="text-xs text-muted-foreground">Capture market before competition emerges</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-1">Product Ready</div>
                      <div className="text-xs text-muted-foreground">Fully functional platform, proven technology, ready to scale</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-1">Massive Market</div>
                      <div className="text-xs text-muted-foreground">$12.4B TAM growing 45% annually</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-1">Scalable Technology</div>
                      <div className="text-xs text-muted-foreground">AI-powered platform with minimal marginal costs per user</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                  Join us in democratizing personalized AI transformation and building the category-defining platform for the AI-powered workforce
                </p>
                
                <button 
                  onClick={() => window.location.href = '/for-investors'}
                  className="relative group overflow-hidden w-full sm:w-auto"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Mail className="relative h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="relative text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">Contact Our Team</span>
                    <ArrowRight className="relative h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download PDF Section */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
              Download Our Complete Pitch Deck
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get the full investor presentation with detailed financial projections, market analysis, and comprehensive growth strategy
            </p>
            <button
              onClick={handleDownloadPDF}
              className="relative group overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Download className="relative h-4 w-4 text-foreground group-hover:text-primary transition-colors duration-300" />
                <span className="relative text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">Download Pitch Deck PDF</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PitchDeck;