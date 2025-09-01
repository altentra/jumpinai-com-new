
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Sophisticated Background - Light: Almost White, Dark: Very Dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-slate-100 to-stone-200 dark:from-slate-950 dark:via-gray-900 dark:to-stone-900"></div>
      
      {/* Innovative Color Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-indigo-100/20 to-slate-300/40 dark:from-blue-950/80 dark:via-indigo-950/60 dark:to-slate-800/70"></div>
      
      {/* Vertical Curtain Drapes Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200/40 via-transparent to-slate-200/40 dark:from-slate-950/60 dark:via-transparent dark:to-slate-950/60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent dark:via-blue-950/30"></div>
      </div>
      
      {/* Bottom Sophisticated Light Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-white/60 via-slate-50/30 to-transparent dark:from-stone-950/60 dark:via-slate-900/30 dark:to-transparent"></div>
      
      {/* AI Neural Network Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-radial from-indigo-200/40 via-indigo-300/20 to-transparent dark:from-indigo-950/50 dark:via-indigo-900/25 dark:to-transparent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-radial from-blue-200/30 via-blue-300/15 to-transparent dark:from-blue-950/40 dark:via-blue-900/20 dark:to-transparent rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-radial from-slate-300/35 via-slate-400/18 to-transparent dark:from-slate-900/45 dark:via-slate-800/22 dark:to-transparent rounded-full animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Enhanced Curved Jump Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-40 opacity-70 dark:opacity-80">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main jump curve */}
          <path
            d="M0 150L80 135C160 120 320 90 480 75C640 60 800 60 960 75C1120 90 1280 120 1360 135L1440 150V150H1360C1280 150 1120 150 960 150C800 150 640 150 480 150C320 150 160 150 80 150H0Z"
            fill={`url(#${isDark ? 'jumpGradientDark' : 'jumpGradient'})`}
            className="drop-shadow-lg"
          />
          {/* Secondary curve for depth */}
          <path
            d="M0 150L100 140C200 130 400 110 600 100C800 90 1000 90 1100 95L1200 100V150H1100C1000 150 800 150 600 150C400 150 200 150 100 150H0Z"
            fill={`url(#${isDark ? 'jumpGradient2Dark' : 'jumpGradient2'})`}
            opacity="0.7"
          />
          <defs>
            <linearGradient id="jumpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(148 163 184)" stopOpacity="0.6" />
              <stop offset="30%" stopColor="rgb(99 102 241)" stopOpacity="0.8" />
              <stop offset="70%" stopColor="rgb(59 130 246)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="rgb(71 85 105)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="jumpGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(15 23 42)" stopOpacity="0.8" />
              <stop offset="30%" stopColor="rgb(30 41 59)" stopOpacity="0.9" />
              <stop offset="70%" stopColor="rgb(51 65 85)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(30 41 59)" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="jumpGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(129 140 248)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="rgb(147 197 253)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(165 180 252)" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="jumpGradient2Dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(51 65 85)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(71 85 105)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(55 65 81)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Sophisticated Tech Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-25 mix-blend-soft-light" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23475569' fill-opacity='0.03'%3E%3Cpath d='M40 40c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8 8 3.58 8 8zm0-20c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm20 0c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
