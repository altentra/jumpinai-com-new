import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

const SyncStripe = () => {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<any>(null);

  React.useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-stripe-prices');

      if (error) throw error;

      if (data.success) {
        toast.success('All prices synced with Stripe successfully!');
        setResults(data.results);
      } else {
        throw new Error(data.details || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync prices');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Stripe Prices</CardTitle>
              <CardDescription>
                Update all Stripe products and prices to match the current database values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleSync} 
                disabled={syncing}
                size="lg"
                className="w-full"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Syncing with Stripe...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Sync All Prices
                  </>
                )}
              </Button>

              {results && (
                <div className="space-y-6 mt-6">
                  {/* Subscription Plans Results */}
                  {results.subscriptionPlans && results.subscriptionPlans.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Subscription Plans Synced
                      </h3>
                      <div className="space-y-2">
                        {results.subscriptionPlans.map((plan: any, idx: number) => (
                          <Card key={idx} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{plan.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Price: {plan.price}/month
                                  </p>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                  <p>Product: {plan.productId}</p>
                                  <p>Price: {plan.priceId}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credit Packages Results */}
                  {results.creditPackages && results.creditPackages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Credit Packages Synced
                      </h3>
                      <div className="space-y-2">
                        {results.creditPackages.map((pkg: any, idx: number) => (
                          <Card key={idx} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{pkg.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {pkg.credits} credits - {pkg.price}
                                  </p>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                  <p>Product: {pkg.productId}</p>
                                  <p>Price: {pkg.priceId}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>This will create new Stripe prices with current database values</li>
                      <li>Old price IDs will become inactive but remain in Stripe history</li>
                      <li>All new checkouts will use the updated prices</li>
                      <li>This operation is safe and can be run multiple times</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SyncStripe;
