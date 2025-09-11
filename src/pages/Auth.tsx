import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";

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
          },
          emailRedirectTo: `https://www.jumpinai.com/dashboard`
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://www.jumpinai.com/dashboard`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "Google login failed");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) return toast.error("Please enter your email address");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `https://www.jumpinai.com/auth?next=/dashboard`,
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

      <main className="min-h-screen pt-28 pb-24 bg-gradient-to-br from-background via-muted/50 to-background">
        <section className="max-w-xl mx-auto px-6">
          <Card className="animate-fade-in backdrop-blur-xl bg-background/80 border-2 border-border/50 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Access your JumpinAI account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Google Login Button */}
              <Button 
                onClick={handleGoogleLogin} 
                disabled={loading} 
                variant="outline" 
                className="w-full h-14 text-base font-medium bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <svg 
                  className="mr-3 h-6 w-6" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fill="#4285F4" 
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path 
                    fill="#34A853" 
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path 
                    fill="#FBBC05" 
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path 
                    fill="#EA4335" 
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-muted-foreground font-medium border border-border/50">
                    Or continue with
                  </span>
                </div>
              </div>

              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid grid-cols-2 w-full bg-muted/30 backdrop-blur-sm p-1 rounded-xl border border-border/30">
                  <TabsTrigger 
                    value="signup" 
                    className="rounded-lg data-[state=active]:bg-background/80 data-[state=active]:shadow-lg data-[state=active]:text-foreground transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                  <TabsTrigger 
                    value="login" 
                    className="rounded-lg data-[state=active]:bg-background/80 data-[state=active]:shadow-lg data-[state=active]:text-foreground transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="mt-8 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">Name</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      value={signupName} 
                      onChange={(e) => setSignupName(e.target.value)} 
                      placeholder="Enter your full name" 
                      className="h-12 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      placeholder="Enter your email" 
                      className="h-12 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      placeholder="Create a password" 
                      className="h-12 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <Button 
                    onClick={handleSignup} 
                    disabled={loading} 
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center bg-muted/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    Start using JumpinAI immediately after signup!
                  </p>
                </TabsContent>

                <TabsContent value="login" className="mt-8 space-y-6">
                  {!showForgotPassword ? (
                    <>
                      <div className="space-y-3">
                        <Label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          value={loginEmail} 
                          onChange={(e) => setLoginEmail(e.target.value)} 
                          placeholder="Enter your email" 
                          className="h-12 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</Label>
                        <Input 
                          id="login-password" 
                          type="password" 
                          value={loginPassword} 
                          onChange={(e) => setLoginPassword(e.target.value)} 
                          placeholder="Enter your password" 
                          className="h-12 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                      </div>
                      <Button 
                        onClick={handleLogin} 
                        disabled={loading} 
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                      <div className="text-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => setShowForgotPassword(true)}
                          className="text-primary hover:text-primary/80 font-medium rounded-lg px-4 py-2 hover:bg-primary/10 transition-all duration-300"
                        >
                          Forgot password?
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground">Email address</Label>
                        <Input 
                          id="forgot-email" 
                          type="email" 
                          value={forgotPasswordEmail} 
                          onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                          placeholder="Enter your email to reset password"
                          className="h-12 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                      </div>
                      <Button 
                        onClick={handleForgotPassword} 
                        disabled={loading} 
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
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
                          className="text-muted-foreground hover:text-primary font-medium rounded-lg px-4 py-2 hover:bg-muted/20 transition-all duration-300"
                        >
                          Back to login
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center pt-8 pb-6">
              <p className="text-sm text-muted-foreground text-center bg-muted/10 backdrop-blur-sm px-6 py-3 rounded-full border border-border/30">
                By continuing you agree to our{" "}
                <Link 
                  to="/terms-of-use" 
                  className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors duration-300"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link 
                  to="/privacy-policy" 
                  className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
}
