
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import logoTransparent from "@/assets/logo-transparent.png";
import heroDesktopNew from "@/assets/hero-desktop-studio-new.jpg";
import heroMobileGeneration from "@/assets/hero-mobile-generation.jpg";
import heroMobileDashboardGraph from "@/assets/hero-mobile-dashboard-graph.jpg";
import heroMobileComboDetail from "@/assets/hero-mobile-combo-detail.png";
import heroMobileClarify from "@/assets/hero-mobile-clarify.jpg";

const Hero = () => {
  const [isDark, setIsDark] = useState(false);
  const { elementRef: mockupsRef, scrollProgress: mockupsProgress } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: mobilesMockupsRef, scrollProgress: mobilesProgress } = useScrollAnimation({ threshold: 0.2 });

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
      {/* === EPIC PREMIUM BACKGROUND === */}
      
      {/* Base Layer - Deep premium foundation */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-100 to-stone-100 dark:from-[#030712] dark:via-[#0a0f1a] dark:to-[#0f172a]"></div>
      
      {/* Primary Radial Glow - Top Left Golden Orb */}
      <div className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-amber-400/44 via-orange-500/22 to-transparent dark:from-amber-500/27 dark:via-orange-600/12 dark:to-transparent blur-3xl"></div>
      
      {/* Secondary Radial Glow - Top Right Purple/Blue Orb */}
      <div className="absolute -top-[20%] -right-[15%] w-[70%] h-[70%] rounded-full bg-gradient-radial from-violet-500/34 via-indigo-600/17 to-transparent dark:from-violet-600/22 dark:via-indigo-700/10 dark:to-transparent blur-3xl"></div>
      
      {/* Tertiary Radial Glow - Bottom Center Emerald/Teal Orb */}
      <div className="absolute -bottom-[25%] left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-radial from-emerald-400/27 via-teal-500/14 to-transparent dark:from-emerald-500/17 dark:via-teal-600/8 dark:to-transparent blur-3xl"></div>
      
      {/* Accent Glow - Center-Right Blue Accent */}
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-blue-500/22 via-sky-500/12 to-transparent dark:from-blue-600/14 dark:via-sky-600/7 dark:to-transparent blur-2xl"></div>
      
      {/* Premium Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(251,191,36,0.088)_0deg,rgba(139,92,246,0.066)_90deg,rgba(59,130,246,0.066)_180deg,rgba(16,185,129,0.066)_270deg,rgba(251,191,36,0.088)_360deg)] dark:bg-[conic-gradient(from_180deg_at_50%_50%,rgba(251,191,36,0.044)_0deg,rgba(139,92,246,0.034)_90deg,rgba(59,130,246,0.034)_180deg,rgba(16,185,129,0.034)_270deg,rgba(251,191,36,0.044)_360deg)]"></div>
      
      {/* Sophisticated Diagonal Flow - Premium 45deg */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,204,21,0.39)_0%,rgba(251,146,60,0.30)_15%,rgba(244,63,94,0.20)_30%,rgba(168,85,247,0.24)_45%,rgba(99,102,241,0.20)_60%,rgba(59,130,246,0.17)_75%,rgba(20,184,166,0.14)_90%,transparent_100%)] dark:bg-[linear-gradient(135deg,rgba(250,204,21,0.14)_0%,rgba(251,146,60,0.10)_15%,rgba(244,63,94,0.066)_30%,rgba(168,85,247,0.088)_45%,rgba(99,102,241,0.066)_60%,rgba(59,130,246,0.056)_75%,rgba(20,184,166,0.044)_90%,transparent_100%)]"></div>
      
      {/* Premium Vignette Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(15,23,42,0.05)_100%)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_30%,rgba(0,0,0,0.36)_100%)]"></div>
      
      {/* Subtle Animated Shimmer - Horizontal Light Sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent dark:via-white/[0.015] translate-x-[-100%] animate-[shimmer_8s_ease-in-out_infinite]"></div>
      </div>
      
      {/* Premium Glass Grain Texture */}
      <div className="absolute inset-0 opacity-[0.012] dark:opacity-[0.04] mix-blend-overlay">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}></div>
      </div>
      
      {/* Ultra-Fine Tech Grid */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
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
            <div className="flex justify-center lg:justify-start mb-6 sm:mb-8 mt-20 sm:mt-24 md:mt-28 lg:mt-20">
              <div className="relative group inline-block z-10">
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/15 via-white/20 to-white/15 rounded-full blur-md opacity-40 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Glass casing */}
                <div className="relative px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.03] backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full opacity-30"></div>
                  
                  {/* Text */}
                  <p className="relative text-xs sm:text-sm text-slate-700 dark:text-white/80 font-semibold tracking-widest uppercase">
                    Jump into AI with clarity and precision
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main H1 Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 tracking-tight font-display leading-tight pb-2">
              <span className="block gradient-text-primary">AI Adaptation Studio</span>
              <span className="block gradient-text-primary mt-2 pb-1">that Clarifies and Builds Your Path Forward</span>
            </h1>
            
            {/* Body Text */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto lg:mx-0 leading-relaxed font-light px-4 lg:px-0">
              AI is advancing fast, and effective adaptation demands clarity. JumpinAI delivers implementation plans designed around your goals, with clear steps, tailored prompts, and the right tools. Then it analyzes your strategy for automation opportunities and builds ready-to-deploy AI agents—taking you from vision to execution with confidence.
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

          {/* Right Mockups - Dynamic Professional Composition */}
          <div ref={mockupsRef} className="relative lg:mt-20">
            <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
              {/* Desktop - Main focal point */}
              <div 
                className="w-full max-w-[92%] sm:max-w-[88%] lg:max-w-[90%] group transition-all ease-out lg:opacity-0 lg:animate-fade-in"
                style={{
                  transitionDuration: window.innerWidth < 1024 ? '1000ms' : '0ms',
                  opacity: window.innerWidth < 1024 ? Math.min(1, mockupsProgress * 1.5) : undefined,
                  transform: window.innerWidth < 1024 ? `scale(${0.95 + Math.min(1, mockupsProgress * 1.5) * 0.05}) translateY(${(1 - Math.min(1, mockupsProgress * 1.5)) * 40}px)` : undefined,
                  animationDelay: window.innerWidth >= 1024 ? '0.25s' : undefined,
                  animationFillMode: window.innerWidth >= 1024 ? 'forwards' : undefined
                }}
              >
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.03] backdrop-blur-sm p-1 hover:scale-[1.02] transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl opacity-30"></div>
                  <img 
                    src={heroDesktopNew} 
                    alt="JumpinAI Studio Dashboard" 
                    className="relative w-full rounded-lg shadow-lg"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>

              {/* Mobile Screenshots - Dynamic staggered layout */}
              <div ref={mobilesMockupsRef} className="relative w-full flex justify-center items-center px-4 h-36 sm:h-48 lg:h-60">
                {/* Jump Generation - Left, slightly raised */}
                <div 
                  className="absolute left-[5%] sm:left-[8%] lg:left-[10%] top-0 w-20 sm:w-28 lg:w-36 group transition-all ease-out lg:opacity-0 lg:animate-fade-in"
                  style={{
                    transitionDuration: window.innerWidth < 1024 ? '600ms' : '0ms',
                    opacity: window.innerWidth < 1024 ? Math.max(0, Math.min(1, mobilesProgress * 2.5)) : undefined,
                    transform: window.innerWidth < 1024 ? `translateY(${(1 - Math.max(0, Math.min(1, mobilesProgress * 2.5))) * 40}px)` : undefined,
                    animationDelay: window.innerWidth >= 1024 ? '0.4s' : undefined,
                    animationFillMode: window.innerWidth >= 1024 ? 'forwards' : undefined
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 transform rotate-[-4deg] hover:rotate-[-2deg] hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileGeneration} 
                      alt="AI Jump Generation" 
                      className="relative w-full rounded-xl shadow-lg"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Dashboard Analytics - Center left, lower */}
                <div 
                  className="absolute left-[27%] sm:left-[29%] lg:left-[30%] top-5 sm:top-8 lg:top-10 w-20 sm:w-28 lg:w-36 group transition-all ease-out lg:opacity-0 lg:animate-fade-in"
                  style={{
                    transitionDuration: window.innerWidth < 1024 ? '600ms' : '0ms',
                    opacity: window.innerWidth < 1024 ? Math.max(0, Math.min(1, (mobilesProgress - 0.15) * 2.5)) : undefined,
                    transform: window.innerWidth < 1024 ? `translateY(${(1 - Math.max(0, Math.min(1, (mobilesProgress - 0.15) * 2.5))) * 40}px)` : undefined,
                    animationDelay: window.innerWidth >= 1024 ? '0.55s' : undefined,
                    animationFillMode: window.innerWidth >= 1024 ? 'forwards' : undefined
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 transform rotate-[2deg] hover:rotate-[1deg] hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileDashboardGraph} 
                      alt="Dashboard Analytics" 
                      className="relative w-full rounded-xl shadow-lg"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Colorful Combos - Center right, higher */}
                <div 
                  className="absolute right-[27%] sm:right-[29%] lg:right-[30%] top-1 sm:top-2 lg:top-3 w-20 sm:w-28 lg:w-36 group transition-all ease-out lg:opacity-0 lg:animate-fade-in"
                  style={{
                    transitionDuration: window.innerWidth < 1024 ? '600ms' : '0ms',
                    opacity: window.innerWidth < 1024 ? Math.max(0, Math.min(1, (mobilesProgress - 0.30) * 2.5)) : undefined,
                    transform: window.innerWidth < 1024 ? `translateY(${(1 - Math.max(0, Math.min(1, (mobilesProgress - 0.30) * 2.5))) * 40}px)` : undefined,
                    animationDelay: window.innerWidth >= 1024 ? '0.7s' : undefined,
                    animationFillMode: window.innerWidth >= 1024 ? 'forwards' : undefined
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 transform rotate-[-3deg] hover:rotate-[-1deg] hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileComboDetail} 
                      alt="Colorful Tool & Prompt Combos" 
                      className="relative w-full rounded-xl shadow-lg"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Clarify Features - Right, slightly raised */}
                <div 
                  className="absolute right-[5%] sm:right-[8%] lg:right-[10%] top-3 sm:top-4 lg:top-6 w-20 sm:w-28 lg:w-36 group transition-all ease-out lg:opacity-0 lg:animate-fade-in"
                  style={{
                    transitionDuration: window.innerWidth < 1024 ? '600ms' : '0ms',
                    opacity: window.innerWidth < 1024 ? Math.max(0, Math.min(1, (mobilesProgress - 0.45) * 2.5)) : undefined,
                    transform: window.innerWidth < 1024 ? `translateY(${(1 - Math.max(0, Math.min(1, (mobilesProgress - 0.45) * 2.5))) * 40}px)` : undefined,
                    animationDelay: window.innerWidth >= 1024 ? '0.85s' : undefined,
                    animationFillMode: window.innerWidth >= 1024 ? 'forwards' : undefined
                  }}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-sm p-1 transform rotate-[5deg] hover:rotate-[3deg] hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-40"></div>
                    <img 
                      src={heroMobileClarify} 
                      alt="Clarify & Reroute" 
                      className="relative w-full rounded-xl shadow-lg"
                      loading="eager"
                      decoding="async"
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
