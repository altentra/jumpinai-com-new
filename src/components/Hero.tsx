
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* AI-Inspired Dark Curtain Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-stone-800 to-amber-900/20 dark:from-slate-950 dark:via-stone-900 dark:to-amber-950/30"></div>
      
      {/* Vertical Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-900/5 to-transparent dark:via-emerald-950/10"></div>
      
      {/* Subtle Light from Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-amber-50/10 via-stone-100/5 to-transparent dark:from-amber-950/20 dark:via-stone-900/10 dark:to-transparent"></div>
      
      {/* AI Neural Network Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-radial from-emerald-800/30 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-radial from-amber-800/20 to-transparent rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-radial from-stone-700/25 to-transparent rounded-full animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Curved Jump Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L50 105C100 90 200 60 300 45C400 30 500 30 600 37.5C700 45 800 60 900 67.5C1000 75 1100 75 1150 75L1200 75V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
            fill="url(#jumpGradient)"
            className="opacity-20 dark:opacity-30"
          />
          <defs>
            <linearGradient id="jumpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(120 113 108)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="rgb(217 119 6)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(6 78 59)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-30 dark:opacity-50 mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23374151' fill-opacity='0.02'%3E%3Cpath d='M20 20c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm0-10c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm10 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z'/%3E%3C/g%3E%3C/svg%3E")`
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
