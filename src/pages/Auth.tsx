import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const next = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, next, navigate]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return toast.error("Please enter email and password");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      toast.success("Logged in successfully");
      navigate(next, { replace: true });
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) return toast.error("Please enter name, email and password");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { 
          data: { 
            display_name: signupName 
          }
        },
      });
      if (error) throw error;
      toast.success("Account created successfully! Welcome to JumpinAI!");
      navigate(next, { replace: true });
    } catch (e: any) {
      toast.error(e.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) return toast.error("Please enter your email address");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth?next=/dashboard`,
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login or Sign Up | JumpinAI</title>
        <meta name="description" content="Login or create your JumpinAI account using secure Supabase authentication." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      <Navigation />

      <main className="min-h-screen pt-28 pb-24">
        <section className="max-w-xl mx-auto px-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Access your JumpinAI account</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Create a password" />
                  </div>
                  <Button onClick={handleSignup} disabled={loading} className="w-full">
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Start using JumpinAI immediately after signup!</p>
                </TabsContent>

                <TabsContent value="login" className="mt-6 space-y-4">
                  {!showForgotPassword ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Enter your email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter your password" />
                      </div>
                      <Button onClick={handleLogin} disabled={loading} className="w-full">
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                      <div className="text-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => setShowForgotPassword(true)}
                          className="text-primary hover:text-primary/80"
                        >
                          Forgot password?
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email address</Label>
                        <Input 
                          id="forgot-email" 
                          type="email" 
                          value={forgotPasswordEmail} 
                          onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                          placeholder="Enter your email to reset password"
                        />
                      </div>
                      <Button onClick={handleForgotPassword} disabled={loading} className="w-full">
                        {loading ? "Sending reset email..." : "Send reset email"}
                      </Button>
                      <div className="text-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotPasswordEmail("");
                          }}
                          className="text-muted-foreground hover:text-primary"
                        >
                          Back to login
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">By continuing you agree to our Terms and Privacy Policy.</p>
            </CardFooter>
          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
}
