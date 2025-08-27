
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSpreadsheet, Users, Crown, ShoppingBag, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const GoogleSheetsTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const syncData = async (type: 'contacts' | 'subscribers' | 'orders' | 'all') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-sheets-sync', {
        body: { type, sync_all: true }
      });
      
      if (error) throw error;
      
      setResults(data);
      toast.success(`Successfully synced ${data.count} ${type} records to Google Sheets!`);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(`Failed to sync ${type}: ${error.message}`);
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Enhanced Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Sync your JumpinAI data to Google Sheets. Choose what type of data to sync:
            </p>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Data</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => syncData('all')} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    )}
                    Sync All Data
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Syncs contacts, subscribers, and orders data in one operation.
                </p>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <Button 
                  onClick={() => syncData('contacts')} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Sync Contacts Only
                </Button>
                <p className="text-sm text-muted-foreground">
                  Syncs newsletter subscribers, lead magnet downloads, and contact form submissions.
                </p>
              </TabsContent>

              <TabsContent value="subscribers" className="space-y-4">
                <Button 
                  onClick={() => syncData('subscribers')} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Sync Subscribers Only
                </Button>
                <p className="text-sm text-muted-foreground">
                  Syncs Pro subscription data including tiers, status, and billing information.
                </p>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <Button 
                  onClick={() => syncData('orders')} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Sync Orders Only
                </Button>
                <p className="text-sm text-muted-foreground">
                  Syncs product purchase history including amounts, status, and customer details.
                </p>
              </TabsContent>
            </Tabs>

            {results && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={results.success ? "default" : "destructive"}>
                    {results.success ? "Success" : "Error"}
                  </Badge>
                </div>
                
                {results.success ? (
                  <div className="space-y-2">
                    <p className="font-medium">✅ {results.message}</p>
                    {results.breakdown && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📊 Breakdown:</p>
                        <ul className="ml-4 space-y-1">
                          {results.breakdown.contacts > 0 && (
                            <li>• {results.breakdown.contacts} contacts</li>
                          )}
                          {results.breakdown.subscribers > 0 && (
                            <li>• {results.breakdown.subscribers} subscribers</li>
                          )}
                          {results.breakdown.orders > 0 && (
                            <li>• {results.breakdown.orders} orders</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-destructive">❌ Sync Failed</p>
                    <p className="text-sm text-muted-foreground">{results.error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium mb-2">📋 Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Create a Google Apps Script webhook that accepts POST requests</li>
                <li>Set the GOOGLE_SHEETS_WEBHOOK_URL secret in your Supabase project</li>
                <li>Configure your webhook to handle the enhanced data format</li>
                <li>Test the sync using the buttons above</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
