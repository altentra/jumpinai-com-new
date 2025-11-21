
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logoTransparent from "@/assets/logo-transparent.png";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8">
      {/* Premium Clean Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-slate-950 dark:to-blue-950/20"></div>
      
      {/* Layered Modern Gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/40 via-transparent to-purple-50/20 dark:from-indigo-950/30 dark:via-transparent dark:to-purple-950/15"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-slate-100/40 to-blue-100/30 dark:from-transparent dark:via-slate-900/50 dark:to-blue-950/25"></div>
      
      {/* Radial Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/30 to-slate-100/50 dark:from-transparent dark:via-black/40 dark:to-slate-950/60"></div>
      
      {/* Tech Grid Pattern - Static */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}></div>
      </div>

      {/* Subtle Noise Texture - Static */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05] mix-blend-overlay">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px'
        }}></div>
      </div>

      {/* Premium Accent Orbs - Static */}
      <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-br from-blue-500/15 via-indigo-500/8 to-transparent rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/12 via-blue-500/8 to-transparent rounded-full blur-3xl opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-[20rem] h-[20rem] bg-gradient-to-br from-indigo-500/12 via-blue-400/6 to-transparent rounded-full blur-2xl opacity-35"></div>

      {/* Premium Mesh Overlay - Static */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-100/30 dark:from-black/50 dark:via-gray-950/70 dark:to-slate-950/60"></div>
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-blue-50/30 via-transparent to-transparent dark:from-blue-950/30 dark:via-transparent dark:to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-tr from-indigo-50/25 via-transparent to-transparent dark:from-purple-950/25 dark:via-transparent dark:to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white/60 via-white/20 to-transparent dark:from-black/70 dark:via-black/30 dark:to-transparent"></div>
      
      {/* Enhanced Curved Bottom Arc Feature */}
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
              <stop offset="0%" stopColor="rgb(71 85 105)" stopOpacity="0.65" />
              <stop offset="30%" stopColor="rgb(100 116 139)" stopOpacity="0.85" />
              <stop offset="70%" stopColor="rgb(100 116 139)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(71 85 105)" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="jumpGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(15 23 42)" stopOpacity="0.8" />
              <stop offset="30%" stopColor="rgb(30 41 59)" stopOpacity="0.9" />
              <stop offset="70%" stopColor="rgb(51 65 85)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(30 41 59)" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="jumpGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(100 116 139)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgb(148 163 184)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="rgb(100 116 139)" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="jumpGradient2Dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(51 65 85)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(71 85 105)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(55 65 81)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          {/* Mini-Tagline */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 font-light max-w-2xl mx-auto px-2">
            Jump into AI with <span className="font-semibold text-foreground">clarity and direction</span>
          </p>
          
          {/* Main H1 Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 tracking-tight font-display leading-tight">
            <span className="block gradient-text-primary">AI Adaptation Studio</span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 gradient-text-primary">for the AI Era</span>
          </h1>
          
          {/* Body Text */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed font-light px-4">
            AI is advancing fast, and effective adaptation has to be personal. JumpinAI provides precision-built adaptation plans shaped around your goals, with clear, adjustable steps and tailored prompts paired with the tools that fit your needs. It gives you a confident, structured way to begin implementing AI successfully.
          </p>
          
          {/* Call to Action Button */}
          <div className="flex justify-center px-4 mb-16">
            <Link to="/jumpinai-studio" className="relative group inline-block w-full sm:w-auto">
              {/* Liquid glass glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/50 via-white/40 to-white/50 rounded-[2rem] blur-md opacity-50 group-hover:opacity-80 transition duration-500"></div>
              
              {/* Button */}
              <div className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-br from-white/60 via-white/70 to-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 group-hover:border-white/80 transition-all duration-300 overflow-hidden shadow-lg">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Content */}
                <Sparkles className="relative h-4 w-4 sm:h-5 sm:w-5 text-black group-hover:animate-spin" />
                <span className="relative text-base sm:text-lg font-bold text-black whitespace-nowrap">
                  Get Started
                </span>
                <ArrowRight className="relative h-4 w-4 sm:h-5 sm:w-5 text-black group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements - Positioned away from center text on mobile */}
        <div className="absolute top-[15%] left-4 sm:left-8 w-2 h-2 bg-gray-400 rounded-full animate-pulse dark:bg-gray-600"></div>
        <div className="absolute top-[20%] right-8 sm:right-12 w-3 h-3 bg-gray-500 rounded-full animate-pulse animation-delay-1000 dark:bg-gray-500"></div>
        <div className="absolute top-[70%] left-2 sm:left-4 w-1 h-1 bg-gray-600 rounded-full animate-pulse animation-delay-2000 dark:bg-gray-400"></div>
        <div className="absolute bottom-[15%] right-6 sm:right-8 w-2 h-2 bg-gray-700 rounded-full animate-pulse animation-delay-3000 dark:bg-gray-300"></div>
        <div className="absolute top-[80%] left-8 sm:left-12 w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse animation-delay-4000 dark:bg-gray-500"></div>
        <div className="absolute bottom-[25%] right-2 sm:right-4 w-1 h-1 bg-gray-600 rounded-full animate-pulse animation-delay-1500 dark:bg-gray-400"></div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
