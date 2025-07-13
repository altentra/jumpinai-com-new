import { Button } from "@/components/ui/button";
import { Book, ExternalLink, Zap, TrendingUp, Users, Target, Lightbulb, Rocket } from "lucide-react";

const BookPromotion = () => {
  const handleWhopAccess = () => {
    window.open('https://whop.com/jumpinai/', '_blank');
  };

  const handleAmazonPurchase = () => {
    window.open('https://www.amazon.com/gp/aw/d/B0FHCM3VQ8', '_blank');
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/10 via-background to-primary/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-8">
          
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800">
            <Book className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">New Book Available</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight font-display">
              Jump in AI: 
              <span className="gradient-text-primary block">PowerStack</span>
            </h2>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-muted-foreground leading-tight">
              21 Strategic Jumps to Apply AI, Build Leverage, and Move at the Speed of Opportunity
            </h3>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Ready to go beyond the basics? This comprehensive guide reveals 21 strategic approaches to implementing AI that will transform how you work, scale your impact, and accelerate your success.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: TrendingUp, text: "Scale your operations" },
              { icon: Lightbulb, text: "Strategic AI implementation" },
              { icon: Rocket, text: "Accelerate growth" },
              { icon: Target, text: "Competitive advantage" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 p-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-muted-foreground font-medium text-center">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Key Features */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 max-w-3xl mx-auto">
            <h4 className="text-xl font-bold text-foreground mb-6">What You'll Master:</h4>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {[
                "21 proven AI implementation strategies",
                "Framework for building AI-powered systems",
                "Methods to leverage AI for competitive advantage",
                "Practical tools for immediate implementation",
                "Advanced techniques for scaling operations",
                "Future-proofing your AI strategy"
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleWhopAccess}
              size="lg" 
              className="modern-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Users className="h-5 w-5 mr-2" />
              Access via Whop Community
            </Button>
            
            <Button 
              onClick={handleAmazonPurchase}
              size="lg" 
              variant="outline"
              className="border-2 border-primary/20 hover:border-primary hover:bg-primary/5 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Buy on Amazon
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Join our premium community for exclusive access or purchase directly from Amazon
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-center">
              <Book className="h-4 w-4 mr-2" />
              Available in digital and print formats
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookPromotion;