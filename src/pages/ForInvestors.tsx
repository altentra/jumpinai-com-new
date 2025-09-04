import { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { InvestmentDeckModal } from "@/components/InvestmentDeckModal";
import { TrendingUp, Users, Globe, DollarSign, Target, Lightbulb, Rocket, Mail, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { sendInvestorContactEmail } from "@/services/investorService";

const ForInvestors = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    investmentLevel: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const scrollToContactForm = () => {
    const contactSection = document.getElementById('contact-form-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendInvestorContactEmail(formData);
      toast({
        title: "Message Sent Successfully",
        description: "We'll respond to your inquiry within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        investmentLevel: '',
        message: ''
      });
    } catch (error: any) {
      console.error("Error sending investor contact:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Please try again later.",
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
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Invest in the Future of
                <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Everyday AI Education
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                JumpinAI empowers everyday people to harness AI tools for income, productivity, and opportunity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => setIsDeckModalOpen(true)}
              >
                <Target className="mr-2 h-5 w-5" />
                Explore Investment Deck
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={scrollToContactForm}
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Invest in JumpinAI
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Positioned at the intersection of AI, education, and the future of work
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Growing Market</h3>
                <p className="text-muted-foreground">
                  The AI education market is projected to reach $25.7B by 2030, growing at 32% annually.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Clear Problem</h3>
                <p className="text-muted-foreground">
                  Millions need practical AI skills but find existing resources too technical or theoretical.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">High Margins</h3>
                <p className="text-muted-foreground">
                  Digital-first model with scalable content delivery and low operational overhead.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
              <CardContent className="p-6 text-center">
                <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Perfect Timing</h3>
                <p className="text-muted-foreground">
                  AI adoption is accelerating, creating massive demand for accessible education.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Unique */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/5 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Makes Us Unique
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our differentiated approach to AI education sets us apart in the market
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Beginner-First Approach</h3>
                  <p className="text-muted-foreground">
                    Designed for everyday people, not tech experts. We make AI accessible to everyone.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Digital-First Model</h3>
                  <p className="text-muted-foreground">
                    Low overhead, high scalability. Our platform reaches global audiences efficiently.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Community-Driven Growth</h3>
                  <p className="text-muted-foreground">
                    Our users become advocates, driving organic growth and engagement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-World Application</h3>
                  <p className="text-muted-foreground">
                    Practical skills that translate directly to income and productivity gains.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Use of Funds
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Strategic investment in growth, innovation, and community impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Product Development</h3>
                <p className="text-muted-foreground mb-4">
                  Enhanced platform features, mobile apps, and AI-powered personalization
                </p>
                <div className="text-2xl font-bold text-primary">40%</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Marketing & Content</h3>
                <p className="text-muted-foreground mb-4">
                  Content production, influencer partnerships, and growth marketing
                </p>
                <div className="text-2xl font-bold text-primary">30%</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Platform Expansion</h3>
                <p className="text-muted-foreground mb-4">
                  New markets, language localization, and enterprise solutions
                </p>
                <div className="text-2xl font-bold text-primary">20%</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community & Access</h3>
                <p className="text-muted-foreground mb-4">
                  Scholarships, community programs, and accessibility initiatives
                </p>
                <div className="text-2xl font-bold text-primary">10%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Crunchbase Profile */}
      <section className="py-16 px-4 bg-gradient-to-br from-secondary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    Explore Our Company Profile
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Get detailed insights into our company metrics, funding history, and growth trajectory on Crunchbase.
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-3 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                  onClick={() => window.open('https://www.crunchbase.com/organization/jumpinai', '_blank')}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View on Crunchbase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section id="contact-form-section" className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to Support a Smarter Future?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join us in democratizing AI education and empowering the next generation of AI-savvy professionals.
            </p>
          </div>
          
          <Card className="shadow-2xl border-0 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="investmentLevel" className="block text-sm font-medium text-foreground mb-2">
                    Investment Interest Level
                  </label>
                  <select
                    id="investmentLevel"
                    name="investmentLevel"
                    value={formData.investmentLevel}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select an option</option>
                    <option value="angel">Angel Investor ($25K - $100K)</option>
                    <option value="strategic">Strategic Partner ($100K - $500K)</option>
                    <option value="institutional">Institutional Investor ($500K+)</option>
                    <option value="advisory">Advisory Role</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message (Optional)
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your investment interests and any questions you have..."
                    className="w-full"
                  />
                </div>
                
                <div className="text-center">
                  <Button type="submit" size="lg" className="text-lg px-12 py-3" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-5 w-5" />
                        Invest or Partner With Us
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    We'll respond within 24 hours to discuss opportunities and next steps.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      
      <InvestmentDeckModal 
        isOpen={isDeckModalOpen} 
        onClose={() => setIsDeckModalOpen(false)} 
      />
    </div>
  );
};

export default ForInvestors;