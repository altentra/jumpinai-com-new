import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Shield, Crown, CreditCard, RefreshCw, Save, LogOut, ExternalLink, AlertTriangle, History, Trash2, Download, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { user, refreshSubscription } = useAuth();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string }>({ display_name: "", avatar_url: "" });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<{ verified: boolean; loading: boolean }>({ verified: false, loading: false });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, login, logout, subscription } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        login('/dashboard/profile');
      } else if (user) {
        setEmail(user.email || "");
        fetchSupabaseUser();
        fetchProfile();
        // Use cached subscription data instead of making API call
        setSubInfo(subscription || { subscribed: false });
        fetchOrders();
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, user, subscription, login]);

  // Auto-refresh order history after purchases from subscription page
  useEffect(() => {
    const profileRefresh = searchParams.get('profile_refresh');
    if (profileRefresh === 'true') {
      console.log('Purchase detected from subscription page, refreshing order history...');
      setTimeout(() => {
        fetchOrders();
      }, 1000);
      
      // Remove the parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('profile_refresh');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  // Check for email verification success parameter
  useEffect(() => {
    const emailVerified = searchParams.get('emailVerified');
    if (emailVerified === 'success') {
      toast.success("🎉 Email verified successfully! You now have full access to all JumpinAI features.");
      // Remove the parameter from URL to clean it up
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('emailVerified');
        return newParams;
      });
      // Refresh the verification status
      setTimeout(() => {
        fetchProfile();
      }, 1000);
    }
  }, [searchParams, setSearchParams]);

  const fetchSupabaseUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      setSupabaseUser(data.user);
    }
  };

  const fetchProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    if (!authUser) return;

    const { data, error } = await (supabase.from("profiles" as any) as any)
      .select("display_name, avatar_url, email_verified")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error(error);
    }

    const meta = authUser.user_metadata || {};
    const identities = (authUser.identities || []);
    const identityData = identities[0]?.identity_data || {};

    const display = (data as any)?.display_name ?? meta.full_name ?? meta.name ?? meta.display_name ?? authUser.email?.split("@")[0] ?? "";
    const avatar = (data as any)?.avatar_url ?? meta.avatar_url ?? meta.picture ?? identityData.picture ?? "";

    setProfile({ display_name: display, avatar_url: avatar });
    setEmailVerificationStatus({ 
      verified: (data as any)?.email_verified ?? false, 
      loading: false 
    });

    if ((!data || !(data as any).avatar_url) && avatar) {
      await (supabase.from("profiles" as any) as any).upsert({ id: authUser.id, display_name: display, avatar_url: avatar });
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

  // Use the cached refreshSubscription from auth context
  // const refreshSubscription = async () => {
  //   try {
  //     const { data, error } = await supabase.functions.invoke("check-subscription");
  //     if (error) throw error;
  //     setSubInfo(data as SubscriberInfo);
  //   } catch (e: any) {
  //     console.error(e);
  //     toast.error("Could not refresh subscription status");
  //   }
  // };

  const subscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  const manage = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { source: 'dashboard-profile' },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (error) throw error;
      const url = (data as any)?.url;
      
      if (url) {
        if (isMobile) {
          // Use placeholder window approach for mobile to avoid popup blockers
          const placeholder = window.open('', '_blank');
          if (placeholder && typeof placeholder.location !== 'undefined') {
            placeholder.location.href = url;
          } else {
            window.location.href = url;
          }
        } else {
          // Direct approach for desktop - much faster
          window.open(url, '_blank');
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to open billing portal");
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
      
      // Fetch all paid orders - only join products table since that's the only foreign key
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          product_id,
          amount,
          download_token,
          download_count,
          max_downloads,
          created_at,
          updated_at,
          user_email,
          stripe_session_id,
          stripe_payment_intent_id,
          currency,
          status,
          products (
            name,
            description,
            file_name
          )
        `)
        .eq("user_email", userEmail)
        .eq("status", "paid")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Orders error:", error);
        throw error;
      }
      
      console.log("Fetched orders:", data);
      setOrders(data || []);
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

    console.log("🔧 [Mobile Debug] Download receipt clicked for:", stripeSessionId);
    // Open placeholder window synchronously to bypass mobile popup blockers
    const placeholder = window.open('', '_blank');
    setDownloadingReceipt(stripeSessionId);
    try {
      console.log("🔧 [Mobile Debug] Invoking download-receipt function");
      const { data, error } = await supabase.functions.invoke("download-receipt", {
        body: { sessionId: stripeSessionId }
      });

      console.log("🔧 [Mobile Debug] Receipt response:", { data, error });

      if (error) {
        console.error("🔧 [Mobile Debug] Supabase function error:", error);
        throw error;
      }

      if (data?.receiptUrl) {
        console.log("🔧 [Mobile Debug] Navigating to receipt URL:", data.receiptUrl);
        if (placeholder && typeof placeholder.location !== 'undefined') {
          placeholder.location.href = data.receiptUrl;
          console.log("🔧 [Mobile Debug] Used placeholder window for receipt");
        } else {
          const win = window.open(data.receiptUrl, '_blank');
          if (!win) {
            console.log("🔧 [Mobile Debug] window.open returned null for receipt, falling back to same-tab navigation");
            window.location.href = data.receiptUrl;
          }
        }
      } else {
        console.error("🔧 [Mobile Debug] No receipt URL in response:", data);
        toast.error("Receipt not available");
        try { placeholder?.close(); } catch {}
      }
    } catch (error: any) {
      console.error("🔧 [Mobile Debug] Error downloading receipt:", error);
      toast.error("Failed to download receipt");
      try { placeholder?.close(); } catch {}
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { source: 'dashboard-profile' },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message || "Failed to open billing portal");
    }
  };

  const sendVerificationEmail = async () => {
    if (!user?.id || !user?.email) {
      toast.error("Unable to send verification email");
      return;
    }

    setEmailVerificationStatus({ ...emailVerificationStatus, loading: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          userId: user.id,
          email: user.email
        }
      });

      if (error) throw error;
      
      toast.success("Verification email sent! Check your inbox and click the verification link.");
    } catch (error: any) {
      console.error('Verification email error:', error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setEmailVerificationStatus({ ...emailVerificationStatus, loading: false });
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pb-8">
      {/* Header */}
      <header>
        <div className="rounded-2xl border border-border glass p-4 sm:p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Account Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2 sm:gap-3">
                    <User className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                    <span className="truncate">Account</span>
                  </h1>
                  <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base truncate">{email}</p>
                </div>
                <div className="flex items-center gap-2 sm:self-start">
                  {subInfo?.subscribed ? (
                    <Badge className="bg-primary/10 text-primary text-xs sm:text-sm whitespace-nowrap">
                      {subInfo.subscription_tier || 'Pro'} Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">Free plan</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Management Section */}
            <div className="space-y-4">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {profile.avatar_url ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Label htmlFor="display_name" className="text-sm">Display Name</Label>
                    <Input 
                      id="display_name" 
                      value={profile.display_name} 
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      disabled={user?.isGoogleUser}
                      className={user?.isGoogleUser ? "bg-muted/50" : ""}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-start sm:justify-end">
                  {!user?.isGoogleUser && (
                    <Button onClick={saveProfile} size="sm" className="hover-scale w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" /> 
                      <span className="sm:inline">Save Changes</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <section className="mt-4 sm:mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex flex-col sm:flex-row w-full gap-2 rounded-2xl glass border border-border/50 p-1.5 h-auto sm:justify-center sm:max-w-4xl sm:mx-auto backdrop-blur-sm">
            <TabsTrigger 
              value="profile" 
              className="w-full sm:flex-1 sm:max-w-52 flex items-center justify-center gap-2 text-xs sm:text-sm py-3.5 px-4 sm:px-6 transition-all duration-300 hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm rounded-xl font-medium"
            >
              <User className="h-4 w-4 flex-shrink-0" /> 
              <span className="sm:hidden">Overview</span>
              <span className="hidden sm:inline">Profile & Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="w-full sm:flex-1 sm:max-w-52 flex items-center justify-center gap-2 text-xs sm:text-sm py-3.5 px-4 sm:px-6 transition-all duration-300 hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm rounded-xl font-medium"
            >
              <Shield className="h-4 w-4 flex-shrink-0" /> 
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="w-full sm:flex-1 sm:max-w-52 flex items-center justify-center gap-2 text-xs sm:text-sm py-3.5 px-4 sm:px-6 transition-all duration-300 hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm rounded-xl font-medium"
            >
              <History className="h-4 w-4 flex-shrink-0" /> 
              <span>Order History</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile & Overview Combined */}
          <TabsContent value="profile" className="mt-4 sm:mt-6 animate-fade-in space-y-4 sm:space-y-6">
            {/* Email & Account Status */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" /> 
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Email Address</Label>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <Input value={email} disabled className="bg-muted/50 text-sm" />
                        {emailVerificationStatus.verified || user?.isGoogleUser ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs whitespace-nowrap self-start sm:self-center">
                            {user?.isGoogleUser ? "Google Verified" : "Verified"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs whitespace-nowrap self-start sm:self-center">
                            Unverified
                          </Badge>
                        )}
                      </div>
                      {!emailVerificationStatus.verified && !user?.isGoogleUser && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Email verification is required for purchases and subscriptions.
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={sendVerificationEmail}
                            disabled={emailVerificationStatus.loading}
                            className="text-xs h-8 w-full sm:w-auto"
                          >
                            {emailVerificationStatus.loading ? "Sending..." : "Send Verification Email"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Account Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-primary/10 text-primary text-xs">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto hover-scale">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive text-lg">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-base sm:text-lg">Delete Account Permanently</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 sm:space-y-4">
                      <div className="text-sm leading-relaxed">
                        <strong>This action cannot be undone.</strong> Deleting your account will:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        <li>Permanently delete all your account data</li>
                        <li>Cancel any active subscriptions immediately</li>
                        <li>Remove access to all purchased content</li>
                        <li>Delete your profile and saved preferences</li>
                      </ul>
                      <div className="text-sm leading-relaxed">
                        To regain access in the future, you would need to create a new account and repurchase any products or subscriptions.
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm" className="text-sm">Type <strong>DELETE</strong> to confirm:</Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE here"
                          className="font-mono text-sm"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <AlertDialogCancel 
                      onClick={() => setDeleteConfirmText("")}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto order-1 sm:order-2"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" onClick={() => logout()} className="w-full sm:w-auto hover-scale">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-4 sm:mt-6 animate-fade-in">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" /> 
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" value={email} disabled className="bg-muted/50 text-sm" />
                </div>
                <Separator />
                {!user?.isGoogleUser ? (
                  <div className="space-y-3">
                    <Label htmlFor="new_password" className="text-sm font-medium">New password</Label>
                    <Input 
                      id="new_password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter new password"
                      className="text-sm" 
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="p-3 sm:p-4 bg-muted/50 rounded-md border">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        🔐 Your account is secured by Google. Password changes are managed through your Google account.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-6">
                {!user?.isGoogleUser && (
                  <Button onClick={changePassword} className="hover-scale w-full sm:w-auto">
                    <Shield className="mr-2 h-4 w-4" /> Update password
                  </Button>
                )}
                <Button variant="outline" onClick={() => logout()} className="hover-scale w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Order History */}
          <TabsContent value="orders" className="mt-4 sm:mt-6 animate-fade-in">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" /> 
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {orders.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No orders found</p>
                    <p className="text-xs sm:text-sm">Your purchase history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:hidden">
                    {/* Mobile Card View */}
                    {orders.map((order) => {
                      // Determine product display name with better descriptions
                      let productName = 'Purchase';
                      let productDescription = 'Order completed';
                      
                      if (order.products?.name) {
                        // Digital product (PDF guide)
                        productName = order.products.name;
                        productDescription = order.products.description || 'Digital product download';
                      } else if (order.download_token) {
                        // Has download token but no product - likely a digital product
                        productName = 'Digital Product';
                        productDescription = 'Digital product download';
                      } else {
                        // No product and no download token - it's a credit package or subscription
                        // Determine based on amount ranges (subscriptions are typically monthly, credits are one-time)
                        const amountInDollars = order.amount / 100;
                        if (amountInDollars >= 10 && amountInDollars <= 50) {
                          productName = 'Subscription Plan';
                          productDescription = 'Monthly subscription with credits';
                        } else {
                          productName = 'Credit Package';
                          productDescription = 'Credits purchase';
                        }
                      }
                      
                      // Only show download for actual digital products (PDF guides), not credit packs or subscriptions
                      const isDownloadableProduct = order.products?.file_name && order.download_token;
                      
                      return (
                        <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex flex-col gap-2">
                            <div className="font-medium text-sm">{productName}</div>
                            <div className="text-xs text-muted-foreground">
                              {productDescription}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Date</div>
                              <div className="text-sm">
                                {new Date(order.created_at).toLocaleString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Amount</div>
                              <div>${(order.amount / 100).toFixed(2)} {order.currency?.toUpperCase() || 'USD'}</div>
                            </div>
                          </div>
                          
                          {isDownloadableProduct && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Downloads</div>
                              <div className="text-sm">
                                {order.download_count || 0} / {order.max_downloads || 5}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2 pt-2">
                            {isDownloadableProduct && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => window.open(`https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/download-product/${order.download_token}`, '_blank')}
                                disabled={(order.download_count || 0) >= (order.max_downloads || 5)}
                              >
                                <Download className="mr-2 h-3 w-3" />
                                Download PDF
                              </Button>
                            )}
                            {order.stripe_session_id && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => downloadReceipt(order.stripe_session_id)}
                                disabled={downloadingReceipt === order.stripe_session_id}
                              >
                                {downloadingReceipt === order.stripe_session_id ? (
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                ) : (
                                  <ExternalLink className="mr-2 h-3 w-3" />
                                )}
                                {downloadingReceipt === order.stripe_session_id ? "Loading..." : "Receipt"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Desktop Table View */}
                {orders.length > 0 && (
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Product</TableHead>
                            <TableHead className="text-xs sm:text-sm">Date</TableHead>
                            <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                            <TableHead className="text-xs sm:text-sm">Downloads</TableHead>
                            <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                           {orders.map((order) => {
                            // Determine product display name with better descriptions
                            let productName = 'Purchase';
                            let productDescription = 'Order completed';
                            
                            if (order.products?.name) {
                              // Digital product (PDF guide)
                              productName = order.products.name;
                              productDescription = order.products.description || 'Digital product download';
                            } else if (order.download_token) {
                              // Has download token but no product - likely a digital product
                              productName = 'Digital Product';
                              productDescription = 'Digital product download';
                            } else {
                              // No product and no download token - it's a credit package or subscription
                              // Determine based on amount ranges (subscriptions are typically monthly, credits are one-time)
                              const amountInDollars = order.amount / 100;
                              if (amountInDollars >= 10 && amountInDollars <= 50) {
                                productName = 'Subscription Plan';
                                productDescription = 'Monthly subscription with credits';
                              } else {
                                productName = 'Credit Package';
                                productDescription = 'Credits purchase';
                              }
                            }
                            
                            // Only show download for actual digital products (PDF guides), not credit packs or subscriptions
                            const isDownloadableProduct = order.products?.file_name && order.download_token;
                            
                            return (
                              <TableRow key={order.id}>
                                <TableCell className="min-w-0">
                                  <div>
                                    <div className="font-medium text-sm">{productName}</div>
                                    <div className="text-xs text-muted-foreground break-words">
                                      {productDescription}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                  <div>
                                    <div>
                                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(order.created_at).toLocaleTimeString('en-US', { 
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                  ${(order.amount / 100).toFixed(2)} {order.currency?.toUpperCase() || 'USD'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {isDownloadableProduct ? (
                                    <div className="text-sm">
                                      <div>{order.download_count || 0} / {order.max_downloads || 5}</div>
                                      <div className="text-xs text-muted-foreground">downloads</div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                                    {isDownloadableProduct && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-xs whitespace-nowrap"
                                        onClick={() => window.open(`https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/download-product/${order.download_token}`, '_blank')}
                                        disabled={(order.download_count || 0) >= (order.max_downloads || 5)}
                                      >
                                        <Download className="mr-1 h-3 w-3" />
                                        Download PDF
                                      </Button>
                                    )}
                                    {order.stripe_session_id && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-xs whitespace-nowrap"
                                        onClick={() => downloadReceipt(order.stripe_session_id)}
                                        disabled={downloadingReceipt === order.stripe_session_id}
                                      >
                                        {downloadingReceipt === order.stripe_session_id ? (
                                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        ) : (
                                          <ExternalLink className="mr-1 h-3 w-3" />
                                        )}
                                        {downloadingReceipt === order.stripe_session_id ? "Loading..." : "Receipt"}
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
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
