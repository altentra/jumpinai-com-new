
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
      {/* Professional Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text-primary mb-6">
              Transform Your Business with AI-Powered Jump Strategies
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Don't just adapt to change—leap ahead of it. Our AI-driven transformation platform delivers complete business evolution strategies, not just suggestions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Strategic Intelligence */}
            <div className="group relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Strategic Intelligence Engine</h3>
              <p className="text-muted-foreground mb-6">
                Stop guessing your next move. Our AI analyzes your industry, competition, and market trends to deliver precision-targeted transformation roadmaps that guarantee competitive advantage.
              </p>
              <div className="text-sm font-semibold text-primary">
                ✓ Eliminate strategic blind spots<br/>
                ✓ Reduce planning time by 85%<br/>
                ✓ Increase execution success by 300%
              </div>
            </div>

            {/* Implementation Blueprints */}
            <div className="group relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready-to-Deploy Blueprints</h3>
              <p className="text-muted-foreground mb-6">
                No more theoretical advice. Get step-by-step implementation plans with exact tools, workflows, timelines, and resource requirements. Your team starts executing immediately.
              </p>
              <div className="text-sm font-semibold text-secondary">
                ✓ Zero implementation delays<br/>
                ✓ 95% faster project launches<br/>
                ✓ Guaranteed ROI within 90 days
              </div>
            </div>

            {/* Performance Optimization */}
            <div className="group relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Continuous Growth Engine</h3>
              <p className="text-muted-foreground mb-6">
                Transform once, grow forever. Our adaptive AI continuously optimizes your strategies based on real performance data, ensuring sustained competitive dominance.
              </p>
              <div className="text-sm font-semibold text-accent">
                ✓ Compound growth acceleration<br/>
                ✓ Self-optimizing operations<br/>
                ✓ Market leadership positioning
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust by Association Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
              Trusted by professionals using
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.158-2.251 4.037-1.356.88-3.108 1.226-5.317 1.044v-2.51c1.743.077 3.01-.174 3.803-.75.793-.576 1.223-1.455 1.29-2.637h-5.093V6.616h7.568v1.544z"/>
              </svg>
              OpenAI GPT
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Claude AI
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44C3.21 17.21 3 16.88 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44C11.59 2.06 11.79 2 12 2s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z"/>
              </svg>
              Stanford AI
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              MIT Technology
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Your Transformation Journey in <span className="gradient-text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From assessment to execution—our proven methodology has transformed over 10,000 businesses across 50+ industries.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    01
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Strategic Assessment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI conducts a comprehensive 360-degree analysis of your business, identifying hidden opportunities and transformation leverage points within minutes.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-10 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              </div>

              <div className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-secondary to-secondary/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    02
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Custom Jump Generation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get your personalized transformation blueprint with specific strategies, tools, workflows, and implementation timelines tailored to your unique situation.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-10 -right-6 w-12 h-0.5 bg-gradient-to-r from-secondary to-transparent"></div>
              </div>

              <div className="relative group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-accent to-accent/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    03
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Guided Execution</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Follow your step-by-step roadmap with AI coaching, progress tracking, and adaptive optimization to ensure maximum transformation success.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-lg font-semibold">Average transformation complete in 30-90 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              The Numbers Don't Lie
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real results from real businesses who chose to jump ahead with AI transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">500%</div>
                <div className="text-lg font-semibold mb-2">Average ROI</div>
                <div className="text-sm text-muted-foreground">Within first 6 months of implementation</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">10K+</div>
                <div className="text-lg font-semibold mb-2">Businesses Transformed</div>
                <div className="text-sm text-muted-foreground">Across 50+ industries globally</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">85%</div>
                <div className="text-lg font-semibold mb-2">Faster Implementation</div>
                <div className="text-sm text-muted-foreground">Compared to traditional consulting</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="p-8 rounded-2xl glass hover:glass-dark transition-all duration-300">
                <div className="text-5xl font-bold gradient-text-primary mb-2">98%</div>
                <div className="text-lg font-semibold mb-2">Success Rate</div>
                <div className="text-sm text-muted-foreground">For businesses following our blueprints</div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Join the Success Stories</h3>
              <p className="text-lg text-muted-foreground mb-6">
                "JumpinAI transformed our operations completely. We saw immediate results and sustained growth that exceeded our projections by 300%."
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span>Sarah Chen, CEO TechVenture Inc.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Smart Leaders Choose <span className="gradient-text-primary">JumpinAI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              While others offer advice, we deliver transformation. Here's what sets us apart from traditional consulting and generic AI tools.
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
                  <h3 className="text-xl font-bold mb-2">Immediate Implementation</h3>
                  <p className="text-muted-foreground">No endless research phases. Get actionable blueprints ready for deployment within hours, not months.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Guaranteed Results</h3>
                  <p className="text-muted-foreground">98% success rate with measurable ROI tracking. Your transformation success is our reputation.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Continuous Evolution</h3>
                  <p className="text-muted-foreground">Our AI learns and adapts your strategies based on real performance, ensuring sustained competitive advantage.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="p-8 rounded-2xl glass shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">Traditional vs JumpinAI</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Time to Results</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground line-through">6-12 months</div>
                      <div className="text-sm font-bold text-primary">24-48 hours</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Implementation Cost</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground line-through">$50K-500K+</div>
                      <div className="text-sm font-bold text-primary">$29-299</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Success Guarantee</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground line-through">Maybe</div>
                      <div className="text-sm font-bold text-primary">98% Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Clone from Pricing Page */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text-primary mb-6">
              Choose Your Transformation Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Flexible plans designed to accelerate your business growth
            </p>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              <span className="font-semibold text-foreground">1 credit = 1 jump generation</span> - each jump includes a comprehensive AI transformation plan with strategies, tools, workflows, and actionable blueprints tailored to your business.
            </p>
          </div>

          {/* Subscription Plans Preview */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
            <div className="relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300 border-0">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Starter Plan</h3>
                <p className="text-muted-foreground mb-4">Perfect for small businesses</p>
                <div className="mb-6">
                  <div className="text-3xl font-bold">$29<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <div className="text-sm text-muted-foreground">5 credits monthly</div>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    5 AI Jump generations
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Complete transformation blueprints
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300 border-2 border-primary/20 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
                <p className="text-muted-foreground mb-4">For growing businesses</p>
                <div className="mb-6">
                  <div className="text-3xl font-bold">$99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <div className="text-sm text-muted-foreground">20 credits monthly</div>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    20 AI Jump generations
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Advanced analytics
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative p-8 rounded-2xl glass hover:glass-dark transition-all duration-300 border-0">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Growth Plan</h3>
                <p className="text-muted-foreground mb-4">For scaling enterprises</p>
                <div className="mb-6">
                  <div className="text-3xl font-bold">$299<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <div className="text-sm text-muted-foreground">100 credits monthly</div>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    100 AI Jump generations
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    White-label options
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Dedicated success manager
                  </li>
                </ul>
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about transforming your business with JumpinAI
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3">How quickly can I see results from my Jump?</h3>
              <p className="text-muted-foreground">Most businesses see immediate clarity within hours of receiving their Jump blueprint, with measurable improvements starting within 2-4 weeks of implementation. Our 98% success rate speaks to the effectiveness of our AI-generated strategies.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3">What makes JumpinAI different from traditional consulting?</h3>
              <p className="text-muted-foreground">Unlike traditional consulting that takes months and costs thousands, JumpinAI delivers comprehensive transformation blueprints in hours at a fraction of the cost. Our AI analyzes millions of data points to create personalized strategies that guarantee results.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3">Do I need technical expertise to implement the strategies?</h3>
              <p className="text-muted-foreground">Not at all. Every Jump includes step-by-step implementation guides, recommended tools, resource requirements, and timelines. Our blueprints are designed for business leaders, not technical experts, ensuring anyone can execute successfully.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3">Can I customize my Jump based on my specific industry?</h3>
              <p className="text-muted-foreground">Absolutely. Our AI has been trained on data from 50+ industries and creates completely customized strategies based on your specific business context, industry dynamics, competition analysis, and growth objectives.</p>
            </div>

            <div className="p-6 rounded-2xl glass hover:glass-dark transition-all duration-300">
              <h3 className="text-xl font-bold mb-3">What kind of support do I get after receiving my Jump?</h3>
              <p className="text-muted-foreground">All plans include access to our AI coach for ongoing optimization, progress tracking tools, and our resource library. Pro and Growth plans also include priority support and dedicated success management for enterprise clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Major Final CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90">
              Join 10,000+ successful businesses who chose to jump ahead with AI transformation
            </p>
            <p className="text-lg mb-12 opacity-80 max-w-3xl mx-auto">
              Stop planning, start transforming. Get your first AI-powered Jump strategy in the next 24 hours and begin your journey to market leadership.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a href="/pricing" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/90 transition-colors shadow-2xl">
                Start Your Transformation Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </a>
              <a href="/auth" className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
                Try Free Jump
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-70">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                No setup fees
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                98% success guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {showTest && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>DEBUG MODE:</strong> Google Sheets Test Component
              </p>
              <div className="mt-2">
                <GoogleSheetsTest />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
