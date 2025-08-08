import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, ShoppingCart, CheckCircle, FileText, Feather, BookOpen, Image as ImageIcon, Paintbrush, Music, Code2, Laptop, Sparkles, Camera, Clapperboard } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  file_name: string;
  file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Jumps = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setProducts((data || []) as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handlePurchase = async () => {
    if (!selectedProduct || !customerEmail) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-payment", {
        body: {
          productId: selectedProduct.id,
          customerEmail: customerEmail,
        },
      });

      if (error) throw error;

      // Redirect to Stripe checkout (mobile-friendly)
      window.location.href = data.url;
      
      setIsDialogOpen(false);
      setCustomerEmail("");
      setSelectedProduct(null);
      
      toast({
        title: "Redirecting to Checkout",
        description: "Redirecting to Stripe payment...",
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const getProductBadge = (name: string) => {
    const n = name.toLowerCase();
    let Primary = Sparkles;
    let Secondary: any = null;

    if (n.includes("text") || n.includes("writing") || n.includes("copy")) {
      Primary = Feather;
      Secondary = BookOpen;
    } else if (n.includes("image") || n.includes("design") || n.includes("art")) {
      Primary = Paintbrush;
      Secondary = ImageIcon;
    } else if (n.includes("sound") || n.includes("music") || n.includes("audio")) {
      Primary = Music;
      Secondary = Sparkles;
    } else if (
      n.includes("video") ||
      n.includes("film") ||
      n.includes("camera") ||
      n.includes("clip") ||
      n.includes("motion")
    ) {
      Primary = Camera;
      Secondary = Clapperboard;
    } else if (
      n.includes("website") ||
      n.includes("app") ||
      n.includes("coding") ||
      n.includes("code") ||
      n.includes("development")
    ) {
      Primary = Code2;
      Secondary = Laptop;
    }

    return (
      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
        <Primary className="h-6 w-6 text-primary" />
        {Secondary ? (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-background/90 border border-border flex items-center justify-center">
            <Secondary className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        ) : null}
      </div>
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6">
              Jumps in AI. Guides.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Take your first steps into AI mastery across different areas. Each guide provides clear insights and practical steps to build your AI skills.
            </p>
          </div>

          {/* Products Grid */}
          <div className="flex flex-wrap justify-center gap-8">
            {products.map((product) => (
              <div key={product.id} className="w-full sm:w-[320px] md:w-[340px]">
                <Card className="group hover:shadow-lg transition-all duration-300 border-muted/50 hover:border-primary/20 h-full flex flex-col">
                  <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        {getProductBadge(product.name)}
                        <span className="text-xs font-medium text-muted-foreground">PDF Guide</span>
                      </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4 flex-grow">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Instant Download</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Download className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Lifetime Access</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 mt-auto">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-primary">
                          ${formatPrice(product.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          One-time payment
                        </div>
                      </div>
                      
                      <Dialog open={isDialogOpen && selectedProduct?.id === product.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full group-hover:bg-primary/90 transition-colors duration-300"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Now
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Complete Your Purchase</DialogTitle>
                            <DialogDescription>
                              You're about to purchase "{selectedProduct?.name}" for ${selectedProduct ? formatPrice(selectedProduct.price) : '0.00'}
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
                                We'll send your download link to this email
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
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>

          {/* All-Access Whop CTA */}
          <div className="mt-16">
            <div className="p-6 md:p-8 rounded-xl border border-muted/50 bg-muted/30 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3">Get access to all guides</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Want everything in one place? Join our Whop for just $19.99 and unlock all products together.
              </p>
              <Button size="lg" className="w-full sm:w-auto hover-scale" asChild>
                <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                  Join on Whop — $19.99
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Jumps;