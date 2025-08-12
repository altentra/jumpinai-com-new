import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, ShoppingCart, CheckCircle } from "lucide-react";

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
  const { toast } = useToast();

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
      window.open((data as any)?.url, '_blank');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Payment error', description: e.message || 'Could not start checkout', variant: 'destructive' });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const order = purchasedByProduct.get(p.id);
        return (
          <Card key={p.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex-1">
              {p.description}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-3">
              {order ? (
                <Button asChild>
                  <a href={`/download/${order.download_token ?? ''}`}>
                    <Download className="mr-2 h-4 w-4" /> Access
                  </a>
                </Button>
              ) : (
                <Button onClick={() => buy(p.id)}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Buy ${formatPrice(p.price)}
                </Button>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Instant download
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
