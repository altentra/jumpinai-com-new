
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Professional Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background"></div>
      
      {/* Geometric Elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse dark:bg-gray-700"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000 dark:bg-gray-600"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000 dark:bg-gray-500"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          {/* Logo with Professional Glow */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black rounded-2xl blur-lg opacity-75 animate-glow dark:from-white dark:to-gray-300 dark:animate-glow-dark"></div>
              <div className="relative bg-gradient-to-r from-gray-800 to-black rounded-2xl dark:from-white dark:to-gray-300 w-20 h-20 p-0 overflow-hidden">
                <img 
                  src="/lovable-uploads/74bafbff-f098-4d0a-9180-b4923d3d9616.png" 
                  alt="JumpinAI Logo" 
                  className="w-full h-full object-cover scale-140"
                />
              </div>
            </div>
          </div>
          
          {/* Main Heading with Professional Typography */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-4 tracking-tight font-display">
            <span className="block gradient-text-primary">JumpinAI</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-2xl sm:text-3xl lg:text-4xl text-muted-foreground mb-6 font-light max-w-4xl mx-auto leading-relaxed">
            Jump into the world of AI with 
            <span className="text-foreground font-medium"> clarity and precision</span>
          </p>
          
          {/* Description */}
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Discover curated AI tools, practical use-cases, and smart workflows that empower creators, entrepreneurs, and innovators to harness the power of artificial intelligence.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              asChild
              className="modern-button group bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-10 py-6 text-lg font-semibold rounded-2xl transition-all duration-500 hover:scale-105 shadow-steel"
            >
              <Link to="/jumps">
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('newsletter')}
              className="modern-button group glass border-2 border-border hover:border-foreground px-10 py-6 text-lg font-semibold rounded-2xl transition-all duration-500 hover:scale-105 backdrop-blur-sm text-foreground hover:text-foreground"
            >
              Stay ahead with AI
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-8 w-2 h-2 bg-gray-400 rounded-full animate-pulse dark:bg-gray-600"></div>
        <div className="absolute top-1/3 right-12 w-3 h-3 bg-gray-500 rounded-full animate-pulse animation-delay-1000 dark:bg-gray-500"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-gray-600 rounded-full animate-pulse animation-delay-2000 dark:bg-gray-400"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-gray-700 rounded-full animate-pulse animation-delay-3000 dark:bg-gray-300"></div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
