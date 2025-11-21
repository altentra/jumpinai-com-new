
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
      {/* Premium Dark Modern Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-gray-950 dark:via-black dark:to-slate-950"></div>
      
      {/* Tech-Inspired Layered Gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-transparent to-indigo-50/30 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-slate-100/50 to-gray-200/40 dark:from-transparent dark:via-gray-950/80 dark:to-black/90"></div>
      
      {/* Radial Depth Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-300/50 dark:to-black/80"></div>
      
      {/* Tech Circuit Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.12]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 L25,50 M75,50 L100,50 M50,0 L50,25 M50,75 L50,100 M25,25 L25,35 L35,35 L35,25 L25,25 M65,25 L65,35 L75,35 L75,25 L65,25 M25,65 L25,75 L35,75 L35,65 L25,65 M65,65 L65,75 L75,75 L75,65 L65,65' stroke='%236366f1' stroke-width='0.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Advanced Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Sophisticated Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08] mix-blend-overlay">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }}></div>
      </div>

      {/* Floating Orbs - Premium Accent */}
      <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-[20rem] h-[20rem] bg-gradient-to-br from-indigo-500/15 via-blue-400/8 to-transparent rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>

      {/* Animated Ripple Effects */}
      <div className="absolute inset-0 opacity-15 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/20 rounded-full animate-ping" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 border border-blue-500/15 rounded-full animate-ping" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-80 h-80 border border-indigo-500/15 rounded-full animate-ping" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      {/* Neural Network Lines */}
      <div className="absolute inset-0 opacity-8 dark:opacity-15">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M100 150 Q400 100 600 200 T1000 150"
            stroke="url(#techGradient)"
            strokeWidth="1.5"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '6s' }}
          />
          <path
            d="M150 400 Q500 300 750 450 T1100 380"
            stroke="url(#techGradient)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '8s', animationDelay: '2s' }}
          />
          <path
            d="M50 650 Q350 550 650 680 T950 600"
            stroke="url(#techGradient)"
            strokeWidth="0.8"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '7s', animationDelay: '1s' }}
          />
        </svg>
      </div>

      {/* Floating Tech Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-blue-500/60 rounded-full animate-bounce shadow-lg shadow-blue-500/30" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-indigo-500/70 rounded-full animate-bounce shadow-lg shadow-indigo-500/30" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-purple-500/80 rounded-full animate-pulse shadow-md shadow-purple-500/40" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-blue-400/70 rounded-full animate-bounce shadow-lg shadow-blue-400/30" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
      </div>

      {/* Premium Mesh Overlay */}
      <div className="absolute inset-0 opacity-20 dark:opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 via-transparent to-blue-100/20 dark:from-black/60 dark:via-gray-950/80 dark:to-slate-950/70"></div>
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-blue-100/20 via-transparent to-transparent dark:from-blue-950/40 dark:via-transparent dark:to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-tr from-indigo-100/25 via-transparent to-transparent dark:from-purple-950/30 dark:via-transparent dark:to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/50 via-transparent to-transparent dark:from-black/60 dark:via-transparent dark:to-transparent"></div>
      
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
