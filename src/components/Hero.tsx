import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12 sm:pt-14 lg:pt-12">
      {/* === WORLD-CLASS OPTIMISTIC AI HERO === */}
      
      {/* Luminous Foundation - Warm & Optimistic */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-slate-50 to-cyan-50/60 dark:from-[#0c0a09] dark:via-[#0f172a] dark:to-[#0c1220]"></div>
      
      {/* Primary Gradient Flow - Golden Warmth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 25%, transparent 50%, rgba(6, 182, 212, 0.06) 75%, rgba(34, 211, 238, 0.08) 100%)',
          animation: 'gradient-flow 20s ease-in-out infinite'
        }}
      ></div>
      
      {/* Secondary Gradient Flow - Teal Accent */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(-45deg, rgba(20, 184, 166, 0.1) 0%, transparent 40%, transparent 60%, rgba(251, 191, 36, 0.08) 100%)',
          animation: 'gradient-flow-reverse 25s ease-in-out infinite'
        }}
      ></div>
      
      {/* Radial Glow - Top Left Golden */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 30%, transparent 60%)',
          filter: 'blur(80px)',
          animation: 'glow-pulse-1 12s ease-in-out infinite'
        }}
      ></div>
      
      {/* Radial Glow - Top Right Cyan */}
      <div 
        className="absolute -top-[10%] -right-[15%] w-[50%] h-[50%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.18) 0%, rgba(20, 184, 166, 0.08) 40%, transparent 65%)',
          filter: 'blur(70px)',
          animation: 'glow-pulse-2 15s ease-in-out infinite'
        }}
      ></div>
      
      {/* Radial Glow - Bottom Center Warm */}
      <div 
        className="absolute bottom-[-10%] left-[25%] w-[50%] h-[40%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.12) 0%, rgba(251, 191, 36, 0.06) 50%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'glow-pulse-3 18s ease-in-out infinite'
        }}
      ></div>
      
      {/* === ANIMATED DOT MATRIX === */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradient for dots */}
            <linearGradient id="dot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.6">
                <animate attributeName="stop-opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="rgb(20, 184, 166)" stopOpacity="0.5">
                <animate attributeName="stop-opacity" values="0.5;0.8;0.5" dur="4s" repeatCount="indefinite" begin="0.5s" />
              </stop>
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6">
                <animate attributeName="stop-opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite" begin="1s" />
              </stop>
            </linearGradient>
            
            {/* Dot pattern */}
            <pattern id="dot-matrix" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="url(#dot-gradient)">
                <animate attributeName="r" values="1;1.5;1" dur="3s" repeatCount="indefinite" />
              </circle>
          </pattern>
          </defs>
          
          {/* Main dot grid */}
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#dot-matrix)" 
            className="opacity-[0.15] dark:opacity-[0.25]"
          />
          
          {/* Animated connection lines */}
          <g className="opacity-[0.06] dark:opacity-[0.1]" stroke="url(#dot-gradient)" strokeWidth="0.5" fill="none">
            <path d="M0,200 Q400,150 800,200 T1600,200">
              <animate attributeName="d" 
                values="M0,200 Q400,150 800,200 T1600,200;M0,200 Q400,250 800,200 T1600,200;M0,200 Q400,150 800,200 T1600,200" 
                dur="8s" repeatCount="indefinite" />
            </path>
            <path d="M0,400 Q400,350 800,400 T1600,400">
              <animate attributeName="d" 
                values="M0,400 Q400,350 800,400 T1600,400;M0,400 Q400,450 800,400 T1600,400;M0,400 Q400,350 800,400 T1600,400" 
                dur="10s" repeatCount="indefinite" />
            </path>
            <path d="M0,600 Q400,550 800,600 T1600,600">
              <animate attributeName="d" 
                values="M0,600 Q400,550 800,600 T1600,600;M0,600 Q400,650 800,600 T1600,600;M0,600 Q400,550 800,600 T1600,600" 
                dur="12s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      </div>
      
      {/* Elegant Breathing Aurora */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top aurora band */}
        <div 
          className="absolute top-0 left-[10%] right-[10%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
            animation: 'aurora-breathe 8s ease-in-out infinite'
          }}
        ></div>
        
        {/* Right side subtle glow */}
        <div 
          className="absolute top-[20%] right-0 w-[30%] h-[60%]"
          style={{
            background: 'radial-gradient(ellipse 50% 80% at 100% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
            animation: 'aurora-breathe 10s ease-in-out infinite 2s'
          }}
        ></div>
        
      </div>
      
      {/* Subtle Radial Highlight - Center Focus */}
      <div 
        className="absolute top-[20%] left-[30%] w-[40%] h-[40%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          animation: 'center-glow 10s ease-in-out infinite'
        }}
      ></div>
      
      {/* Premium Vignette - Soft Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,transparent_0%,rgba(0,0,0,0.015)_60%,rgba(0,0,0,0.04)_100%)] dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,transparent_0%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.4)_100%)]"></div>
      
      {/* Ultra-Fine Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px'
        }}></div>
      </div>
      
      {/* Keyframe Animations */}
      <style>{`
        /* NOTE: keep hero "alive" but avoid lateral movement that creates edge banding */
        @keyframes gradient-flow {
          0%, 100% { opacity: 1; transform: none; }
          50% { opacity: 0.8; transform: none; }
        }
        @keyframes gradient-flow-reverse {
          0%, 100% { opacity: 1; transform: none; }
          50% { opacity: 0.7; transform: none; }
        }
        @keyframes glow-pulse-1 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes glow-pulse-2 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
        @keyframes glow-pulse-3 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes aurora-breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes center-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
      
      {/* Enhanced Curved Bottom Arc - Flowing Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-80 dark:opacity-90">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Animated wave paths */}
          <path
            d="M0 200L48 185C96 170 192 140 288 125C384 110 480 110 576 120C672 130 768 150 864 155C960 160 1056 150 1152 135C1248 120 1344 100 1392 90L1440 80V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z"
            fill={`url(#${isDark ? 'waveGradientDark' : 'waveGradient'})`}
          >
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
              M0 200L48 185C96 170 192 140 288 125C384 110 480 110 576 120C672 130 768 150 864 155C960 160 1056 150 1152 135C1248 120 1344 100 1392 90L1440 80V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z;
              M0 200L48 175C96 160 192 130 288 120C384 100 480 100 576 115C672 125 768 145 864 150C960 155 1056 145 1152 130C1248 115 1344 95 1392 85L1440 75V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z;
              M0 200L48 185C96 170 192 140 288 125C384 110 480 110 576 120C672 130 768 150 864 155C960 160 1056 150 1152 135C1248 120 1344 100 1392 90L1440 80V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z
            " />
          </path>
          <path
            d="M0 200L60 190C120 180 240 160 360 150C480 140 600 140 720 145C840 150 960 160 1080 165C1200 170 1320 170 1380 170L1440 170V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z"
            fill={`url(#${isDark ? 'waveGradient2Dark' : 'waveGradient2'})`}
            opacity="0.6"
          >
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
              M0 200L60 190C120 180 240 160 360 150C480 140 600 140 720 145C840 150 960 160 1080 165C1200 170 1320 170 1380 170L1440 170V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z;
              M0 200L60 185C120 170 240 150 360 145C480 135 600 135 720 140C840 145 960 155 1080 160C1200 165 1320 165 1380 165L1440 165V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z;
              M0 200L60 190C120 180 240 160 360 150C480 140 600 140 720 145C840 150 960 160 1080 165C1200 170 1320 170 1380 170L1440 170V200H1380C1320 200 1200 200 1080 200C960 200 840 200 720 200C600 200 480 200 360 200C240 200 120 200 60 200H0Z
            " />
          </path>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(241 245 249)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="rgb(248 250 252)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(241 245 249)" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waveGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(15 23 42)" stopOpacity="0.95" />
              <stop offset="30%" stopColor="rgb(30 41 59)" stopOpacity="0.9" />
              <stop offset="70%" stopColor="rgb(30 41 59)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(15 23 42)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(226 232 240)" stopOpacity="0.7" />
              <stop offset="50%" stopColor="rgb(241 245 249)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(226 232 240)" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="waveGradient2Dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(51 65 85)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(71 85 105)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="rgb(51 65 85)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
          {/* Left Content */}
          <div className="animate-fade-in-up text-center lg:text-left">
            {/* Mini-Tagline */}
            <div className="flex justify-center lg:justify-start mb-6 sm:mb-8 mt-16 sm:mt-18 md:mt-20 lg:mt-14">
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
            
            {/* Main H1 Title - Premium billion-dollar styling */}
            <h1 className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[2.75rem] xl:text-[3.5rem] font-black mb-6 sm:mb-8 tracking-[-0.02em] font-display leading-[1.1] pb-2">
              <span 
                className="block gradient-text-primary"
                style={{ 
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.25), 0 8px 40px rgba(251, 191, 36, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)' 
                }}
              >
                Start Using AI.
              </span>
              <span 
                className="block gradient-text-primary mt-2 pb-1"
                style={{ 
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.25), 0 8px 40px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)' 
                }}
              >
                In Your Best Way Possible.
              </span>
            </h1>
            
            {/* Body Text */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto lg:mx-0 leading-relaxed font-light px-4 lg:px-0">
              Clarify your AI strategy with a roadmap designed for your specific goals. Through adaptive planning and strategic refinement, we ensure every element aligns with how you work and what you're building toward. You'll receive tool-prompt combinations perfectly crafted for each phase, seamlessly integrated workflows for consistent execution, and intelligent AI agents for sophisticated decision-making. Build your unstoppable competitive advantage in the new era of AI.
            </p>
            
            {/* Call to Action Button */}
            <div className="flex justify-center lg:justify-start px-4 lg:px-0 mb-16 lg:mb-0">
              <button 
                onClick={() => scrollToSection('inline-studio')} 
                className="relative group inline-block w-full sm:w-auto"
              >
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
              </button>
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
