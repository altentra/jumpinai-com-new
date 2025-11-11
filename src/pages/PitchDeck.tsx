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
            <div className="relative inline-block mb-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
                Pitch Deck
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-3">
              JumpinAI - Your Personalized AI Adaptation Studio
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Revolutionizing how individuals and businesses adopt AI through intelligent, personalized transformation plans — delivering unprecedented speed, clarity, and actionability.
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
            
            <div className="space-y-6 mb-6">
            <p className="text-base text-muted-foreground leading-relaxed">
              The AI revolution has created a paradox: while AI capabilities advance exponentially, actual adoption and successful implementation lag dramatically behind. Organizations and individuals face a fundamental disconnect between AI's promise and their ability to harness it effectively.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass backdrop-blur-sm bg-background/25 border border-destructive/20 rounded-xl p-5 space-y-3">
                <h3 className="text-base font-bold text-foreground">The Personalization Crisis</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generic AI consulting and cookie-cutter frameworks fundamentally misunderstand the nature of successful transformation. Every organization operates within unique constraints: distinct industry regulations, legacy technology stacks, team skill distributions, budget limitations, cultural dynamics, and strategic priorities. Yet the market offers predominantly standardized solutions that ignore these critical contextual factors.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The result: <span className="text-foreground font-semibold">78% of AI transformation initiatives fail</span> not because AI doesn't work, but because the implementation strategy doesn't fit the specific organizational reality.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 border border-destructive/20 rounded-xl p-5 space-y-3">
                <h3 className="text-base font-bold text-foreground">The Implementation Gap</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Awareness doesn't equal capability. People understand AI is transformative and feel pressure to adapt, yet face a daunting implementation gap. Research shows <span className="text-foreground font-semibold">individuals invest 40+ hours</span> researching AI strategies, consuming countless articles, webinars, and courses. Despite this investment, they remain paralyzed at the starting line.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This isn't a knowledge problem—it's an <span className="text-foreground font-semibold">actionability problem</span>. The market floods users with conceptual frameworks and theoretical benefits while failing to deliver concrete, personalized, step-by-step guidance.
                </p>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 border border-destructive/20 rounded-xl p-5 space-y-3">
                <h3 className="text-base font-bold text-foreground">The Adaptation Void</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real transformation is non-linear. Even with a personalized initial plan, implementation invariably encounters unexpected obstacles: technology limitations, stakeholder resistance, budget changes, competitive pressures, or shifting organizational priorities. In these critical moments, users need adaptive guidance—alternative approaches, deeper clarification, or strategic pivots.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Traditional solutions offer static documents that become obsolete the moment reality deviates from assumptions. This creates an <span className="text-foreground font-semibold">adaptation void</span>: when users most need intelligent guidance to navigate obstacles, they're abandoned with outdated plans and no recourse.
                </p>
              </div>
            </div>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
              <div className="text-center space-y-2">
                <p className="text-base font-bold text-foreground">
                  Market Opportunity: <span className="text-primary text-xl">$12.4B</span> AI Education & Transformation Market by 2027
                </p>
                <p className="text-sm text-muted-foreground">
                  Millions of individuals, entrepreneurs, and organizations desperately need a solution that bridges the gap between AI's potential and their ability to realize it
                </p>
              </div>
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
              <div className="space-y-5 mb-6">
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                    The World's First Truly Adaptive AI Transformation Platform
                  </h3>
                  <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-4">
                    3-Tab System: From 2 Questions to Complete Personalized Blueprint in 2 Minutes
                  </p>
                </div>
                
                <div className="glass backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl p-6">
                  <p className="text-sm text-foreground leading-relaxed text-center">
                    JumpinAI solves the personalization crisis, implementation gap, and adaptation void simultaneously. Our AI engine analyzes your unique context through an intelligent questionnaire, then generates a comprehensive transformation blueprint tailored specifically to your situation. Unlike static consulting or generic AI advice, our platform adapts in real-time as your needs evolve—providing multi-level clarifications, alternative strategies, and continuous optimization through AI coaching.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="glass backdrop-blur-sm bg-background/25 border border-primary/20 rounded-xl p-5">
                    <h4 className="text-base font-bold text-foreground mb-3">Hyper-Personalization at Scale</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Every Jump uniquely tailored to your industry, role, team size, budget, technical capabilities, and strategic goals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Multi-model AI orchestration with xAI as our primary choice, supplemented by ChatGPT-5, Claude, and Gemini for optimal analysis depth and personalization accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Comprehensive transformation delivered in ~2 minutes, not months of consulting</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 border border-primary/20 rounded-xl p-5">
                    <h4 className="text-base font-bold text-foreground mb-3">True Adaptability</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>4-level deep clarification system: drill down into any step for granular guidance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>3 alternative routes per step: pivot when obstacles arise or circumstances change</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>AI Coach for continuous refinement and strategic adjustments post-generation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-center text-foreground mb-4">The 3-Tab Transformation System</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
                      <h4 className="text-base font-bold text-foreground">Overview Tab</h4>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="leading-relaxed">Strategic foundation with executive-level analysis that grounds your entire journey.</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">Current Situation Analysis:</span> Comprehensive assessment of your starting point</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">Strategic Vision & Objectives:</span> Clear articulation of transformation goals</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">High-Level Roadmap:</span> Strategic phases from current to desired state</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
                      <h4 className="text-base font-bold text-foreground">Adaptive Plan Tab</h4>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="leading-relaxed">Your execution plan isn't just detailed—it's living and responsive.</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">Step-by-step guidance</span> with milestones and timelines</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">4-Level Clarification:</span> Drill down for granular details when needed</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">3 Alternative Routes:</span> Pivot when obstacles arise or circumstances change</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
                      <h4 className="text-base font-bold text-foreground">Tools & Prompts Tab</h4>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="leading-relaxed">Bridge the gap from strategy to execution with ready-to-use tools.</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">9 Custom Tool-Prompt Combinations</span> for your transformation</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">Copy-Paste Ready:</span> No prompt engineering required</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span><span className="font-semibold text-foreground">AI Coach Access:</span> Ongoing guidance and optimization</span>
                        </li>
                      </ul>
                    </div>
                  </div>
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
                <h3 className="text-lg font-bold mb-4 text-foreground">Explosive Market Growth</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">$467B+</div>
                    <p className="text-sm text-muted-foreground font-semibold">Global AI Market Size (November 2025)</p>
                    <p className="text-xs text-muted-foreground mt-1">Growing at 37.3% CAGR through 2030</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5 italic">Source: Fortune Business Insights, November 2025</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">$15.8B</div>
                    <p className="text-sm text-muted-foreground font-semibold">AI Education & Training Market (November 2025)</p>
                    <p className="text-xs text-muted-foreground mt-1">CAGR: 46.3% through 2028</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5 italic">Source: MarketsandMarkets Research, November 2025</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">520M+</div>
                    <p className="text-sm text-muted-foreground font-semibold">Knowledge Workers Globally</p>
                    <p className="text-xs text-muted-foreground mt-1">All requiring AI transformation guidance</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5 italic">Potential addressable market for personalized AI transformation</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-2xl font-bold text-primary mb-1">92%</div>
                    <p className="text-sm text-muted-foreground font-semibold">Organizations Adopting AI by End of 2025</p>
                    <p className="text-xs text-muted-foreground mt-1">Up from 84% in early 2025</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5 italic">Source: Gartner AI Adoption Survey, November 2025</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">Target Segments</h3>
                <div className="space-y-3">
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Individuals & Entrepreneurs (Primary)</h4>
                    <p className="text-xs text-muted-foreground mb-2">Founders, creators, and knowledge workers seeking personal AI upskilling and competitive advantage</p>
                    <p className="text-xs text-muted-foreground/80 italic">Immediate monetization through subscription and credit sales</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Small-Medium Businesses</h4>
                    <p className="text-xs text-muted-foreground mb-2">1-200 employee companies needing affordable AI transformation without expensive consultants</p>
                    <p className="text-xs text-muted-foreground/80 italic">High-value segment with team subscription potential</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Enterprise Teams (Future)</h4>
                    <p className="text-xs text-muted-foreground mb-2">Scaling AI adoption across departments with team collaboration features</p>
                    <p className="text-xs text-muted-foreground/80 italic">Largest revenue opportunity through enterprise licensing</p>
                  </div>
                  
                  <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Educational Institutions</h4>
                    <p className="text-xs text-muted-foreground mb-2">Universities and training programs preparing students for AI-driven workforce</p>
                    <p className="text-xs text-muted-foreground/80 italic">Partnership opportunities for bulk licensing</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <p className="text-xs text-muted-foreground text-center">
                    <span className="font-semibold text-foreground">Market Timing:</span> AI adoption urgency at all-time high following ChatGPT's mainstream breakthrough and enterprise AI transformation mandates
                  </p>
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
                  <h3 className="text-base font-bold text-foreground mb-1">Subscription Tiers</h3>
                  <div className="text-xl font-bold text-primary">$9–$49/month</div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><span className="font-semibold text-foreground">Starter Plan:</span> $9/month — 25 credits monthly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><span className="font-semibold text-foreground">Pro Plan:</span> $25/month — 100 credits + AI Coach access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><span className="font-semibold text-foreground">Growth Plan:</span> $49/month — 250 credits + priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>All credits roll over month-to-month and never expire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>1 credit = 1 complete Jump (3-tab transformation blueprint)</span>
                  </li>
                </ul>
              </div>
              
              <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-5">
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-foreground mb-1">Credit Packs</h3>
                  <div className="text-xs text-muted-foreground">One-Time Purchases</div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Flexible pay-as-you-go option</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>No recurring commitments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Perfect for occasional users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Credits never expire</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-bold text-foreground mb-3">Future Revenue Streams</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass backdrop-blur-sm bg-background/25 border border-primary/20 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-foreground mb-2">Enterprise Solutions</h5>
                  <p className="text-xs text-muted-foreground">Team collaboration, white-label, custom integrations, and dedicated support for organizations scaling AI adoption across departments.</p>
                </div>
                <div className="glass backdrop-blur-sm bg-background/25 border border-primary/20 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-foreground mb-2">Premium Resources</h5>
                  <p className="text-xs text-muted-foreground">Industry-specific templates, advanced analytics, expert consultations, and exclusive AI transformation guides for power users.</p>
                </div>
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
              <h4 className="text-base font-bold text-foreground mb-3 text-center">Our Strategic Position</h4>
              <p className="text-center text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                We're first-to-market with adaptive AI transformation at scale. Our technology creates compounding advantages: every Jump improves our AI, every user interaction strengthens our network effects, and our data moat deepens daily. As the market matures, we'll be established with millions of transformation journeys powering a defensible platform.
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
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Raising</div>
                  <div className="text-3xl font-bold text-primary mb-2">$500K</div>
                  <div className="text-xs text-muted-foreground">Pre-Seed Round</div>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Valuation</div>
                  <div className="text-3xl font-bold text-primary mb-2">$2M</div>
                  <div className="text-xs text-muted-foreground">Pre-money</div>
                </div>
                
                <div className="glass backdrop-blur-sm bg-background/25 dark:bg-background/15 border border-primary/20 rounded-xl p-6 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Investor Discount</div>
                  <div className="text-3xl font-bold text-primary mb-2">20%</div>
                  <div className="text-xs text-muted-foreground">Standard Discount</div>
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