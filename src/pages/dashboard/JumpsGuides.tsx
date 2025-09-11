import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, ShoppingCart, CheckCircle, Crown } from "lucide-react";
import { useAuth0Token } from "@/hooks/useAuth0Token";
import { subscriptionCache } from "@/utils/subscriptionCache";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  file_name: string;
}

interface Order {
  id: string;
  product_id: string;
  download_token: string | null;
  status: string | null;
}

export default function MyJumps() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subInfo, setSubInfo] = useState<any>(null);
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth0Token();

  const purchasedByProduct = useMemo(() => {
    const map = new Map<string, Order>();
    orders.forEach((o) => {
      if (o.status === 'paid') map.set(o.product_id, o);
    });
    return map;
  }, [orders]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: prods, error: pErr } = await (supabase as any)
          .from('products')
          .select('id, name, description, price, file_name, status')
          .eq('status', 'active')
          .neq('name', 'JumpinAI Pro Subscription')
          .order('created_at', { ascending: true });
        if (pErr) throw pErr;
        setProducts((prods || []) as Product[]);

        const { data: session } = await supabase.auth.getSession();
        const email = session.session?.user?.email;
        if (email) {
          const { data: ords, error: oErr } = await (supabase as any)
            .from('orders')
            .select('id, product_id, download_token, status')
            .eq('user_email', email)
            .eq('status', 'paid');
          if (oErr) throw oErr;
          setOrders((ords || []) as Order[]);

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
      } catch (e) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to load your products', variant: 'destructive' });
      }
    };
    load();
  }, [toast]);

  const formatPrice = (price: number) => (price / 100).toFixed(2);

  const buy = async (productId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const email = session.session?.user?.email;
      if (!email) throw new Error('Please sign in to purchase');
      const { data, error } = await supabase.functions.invoke('create-product-payment', {
        body: { productId, customerEmail: email },
      });
      if (error) throw error;
      window.location.href = (data as any)?.url;
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Payment error', description: e.message || 'Could not start checkout', variant: 'destructive' });
    }
  };

  const upgradeToPro = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { source: 'dashboard-home' },
      });
      if (error) throw error;
      window.location.href = (data as any)?.url;
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Checkout error', description: e.message || 'Could not start subscription checkout', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass rounded-xl p-4 shadow-modern">
        <div className="flex items-center gap-3">
          <Download className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Jumps Guides</h1>
            <p className="text-sm text-muted-foreground">Explore and purchase AI guide products</p>
          </div>
        </div>
      </div>

      {/* Only show upgrade CTA if user is not subscribed to Pro */}
      {!(subInfo?.subscribed && subInfo?.subscription_tier === "JumpinAI Pro") && (
        <Card className="glass animate-fade-in rounded-xl shadow-modern border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-base font-medium">Unlock all Jumps with JumpinAI Pro</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Purchase Jumps individually on the Free plan. For unlimited access to all current and future Jumps with continuous updates, upgrade to JumpinAI Pro.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={upgradeToPro} className="text-sm px-4 py-2">Join JumpinAI Pro for $10/month</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div id="jumps-list" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const order = purchasedByProduct.get(p.id);
          return (
            <Card key={p.id} className="glass flex flex-col rounded-xl shadow-modern hover:shadow-modern-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-base leading-tight">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground flex-1 pt-0">
                {p.description}
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-2 pt-3">
                {order || (subInfo?.subscribed && subInfo?.subscription_tier === "JumpinAI Pro") ? (
                  <Button 
                    size="sm"
                    className="text-sm px-3 py-1.5"
                    onClick={() => {
                      if (order?.download_token) {
                        window.location.href = `/download/${order.download_token}`;
                      } else {
                        window.location.href = `/download-pro/${p.id}`;
                      }
                    }}
                  >
                    <Download className="mr-1.5 h-3 w-3" /> Access
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="text-sm px-3 py-1.5"
                    onClick={() => buy(p.id)}
                  >
                    <ShoppingCart className="mr-1.5 h-3 w-3" /> Buy ${formatPrice(p.price)}
                  </Button>
                )}
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> 
                  <span className="text-xs">
                    {order || (subInfo?.subscribed && subInfo?.subscription_tier === "JumpinAI Pro") ? "Pro" : "Download"}
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
