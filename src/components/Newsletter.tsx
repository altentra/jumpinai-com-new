import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, ArrowRight } from "lucide-react";
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
          // Make a direct fetch to get the actual response using the correct Supabase URL
          const response = await fetch(`https://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/send-newsletter-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWN6YWFqY2drZ2RnZW5mZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzU4OTksImV4cCI6MjA2NjExMTg5OX0.OiDppCXfN_AN64XvCvfhphFqbjSvRtKSwF-cIXCZMQU'
            },
            body: JSON.stringify({ email })
          });
          
          const responseData = await response.json();
          console.log("Direct response data:", responseData);
          
          if (response.status === 409 && responseData.message?.includes("already subscribed")) {
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
    <section id="newsletter" className="relative py-12 px-4 sm:px-6 lg:px-8 scroll-snap-section">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="relative border-2 border-border/40 dark:border-border/60 rounded-3xl p-8 sm:p-10 shadow-modern-lg animate-fade-in-up bg-background/80 backdrop-blur-sm hover:border-border/60 dark:hover:border-border/80 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.1)]">
          {/* Enhanced Border Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl opacity-30 dark:opacity-50 blur-sm"></div>
          <div className="absolute inset-0 bg-background rounded-3xl"></div>
          
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
            
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 bg-muted/60 backdrop-blur-sm rounded-full mb-5 border border-border/50">
              <Sparkles className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm font-semibold text-muted-foreground">Join the Professionals</span>
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
                    placeholder="Enter your professional email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-3 text-base rounded-2xl border-border bg-background text-foreground placeholder-muted-foreground focus:bg-background transition-all duration-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="modern-button group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
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
