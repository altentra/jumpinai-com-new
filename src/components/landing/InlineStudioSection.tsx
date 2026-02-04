import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { StudioTextarea } from '@/components/studio/StudioTextarea';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

/**
 * InlineStudioSection - A fully functional studio form embedded in the landing page
 * When user clicks generate, it transitions them to /jumpinai-studio with preserved data
 */
const InlineStudioSection = () => {
  const navigate = useNavigate();
  const { elementRef, scrollProgress } = useScrollAnimation({ threshold: 0.15 });
  
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
      ref={elementRef as React.RefObject<HTMLElement>}
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
    >
      {/* Premium Background System */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background"></div>
        
        {/* Warm golden center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-amber-500/[0.06] dark:bg-amber-400/[0.04] rounded-full blur-[150px] pointer-events-none"></div>
        
        {/* Accent glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/[0.05] dark:bg-violet-400/[0.03] rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-blue-500/[0.05] dark:bg-blue-400/[0.03] rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Subtle grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>
      
      {turnstileElement}
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className="max-w-4xl mx-auto transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, scrollProgress * 2),
            transform: `translateY(${(1 - Math.min(1, scrollProgress * 2)) * 30}px)`
          }}
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
            
            {/* Card with glassmorphism */}
            <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden 
              bg-white/70 dark:bg-zinc-900/70
              backdrop-blur-2xl
              border border-white/40 dark:border-white/[0.12]
              shadow-[0_32px_100px_-20px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset]
              dark:shadow-[0_32px_100px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
              
              {/* Premium top highlight - rainbow shimmer */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent"></div>
              
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none"></div>
              
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
                      
                      {/* Trust badges - Premium minimal (matches JumpinAIStudio) */}
                      <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground/60 font-medium">
                        <span className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70"></span>
                          ~2 minutes
                        </span>
                        <span className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                          Personalized
                        </span>
                        <span className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70"></span>
                          Ready-to-use
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
    </section>
  );
};

export default InlineStudioSection;
