import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address (e.g., example@domain.com).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Newsletter signup:", email);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-email', {
        body: { email }
      });

      // Handle the special case where we get a FunctionsHttpError due to 409 status
      if (error && error.message?.includes("non-2xx status code")) {
        console.log("Received non-2xx status, checking if it's already subscribed case");
        
        // Try to get the response data from the error context
        // For 409 status (already subscribed), we want to show a success message
        try {
          // Use the configured Supabase client instead of hardcoded API keys
          const { data: retryData, error: retryError } = await supabase.functions.invoke('send-newsletter-email', {
            body: { email }
          });
          
          if (retryError) {
            console.log("Retry also failed:", retryError);
          } else if (retryData && retryData.message?.includes("already subscribed")) {
            toast({
              title: "You're Already Part of Our Community! 🎉",
              description: "Great news! You're already subscribed to our newsletter. Check your inbox for our latest AI insights and updates.",
            });
            setEmail("");
            return;
          }
        } catch (directFetchError) {
          console.error("Direct fetch also failed:", directFetchError);
        }
        
        // If we can't determine it's already subscribed, show generic error
        throw error;
      }

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      // Check if it's an error response from our function
      if (data && !data.success) {
        // Handle already subscribed case with friendly SUCCESS message (NOT as error)
        if (data.message?.includes("already subscribed")) {
          toast({
            title: "You're Already Part of Our Community! 🎉",
            description: "Great news! You're already subscribed to our newsletter. Check your inbox for our latest AI insights and updates.",
            // NO variant specified = default success styling (green)
          });
        } else {
          // Handle other subscription issues with friendly tone (NOT as error)
          toast({
            title: "Subscription Update",
            description: data.message || "We're processing your subscription. If you continue to have issues, please contact us at info@jumpinai.com.",
            // NO variant specified = default success styling (green)
          });
        }
        setEmail("");
        return;
      }

      console.log("Newsletter signup successful:", data);
      
      // Show appropriate success message based on subscription type
      const isResubscription = data?.isResubscription;
      toast({
        title: isResubscription ? "Welcome Back! 🎉" : "Welcome to JumpinAI! 🚀",
        description: isResubscription 
          ? "Fantastic! You're back in our community. We've reactivated your subscription and you'll receive our latest AI strategies and insights."
          : "Thank you for joining our community! Check your inbox for a welcome email with exclusive AI content and resources.",
        // NO variant specified = default success styling (green)
      });
      
      setEmail("");
    } catch (error) {
      console.error("Error processing newsletter signup:", error);
      
      // Show friendly error message ONLY for actual technical errors
      toast({
        title: "Technical Issue",
        description: "We're experiencing a temporary issue. Please try again in a moment or contact us at info@jumpinai.com if this continues.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="relative py-12 px-4 sm:px-6 lg:px-8 scroll-snap-section overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02]"></div>
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="relative border-2 border-border/40 dark:border-border/60 rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-in-up glass-dark backdrop-blur-xl bg-background/80 dark:bg-background/60 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-500 hover:shadow-3xl group">
          {/* Enhanced Border Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 dark:from-primary/30 dark:via-primary/40 dark:to-primary/30 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-background/90 dark:bg-background/80 rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-2xl blur-lg opacity-20 dark:opacity-30"></div>
                <div className="relative bg-primary p-3 rounded-2xl shadow-lg">
                  <Mail className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3 tracking-tight font-display">
              Stay Ahead
            </h2>
            
            <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed font-light">
              Get the latest AI tools, strategic insights, and professional workflows delivered to your inbox. Join thousands of industry leaders already implementing AI strategically.
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-3 text-base rounded-3xl border-border bg-background/80 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:bg-background transition-all duration-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="modern-button group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base font-semibold rounded-3xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl backdrop-blur-sm"
                >
                  {isSubmitting ? "Processing..." : "Join Now"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-3">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground font-display">30K+</div>
                <div className="text-muted-foreground text-sm">Professionals</div>
              </div>
              <div className="w-px h-6 bg-border hidden sm:block"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground font-display">98%</div>
                <div className="text-muted-foreground text-sm">Satisfaction</div>
              </div>
              <div className="w-px h-6 bg-border hidden sm:block"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground font-display">Weekly</div>
                <div className="text-muted-foreground text-sm">Updates</div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-xs font-light">
              Professional insights only. Unsubscribe anytime. Previously unsubscribed? You can resubscribe here!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
