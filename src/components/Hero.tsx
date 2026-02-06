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
      {/* === NEXT-LEVEL CINEMATIC AI HERO === */}
      
      {/* Deep Cosmic Foundation */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-100/80 to-white dark:from-[#000000] dark:via-[#030014] dark:to-[#0a0118]"></div>
      
      {/* Animated Morphing Blob 1 - Primary Violet/Magenta */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] opacity-70 dark:opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.3) 30%, rgba(192, 38, 211, 0.15) 60%, transparent 80%)',
          filter: 'blur(60px)',
          animation: 'morph-1 25s ease-in-out infinite',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
        }}
      ></div>
      
      {/* Animated Morphing Blob 2 - Electric Cyan/Blue */}
      <div 
        className="absolute top-[10%] right-[-15%] w-[65%] h-[65%] opacity-60 dark:opacity-45"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.45) 0%, rgba(59, 130, 246, 0.3) 35%, rgba(99, 102, 241, 0.15) 65%, transparent 85%)',
          filter: 'blur(70px)',
          animation: 'morph-2 30s ease-in-out infinite',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%'
        }}
      ></div>
      
      {/* Animated Morphing Blob 3 - Warm Amber/Rose */}
      <div 
        className="absolute bottom-[-15%] left-[20%] w-[55%] h-[55%] opacity-55 dark:opacity-35"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.4) 0%, rgba(244, 63, 94, 0.25) 40%, rgba(236, 72, 153, 0.12) 70%, transparent 90%)',
          filter: 'blur(80px)',
          animation: 'morph-3 20s ease-in-out infinite',
          borderRadius: '50% 50% 30% 70% / 50% 70% 30% 50%'
        }}
      ></div>
      
      {/* Animated Morphing Blob 4 - Deep Emerald Accent */}
      <div 
        className="absolute bottom-[20%] right-[5%] w-[40%] h-[40%] opacity-45 dark:opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.4) 0%, rgba(20, 184, 166, 0.2) 50%, transparent 80%)',
          filter: 'blur(60px)',
          animation: 'morph-4 22s ease-in-out infinite',
          borderRadius: '70% 30% 50% 50% / 30% 60% 40% 70%'
        }}
      ></div>
      
      {/* Central Spotlight - Dramatic Focus */}
      <div 
        className="absolute top-[15%] left-[35%] w-[50%] h-[50%] opacity-40 dark:opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
          filter: 'blur(40px)',
          animation: 'spotlight-pulse 8s ease-in-out infinite'
        }}
      ></div>
      
      {/* Aurora Wave Layer 1 */}
      <div 
        className="absolute inset-0 opacity-50 dark:opacity-35"
        style={{
          background: 'linear-gradient(125deg, transparent 0%, rgba(139, 92, 246, 0.12) 20%, rgba(59, 130, 246, 0.15) 40%, rgba(6, 182, 212, 0.12) 60%, rgba(16, 185, 129, 0.08) 80%, transparent 100%)',
          animation: 'aurora-wave-1 18s ease-in-out infinite'
        }}
      ></div>
      
      {/* Aurora Wave Layer 2 */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          background: 'linear-gradient(-45deg, transparent 0%, rgba(236, 72, 153, 0.1) 25%, rgba(168, 85, 247, 0.12) 50%, rgba(99, 102, 241, 0.1) 75%, transparent 100%)',
          animation: 'aurora-wave-2 22s ease-in-out infinite'
        }}
      ></div>
      
      {/* Floating Particles Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Particle 1 */}
        <div className="absolute w-2 h-2 rounded-full bg-violet-400/60 dark:bg-violet-400/40" style={{ top: '15%', left: '20%', animation: 'particle-float-1 15s ease-in-out infinite', filter: 'blur(1px)' }}></div>
        {/* Particle 2 */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400/70 dark:bg-cyan-400/50" style={{ top: '25%', left: '70%', animation: 'particle-float-2 18s ease-in-out infinite', filter: 'blur(0.5px)' }}></div>
        {/* Particle 3 */}
        <div className="absolute w-3 h-3 rounded-full bg-amber-400/50 dark:bg-amber-400/30" style={{ top: '60%', left: '15%', animation: 'particle-float-3 20s ease-in-out infinite', filter: 'blur(1px)' }}></div>
        {/* Particle 4 */}
        <div className="absolute w-2 h-2 rounded-full bg-rose-400/55 dark:bg-rose-400/35" style={{ top: '70%', left: '80%', animation: 'particle-float-4 16s ease-in-out infinite', filter: 'blur(1px)' }}></div>
        {/* Particle 5 */}
        <div className="absolute w-1 h-1 rounded-full bg-blue-400/80 dark:bg-blue-400/60" style={{ top: '40%', left: '50%', animation: 'particle-float-5 14s ease-in-out infinite' }}></div>
        {/* Particle 6 */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/45 dark:bg-emerald-400/30" style={{ top: '85%', left: '40%', animation: 'particle-float-6 22s ease-in-out infinite', filter: 'blur(1px)' }}></div>
        {/* Particle 7 */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/65 dark:bg-purple-400/45" style={{ top: '10%', left: '85%', animation: 'particle-float-7 19s ease-in-out infinite', filter: 'blur(0.5px)' }}></div>
        {/* Particle 8 */}
        <div className="absolute w-2 h-2 rounded-full bg-pink-400/50 dark:bg-pink-400/35" style={{ top: '50%', left: '8%', animation: 'particle-float-8 17s ease-in-out infinite', filter: 'blur(1px)' }}></div>
      </div>
      
      {/* Neural Grid - Subtle Tech Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neural-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8" />
          </linearGradient>
          <pattern id="hex-pattern" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke="url(#neural-line-gradient)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>
      
      {/* Cinematic Light Rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <div 
          className="absolute top-0 left-1/4 w-[2px] h-full"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.3) 30%, rgba(139, 92, 246, 0.5) 50%, rgba(139, 92, 246, 0.3) 70%, transparent 100%)',
            animation: 'ray-1 12s ease-in-out infinite',
            filter: 'blur(2px)'
          }}
        ></div>
        <div 
          className="absolute top-0 right-1/3 w-[1px] h-full"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.25) 40%, rgba(6, 182, 212, 0.4) 50%, rgba(6, 182, 212, 0.25) 60%, transparent 100%)',
            animation: 'ray-2 15s ease-in-out infinite',
            filter: 'blur(1.5px)'
          }}
        ></div>
      </div>
      
      {/* Horizontal Sweep Light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 48%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.04) 52%, transparent 100%)',
            animation: 'sweep-light 10s ease-in-out infinite'
          }}
        ></div>
      </div>
      
      {/* Premium Vignette - Cinematic Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,transparent_0%,rgba(0,0,0,0.01)_50%,rgba(0,0,0,0.06)_100%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,transparent_0%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.6)_100%)]"></div>
      
      {/* Film Grain - Premium Texture */}
      <div className="absolute inset-0 opacity-[0.012] dark:opacity-[0.025] mix-blend-overlay pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px'
        }}></div>
      </div>
      
      {/* Keyframe Animations */}
      <style>{`
        @keyframes morph-1 {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: translate(20px, -30px) rotate(5deg) scale(1.05); }
          50% { border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%; transform: translate(-20px, 20px) rotate(-5deg) scale(0.95); }
          75% { border-radius: 40% 30% 60% 50% / 60% 50% 40% 60%; transform: translate(15px, 15px) rotate(3deg) scale(1.02); }
        }
        @keyframes morph-2 {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; transform: translate(-30px, 25px) rotate(-8deg) scale(1.08); }
          66% { border-radius: 50% 50% 30% 70% / 50% 70% 30% 50%; transform: translate(25px, -20px) rotate(6deg) scale(0.92); }
        }
        @keyframes morph-3 {
          0%, 100% { border-radius: 50% 50% 30% 70% / 50% 70% 30% 50%; transform: translate(0, 0) rotate(0deg); }
          50% { border-radius: 30% 70% 50% 50% / 70% 30% 50% 50%; transform: translate(35px, -25px) rotate(10deg); }
        }
        @keyframes morph-4 {
          0%, 100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; transform: translate(0, 0) scale(1); }
          50% { border-radius: 40% 60% 30% 70% / 60% 40% 50% 60%; transform: translate(-25px, 30px) scale(1.1); }
        }
        @keyframes spotlight-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes aurora-wave-1 {
          0%, 100% { transform: translateX(0) translateY(0) skewX(0deg); opacity: 0.5; }
          50% { transform: translateX(30px) translateY(-20px) skewX(3deg); opacity: 0.7; }
        }
        @keyframes aurora-wave-2 {
          0%, 100% { transform: translateX(0) translateY(0) skewX(0deg); opacity: 0.4; }
          50% { transform: translateX(-40px) translateY(25px) skewX(-4deg); opacity: 0.55; }
        }
        @keyframes particle-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25% { transform: translate(40px, -30px) scale(1.2); opacity: 0.9; }
          50% { transform: translate(20px, -60px) scale(0.8); opacity: 0.5; }
          75% { transform: translate(-20px, -30px) scale(1.1); opacity: 0.8; }
        }
        @keyframes particle-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-50px, 40px) scale(1.3); opacity: 1; }
        }
        @keyframes particle-float-3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          33% { transform: translate(30px, -50px); opacity: 0.8; }
          66% { transform: translate(60px, -20px); opacity: 0.4; }
        }
        @keyframes particle-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
          50% { transform: translate(-40px, -60px) scale(1.4); opacity: 0.9; }
        }
        @keyframes particle-float-5 {
          0%, 100% { transform: translate(0, 0); opacity: 0.8; }
          25% { transform: translate(20px, 30px); opacity: 1; }
          75% { transform: translate(-30px, -20px); opacity: 0.6; }
        }
        @keyframes particle-float-6 {
          0%, 100% { transform: translate(0, 0); opacity: 0.45; }
          50% { transform: translate(45px, -35px); opacity: 0.7; }
        }
        @keyframes particle-float-7 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.65; }
          50% { transform: translate(-35px, 50px) scale(1.2); opacity: 1; }
        }
        @keyframes particle-float-8 {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(30px, -45px); opacity: 0.85; }
        }
        @keyframes ray-1 {
          0%, 100% { opacity: 0.3; transform: translateX(0) scaleY(1); }
          50% { opacity: 0.6; transform: translateX(20px) scaleY(1.1); }
        }
        @keyframes ray-2 {
          0%, 100% { opacity: 0.25; transform: translateX(0); }
          50% { opacity: 0.5; transform: translateX(-15px); }
        }
        @keyframes sweep-light {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
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
