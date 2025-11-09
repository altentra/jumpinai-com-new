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

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

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
      const { data, error } = await supabase.auth.signUp({
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
      
      // Send signup notification to admin
      if (data.user) {
        try {
          await supabase.functions.invoke('send-user-signup-notification', {
            body: {
              email: signupEmail,
              name: signupName,
              provider: 'email'
            }
          });
          console.log("✅ Signup notification sent to admin");
        } catch (notifError) {
          console.error("⚠️ Failed to send signup notification:", notifError);
          // Don't fail signup if notification fails
        }
      }
      
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

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `https://www.jumpinai.com/dashboard`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "Apple login failed");
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

      <main className="min-h-screen pt-28 pb-24 bg-gradient-to-br from-background/95 via-background to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative overflow-hidden">
        {/* Premium floating background elements with liquid glass effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs with enhanced blur and liquid animation */}
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          
          {/* Liquid glass floating elements */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
          
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent opacity-40"></div>
        </div>
        <section className="max-w-xl mx-auto px-6 relative">
          <Card className="animate-fade-in backdrop-blur-xl bg-background/80 border border-primary/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Access your JumpinAI account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Login Button */}
              <Button 
                onClick={handleGoogleLogin} 
                disabled={loading} 
                variant="outline" 
                className="w-full h-11 text-base font-medium bg-card hover:bg-muted border border-primary/20 hover:border-primary/40 text-foreground rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
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

              {/* Apple Login Button */}
              <Button
                onClick={handleAppleLogin}
                disabled={loading}
                aria-label="Continue with Apple"
                variant="outline"
                className="w-full h-11 mt-2 text-base font-medium bg-card hover:bg-muted border border-primary/20 hover:border-primary/40 text-foreground rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                <svg
                  className="mr-3 h-5 w-5"
                  viewBox="0 0 814 1000"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127c-54.7-77.4-96.7-194.1-96.7-311.6 0-200.2 130.4-307.5 250.8-307.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 2.6 18.1 4.2.6 10.4 1.3 16.6 1.3 45.4 0 102.5-30.4 131.8-71.3z"/>
                </svg>
                Continue with Apple
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-muted-foreground font-medium border border-primary/15">
                    Or continue with
                  </span>
                </div>
              </div>

              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid grid-cols-2 w-full bg-muted/30 backdrop-blur-sm p-1 rounded-2xl border border-primary/15">
                  <TabsTrigger 
                    value="signup" 
                    className="rounded-xl data-[state=active]:bg-background/80 data-[state=active]:shadow-lg data-[state=active]:text-foreground transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                  <TabsTrigger 
                    value="login" 
                    className="rounded-xl data-[state=active]:bg-background/80 data-[state=active]:shadow-lg data-[state=active]:text-foreground transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="mt-6 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">Name</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      value={signupName} 
                      onChange={(e) => setSignupName(e.target.value)} 
                      placeholder="Enter your full name" 
                      className="h-10 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      placeholder="Enter your email" 
                      className="h-10 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      placeholder="Create a password" 
                      className="h-10 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <Button 
                    onClick={handleSignup} 
                    disabled={loading} 
                    variant="glass"
                    className="w-full h-10 mt-4"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center bg-muted/20 backdrop-blur-sm px-3 py-1 rounded-xl mt-2">
                    Start using JumpinAI immediately after signup!
                  </p>
                </TabsContent>

                <TabsContent value="login" className="mt-6 space-y-3">
                  {!showForgotPassword ? (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          value={loginEmail} 
                          onChange={(e) => setLoginEmail(e.target.value)} 
                          placeholder="Enter your email" 
                          className="h-10 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</Label>
                        <Input 
                          id="login-password" 
                          type="password" 
                          value={loginPassword} 
                          onChange={(e) => setLoginPassword(e.target.value)} 
                          placeholder="Enter your password" 
                          className="h-10 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                      </div>
                      <Button 
                        onClick={handleLogin} 
                        disabled={loading} 
                        variant="glass"
                        className="w-full h-10 mt-4"
                      >
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                      <div className="text-center mt-2">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => setShowForgotPassword(true)}
                          className="text-primary hover:text-primary/80 font-medium rounded-2xl px-3 py-1 hover:bg-primary/10 transition-all duration-300 text-sm"
                        >
                          Forgot password?
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground">Email address</Label>
                        <Input 
                          id="forgot-email" 
                          type="email" 
                          value={forgotPasswordEmail} 
                          onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                          placeholder="Enter your email to reset password"
                          className="h-10 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                      </div>
                      <Button 
                        onClick={handleForgotPassword} 
                        disabled={loading} 
                        variant="glass"
                        className="w-full h-10 mt-4"
                      >
                        {loading ? "Sending reset email..." : "Send reset email"}
                      </Button>
                      <div className="text-center mt-2">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotPasswordEmail("");
                          }}
                          className="text-muted-foreground hover:text-primary font-medium rounded-2xl px-3 py-1 hover:bg-muted/20 transition-all duration-300 text-sm"
                        >
                          Back to login
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center pt-4 pb-4">
              <p className="text-sm text-muted-foreground text-center bg-muted/10 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
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
