import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      });

      if (error) {
        console.error('Error checking email:', error);
        return false;
      }

      return data?.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    
    // Check if user already exists
    const userExists = await checkEmailExists(email);
    if (userExists) {
      setLoading(false);
      toast.error("An account with this email already exists. Please sign in instead.");
      setIsSignUp(false); // Switch to sign in mode
      return;
    }
    
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: redirectUrl,
        data: { display_name: name }
      },
    });
    
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>Login or Sign Up | JumpinAI</title>
        <meta name="description" content="Sign in or create an account to access your profile and JumpinAI Pro subscription." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      
      <div className="container mx-auto px-4">
        <section className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-down">
            <h1 className="text-3xl font-bold gradient-text-primary mb-3">
              {isSignUp ? "Join JumpinAI" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp 
                ? "Create your account and start your AI journey" 
                : "Sign in to access your dashboard"
              }
            </p>
          </div>

          {/* Auth Form */}
          <div className="glass rounded-2xl p-8 border border-border shadow-modern animate-fade-in-up">
            <div className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your full name"
                    className="h-11"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>
              
              <Button 
                className="w-full h-11 modern-button" 
                onClick={isSignUp ? handleSignUp : handleSignIn} 
                disabled={loading || (isSignUp && !name.trim())}
              >
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  onClick={() => setIsSignUp((v) => !v)}
                >
                  {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
                </button>
              </div>
            </div>
          </div>

          <aside className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up animate-delay-200">
            By continuing you agree to our{" "}
            <Link to="/terms-of-use" className="text-foreground hover:underline underline-offset-4 transition-colors">
              Terms of Use
            </Link>{" "}
            and acknowledge our{" "}
            <Link to="/privacy-policy" className="text-foreground hover:underline underline-offset-4 transition-colors">
              Privacy Policy
            </Link>
            .
          </aside>
        </section>
      </div>
    </main>
  );
};

export default Auth;
