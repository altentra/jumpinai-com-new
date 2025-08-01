import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Loader2, Mail, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your digital product is ready.
            </p>
          </div>

          {orderDetails ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
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

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium">Download Instructions</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• A download link has been sent to your email</li>
                    <li>• You can download this product up to 5 times</li>
                    <li>• Download link is valid for 30 days</li>
                    <li>• Keep your email for future reference</li>
                  </ul>
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
            <Card className="mb-8">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Unable to retrieve order details. Please check your email for the download link 
                  or contact support if you need assistance.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-center space-y-4">
            <Button variant="outline" asChild>
              <Link to="/jumps">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse More Products
              </Link>
            </Button>
            
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