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
    <section id="newsletter" className="py-12 sm:py-16 lg:py-24 relative">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 font-display gradient-text-primary">
            Stay Updated
          </h2>
          
          <p className="text-sm sm:text-base mb-6 sm:mb-8 text-muted-foreground max-w-2xl mx-auto px-4">
            Weekly AI insights, exclusive tools and prompts, JumpinAI Studio updates, and strategic guidance—everything you need to stay ahead in the AI revolution.
          </p>
          
          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-6 sm:mb-8 px-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-2xl glass focus:glass-dark transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative group overflow-hidden"
              >
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {isSubmitting ? "Processing..." : "Join Now"}
                  </span>
                  
                  {/* Arrow icon */}
                  <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </form>
          
          <p className="text-muted-foreground text-xs sm:text-sm px-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
