
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Sophisticated Background - Light: Almost White, Dark: Deep Blue Premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-slate-100 to-stone-200 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900"></div>
      
      {/* Premium Deep Blue Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-indigo-100/20 to-slate-300/40 dark:from-blue-950/95 dark:via-indigo-950/90 dark:to-blue-900/95"></div>
      
      {/* Radial Blue Depth Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-blue-950/40 dark:from-transparent dark:via-blue-950/30 dark:to-blue-950/80"></div>
      
      {/* Vertical Curtain Drapes Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200/40 via-transparent to-slate-200/40 dark:from-black/80 dark:via-transparent dark:to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent dark:via-slate-950/50"></div>
      </div>
      
      {/* Bottom Sophisticated Light Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-white/60 via-slate-50/30 to-transparent dark:from-black/80 dark:via-gray-950/50 dark:to-transparent"></div>

      {/* Advanced Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]">
        <div className="absolute inset-0 bg-grid-pattern animate-pulse" style={{ 
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animationDuration: '8s'
        }}></div>
      </div>

      {/* Sophisticated Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.06] mix-blend-overlay">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }}></div>
      </div>

      {/* Advanced Ripple Effects */}
      <div className="absolute inset-0 opacity-5 dark:opacity-15">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-blue-300/20 dark:border-blue-400/30 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 border border-indigo-400/25 dark:border-indigo-300/35 rounded-full animate-ping" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-80 h-80 border border-slate-400/20 dark:border-slate-300/30 rounded-full animate-ping" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
      </div>

      {/* Sophisticated Hexagonal Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.12]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%234F46E5' stroke-width='0.5' stroke-opacity='0.1'%3E%3Cpolygon points='30,5 50,17 50,43 30,55 10,43 10,17'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundPosition: '0 0, 30px 30px'
        }}></div>
      </div>

      {/* Advanced Lighting Rays */}
      <div className="absolute inset-0 opacity-8 dark:opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blue-300/40 via-transparent via-transparent to-indigo-400/30 dark:from-blue-400/20 dark:via-transparent dark:to-indigo-300/15 animate-pulse" style={{ animationDuration: '7s' }}></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-indigo-400/35 via-transparent via-transparent to-blue-300/25 dark:from-indigo-300/18 dark:via-transparent dark:to-blue-400/12 animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }}></div>
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-slate-400/30 via-transparent via-transparent to-blue-400/20 dark:from-slate-300/15 dark:via-transparent dark:to-blue-300/10 animate-pulse" style={{ animationDuration: '11s', animationDelay: '4s' }}></div>
      </div>

      {/* Sophisticated Mesh Distortion */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.15]">
        <div className="absolute top-1/3 left-1/4 w-full h-full bg-gradient-conic from-blue-200/30 via-indigo-300/20 via-slate-200/25 to-blue-200/30 dark:from-blue-900/40 dark:via-indigo-950/30 dark:via-slate-900/35 dark:to-blue-900/40 rounded-full blur-3xl transform rotate-45 animate-spin" style={{ animationDuration: '60s' }}></div>
      </div>
      
      {/* Advanced AI Neural Network Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-radial from-indigo-200/40 via-indigo-300/20 to-transparent dark:from-indigo-950/50 dark:via-indigo-900/25 dark:to-transparent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-radial from-blue-200/30 via-blue-300/15 to-transparent dark:from-blue-950/40 dark:via-blue-900/20 dark:to-transparent rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-radial from-slate-300/35 via-slate-400/18 to-transparent dark:from-slate-900/45 dark:via-slate-800/22 dark:to-transparent rounded-full animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300/60 dark:bg-blue-400/60 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-slate-400/50 dark:bg-indigo-300/50 rounded-full animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-indigo-300/80 dark:bg-indigo-400/70 rounded-full animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
        
        {/* Additional Logo Area Particles */}
        <div className="absolute top-[20%] left-[35%] w-1.5 h-1.5 bg-blue-400/70 dark:bg-blue-300/80 rounded-full animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
        <div className="absolute top-[18%] right-[38%] w-2 h-2 bg-indigo-400/60 dark:bg-indigo-300/70 rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
        <div className="absolute top-[25%] left-[42%] w-1 h-1 bg-blue-300/80 dark:bg-blue-400/90 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.8s' }}></div>
        <div className="absolute top-[22%] right-[45%] w-1.5 h-1.5 bg-indigo-300/70 dark:bg-indigo-400/80 rounded-full animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '1.2s' }}></div>
        <div className="absolute top-[28%] left-[48%] w-1 h-1 bg-blue-400/60 dark:bg-blue-300/70 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.3s' }}></div>
        <div className="absolute top-[16%] right-[32%] w-2 h-2 bg-indigo-400/50 dark:bg-indigo-300/60 rounded-full animate-pulse" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}></div>
        <div className="absolute top-[30%] left-[55%] w-1.5 h-1.5 bg-blue-300/70 dark:bg-blue-400/80 rounded-full animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.6s' }}></div>
      </div>

      {/* Neural Connection Lines */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="connectionGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(148 163 184)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(71 85 105)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M100 200 Q300 100 500 250 T900 180"
            stroke={`url(#${isDark ? 'connectionGradientDark' : 'connectionGradient'})`}
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <path
            d="M200 400 Q600 200 800 450 T1100 350"
            stroke={`url(#${isDark ? 'connectionGradientDark' : 'connectionGradient'})`}
            strokeWidth="0.8"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          />
          <path
            d="M50 600 Q400 500 700 650 T1000 550"
            stroke={`url(#${isDark ? 'connectionGradientDark' : 'connectionGradient'})`}
            strokeWidth="0.6"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </svg>
      </div>

      {/* Advanced Mesh Gradient Overlay */}
      <div className="absolute inset-0 opacity-30 dark:opacity-50">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent via-transparent to-indigo-200/30 dark:from-blue-900/50 dark:via-indigo-950/40 dark:to-blue-950/60"></div>
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-slate-200/25 via-transparent to-blue-300/20 dark:from-blue-900/45 dark:via-indigo-950/30 dark:to-blue-950/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-tr from-indigo-100/30 via-transparent to-slate-300/25 dark:from-indigo-900/50 dark:via-blue-950/35 dark:to-blue-900/55 rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-blue-900/40 via-indigo-950/30 to-transparent dark:from-blue-800/45 dark:via-indigo-900/35 dark:to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Dynamic Light Rays */}
      <div className="absolute inset-0 opacity-15 dark:opacity-25">
        <div className="absolute top-1/4 -left-32 w-64 h-1 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent dark:via-blue-400/30 rotate-45 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 -right-32 w-48 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent dark:via-indigo-300/40 -rotate-45 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-56 h-0.5 bg-gradient-to-r from-transparent via-slate-400/50 to-transparent dark:via-slate-300/30 rotate-12 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2.5s' }}></div>
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
          {/* Logo */}
          <div className="flex items-center justify-center mt-8 sm:mt-12 mb-4 sm:mb-5 overflow-hidden">
            <img 
              src={logoTransparent}
              alt="JumpinAI Logo" 
              className="w-[140px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-[70px] sm:h-[100px] md:h-[125px] lg:h-[150px] object-cover object-center"
              style={{ objectPosition: 'center 45%' }}
            />
          </div>
          
          {/* Main Heading with Professional Typography */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-3 sm:mb-4 tracking-tight font-display">
            <span className="block gradient-text-primary">JumpinAI</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted-foreground mb-4 sm:mb-6 font-light max-w-4xl mx-auto leading-relaxed px-2">
            Jump into the world of AI with 
            <span className="text-foreground font-medium"> clarity and precision</span>
          </p>
          
          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light px-4">
            This is your moment. <br className="hidden sm:block" />While others hesitate at the edge of the AI revolution, you're <span className="font-bold">ready to jump</span>. <br className="hidden sm:block" />We'll guide you from curiosity to clarity, from ideas to implementation, transforming the way you work, create, and live. Your AI-powered future begins with one bold step forward.
          </p>
          
          {/* Call to Action Button */}
          <div className="flex justify-center px-4">
            <Button 
              size="lg" 
              asChild
              className="modern-button group bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-3xl transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto"
            >
              <Link to="/jumpinai-studio">
                <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-spin" />
                Get Started
                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
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
