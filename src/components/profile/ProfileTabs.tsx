import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Shield, Crown, CreditCard, RefreshCcw, Save, LogOut, ExternalLink, AlertTriangle, History, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth0Token } from "@/hooks/useAuth0Token";

interface SubscriberInfo {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

const planFeatures = {
  free: [
    "Access to public resources",
    "Weekly newsletter",
    "Community support",
  ],
  pro: [
    "Everything in Free",
    "Full Blueprints library",
    "Advanced Workflows & Prompts",
    "Early access to new tools",
    "Priority support",
  ],
};

export default function ProfileTabs() {
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string }>({ display_name: "", avatar_url: "" });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();
  const { getAuthHeaders } = useAuth0Token();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        login('/dashboard/profile');
      } else if (user) {
        setEmail(user.email || "");
        fetchProfile();
        refreshSubscription();
        fetchOrders();
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, user, login]);

  const fetchProfile = async () => {
    const { data, error } = await (supabase.from("profiles" as any) as any)
      .select("display_name, avatar_url")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();
    if (error) {
      console.error(error);
    } else {
      setProfile({ display_name: (data as any)?.display_name ?? "", avatar_url: (data as any)?.avatar_url ?? "" });
    }
  };

  const saveProfile = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      
      // Update profile in profiles table
      const { error: profileError } = await (supabase.from("profiles" as any) as any)
        .upsert({ id: user.id, display_name: profile?.display_name, avatar_url: profile?.avatar_url });
      
      if (profileError) throw profileError;
      
      // Update user metadata to keep it in sync
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url 
        }
      });
      
      if (userError) throw userError;
      
      toast.success("Profile updated successfully!");
      await fetchProfile();
      
      // Force a refresh of the sidebar by triggering a window refresh event
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const changePassword = async () => {
    if (!password) {
      return toast.error("Please enter a new password");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast.success("Password updated successfully! You will receive a confirmation email.");
      setPassword("");
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || "Failed to update password");
    }
  };

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: await getAuthHeaders(),
      });
      if (error) throw error;
      setSubInfo(data as SubscriberInfo);
    } catch (e: any) {
      console.error(e);
      toast.error("Could not refresh subscription status");
    }
  };

  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: await getAuthHeaders(),
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  const manage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: await getAuthHeaders(),
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to open customer portal");
    }
  };

  const fetchOrders = async () => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      const userEmail = currentUser?.email;
      
      console.log("Fetching orders for email:", userEmail);
      
      if (!userEmail) {
        console.error("No user email found");
        return;
      }
      
      // First fetch orders without products join
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_email", userEmail)
        .eq("status", "paid") // Only show completed orders
        .order("created_at", { ascending: false });
      
      if (ordersError) {
        console.error("Orders error:", ordersError);
        throw ordersError;
      }
      
      console.log("Fetched orders data:", ordersData);
      
      // Then fetch product data for each order
      if (ordersData && ordersData.length > 0) {
        const ordersWithProducts = await Promise.all(
          ordersData.map(async (order) => {
            const { data: productData, error: productError } = await supabase
              .from("products")
              .select("*")
              .eq("id", order.product_id)
              .single();
            
            if (productError) {
              console.error("Product fetch error for order", order.id, ":", productError);
              return { ...order, products: null };
            }
            
            return { ...order, products: productData };
          })
        );
        
        console.log("Orders with products:", ordersWithProducts);
        setOrders(ordersWithProducts);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load order history");
    }
  };

  const downloadReceipt = async (stripeSessionId: string) => {
    if (!stripeSessionId) {
      toast.error("No receipt available for this order");
      return;
    }

    setDownloadingReceipt(stripeSessionId);
    try {
      console.log("Downloading receipt for session:", stripeSessionId);
      const { data, error } = await supabase.functions.invoke("download-receipt", {
        body: { sessionId: stripeSessionId }
      });

      console.log("Receipt response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data?.receiptUrl) {
        console.log("Opening receipt URL:", data.receiptUrl);
        window.open(data.receiptUrl, '_blank');
      } else {
        console.error("No receipt URL in response:", data);
        toast.error("Receipt not available");
      }
    } catch (error: any) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message || "Failed to open billing portal");
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type 'DELETE' exactly as shown to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      
      toast.success("Account deleted successfully");
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmText("");
    }
  };

  const proActive = useMemo(() => subInfo?.subscribed && subInfo.subscription_tier === "JumpinAI Pro", [subInfo]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pb-8">
      {/* Header */}
      <header>
        <div className="rounded-2xl border border-border glass p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <User className="h-7 w-7 text-primary" />
                Account
              </h1>
              <p className="text-muted-foreground mt-2">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              {subInfo?.subscribed ? (
                <Badge className="bg-primary/10 text-primary">{subInfo.subscription_tier || 'Pro'} Active</Badge>
              ) : (
                <Badge variant="secondary">Free plan</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <section className="mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-3 w-full gap-2 md:gap-0 -mx-2 px-2 md:mx-0 md:px-0 rounded-xl bg-muted/30">
            <TabsTrigger value="profile" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <User className="h-4 w-4" /> Profile & Overview
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <History className="h-4 w-4" /> Order History
            </TabsTrigger>
          </TabsList>

          {/* Profile & Overview Combined */}
          <TabsContent value="profile" className="mt-6 animate-fade-in space-y-6">
            {/* Subscription Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Subscription Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {subInfo?.subscribed
                    ? `You're on ${subInfo.subscription_tier || 'JumpinAI Pro'}. Next renewal: ${subInfo.subscription_end ? new Date(subInfo.subscription_end).toLocaleString() : '—'}`
                    : 'You are on the Free plan. Upgrade to JumpinAI Pro to unlock all blueprints and workflows.'}
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                {!subInfo?.subscribed ? (
                  <Button onClick={subscribe} className="hover-scale">
                    <Crown className="mr-2 h-4 w-4" /> Get JumpinAI Pro
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" onClick={manage} className="hover-scale">
                      <ExternalLink className="mr-2 h-4 w-4" /> Manage billing
                    </Button>
                    <Button variant="outline" onClick={refreshSubscription} className="hover-scale">
                      <RefreshCcw className="mr-2 h-4 w-4" /> Refresh status
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display name</Label>
                    <Input id="display_name" value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input id="avatar_url" value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfile} className="hover-scale">
                  <Save className="mr-2 h-4 w-4" /> Save changes
                </Button>
              </CardFooter>
            </Card>

            {/* Account Actions */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full md:w-auto hover-scale">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account Permanently
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <div>
                        <strong>This action cannot be undone.</strong> Deleting your account will:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Permanently delete all your account data</li>
                        <li>Cancel any active subscriptions immediately</li>
                        <li>Remove access to all purchased content</li>
                        <li>Delete your profile and saved preferences</li>
                      </ul>
                      <div>
                        To regain access in the future, you would need to create a new account and repurchase any products or subscriptions.
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm:</Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE here"
                          className="font-mono"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="w-full md:w-auto hover-scale">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="new_password">New password</Label>
                  <Input id="new_password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={changePassword} className="hover-scale">
                  Update password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Order History */}
          <TabsContent value="orders" className="mt-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found</p>
                    <p className="text-sm">Your purchase history will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Downloads</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.products?.name || 'Product'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {order.products?.description || 'Digital product'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              ${(order.amount / 100).toFixed(2)} {order.currency?.toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{order.download_count || 0} / {order.max_downloads || 20}</div>
                                <div className="text-muted-foreground">downloads</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {order.download_token && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(`https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/download-product/${order.download_token}`, '_blank')}
                                    disabled={(order.download_count || 0) >= (order.max_downloads || 20)}
                                  >
                                    Download
                                  </Button>
                                )}
                                {order.stripe_session_id && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadReceipt(order.stripe_session_id)}
                                    disabled={downloadingReceipt === order.stripe_session_id}
                                  >
                                    {downloadingReceipt === order.stripe_session_id ? "Loading..." : "Receipt"}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
