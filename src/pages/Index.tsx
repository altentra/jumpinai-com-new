import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LeadMagnet from "@/components/LeadMagnet";
import BookPromotion from "@/components/BookPromotion";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { GoogleSheetsTest } from "@/components/GoogleSheetsTest";

const Index = () => {
  // Show test component only in development or when URL contains 'test'
  const showTest = window.location.hostname === 'localhost' || 
                   window.location.search.includes('test=true') ||
                   window.location.pathname.includes('test');

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
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text-primary mb-6 font-display">
              Stop Struggling with AI Implementation
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Get your complete AI transformation blueprint in minutes. JumpinAI Studio creates personalized action plans that turn AI confusion into competitive advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Personalized Jump Plans */}
            <div className="group relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">Strategic Action Plans</h3>
              <p className="text-muted-foreground mb-6">
                Stop wandering aimlessly in the AI landscape. Get clear, step-by-step roadmaps tailored to your exact goals, industry, and current AI experience level.
              </p>
              <div className="text-sm font-semibold text-primary">
                ✓ Industry-specific strategies<br/>
                ✓ Clear execution timelines<br/>
                ✓ Risk-assessed recommendations
              </div>
            </div>

            {/* AI Tool Selection */}
            <div className="group relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">Curated AI Tool Lists</h3>
              <p className="text-muted-foreground mb-6">
                End tool overwhelm forever. Receive hand-picked AI tools specifically chosen for your use case, complete with setup guides and optimization tips.
              </p>
              <div className="text-sm font-semibold text-secondary">
                ✓ Pre-vetted tools only<br/>
                ✓ Cost-benefit analysis<br/>
                ✓ Integration guidance included
              </div>
            </div>

            {/* Ready-to-Use Resources */}
            <div className="group relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">Complete Resource Package</h3>
              <p className="text-muted-foreground mb-6">
                Get 4 custom prompts, 4 workflows, 4 blueprints, and 4 strategies ready for immediate deployment. No more starting from scratch.
              </p>
              <div className="text-sm font-semibold text-accent">
                ✓ 16 ready-to-use resources<br/>
                ✓ Customized for your goals<br/>
                ✓ Instant implementation
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
              Powered by leading AI technologies
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-70 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                AI
              </div>
              OpenAI GPT
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-secondary rounded-lg flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                C
              </div>
              Claude AI
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-accent rounded-lg flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                G
              </div>
              Gemini
            </div>
            <div className="flex items-center gap-2 text-lg lg:text-xl font-bold text-foreground">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                ∞
              </div>
              Machine Learning
            </div>
          </div>
        </div>
      </section>

      {/* How JumpinAI Studio Works */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-display">
              From Confusion to <span className="gradient-text-primary">Clarity in Minutes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Skip months of research and trial-and-error. Our AI analyzes your situation and delivers your personalized Jump in AI plan.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                    01
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">Share Your Goals</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Tell us your objectives, current challenges, industry, and AI experience. Our intelligent form adapts to gather exactly what we need to help you.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-10 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              </div>

              <div className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-secondary to-secondary/70 rounded-full flex items-center justify-center text-secondary-foreground text-2xl font-bold shadow-lg">
                    02
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">AI Analysis & Generation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI instantly analyzes your needs and generates your comprehensive Jump plan with strategic roadmap, tools, prompts, workflows, and blueprints.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-10 -right-6 w-12 h-0.5 bg-gradient-to-r from-secondary to-transparent"></div>
              </div>

              <div className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-accent to-accent/70 rounded-full flex items-center justify-center text-accent-foreground text-2xl font-bold shadow-lg">
                    03
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">Start Implementing</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Follow your step-by-step plan and use your custom resources immediately. Save to dashboard for ongoing access and track your progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-lg font-semibold">Complete personalized plan generated in under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics Section */}
      <section className="py-20 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30 dark:from-muted/20 dark:via-muted/5 dark:to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-display">
              Proven Results Speak Louder Than Promises
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands who've transformed their AI journey from overwhelming to outstanding
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">15K+</div>
                <div className="text-lg font-semibold mb-2">Jump Plans Created</div>
                <div className="text-sm text-muted-foreground">Personalized AI strategies delivered</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">94%</div>
                <div className="text-lg font-semibold mb-2">Implementation Rate</div>
                <div className="text-sm text-muted-foreground">Users actually deploy their plans</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">3.2x</div>
                <div className="text-lg font-semibold mb-2">Faster Results</div>
                <div className="text-sm text-muted-foreground">Compared to DIY approaches</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">4.8★</div>
                <div className="text-lg font-semibold mb-2">User Rating</div>
                <div className="text-sm text-muted-foreground">Based on 2,800+ reviews</div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto p-8 rounded-2xl glass border border-primary/20">
              <h3 className="text-2xl font-bold mb-4 font-display">Real Success Story</h3>
              <p className="text-lg text-muted-foreground mb-6">
                "JumpinAI Studio gave me the exact roadmap I needed. In 30 days, I implemented AI tools that increased my productivity by 300% and saved 15 hours per week."
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span>Michael Chen, Marketing Director</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose JumpinAI Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-display">
              Why JumpinAI Studio Beats <span className="gradient-text-primary">Everything Else</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop wasting time on generic advice and expensive consultants. Get personalized, actionable AI strategies that actually work.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-display">Instant Personalization</h3>
                  <p className="text-muted-foreground">Skip months of research. Get AI strategies tailored to your exact industry, role, and experience level in minutes.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-display">Complete Resource Package</h3>
                  <p className="text-muted-foreground">No more hunting for resources. Get 16 ready-to-use items: prompts, workflows, blueprints, and strategies all in one place.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-display">Fraction of Consultant Cost</h3>
                  <p className="text-muted-foreground">Get enterprise-level AI strategy for the price of a coffee. No $10,000 consultant fees, no month-long delays.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-3xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-background via-muted/30 to-background rounded-2xl p-8 border border-border/50">
                <h3 className="text-2xl font-bold mb-6 text-center font-display">What You Get vs Alternatives</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <span className="font-medium">Personalized strategy</span>
                    <div className="flex gap-2">
                      <span className="text-green-500 font-bold">✓ JumpinAI</span>
                      <span className="text-red-500">✗ Generic guides</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                    <span className="font-medium">Ready-to-use resources</span>
                    <div className="flex gap-2">
                      <span className="text-green-500 font-bold">✓ 16 items</span>
                      <span className="text-red-500">✗ DIY research</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                    <span className="font-medium">Implementation time</span>
                    <div className="flex gap-2">
                      <span className="text-green-500 font-bold">✓ 2 minutes</span>
                      <span className="text-red-500">✗ Weeks/months</span>
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
              <span className="font-semibold text-foreground">1 credit = 1 Jump generation</span> - each Jump includes a comprehensive AI transformation plan with strategies, tools, workflows, and actionable blueprints tailored to your business.
            </p>
          </div>

          {/* All 4 Subscription Plans */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 sm:gap-6 min-w-max px-2 sm:px-4 md:px-0 md:justify-center md:flex-wrap md:max-w-7xl md:mx-auto pt-4">
              {/* Free Plan */}
              <div className="relative flex flex-col w-72 sm:w-56 md:w-64 lg:w-72 flex-shrink-0 min-h-[500px] glass hover:glass-dark transition-all duration-300 shadow-modern hover:shadow-modern-lg rounded-2xl border-0">
                <div className="text-center pb-6 p-6">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
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
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                  </div>
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
                    <div className="w-full modern-button shadow-modern bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-lg font-semibold cursor-pointer text-center">
                      Get Started
                    </div>
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
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"></path>
                    </svg>
                  </div>
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
                    <div className="w-full modern-button shadow-modern bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-lg font-semibold cursor-pointer text-center">
                      Get Started
                    </div>
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
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
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
                    <div className="w-full modern-button shadow-modern bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-lg font-semibold cursor-pointer text-center">
                      Get Started
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a href="/pricing" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors">
              View All Plans & Pricing
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about transforming your business with JumpinAI Studio
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 font-display">How quickly can I see results from my Jump?</h3>
              <p className="text-muted-foreground">Most users see immediate clarity within minutes of receiving their Jump plan, with measurable improvements starting within 1-2 weeks of implementation. Our personalized strategies are designed for rapid deployment.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 font-display">What exactly do I get in each Jump plan?</h3>
              <p className="text-muted-foreground">Every Jump includes a strategic action plan, curated AI tool list, 4 custom prompts, 4 workflows, 4 blueprints, and 4 strategies - all tailored to your specific goals, industry, and experience level. It's a complete transformation package.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 font-display">Do I need technical expertise to implement the strategies?</h3>
              <p className="text-muted-foreground">Not at all. Every Jump includes step-by-step implementation guides, tool setup instructions, and clear timelines. Our plans are designed for business leaders and professionals, not technical experts.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 font-display">Can I customize my Jump based on my specific industry?</h3>
              <p className="text-muted-foreground">Absolutely. JumpinAI Studio creates completely customized strategies based on your specific business context, industry dynamics, role, and current AI experience level. Every plan is unique to your situation.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 font-display">What happens if I'm not satisfied with my Jump plan?</h3>
              <p className="text-muted-foreground">We have a 94% implementation rate because our plans work. However, if you're not satisfied, contact our support team and we'll work with you to refine your strategy or provide additional guidance at no extra cost.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Major Final CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-muted/30 to-background dark:from-black dark:via-muted/10 dark:to-black relative overflow-hidden">
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
      <LeadMagnet />
      <BookPromotion />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;