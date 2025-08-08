import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Book, ShoppingCart, Zap, Loader2 } from "lucide-react";

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number; // in cents
  file_name: string;
  file_path: string;
  status: string;
}

const POWERSTACK_FILE_NAME = "jump-in-ai-powerstack.pdf";

const BookPromotion = () => {
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("products")
          .select("*")
          .eq("status", "active")
          .eq("file_name", POWERSTACK_FILE_NAME)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast({
            title: "Product not found",
            description:
              "We couldn't find PowerStack in the catalog. Please try again later.",
            variant: "destructive",
          });
        }
        setProduct(data as ProductRow | null);
      } catch (err) {
        console.error("Error fetching PowerStack product:", err);
        toast({
          title: "Error",
          description: "Failed to load product. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [toast]);

  const priceCents = product?.price ?? 999; // default to $9.99
  const priceDisplay = (priceCents / 100).toFixed(2);

  const handlePurchase = async () => {
    if (!product?.id || !customerEmail) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-product-payment",
        {
          body: {
            productId: product.id,
            customerEmail,
          },
        }
      );

      if (error) throw error;

      // Redirect to Stripe checkout
      window.location.href = data.url;

      setIsDialogOpen(false);
      setCustomerEmail("");

      toast({
        title: "Redirecting to Checkout",
        description: "Taking you to the secure payment page...",
      });
    } catch (err) {
      console.error("Error creating payment:", err);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <article className="relative border-2 border-border/40 dark:border-border/60 rounded-3xl p-8 sm:p-10 bg-background/80 backdrop-blur-sm shadow-modern-lg hover:border-border/60 transition-all duration-500">
          <header className="text-center mb-6">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Book className="h-4 w-4 text-primary mr-2" />
              <span className="text-xs font-semibold text-primary">Digital Guide</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
              Jump in AI: <span className="gradient-text-primary">PowerStack</span>
            </h2>
          </header>

          {/* Compact product summary */}
            <div className="mt-2 mb-6 text-center space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
                Jump in AI: PowerStack is your concise, professional field guide to making AI move the needle in your work.
                Inside, you’ll find 21 proven jumps with clear objectives, recommended tools, and step-by-step actions you can
                apply in hours—not weeks.
              </p>
              <ul className="text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <li>21 strategic, no‑fluff playbooks</li>
                <li>Ready-to-use prompts and templates</li>
                <li>Quick-start checklists for each jump</li>
                <li>Case-style examples and outcomes</li>
                <li>Lifetime access (PDF)</li>
              </ul>
            </div>

          <div className="mt-6 flex flex-col items-center justify-center text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    disabled={loadingProduct || !product}
                    className="min-w-[240px] px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {loadingProduct ? "Loading..." : `Buy Now — $${priceDisplay}`}
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Complete Your Purchase</DialogTitle>
                    <DialogDescription>
                      {product?.name || "PowerStack"} — ${priceDisplay}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We’ll email your download link after payment
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePurchase}
                        disabled={!customerEmail || isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        {isProcessing ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button asChild variant="outline" size="lg" className="min-w-[240px] px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group">
                <a href="https://www.amazon.com/dp/B0FHCM3VQ8" target="_blank" rel="noopener noreferrer">
                  Buy on Amazon — $15.99
                </a>
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Direct PDF download via secure checkout</p>
          </div>

          {(!product && !loadingProduct) && (
            <p className="mt-4 text-xs text-destructive">
              This product isn’t configured yet. Please check back soon.
            </p>
          )}
        </article>
      </div>
    </section>
  );
};

export default BookPromotion;
