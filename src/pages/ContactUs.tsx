
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const ContactUs = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log("Contact form submitted:", values);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: values
      });

      if (error) throw error;

      console.log("Emails sent successfully:", data);
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours. A confirmation email has been sent to your inbox.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error sending message",
        description: "There was an error sending your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl blur-lg opacity-75 dark:from-gray-400 dark:to-gray-200"></div>
              <div className="relative bg-gradient-to-r from-gray-600 to-gray-800 p-4 rounded-2xl dark:from-gray-400 dark:to-gray-200">
                <Mail className="h-10 w-10 text-white dark:text-black" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text-primary mb-6 animate-fade-in-up">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Ready to transform your AI strategy? Let's start a conversation about your goals and how we can help you achieve them.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            
            {/* Contact Information - Sidebar */}
            <div className="lg:col-span-1 space-y-6 animate-fade-in-left">
              <div>
                <h2 className="text-xl font-bold mb-4 font-display text-foreground">Let's Connect</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We're here to help you navigate the world of AI.
                </p>
              </div>

              <div className="space-y-4">
                {/* Main Email - Emphasized */}
                <div className="group p-4 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 hover:from-muted hover:to-muted/60 transition-all duration-300 border border-border/50">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-200 p-2 rounded-lg flex-shrink-0">
                      <Mail className="h-4 w-4 text-white dark:text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1 text-foreground">Email Us</h3>
                      <p className="text-base font-semibold gradient-text-primary">info@jumpinai.com</p>
                      <p className="text-xs text-muted-foreground mt-1">Your gateway to AI transformation</p>
                    </div>
                  </div>
                </div>

                {/* Secondary Info - Smaller */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="group flex items-center space-x-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-300">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-200 p-1.5 rounded-md">
                      <Clock className="h-3 w-3 text-white dark:text-black" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-foreground">Response Time</h4>
                      <p className="text-xs text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>

                  <div className="group flex items-center space-x-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-300">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-200 p-1.5 rounded-md">
                      <MapPin className="h-3 w-3 text-white dark:text-black" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-foreground">Our Reach</h4>
                      <p className="text-xs text-muted-foreground">Global - Remote Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Main Content */}
            <div className="lg:col-span-2 animate-fade-in-right">
              <div className="max-w-xl mx-auto">
                <Card className="relative shadow-2xl backdrop-blur-xl bg-gradient-to-br from-background/95 via-background/90 to-muted/10 border-2 border-gray-200/30 dark:border-gray-700/50 before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-gray-300/20 dark:before:border-gray-600/40 before:bg-gradient-to-br before:from-background/80 before:to-background/40 before:backdrop-blur-xl before:-z-10 dark:before:from-background/60 dark:before:to-background/20">
                  <CardHeader className="pb-6 text-center relative z-10">
                    <CardTitle className="text-2xl font-bold font-display text-foreground mb-3">Send us a Message</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Your full name" 
                                    className="h-10 text-sm bg-background/50 border-border/50 focus:border-foreground/20 focus:bg-background transition-all duration-300 rounded-lg"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold">Email Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="your.email@example.com" 
                                    type="email" 
                                    className="h-10 text-sm bg-background/50 border-border/50 focus:border-foreground/20 focus:bg-background transition-all duration-300 rounded-lg"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-semibold">Subject</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="What would you like to discuss?" 
                                  className="h-10 text-sm bg-background/50 border-border/50 focus:border-foreground/20 focus:bg-background transition-all duration-300 rounded-lg"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-semibold">Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your AI goals, challenges, or how we can help you..."
                                  className="min-h-[120px] text-sm bg-background/50 border-border/50 focus:border-foreground/20 focus:bg-background transition-all duration-300 rounded-lg resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-modern group"
                          >
                            <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            {isSubmitting ? "Sending..." : "Send Message"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
