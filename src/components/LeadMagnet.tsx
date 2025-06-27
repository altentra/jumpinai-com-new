
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Mail, CheckCircle, Target, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to download the PDF.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Lead magnet download:", email);
    
    try {
      // Record the download (no restrictions)
      const { error: insertError } = await supabase
        .from('lead_magnet_downloads')
        .insert({
          email: email,
          ip_address: null,
          user_agent: navigator.userAgent
        });

      if (insertError) {
        console.error("Database insert error:", insertError);
        // Don't throw error here, we still want to send the email
      }

      // Send welcome email with PDF
      const { data, error } = await supabase.functions.invoke('send-lead-magnet-email', {
        body: { email }
      });

      if (error) {
        console.error("Email function error:", error);
        throw error;
      }

      console.log("Lead magnet email sent successfully:", data);
      
      toast({
        title: "Success! 🎉",
        description: "Check your inbox for the PDF download link. You can also download it directly below.",
      });
      
      setDownloadReady(true);
      setEmail("");
    } catch (error) {
      console.error("Error processing lead magnet request:", error);
      
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us at info@jumpinai.com if this continues.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectDownload = () => {
    // Create download link to the PDF in Supabase storage
    const downloadUrl = `https://cieczaajcgkgdgenfdzi.supabase.co/storage/v1/object/public/lead-magnets/jumpstart-ai-7-fast-wins.pdf`;
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Jumpstart AI - 7 Fast Wins You Can Use Today.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started! 📥",
      description: "Your PDF is downloading now. Enjoy your AI fast wins!",
    });
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-8">
          
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Zap className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-primary">Free Download</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight font-display">
              Jumpstart AI: 
              <span className="gradient-text-primary block">7 Fast Wins You Can Use Today</span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Stop wondering how to implement AI in your business. Get 7 proven strategies that you can start using immediately to boost productivity and streamline your workflow.
            </p>
          </div>

          {/* Benefits List */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Target, text: "Automate repetitive tasks" },
              { icon: Users, text: "Improve team collaboration" },
              { icon: Zap, text: "Generate content faster" },
              { icon: CheckCircle, text: "Make data-driven decisions" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 p-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-muted-foreground font-medium text-center">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="modern-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
                  <Download className="h-5 w-5 mr-2" />
                  Get Your Free PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    Download Your Free AI Guide
                  </DialogTitle>
                </DialogHeader>
                
                {!downloadReady ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground">
                        Enter your email to get instant access to "Jumpstart AI: 7 Fast Wins You Can Use Today"
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 text-base rounded-xl"
                      />
                      
                      <Button 
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full modern-button bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-xl transition-all duration-300"
                      >
                        {isSubmitting ? "Sending..." : "Send Me The PDF"}
                        <Mail className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </form>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Success! 🎉</h3>
                      <p className="text-muted-foreground">
                        We've sent the PDF to your inbox. You can also download it directly:
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleDirectDownload}
                      size="lg"
                      className="w-full modern-button bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-xl transition-all duration-300"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Now
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setDownloadReady(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <p className="text-sm text-muted-foreground flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Instant delivery • No spam • 100% free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;
