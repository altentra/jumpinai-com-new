import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) navigate("/dashboard", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20">
      <Helmet>
        <title>Login or Sign Up | JumpinAI</title>
        <meta name="description" content="Sign in or create an account to access your profile and JumpinAI Pro subscription." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      <section className="max-w-md mx-auto glass rounded-2xl p-8 border border-border">
        <h1 className="text-2xl font-bold mb-6">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button className="w-full" onClick={isSignUp ? handleSignUp : handleSignIn} disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            onClick={() => setIsSignUp((v) => !v)}
          >
            {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </div>
      </section>
      <aside className="max-w-md mx-auto mt-6 text-sm text-muted-foreground">
        By continuing you agree to our Terms and acknowledge our Privacy Policy.
      </aside>
    </main>
  );
};

export default Auth;
