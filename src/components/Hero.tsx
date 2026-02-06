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
      {/* === WORLD-CLASS AI HERO BACKGROUND === */}
      
      {/* Deep Space Foundation */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-[#000000] dark:via-[#020617] dark:to-[#0a0a0f]"></div>
      
      {/* Animated Aurora Layer 1 - Primary Flow */}
      <div 
        className="absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.15) 25%, rgba(168, 85, 247, 0.2) 50%, rgba(236, 72, 153, 0.15) 75%, transparent 100%)',
          filter: 'blur(80px)',
          animation: 'aurora-drift 15s ease-in-out infinite alternate'
        }}
      ></div>
      
      {/* Animated Aurora Layer 2 - Secondary Flow */}
      <div 
        className="absolute inset-0 opacity-50 dark:opacity-30"
        style={{
          background: 'linear-gradient(-45deg, transparent 0%, rgba(6, 182, 212, 0.18) 30%, rgba(34, 211, 238, 0.15) 50%, rgba(59, 130, 246, 0.2) 70%, transparent 100%)',
          filter: 'blur(100px)',
          animation: 'aurora-drift 20s ease-in-out infinite alternate-reverse'
        }}
      ></div>
      
      {/* Floating Orb 1 - Top Left - Gold/Amber */}
      <div 
        className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] rounded-full opacity-70 dark:opacity-50"
        style={{
          background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'orb-float-1 12s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Orb 2 - Top Right - Violet/Purple */}
      <div 
        className="absolute -top-[5%] -right-[10%] w-[45%] h-[45%] rounded-full opacity-60 dark:opacity-40"
        style={{
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.45) 0%, rgba(124, 58, 237, 0.2) 40%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'orb-float-2 14s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Orb 3 - Center - Cyan/Blue */}
      <div 
        className="absolute top-[30%] left-[40%] w-[35%] h-[35%] rounded-full opacity-50 dark:opacity-35"
        style={{
          background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-float-3 18s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Orb 4 - Bottom Left - Rose/Pink */}
      <div 
        className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] rounded-full opacity-50 dark:opacity-30"
        style={{
          background: 'radial-gradient(circle at center, rgba(244, 63, 94, 0.3) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orb-float-4 16s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Orb 5 - Bottom Right - Emerald */}
      <div 
        className="absolute bottom-[5%] right-[10%] w-[30%] h-[30%] rounded-full opacity-40 dark:opacity-25"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.35) 0%, rgba(52, 211, 153, 0.15) 50%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'orb-float-5 20s ease-in-out infinite'
        }}
      ></div>
      
      {/* Neural Network Grid - Animated Pulse */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-pulse 4s ease-in-out infinite'
          }}
        ></div>
      </div>
      
      {/* Animated Mesh Lines - AI Neural Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" />
            <stop offset="50%" stopColor="rgb(59, 130, 246)" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" />
          </linearGradient>
        </defs>
        <pattern id="neural-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 0 L50 100 M0 50 L100 50 M0 0 L100 100 M100 0 L0 100" stroke="url(#mesh-gradient)" strokeWidth="0.5" fill="none" opacity="0.5" />
          <circle cx="50" cy="50" r="3" fill="url(#mesh-gradient)" opacity="0.6">
            <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="2" fill="url(#mesh-gradient)" opacity="0.4" />
          <circle cx="100" cy="0" r="2" fill="url(#mesh-gradient)" opacity="0.4" />
          <circle cx="0" cy="100" r="2" fill="url(#mesh-gradient)" opacity="0.4" />
          <circle cx="100" cy="100" r="2" fill="url(#mesh-gradient)" opacity="0.4" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#neural-pattern)" />
      </svg>
      
      {/* Horizontal Light Beam - Animated Sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 45%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 55%, transparent 100%)',
            animation: 'light-sweep 8s ease-in-out infinite'
          }}
        ></div>
      </div>
      
      {/* Premium Vignette - Depth Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_0%,rgba(0,0,0,0.02)_70%,rgba(0,0,0,0.08)_100%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_0%,rgba(0,0,0,0.15)_60%,rgba(0,0,0,0.5)_100%)]"></div>
      
      {/* Subtle Noise Texture - Premium Feel */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}></div>
      </div>
      
      {/* Inline Keyframe Animations */}
      <style>{`
        @keyframes aurora-drift {
          0% { transform: translateX(-5%) translateY(-5%) rotate(-2deg) scale(1); }
          100% { transform: translateX(5%) translateY(5%) rotate(2deg) scale(1.05); }
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 20px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 35px) scale(0.95); }
          66% { transform: translate(35px, -25px) scale(1.05); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes orb-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -40px) scale(1.05); }
          66% { transform: translate(-30px, -20px) scale(0.95); }
        }
        @keyframes orb-float-5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 25px) scale(1.08); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
        @keyframes light-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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
              Clarify your AI strategy with a roadmap designed for your specific goals. Get tool-prompt combinations perfectly crafted for each step. Deploy workflows for predictable processes or intelligent AI agents for complex decisions. Build your unstoppable competitive advantage in the new era of AI.
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
