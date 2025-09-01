
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
      {/* AI-Inspired Curtain Background - Light Mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700"></div>
      
      {/* Deep Blue to Teal Innovative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-teal-800/60 to-cyan-700/40 dark:from-blue-950/90 dark:via-teal-900/70 dark:to-cyan-800/50"></div>
      
      {/* Vertical Curtain Drapes Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 via-transparent via-transparent to-blue-800/20 dark:from-blue-950/30 dark:via-transparent dark:to-blue-950/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-600/10 to-transparent dark:via-teal-800/15"></div>
      </div>
      
      {/* Bottom Light Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-cyan-100/30 via-teal-50/15 to-transparent dark:from-cyan-950/40 dark:via-teal-900/20 dark:to-transparent"></div>
      
      {/* AI Neural Network Pattern */}
      <div className="absolute inset-0 opacity-15 dark:opacity-25">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-radial from-teal-600/40 via-teal-700/20 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-radial from-cyan-600/30 via-cyan-700/15 to-transparent rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-radial from-blue-600/35 via-blue-700/18 to-transparent rounded-full animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Enhanced Curved Jump Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-40 opacity-60 dark:opacity-80">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main jump curve */}
          <path
            d="M0 150L80 135C160 120 320 90 480 75C640 60 800 60 960 75C1120 90 1280 120 1360 135L1440 150V150H1360C1280 150 1120 150 960 150C800 150 640 150 480 150C320 150 160 150 80 150H0Z"
            fill="url(#jumpGradient)"
            className="drop-shadow-lg"
          />
          {/* Secondary curve for depth */}
          <path
            d="M0 150L100 140C200 130 400 110 600 100C800 90 1000 90 1100 95L1200 100V150H1100C1000 150 800 150 600 150C400 150 200 150 100 150H0Z"
            fill="url(#jumpGradient2)"
            opacity="0.7"
          />
          <defs>
            <linearGradient id="jumpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(30 58 138)" stopOpacity="0.6" />
              <stop offset="30%" stopColor="rgb(5 150 105)" stopOpacity="0.8" />
              <stop offset="70%" stopColor="rgb(6 182 212)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="rgb(14 116 144)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="jumpGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="rgb(34 211 238)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Subtle Tech Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 dark:opacity-40 mix-blend-soft-light" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
