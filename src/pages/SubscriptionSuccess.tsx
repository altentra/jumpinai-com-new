import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Crown, ArrowRight, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Send welcome email to the customer
    const sendWelcomeEmail = async () => {
      if (user?.email) {
        try {
          console.log("Sending welcome email to:", user.email);
          await supabase.functions.invoke('send-subscription-welcome', {
            body: {
              customerEmail: user.email,
              customerName: user.display_name || user.email?.split('@')[0],
              subscriptionTier: 'JumpinAI Pro'
            }
          });
          console.log("✅ Welcome email sent successfully");
        } catch (error) {
          console.error("⚠️ Failed to send welcome email:", error);
          // Don't block the page if email fails
        }
      }
    };

    // Send welcome email after a short delay to ensure subscription is processed
    const emailTimer = setTimeout(sendWelcomeEmail, 2000);
    
    // Clean up URL parameters after a delay
    const urlTimer = setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);

    return () => {
      clearTimeout(emailTimer);
      clearTimeout(urlTimer);
    };
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Welcome to JumpinAI Pro! - Subscription Successful</title>
        <meta name="description" content="Welcome to JumpinAI Pro! Your subscription is active and you now have access to all premium features." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
        </div>
        <Navigation />
        
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-4">
                Welcome to JumpinAI Pro! 🎉
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your subscription is now active. You have unlimited access to all our premium AI resources and tools.
              </p>
            </div>

            {/* What's Included */}
            <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-6 w-6" />
                  What You Now Have Access To
                </CardTitle>
                <CardDescription>
                  Your JumpinAI Pro subscription includes everything you need to master AI
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Complete Blueprints Library</h3>
                        <p className="text-sm text-muted-foreground">Access all 50+ professional AI blueprints and templates</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Advanced Workflows</h3>
                        <p className="text-sm text-muted-foreground">Step-by-step workflows for complex AI implementations</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Premium Prompt Collection</h3>
                        <p className="text-sm text-muted-foreground">300+ professional prompts for every use case</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Custom Strategy Tools</h3>
                        <p className="text-sm text-muted-foreground">Advanced tools for developing AI strategies</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Priority Support</h3>
                        <p className="text-sm text-muted-foreground">Get help faster with priority email support</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Early Access</h3>
                        <p className="text-sm text-muted-foreground">Be first to try new features and content</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Monthly Training Sessions</h3>
                        <p className="text-sm text-muted-foreground">Exclusive live training with AI experts</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Analytics Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Track your AI journey with detailed insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/dashboard">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Explore Your Dashboard
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/resources">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Browse All Resources
                </Link>
              </Button>
            </div>

            {/* Getting Started Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Get Started?</CardTitle>
                <CardDescription>
                  Here are some suggestions for making the most of your Pro subscription
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg border border-border">
                    <div className="text-2xl mb-2">📚</div>
                    <h3 className="font-semibold mb-2">Explore Blueprints</h3>
                    <p className="text-sm text-muted-foreground">Start with our most popular blueprints to see immediate results</p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg border border-border">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold mb-2">Try Advanced Prompts</h3>
                    <p className="text-sm text-muted-foreground">Access our premium prompt library for better AI interactions</p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg border border-border">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-semibold mb-2">Build Your Strategy</h3>
                    <p className="text-sm text-muted-foreground">Use our strategy tools to create your AI implementation plan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Info */}
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground mb-2">
                Questions about your subscription? Need help getting started?
              </p>
              <p className="text-sm text-muted-foreground">
                Email us at <a href="mailto:support@jumpinai.com" className="text-primary hover:underline">support@jumpinai.com</a> for priority support
              </p>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </>
  );
};

export default SubscriptionSuccess;