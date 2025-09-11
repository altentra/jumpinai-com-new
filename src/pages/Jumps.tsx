import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, ShoppingCart, CheckCircle, FileText, Feather, BookOpen, Image as ImageIcon, Paintbrush, Music, Code2, Laptop, Sparkles, Camera, Clapperboard, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { subscriptionCache } from "@/utils/subscriptionCache";

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

interface Order {
  id: string;
  product_id: string;
  download_token: string | null;
  status: string | null;
}

const Jumps = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subInfo, setSubInfo] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const purchasedByProduct = useMemo(() => {
    const map = new Map<string, Order>();
    orders.forEach((o) => {
      if (o.status === 'paid') map.set(o.product_id, o);
    });
    return map;
  }, [orders]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data, error } = await (supabase as any)
          .from('products')
          .select('id, name, description, price, status, created_at, updated_at, file_name')
          .eq('status', 'active')
          .neq('name', 'JumpinAI Pro Subscription')
          .neq('file_name', 'jump-in-ai-powerstack.pdf')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setProducts((data || []) as Product[]);

        // If user is logged in, fetch their orders and subscription status
        if (isAuthenticated && user?.email) {
          const { data: orderData, error: orderError } = await (supabase as any)
            .from('orders')
            .select('id, product_id, download_token, status')
            .eq('user_email', user.email)
            .eq('status', 'paid');
          
          if (orderError) throw orderError;
          setOrders((orderData || []) as Order[]);

          // Check subscription status using cache first
          const cachedSub = subscriptionCache.get();
          if (cachedSub) {
            setSubInfo(cachedSub);
          } else {
            try {
              const { data: subData, error: subError } = await supabase.functions.invoke("check-subscription");
              if (!subError && subData) {
                setSubInfo(subData);
                subscriptionCache.set(subData);
              }
            } catch (e) {
              console.error('Failed to check subscription:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, isAuthenticated, user?.email]);

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    
    const email = isAuthenticated && user?.email ? user.email : customerEmail;
    if (!email) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-payment", {
        body: {
          productId: selectedProduct.id,
          customerEmail: email,
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

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    
    // If user is logged in, proceed directly to purchase
    if (isAuthenticated && user?.email) {
      // Use setTimeout to ensure selectedProduct is set before calling handlePurchase
      setTimeout(() => {
        handlePurchaseDirectly(product);
      }, 0);
    } else {
      // Show email dialog for guest users
      setIsDialogOpen(true);
    }
  };

  const handlePurchaseDirectly = async (product: Product) => {
    if (!product) return;
    
    const email = user?.email;
    if (!email) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-payment", {
        body: {
          productId: product.id,
          customerEmail: email,
        },
      });

      if (error) throw error;

      // Redirect to Stripe checkout (mobile-friendly)
      window.location.href = data.url;
      
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
      Primary = Clapperboard;
      Secondary = Camera;
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
      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg glass backdrop-blur-sm border border-white/20">
        <Primary className="h-6 w-6 text-primary" />
        {Secondary ? (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl glass backdrop-blur-sm border border-white/30 flex items-center justify-center">
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
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Jumps in AI. Guides.
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-xl rounded-3xl opacity-30"></div>
            </div>
            <div className="glass rounded-3xl p-8 max-w-4xl mx-auto backdrop-blur-xl border border-white/10">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Take your first steps into AI mastery across different areas. Each guide provides clear insights and practical steps to build your AI skills.
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex flex-wrap justify-center gap-8">
            {products.map((product) => {
              const order = purchasedByProduct.get(product.id);
              const hasPurchased = !!order;
              
              return (
                <div key={product.id} className="w-full sm:w-[320px] md:w-[340px]">
                  <Card className={`group glass hover:shadow-2xl transition-all duration-500 border-white/20 hover:border-primary/30 h-full flex flex-col rounded-3xl backdrop-blur-xl hover:scale-[1.02] ${hasPurchased ? 'ring-2 ring-green-500/30 border-green-500/50 shadow-green-500/10' : ''}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getProductBadge(product.name)}
                          <span className="text-xs font-medium text-muted-foreground">PDF Guide</span>
                        </div>
                        {hasPurchased && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
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
                        {/* Only show price for non-Pro subscribers */}
                        {!(subInfo?.subscribed && subInfo?.subscription_tier === "JumpinAI Pro") && (
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-primary">
                              ${formatPrice(product.price)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              One-time payment
                            </div>
                          </div>
                        )}
                        
                        {hasPurchased || (subInfo?.subscribed && subInfo?.subscription_tier === "JumpinAI Pro") ? (
                          <Button asChild={false} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl glass backdrop-blur-sm border border-green-500/20" onClick={() => {
                            if (order?.download_token) {
                              window.location.href = `/download/${order.download_token}`;
                            } else {
                              // For Pro subscribers, go to the dedicated download page
                              window.location.href = `/download-pro/${product.id}`;
                            }
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Access Your Guide
                          </Button>
                        ) : (
                          <>
                            <Dialog open={isDialogOpen && selectedProduct?.id === product.id} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  className="w-full group-hover:bg-primary/90 transition-all duration-500 rounded-2xl hover:scale-105"
                                  onClick={() => handleBuyClick(product)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Buy Now
                                </Button>
                              </DialogTrigger>
                        
                              <DialogContent className="sm:max-w-md glass backdrop-blur-xl border border-white/20 rounded-3xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl">Complete Your Purchase</DialogTitle>
                                  <DialogDescription className="text-muted-foreground">
                                    You're about to purchase "{selectedProduct?.name}" for ${selectedProduct ? formatPrice(selectedProduct.price) : '0.00'}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      placeholder="your.email@example.com"
                                      value={customerEmail}
                                      onChange={(e) => setCustomerEmail(e.target.value)}
                                      required
                                      className="rounded-2xl glass backdrop-blur-sm border border-white/20"
                                    />
                                    <p className="text-xs text-muted-foreground glass backdrop-blur-sm rounded-xl p-2 border border-white/10">
                                      We'll send your download link to this email
                                    </p>
                                  </div>
                                  
                                  <div className="flex gap-3">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setIsDialogOpen(false)}
                                      className="flex-1 rounded-2xl glass backdrop-blur-sm border border-white/20"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handlePurchase}
                                      disabled={!customerEmail || isProcessing}
                                      className="flex-1 rounded-2xl hover:scale-105 transition-all duration-300"
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
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* All-Access CTA - Only show if user is not subscribed to Pro */}
          {!(subInfo?.subscribed && subInfo?.subscription_tier === "JumpinAI Pro") && (
            <div className="mt-16">
              <div className="relative glass backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/20 text-center overflow-hidden">
                {/* Floating background elements */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-4 gradient-text">Get access to all guides</h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Want everything in one place? Join our Whop for just $19.99 and unlock all products together.
                  </p>
                  <Button size="lg" className="w-full sm:w-auto hover-scale rounded-2xl glass backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-500" asChild>
                    <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer">
                      Join on Whop — $19.99
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Jumps;