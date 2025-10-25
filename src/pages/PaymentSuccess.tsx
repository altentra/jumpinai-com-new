import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Loader2, Mail, ArrowLeft, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface OrderDetails {
  id: string;
  productName: string;
  downloadUrl: string;
  status: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "Invalid payment session",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log("Verifying payment for session:", sessionId);
      
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { sessionId },
      });

      console.log("Verify payment response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data && data.success) {
        setOrderDetails(data.order);
        toast({
          title: "Payment Successful!",
          description: "Your product is ready for download. Check your email for the download link.",
        });
      } else {
        console.error("Payment verification failed:", data);
        throw new Error(data?.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Verification Error", 
        description: `Unable to verify payment: ${error.message}. Please contact support.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Glassmorphism background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        </div>
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Glassmorphism background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
      </div>
      <Navigation />
      
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 w-16 h-16 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/20">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary mb-4">
              Payment Successful
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your digital product is ready.
            </p>
          </div>

          {orderDetails ? (
            <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Your Purchase
                </CardTitle>
                <CardDescription>
                  Order ID: {orderDetails.id}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{orderDetails.productName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Your AI guide is ready for download
                  </p>
                </div>

                <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">Your Download is Ready</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      We've sent a secure download link directly to your email inbox. 
                      The link provides lifetime access to your digital product.
                    </p>
                    <p className="text-muted-foreground">
                      Please save your email confirmation for future reference and easy re-download access.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <a href={orderDetails.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Unable to retrieve order details. Please check your email for the download link 
                  or contact support if you need assistance.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-center space-y-6">
            <Card className="bg-primary/5 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Keep Track of All Your Purchases
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create a free JumpinAI account to access all your purchases from one convenient dashboard, 
                  track your AI learning journey, and get exclusive updates.
                </p>
                <Button asChild>
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Create Free Account
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
              Need help? Contact us at support@jumpinai.com
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;