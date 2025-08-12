import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth", { replace: true });
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setEmail(user.email || "");
      await fetchProfile();
      await refreshSubscription();
      setLoading(false);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

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
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  const manage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Failed to open customer portal");
    }
  };

  const proActive = useMemo(() => subInfo?.subscribed && subInfo.subscription_tier === "JumpinAI Pro", [subInfo]);

  if (loading) return <main className="min-h-screen pt-28 pb-20"><div className="max-w-4xl mx-auto">Loading...</div></main>;

  return (
    <main className="min-h-screen pt-28 pb-20">
      <Helmet>
        <title>Your Profile | JumpinAI</title>
        <meta name="description" content="Manage your profile, security, and JumpinAI Pro subscription." />
        <link rel="canonical" href={`${window.location.origin}/profile`} />
      </Helmet>

      <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="glass rounded-2xl p-6 border border-border md:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
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
          <div className="mt-4 flex gap-3">
            <Button onClick={saveProfile}>Save changes</Button>
          </div>
        </article>

        <aside className="glass rounded-2xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="new_password">New password</Label>
            <Input id="new_password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="mt-3 w-full" onClick={changePassword}>Update password</Button>
          <Button className="mt-3 w-full" variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>Sign out</Button>
        </aside>
      </section>

      <section className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className={`rounded-2xl p-6 border ${proActive ? 'border-primary' : 'border-border'} glass`}>
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="text-muted-foreground">$0 / month</p>
          <ul className="mt-4 space-y-2 list-disc list-inside">
            {planFeatures.free.map((f) => (<li key={f}>{f}</li>))}
          </ul>
        </article>
        <article className={`rounded-2xl p-6 border ${proActive ? 'border-primary' : 'border-border'} glass`}>
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl font-semibold">JumpinAI Pro</h2>
              <p className="text-muted-foreground">$10 / month</p>
            </div>
            {proActive && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">Your plan</span>}
          </div>
          <ul className="mt-4 space-y-2 list-disc list-inside">
            {planFeatures.pro.map((f) => (<li key={f}>{f}</li>))}
          </ul>
          <div className="mt-4 flex gap-3">
            {!proActive ? (
              <Button onClick={subscribe}>Get JumpinAI Pro</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={manage}>Manage subscription</Button>
                <Button variant="outline" onClick={refreshSubscription}>Refresh status</Button>
              </>
            )}
          </div>
          {subInfo?.subscription_end && (
            <p className="mt-3 text-sm text-muted-foreground">Current period ends: {new Date(subInfo.subscription_end).toLocaleString()}</p>
          )}
        </article>
      </section>
    </main>
  );
};

export default Profile;
