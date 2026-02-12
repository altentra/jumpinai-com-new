import React, { useState, useRef, useMemo, useCallback } from 'react';
import HeroDotMatrix from '@/components/HeroDotMatrix';
import { useNavigate } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { StudioTextarea } from '@/components/studio/StudioTextarea';


const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

/**
 * InlineStudioSection - A fully functional studio form embedded in the landing page
 * When user clicks generate, it transitions them to /jumpinai-studio with preserved data
 */
const InlineStudioSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleSectionMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleSectionMouseLeave = useCallback(() => {
    setMousePos({ x: -1000, y: -1000 });
  }, []);
  
  // Form state
  const [goals, setGoals] = useState('');
  const [challenges, setChallenges] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // STT tracking state
  const [goalsUsedStt, setGoalsUsedStt] = useState(false);
  const [challengesUsedStt, setChallengesUsedStt] = useState(false);
  const [goalsSttDuration, setGoalsSttDuration] = useState(0);
  const [challengesSttDuration, setChallengesSttDuration] = useState(0);
  const [goalsTyped, setGoalsTyped] = useState(false);
  const [challengesTyped, setChallengesTyped] = useState(false);
  
  // Turnstile state for pre-validation
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const turnstileErrorShownRef = useRef(false);
  
  // Refs
  const goalsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const challengesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle generate - transitions to studio with data
  const handleGenerate = useCallback(() => {
    if (!goals.trim() || !challenges.trim()) {
      // Focus the empty field
      if (!goals.trim()) {
        goalsTextareaRef.current?.focus();
      } else {
        challengesTextareaRef.current?.focus();
      }
      return;
    }

    setIsTransitioning(true);
    
    // Prepare the state to pass to studio
    const studioState = {
      goals,
      challenges,
      goalsUsedStt,
      challengesUsedStt,
      goalsSttDuration,
      challengesSttDuration,
      goalsTyped,
      challengesTyped,
      turnstileToken,
      autoStart: true, // Signal to auto-start generation
    };
    
    // Navigate to studio with state
    navigate('/jumpinai-studio', { 
      state: studioState,
      replace: false 
    });
  }, [goals, challenges, goalsUsedStt, challengesUsedStt, goalsSttDuration, challengesSttDuration, goalsTyped, challengesTyped, turnstileToken, navigate]);

  // Memoized Turnstile component
  const turnstileElement = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isPreviewHost =
      host.includes('lovable.app') ||
      host.includes('lovableproject.com') ||
      host.includes('lovable.dev') ||
      host === 'localhost' ||
      host === '127.0.0.1';

    const configured = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const siteKey = isPreviewHost ? TURNSTILE_TEST_SITE_KEY : (configured || TURNSTILE_TEST_SITE_KEY);

    return (
      <div className="hidden">
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={(token) => {
            setTurnstileToken(token);
            turnstileErrorShownRef.current = false;
          }}
          onError={() => {
            if (!turnstileErrorShownRef.current) {
              turnstileErrorShownRef.current = true;
            }
          }}
          onExpire={() => {
            setTurnstileToken(null);
            // Avoid reset loops; Turnstile auto-refreshes when refreshExpired='auto'.
          }}
          options={{
            theme: 'light',
            size: 'invisible',
            refreshExpired: 'auto',
          }}
        />
      </div>
    );
  }, []);

  const isFormValid = goals.trim() && challenges.trim();

  return (
    <section 
      id="inline-studio"
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      onMouseLeave={handleSectionMouseLeave}
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
    >
      {/* Smooth Black Transition from Hero - Black strip with feathered top+bottom edges */}
      <div
        className="absolute -top-64 inset-x-0 h-96 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 12%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.75) 72%, rgba(0,0,0,0.25) 88%, transparent 100%)',
        }}
      ></div>
      
      {/* Premium Background System - Matching Hero Style */}
      <div className="absolute inset-0">
        {/* Base gradient - matches Hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-slate-50/90 to-cyan-50/50 dark:from-[#110d08] dark:via-[#0c1420] dark:to-[#0a1018]"></div>
        
        {/* Primary Gradient Flow - Golden Warmth */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(234, 170, 50, 0.18) 0%, rgba(214, 145, 30, 0.10) 25%, transparent 50%, rgba(6, 182, 212, 0.08) 75%, rgba(34, 211, 238, 0.12) 100%)',
          }}
        ></div>
        
        {/* Secondary Gradient Flow - Teal Accent */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(-45deg, rgba(20, 184, 166, 0.12) 0%, transparent 40%, transparent 60%, rgba(214, 160, 40, 0.08) 100%)',
          }}
        ></div>
        
        {/* Radial Glow - Top Left Golden */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(218, 160, 45, 0.22) 0%, rgba(200, 140, 30, 0.10) 30%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        ></div>
        
        {/* Radial Glow - Top Right Cyan */}
        <div 
          className="absolute -top-[10%] -right-[10%] w-[45%] h-[45%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.1) 40%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        ></div>
        
        {/* Radial Glow - Bottom Center Warm */}
        <div 
          className="absolute bottom-[-10%] left-[20%] w-[60%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(210, 140, 50, 0.13) 0%, rgba(200, 155, 45, 0.07) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        ></div>
        
        {/* Interactive Dot Matrix - same as Hero */}
        <div className="absolute inset-0 overflow-hidden">
          <HeroDotMatrix isDark={true} mousePos={mousePos} />
        </div>
        
        {/* SIMPLE BLACK OVERLAY TO DARKEN - 30% opacity */}
        <div className="absolute inset-0 bg-black/[0.30] dark:bg-black/[0.30]"></div>
      </div>
      
      {/* Keyframe Animations */}
      <style>{`
        @keyframes glow-pulse-1 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes glow-pulse-2 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.08); }
        }
      `}</style>
      
      {turnstileElement}
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className="max-w-4xl mx-auto"
        >
          {/* Hero text - Premium typography */}
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-5 tracking-tight leading-[1.15]">
              Create Your{' '}
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                Jump in AI
              </span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium">
              Share your vision and challenges — we'll craft your personalized AI implementation roadmap.
            </p>
          </div>

          {/* Premium Glassmorphism Card */}
          <div className="relative">
            {/* Multi-layer ambient glow behind card */}
            <div className="absolute -inset-8 bg-gradient-to-br from-amber-500/[0.08] via-primary/[0.06] to-violet-500/[0.08] rounded-[4rem] blur-3xl opacity-70"></div>
            <div className="absolute -inset-4 bg-primary/[0.04] rounded-[3rem] blur-xl opacity-50"></div>
            
            {/* Card with glassmorphism + gradient border via wrapper */}
            <div className="relative rounded-[32px] sm:rounded-[40px] p-px bg-gradient-to-br from-amber-400/40 via-white/20 to-cyan-400/40 dark:from-amber-500/30 dark:via-white/12 dark:to-cyan-500/30">
            <div className="relative rounded-[31px] sm:rounded-[39px] overflow-hidden 
              bg-gradient-to-br from-zinc-900/85 via-zinc-950/80 to-zinc-900/85 
              dark:from-zinc-950/90 dark:via-black/85 dark:to-zinc-950/90
              backdrop-blur-3xl
              shadow-[0_8px_40px_-4px_rgba(0,0,0,0.25),0_32px_80px_-12px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_1px_0_rgba(255,255,255,0.15)_inset]
              dark:shadow-[0_8px_40px_-4px_rgba(0,0,0,0.5),0_32px_80px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_1px_0_rgba(255,255,255,0.06)_inset]">
              
              {/* Premium top highlight - refined shimmer */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/15 to-transparent"></div>
              
              {/* Bottom subtle edge */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 dark:via-zinc-500/10 to-transparent"></div>
              
              {/* Subtle inner glow - warm tint */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-cyan-500/[0.03] pointer-events-none"></div>
              
              {/* Content */}
              <div className="relative p-8 sm:p-10 md:p-12 lg:p-14">
                {/* Form inputs */}
                <div className="space-y-8 sm:space-y-10">
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
                    {/* Goals Input */}
                    <StudioTextarea
                      ref={goalsTextareaRef}
                      label="What are you building?"
                      value={goals}
                      onChange={setGoals}
                      onTyped={() => setGoalsTyped(true)}
                      onSttUsed={() => setGoalsUsedStt(true)}
                      onSttDuration={(seconds) => setGoalsSttDuration(prev => prev + seconds)}
                      placeholder="Describe your goals, project, or what you want to achieve with AI..."
                    />
                    
                    {/* Challenges Input */}
                    <StudioTextarea
                      ref={challengesTextareaRef}
                      label="What's in your way?"
                      value={challenges}
                      onChange={setChallenges}
                      onTyped={() => setChallengesTyped(true)}
                      onSttUsed={() => setChallengesUsedStt(true)}
                      onSttDuration={(seconds) => setChallengesSttDuration(prev => prev + seconds)}
                      placeholder="What obstacles, challenges, or frustrations are you facing..."
                    />
                  </div>

                  {/* Generate Button - Matches JumpinAIStudio exactly */}
                  <div className="pt-4 sm:pt-6">
                    <div className="flex flex-col items-center">
                      <div className="relative group/btn w-full sm:w-auto">
                        {/* Subtle hover glow */}
                        <div className="absolute -inset-1 bg-primary/15 rounded-full blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                        
                        <button
                          onClick={handleGenerate}
                          disabled={isTransitioning}
                          className="relative w-full sm:w-auto px-12 sm:px-16 md:px-20 py-4 sm:py-5 
                            bg-zinc-900 dark:bg-zinc-800
                            text-white font-semibold text-base sm:text-lg
                            rounded-full
                            border border-white/10
                            transition-all duration-300 ease-out
                            hover:scale-[1.02] active:scale-[0.98] 
                            hover:shadow-xl hover:shadow-black/30
                            disabled:cursor-not-allowed disabled:hover:scale-100 
                            shadow-lg shadow-black/20
                            overflow-hidden"
                          style={{
                            background: 'linear-gradient(to bottom right, #27272a, #18181b, #000000)',
                          }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 rounded-full"></div>
                          
                          {/* Top highlight */}
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                          
                          {/* Bottom subtle shadow */}
                          <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                          
                          <div className="relative z-10 flex items-center justify-center gap-4 text-white">
                            {isTransitioning ? (
                              <>
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                <span className="text-white">Loading Studio...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-6 h-6 text-white transition-transform duration-500 group-hover/btn:scale-125 group-hover/btn:rotate-12" />
                                <span className="text-white">Generate My Jump</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                      
                      {/* Refined trust signals - color coded */}
                      <div className="flex items-center justify-center gap-3.5 sm:gap-5 mt-8 text-[11px] sm:text-xs font-medium tracking-wide">
                        <span className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-teal-400/70"></span>
                          <span className="text-teal-700/55 dark:text-teal-300/50">AI-Powered Strategy</span>
                        </span>
                        <span className="w-px h-3 bg-muted-foreground/10"></span>
                        <span className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-400/70"></span>
                          <span className="text-amber-700/55 dark:text-amber-300/50">Tailored to You</span>
                        </span>
                        <span className="w-px h-3 bg-muted-foreground/10"></span>
                        <span className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-indigo-400/70"></span>
                          <span className="text-indigo-700/55 dark:text-indigo-300/50">Implementation-Ready</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InlineStudioSection;
