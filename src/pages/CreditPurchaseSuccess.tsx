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
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);
  const [previousBalance, setPreviousBalance] = useState<number>(0);

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
    const refreshCredits = async () => {
      if (user?.id) {
        // Store current balance
        const currentBalance = credits?.credits_balance || 0;
        setPreviousBalance(currentBalance);
        
        // Wait for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchCredits();
        setVerifying(false);
        
        // Force a page refresh to show updated transactions
        setTimeout(() => {
          window.location.href = '/dashboard/subscription';
        }, 1500);
      }
    };

    refreshCredits();

    const urlTimer = setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);

    return () => {
      clearTimeout(urlTimer);
    };
  }, [user?.id]);

  // Calculate credits added
  useEffect(() => {
    if (credits && previousBalance > 0 && !verifying) {
      const added = credits.credits_balance - previousBalance;
      if (added > 0) {
        setCreditsAdded(added);
      }
    }
  }, [credits, previousBalance, verifying]);

  return (
    <>
      <Helmet>
        <title>Credits Added Successfully - JumpinAI</title>
        <meta name="description" content="Your credit purchase was successful. Start creating AI transformation plans now." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Glassmorphism background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        </div>
        
        <Navigation />
        
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/20">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-4">
                Payment Successful
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Thank you for your purchase
              </p>
            </div>

            {/* Credits Added Card */}
            <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-primary">
                  <Zap className="h-6 w-6" />
                  Credits Added
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {verifying || isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Processing your payment...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-8 border border-primary/10">
                      {creditsAdded && (
                        <div className="mb-4">
                          <div className="text-5xl font-bold text-primary mb-2">
                            +{creditsAdded}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Credits Added
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t border-primary/10">
                        <div className="text-4xl font-bold text-foreground mb-2">
                          {credits?.credits_balance || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Balance
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        What you can do with credits:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>Generate personalized AI transformation plans</li>
                        <li>Create custom tool and prompt combinations</li>
                        <li>Build comprehensive implementation blueprints</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Cards */}
            <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Start Creating Your AI Plan
                </CardTitle>
                <CardDescription>
                  Ready to transform your business with AI?
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-all bg-card/30 backdrop-blur-sm">
                    <div className="text-4xl mb-3">
                      <Sparkles className="h-12 w-12 mx-auto text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">JumpinAI Studio</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate your personalized AI transformation plan
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/jumpinai-studio">
                        Start Creating
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-all bg-card/30 backdrop-blur-sm">
                    <div className="text-4xl mb-3">
                      <Zap className="h-12 w-12 mx-auto text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">My Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View your credits and manage your plans
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/dashboard">
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Confirmation */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-6">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">
                    A confirmation email with your purchase details has been sent to your inbox
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
