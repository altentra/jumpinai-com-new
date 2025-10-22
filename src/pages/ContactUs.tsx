
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
import { Mail, MapPin, Clock, Send, MessageCircle, Phone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

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
    <div className="min-h-screen bg-gradient-to-br from-background/95 via-background to-primary/5">
      <Helmet>
        <title>Contact JumpinAI | Get AI Strategy & Implementation Support</title>
        <meta name="description" content="Contact JumpinAI for AI strategy consultation, implementation support, and expert guidance. Get in touch with our team to transform your business with AI." />
        <link rel="canonical" href={`${window.location.origin}/contact-us`} />
      </Helmet>
      
      {/* Enhanced floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent rounded-full blur-xl"></div>
      </div>
      
      <Navigation />
      
      {/* Premium Hero Section - Glass Morphism */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-6 md:p-12 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent animate-fade-in-up">
                Let's Start a Conversation
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 animate-fade-in-up animate-delay-100">
                Ready to transform your business with AI? We're here to guide you through every step of your AI journey.
              </p>
              
              <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-2xl p-4 shadow-lg shadow-primary/10 animate-fade-in-up animate-delay-200">
                <p className="text-base text-muted-foreground">
                  Whether you need strategic guidance, implementation support, or custom AI solutions, 
                  our team of AI experts is ready to help you unlock your potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Contact Section - Glass Morphism */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 xl:gap-8">
            
            {/* Contact Information - Enhanced Glass Cards */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass backdrop-blur-md bg-background/25 dark:bg-background/15 border border-primary/20 rounded-3xl p-6 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
                <h2 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                  Get in Touch
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  We're here to help you navigate the world of AI and turn your vision into reality.
                </p>

                <div className="space-y-3">
                  {/* Main Email - Premium Glass Card */}
                  <div className="glass backdrop-blur-sm bg-gradient-to-br from-primary/10 via-background/30 to-secondary/5 border border-primary/30 rounded-2xl p-4 shadow-xl shadow-primary/15 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-300 group hover:scale-105 hover:-translate-y-1">
                    <div>
                      <h3 className="font-bold text-sm mb-2 bg-gradient-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
                        Email Us
                      </h3>
                      <a 
                        href="mailto:info@jumpinai.com" 
                        className="text-base font-semibold text-primary mb-1 hover:text-primary/80 transition-colors duration-200 cursor-pointer"
                      >
                        info@jumpinai.com
                      </a>
                      <p className="text-xs text-muted-foreground">Your gateway to AI transformation</p>
                    </div>
                  </div>

                  {/* Response Time & Location - Enhanced Cards */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-2xl p-3 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/30 transition-all duration-300 group">
                      <div>
                        <h4 className="font-bold text-xs text-foreground mb-1">Response Time</h4>
                        <p className="text-xs text-muted-foreground">Within 24 hours</p>
                      </div>
                    </div>

                    <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/20 rounded-2xl p-3 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/30 transition-all duration-300 group">
                      <div>
                        <h4 className="font-bold text-xs text-foreground mb-1">Our Reach</h4>
                        <p className="text-xs text-muted-foreground">Global - Remote Team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Premium Glass Design */}
            <div className="lg:col-span-8">
              <div className="glass backdrop-blur-md bg-background/30 dark:bg-background/15 border border-primary/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/10 hover:shadow-3xl hover:shadow-primary/15 transition-all duration-500">
                <div className="max-w-2xl mx-auto">
                  {/* Form Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-br from-foreground via-foreground to-primary/70 bg-clip-text text-transparent">
                      Send us a Message
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Fill out the form below and we'll get back to you as soon as possible with personalized insights for your AI journey.
                    </p>
                  </div>

                  {/* Form Container */}
                  <div className="glass backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-primary/25 rounded-2xl p-6 shadow-xl shadow-primary/15">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel className="text-xs font-bold text-foreground">Full Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Your full name" 
                                    className="h-10 text-sm glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
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
                                <FormLabel className="text-xs font-bold text-foreground">Email Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="your.email@example.com" 
                                    type="email" 
                                    className="h-10 text-sm glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
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
                              <FormLabel className="text-xs font-bold text-foreground">Subject</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="What would you like to discuss?" 
                                  className="h-10 text-sm glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
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
                              <FormLabel className="text-xs font-bold text-foreground">Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your AI goals, challenges, or how we can help you transform your business..."
                                  className="min-h-[120px] text-sm glass backdrop-blur-sm bg-background/50 dark:bg-background/30 border-primary/30 focus:border-primary/50 focus:bg-background/70 dark:focus:bg-background/50 transition-all duration-300 rounded-xl resize-none shadow-lg shadow-primary/5 focus:shadow-xl focus:shadow-primary/10"
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
                            className="w-full h-10 text-sm font-bold bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80 text-primary-foreground border border-primary/30 rounded-3xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
                          >
                            {isSubmitting ? "Sending Message..." : "Send Message"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
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
