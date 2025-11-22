
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logoTransparent from "@/assets/logo-transparent.png";
import heroDesktopNew from "@/assets/hero-desktop-new.jpg";
import heroMobileGeneration from "@/assets/hero-mobile-generation.jpg";
import heroMobileDashboardGraph from "@/assets/hero-mobile-dashboard-graph.jpg";
import heroMobileComboDetail from "@/assets/hero-mobile-combo-detail.png";
import heroMobileClarify from "@/assets/hero-mobile-clarify.jpg";

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
      {/* Main Dark Background - Original Colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-100 to-stone-200 dark:from-black dark:via-gray-950 dark:to-slate-950"></div>
      
      {/* Sophisticated Multi-Color Gradient - 45 degree from Top Left */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,204,21,0.30)_0%,rgba(251,146,60,0.20)_20%,rgba(167,139,250,0.18)_40%,rgba(59,130,246,0.12)_60%,rgba(16,185,129,0.08)_80%,transparent_100%)] dark:bg-[linear-gradient(135deg,rgba(250,204,21,0.20)_0%,rgba(251,146,60,0.14)_20%,rgba(139,92,246,0.12)_40%,rgba(59,130,246,0.08)_60%,rgba(16,185,129,0.05)_80%,transparent_100%)]"></div>
      
      {/* Subtle Enhancement Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/8 via-transparent to-slate-100/15 dark:from-blue-950/8 dark:via-transparent dark:to-slate-900/15"></div>
      
      {/* Subtle Tech Grid - Static */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.06]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}></div>
      </div>

      {/* Minimal Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05] mix-blend-overlay">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px'
        }}></div>
      </div>
      
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
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
          {/* Left Content */}
          <div className="animate-fade-in-up text-center lg:text-left">
            {/* Mini-Tagline */}
            <div className="flex justify-center lg:justify-start mb-6 sm:mb-8 mt-20 sm:mt-24 md:mt-28 lg:mt-12">
              <div className="relative group inline-block z-10">
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/15 via-white/20 to-white/15 rounded-full blur-md opacity-40 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Glass casing */}
                <div className="relative px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.03] backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full opacity-30"></div>
                  
                  {/* Text */}
                  <p className="relative text-xs sm:text-sm text-white/80 font-semibold tracking-widest uppercase">
                    Jump into AI with clarity and precision
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main H1 Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 tracking-tight font-display leading-tight pb-2">
              <span className="block gradient-text-primary">AI Adaptation Studio</span>
              <span className="block gradient-text-primary mt-2 pb-1">that clarifies Your Path Forward</span>
            </h1>
            
            {/* Body Text */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto lg:mx-0 leading-relaxed font-light px-4 lg:px-0">
              AI is advancing fast, and effective adaptation demands clarity. JumpinAI delivers implementation plans designed around your goals, with clear steps, tailored prompts, and the right tools—giving you a structured way to begin implementing AI with confidence.
            </p>
            
            {/* Call to Action Button */}
            <div className="flex justify-center lg:justify-start px-4 lg:px-0 mb-16 lg:mb-0">
              <Link to="/jumpinai-studio" className="relative group inline-block w-full sm:w-auto">
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/50 via-white/40 to-white/50 rounded-[2rem] blur-md opacity-50 group-hover:opacity-80 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-br from-white/60 via-white/70 to-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 group-hover:border-white/80 transition-all duration-300 overflow-hidden shadow-lg">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <Sparkles className="relative h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  <span className="relative text-base sm:text-lg font-bold text-black whitespace-nowrap">
                    Get Started
                  </span>
                  <ArrowRight className="relative h-4 w-4 sm:h-5 sm:w-5 text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Mockups - Professional Composition */}
          <div className="relative animate-fade-in-up animation-delay-200">
            <div className="flex flex-col items-center gap-8 lg:gap-10">
              {/* Desktop - Main focal point */}
              <div className="w-full max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] group">
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.03] backdrop-blur-sm p-1 hover:scale-[1.02] transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl opacity-30"></div>
                  <img 
                    src={heroDesktopNew} 
                    alt="JumpinAI Studio Dashboard" 
                    className="relative w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Mobile Screenshots - Horizontal row below */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 w-full px-4">
                {/* Jump Generation */}
                <div className="w-28 sm:w-32 lg:w-36 group">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileGeneration} 
                      alt="AI Jump Generation" 
                      className="relative w-full rounded-xl shadow-lg"
                    />
                  </div>
                </div>

                {/* Dashboard Analytics */}
                <div className="w-28 sm:w-32 lg:w-36 group">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileDashboardGraph} 
                      alt="Dashboard Analytics" 
                      className="relative w-full rounded-xl shadow-lg"
                    />
                  </div>
                </div>

                {/* Colorful Tool & Prompt Cards */}
                <div className="w-28 sm:w-32 lg:w-36 group">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileComboDetail} 
                      alt="Colorful Tool & Prompt Combos" 
                      className="relative w-full rounded-xl shadow-lg"
                    />
                  </div>
                </div>

                {/* Clarify Features */}
                <div className="w-28 sm:w-32 lg:w-36 group">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileClarify} 
                      alt="Clarify & Reroute" 
                      className="relative w-full rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
