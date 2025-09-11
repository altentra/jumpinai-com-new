import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Crown, CreditCard, RefreshCcw, Save, LogOut } from "lucide-react";

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

const Profile = () => {
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string }>({ display_name: "", avatar_url: "" });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [subInfo, setSubInfo] = useState<SubscriberInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        login('/profile');
      } else if (user) {
        setEmail(user.email || "");
        fetchProfile();
        refreshSubscription();
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
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await (supabase.from("profiles" as any) as any)
      .upsert({ id: user.id, display_name: profile?.display_name, avatar_url: profile?.avatar_url });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile saved");
      fetchProfile();
    }
  };

  const changePassword = async () => {
    if (!password) return toast.error("Enter a new password");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPassword("");
    }
  };

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubInfo(data as SubscriberInfo);
    } catch (e: any) {
      console.error(e);
      toast.error("Could not refresh subscription status");
    }
  };

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
        body: { source: 'profile' },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, '_blank');
    } catch (e: any) {
      toast.error(e.message || "Failed to open customer portal");
    }
  };

  const proActive = useMemo(() => subInfo?.subscribed && subInfo.subscription_tier === "JumpinAI Pro", [subInfo]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
          {/* Enhanced floating background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
          </div>
          <div className="max-w-6xl mx-auto px-6">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Account | JumpinAI</title>
        <meta name="description" content="Manage your profile, security, and JumpinAI Pro subscription in your account dashboard." />
        <link rel="canonical" href={`${window.location.origin}/profile`} />
      </Helmet>
      <Navigation />

      <main className="min-h-screen pt-28 pb-24 bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
        </div>
        {/* Header */}
        <header className="max-w-6xl mx-auto px-6">
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
        <section className="max-w-6xl mx-auto px-6 mt-6">
          <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-4 w-full gap-2 md:gap-0 -mx-2 px-2 md:mx-0 md:px-0 rounded-xl bg-muted/30">
            <TabsTrigger value="overview" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Crown className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              <CreditCard className="h-4 w-4" /> Subscription
            </TabsTrigger>
          </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Subscription</CardTitle>
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
                        <CreditCard className="mr-2 h-4 w-4" /> Manage subscription
                      </Button>
                      <Button variant="outline" onClick={refreshSubscription} className="hover-scale">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh status
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile" className="mt-6 animate-fade-in">
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
                <CardFooter className="flex flex-wrap gap-3">
                  <Button onClick={changePassword} className="hover-scale">
                    Update password
                  </Button>
                  <Button variant="outline" onClick={() => logout()} className="hover-scale">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Subscription Plans */}
            <TabsContent value="subscription" className="mt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                    <p className="text-muted-foreground">$0 / month</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc list-inside">
                      {planFeatures.free.map((f) => (<li key={f}>{f}</li>))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className={`h-full ${subInfo?.subscribed ? 'ring-1 ring-primary/30' : ''}`}>
                  <CardHeader className="flex items-start justify-between">
                    <div>
                      <CardTitle>JumpinAI Pro</CardTitle>
                      <p className="text-muted-foreground">$10 / month</p>
                    </div>
                    {subInfo?.subscribed && (
                      <Badge className="bg-primary/10 text-primary">Your plan</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc list-inside">
                      {planFeatures.pro.map((f) => (<li key={f}>{f}</li>))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3">
                    {!subInfo?.subscribed ? (
                      <Button onClick={subscribe} className="hover-scale">
                        <Crown className="mr-2 h-4 w-4" /> Get JumpinAI Pro
                      </Button>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={manage} className="hover-scale">
                          <CreditCard className="mr-2 h-4 w-4" /> Manage subscription
                        </Button>
                        <Button variant="outline" onClick={refreshSubscription} className="hover-scale">
                          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh status
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Bottom Log Out */}
          <div className="mt-6">
            <Button variant="outline" onClick={() => logout()} className="w-full md:w-auto hover-scale">
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );

};

export default Profile;
