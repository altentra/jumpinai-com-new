import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const CreditPurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { credits, fetchCredits, isLoading } = useCredits();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    // Refresh credits after successful purchase
    const refreshCredits = async () => {
      if (user?.id) {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchCredits();
        setVerifying(false);
      }
    };

    refreshCredits();

    // Clean up URL parameters after a delay
    const urlTimer = setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);

    return () => {
      clearTimeout(urlTimer);
    };
  }, [user?.id]);

  return (
    <>
      <Helmet>
        <title>Credits Added Successfully! - JumpinAI</title>
        <meta name="description" content="Your credit purchase was successful! Start creating AI transformation plans now." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
        </div>
        <Navigation />
        
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-4">
                Payment Successful! 🎉
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your credits have been added to your account
              </p>
            </div>

            {/* Credits Balance Card */}
            <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-primary">
                  <Zap className="h-6 w-6" />
                  Your Credit Balance
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {verifying || isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Processing your credits...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 mb-6">
                      <div className="text-6xl font-bold text-primary mb-2">
                        {credits?.credits_balance || 0}
                      </div>
                      <div className="text-lg text-muted-foreground">
                        {credits?.credits_balance === 1 ? 'Credit' : 'Credits'} Available
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
                      <p className="text-sm text-foreground">
                        <strong>What you can do with credits:</strong>
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>✨ Generate personalized AI transformation plans</li>
                        <li>🎯 Create custom tool & prompt combinations</li>
                        <li>📋 Build comprehensive implementation blueprints</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Next Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Start Creating Your AI Plan
                </CardTitle>
                <CardDescription>
                  Ready to transform your business with AI? Here's what to do next
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="text-4xl mb-3">🚀</div>
                    <h3 className="font-semibold mb-2">JumpinAI Studio</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate your personalized AI transformation plan
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/jumpinai-studio">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Creating
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="text-4xl mb-3">📊</div>
                    <h3 className="font-semibold mb-2">My Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View your credits and manage your plans
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/dashboard">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Confirmation Note */}
            <Card>
              <CardContent className="py-6">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">
                    📧 A confirmation email with your purchase details has been sent to your inbox
                  </p>
                  <p>
                    Questions? Contact us at <a href="mailto:support@jumpinai.com" className="text-primary hover:underline">support@jumpinai.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <Footer />
      </div>
    </>
  );
};

export default CreditPurchaseSuccess;
