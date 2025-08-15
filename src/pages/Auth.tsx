import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

const Auth = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
              Welcome to JumpinAI
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your AI-powered dashboard
            </p>
          </div>

          {/* Auth Form */}
          <div className="glass rounded-2xl p-8 border border-border shadow-modern animate-fade-in-up">
            <div className="space-y-6">
              {isAuthenticated ? (
                <div className="text-center space-y-4">
                  <p className="text-foreground">Welcome, {user?.name || user?.email}!</p>
                  <Button 
                    className="w-full h-11 modern-button" 
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    className="w-full h-11 modern-button" 
                    onClick={() => loginWithRedirect()}
                    disabled={isLoading}
                  >
                    {isLoading ? "Please wait..." : "Sign In / Sign Up"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Secure authentication powered by Auth0
                  </p>
                </div>
              )}
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
