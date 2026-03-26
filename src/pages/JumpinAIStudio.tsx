import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import HeroDotMatrix from '@/components/HeroDotMatrix';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Loader2, LogIn, Zap } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { Navigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { jumpinAIStudioService, type StudioFormData } from '@/services/jumpinAIStudioService';
import { toast } from 'sonner';
import ProgressiveJumpDisplay from '@/components/ProgressiveJumpDisplay';
import { useProgressiveGeneration } from '@/hooks/useProgressiveGeneration';
import { supabase } from '@/integrations/supabase/client';
import { StudioTextarea } from '@/components/studio/StudioTextarea';
import { markJumpAsUsingSTT } from '@/services/sttTrackingService';
import type { AlternativeRoute, RouteExplorationHistory } from '@/types/alternativeRoutes';

const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

// Interface for state passed from landing page inline studio
interface IncomingStudioState {
  goals?: string;
  challenges?: string;
  goalsUsedStt?: boolean;
  challengesUsedStt?: boolean;
  goalsSttDuration?: number;
  challengesSttDuration?: number;
  goalsTyped?: boolean;
  challengesTyped?: boolean;
  turnstileToken?: string | null;
  autoStart?: boolean;
}

// Input tracking (simplified for single input)
interface InputTracking {
  inputMethod: 'typed' | 'narrated' | 'mixed';
  sttDurationSeconds: number;
}

// Silently send notification to admin about jump generation (guest + authenticated)
const sendJumpGenerationNotification = async (
  formData: { goals: string },
  user: { id?: string; email?: string; user_metadata?: { name?: string; full_name?: string } } | null,
  inputTracking: InputTracking
) => {
  try {
    let ipAddress: string | undefined;
    let location: string | undefined;

    try {
      const ipResponse = await supabase.functions.invoke('get-client-ip');
      ipAddress = ipResponse.data?.ip;
      location = ipResponse.data?.location;
    } catch {
      // ignore
    }

    await supabase.functions.invoke('send-jump-generation-notification', {
      body: {
        userType: user?.id ? 'authenticated' : 'guest',
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.user_metadata?.name || user?.user_metadata?.full_name,
        ipAddress,
        location,
        goals: formData.goals,
        challenges: '',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        goalsInputMethod: inputTracking.inputMethod,
        challengesInputMethod: 'typed',
        goalsSttDurationSeconds: inputTracking.sttDurationSeconds,
        challengesSttDurationSeconds: 0,
        totalSttDurationSeconds: inputTracking.sttDurationSeconds,
      },
    });
  } catch {
    // Silently fail - never disrupt generation
  }
};

const JumpinAIStudio = () => {
  const location = useLocation();
  const incomingState = location.state as IncomingStudioState | null;
  
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { hasCredits, deductCredit, updateTransactionReference } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  
  // State
  const [generationTimer, setGenerationTimer] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(incomingState?.turnstileToken || null);
  const [studioIsDark, setStudioIsDark] = useState(false);
  const [guestUsageInfo, setGuestUsageInfo] = useState<{ usageCount: number; remaining: number } | null>(null);
  const [isLoadingGuestInfo, setIsLoadingGuestInfo] = useState(true);
  const [sttUsed, setSttUsed] = useState(incomingState?.goalsUsedStt || incomingState?.challengesUsedStt || false);
  const [studioMousePos, setStudioMousePos] = useState({ x: -1000, y: -1000 });
  const studioContainerRef = useRef<HTMLDivElement>(null);

  const handleStudioMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = studioContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStudioMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top + (studioContainerRef.current?.scrollTop || 0) });
  }, []);

  const handleStudioMouseLeave = useCallback(() => {
    setStudioMousePos({ x: -1000, y: -1000 });
  }, []);
  
  // Input method tracking state - simplified for single input
  const [visionUsedStt, setVisionUsedStt] = useState(incomingState?.goalsUsedStt || false);
  const [visionSttDuration, setVisionSttDuration] = useState(incomingState?.goalsSttDuration || 0);
  const [visionTyped, setVisionTyped] = useState(incomingState?.goalsTyped || false);
  
  // Track if we've already triggered auto-start
  const autoStartTriggered = useRef(false);
  
  const [formData, setFormData] = useState<StudioFormData>({
    currentRole: '',
    industry: '',
    experienceLevel: '',
    aiKnowledge: '',
    goals: incomingState?.goals || '',
    challenges: '',
    timeCommitment: '',
    budget: ''
  });

  // Refs - stable across renders
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const turnstileErrorShownRef = useRef(false);
  const guestUsageFetched = useRef(false);
  const progressDisplayRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLDivElement>(null);
  const visionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Turnstile can fail on preview/staging domains due to Cloudflare domain restrictions.
  // Use Turnstile's official test key in Lovable preview/local environments so guests aren't blocked.
  const turnstileSiteKey = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isPreviewHost =
      host.includes('lovable.app') ||
      host.includes('lovableproject.com') ||
      host.includes('lovable.dev') ||
      host === 'localhost' ||
      host === '127.0.0.1';

    const configured = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (isPreviewHost) return TURNSTILE_TEST_SITE_KEY;
    return configured || TURNSTILE_TEST_SITE_KEY;
  }, []);

  // Helper function to format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Refresh function to fetch latest tool prompts
  const refreshToolPrompts = useCallback(async () => {
    if (!result?.jumpId) return;
    
    try {
      console.log('🔄 Refreshing tool prompts for jump:', result.jumpId);
      const { data: toolPromptsData, error } = await supabase
        .from('user_tool_prompts')
        .select('*')
        .eq('jump_id', result.jumpId);
      
      if (error) throw error;
      console.log('✅ Fetched updated tool prompts:', toolPromptsData?.length);
      return toolPromptsData;
    } catch (error) {
      console.error('❌ Error refreshing tool prompts:', error);
      throw error;
    }
  }, [result?.jumpId]);

  // Theme detection
  useEffect(() => {
    const check = () => setStudioIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Add noindex meta tag
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Fetch guest usage - only once when auth settles and user is not authenticated
  useEffect(() => {
    if (isLoading || guestUsageFetched.current) return;
    
    if (isAuthenticated) {
      setIsLoadingGuestInfo(false);
      return;
    }

    guestUsageFetched.current = true;
    
    const fetchGuestUsage = async () => {
      setIsLoadingGuestInfo(true);
      try {
        const { data: ipData, error: ipError } = await supabase.functions.invoke('get-client-ip');
        
        if (ipError || !ipData?.ip) {
          console.error('Error getting IP:', ipError);
          setGuestUsageInfo({ usageCount: 0, remaining: 3 });
          setIsLoadingGuestInfo(false);
          return;
        }
        
        const clientIp = ipData.ip;
        console.log('📍 Client IP for usage check:', clientIp);
        
        const { data, error } = await supabase.rpc('get_guest_usage', {
          p_ip_address: clientIp
        });
        
        if (error) throw error;
        
        const usageData = data as { usage_count: number; remaining: number; reset_at?: string };
        console.log('📊 Guest usage on mount:', usageData);
        
        setGuestUsageInfo({
          usageCount: usageData.usage_count || 0,
          remaining: usageData.remaining ?? 3
        });
      } catch (error) {
        console.error('Error fetching guest usage:', error);
        setGuestUsageInfo({ usageCount: 0, remaining: 3 });
      } finally {
        setIsLoadingGuestInfo(false);
      }
    };
    
    fetchGuestUsage();
  }, [isLoading, isAuthenticated]);

  // Timer effect for generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationTimer(prev => prev + 1);
      }, 1000);
    } else {
      setGenerationTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Auto-scroll when generation starts
  useEffect(() => {
    if (isGenerating && progressDisplayRef.current) {
      setTimeout(() => {
        if (progressDisplayRef.current) {
          progressDisplayRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 300);
    }
  }, [isGenerating]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (visionTextareaRef.current) {
      visionTextareaRef.current.style.height = 'auto';
      visionTextareaRef.current.style.height = visionTextareaRef.current.scrollHeight + 'px';
    }
  }, [formData.goals]);

  // Auto-start generation when coming from landing page with data
  useEffect(() => {
    // Only trigger once, when we have valid incoming state with autoStart flag
    if (
      incomingState?.autoStart && 
      !autoStartTriggered.current && 
      !isLoading && 
      !isLoadingGuestInfo &&
      formData.goals.trim() &&
      !isGenerating
    ) {
      autoStartTriggered.current = true;
      
      // Small delay to ensure Turnstile has time to initialize if needed
      const startDelay = turnstileToken ? 100 : 1500;
      
      setTimeout(() => {
        console.log('🚀 Auto-starting generation from landing page...');
        toast.info('Starting your Jump generation...');
        // Trigger generation - handleGenerate will be called via ref or direct invocation
        if (generateButtonRef.current) {
          const button = generateButtonRef.current.querySelector('button');
          if (button && !button.disabled) {
            button.click();
          }
        }
      }, startDelay);
    }
  }, [incomingState, isLoading, isLoadingGuestInfo, formData.goals, formData.challenges, isGenerating, turnstileToken]);

  const handleCancel = useCallback(() => {
    toast.info('Generation cancelled. You can start a new request anytime.');
    window.location.reload();
  }, []);

  const handleGenerate = useCallback(async (alternativeContext?: { title: string; description: string }) => {
    console.log('=== GENERATE BUTTON CLICKED ===');
    
    // Calculate input method
    const getInputMethod = (usedStt: boolean, typed: boolean): 'typed' | 'narrated' | 'mixed' => {
      if (usedStt && typed) return 'mixed';
      if (usedStt) return 'narrated';
      return 'typed';
    };
    
    const overallInputMethod = getInputMethod(visionUsedStt, visionTyped);
    
    const effectiveFormData = alternativeContext 
      ? {
          ...formData,
          goals: `${formData.goals}\n\n[ALTERNATIVE APPROACH SELECTED: "${alternativeContext.title}"]\nUser has explicitly chosen this alternative approach: ${alternativeContext.description}\nGenerate a jump that follows THIS specific approach, NOT the original default approach.`,
          sttUsed: visionUsedStt,
          inputMethod: overallInputMethod,
          goalsSttSeconds: visionSttDuration,
          challengesSttSeconds: 0,
        }
      : {
          ...formData,
          sttUsed: visionUsedStt,
          inputMethod: overallInputMethod,
          goalsSttSeconds: visionSttDuration,
          challengesSttSeconds: 0,
        };
    
    if (!effectiveFormData.goals.trim()) {
      toast.error('Please share your vision, goals, and challenges');
      return;
    }

    // Guest users: Verify Turnstile token
    if (!turnstileToken) {
      if (turnstileRef.current) {
        toast.info('Security verification in progress. Please wait a moment and try again.');
        turnstileRef.current.reset();
      } else {
        toast.error('Security verification required. Please refresh the page and try again.');
      }
      return;
    }
    
    const inputTracking: InputTracking = {
      inputMethod: overallInputMethod,
      sttDurationSeconds: visionSttDuration,
    };

    // Send silent notification to admin (fire and forget)
    void sendJumpGenerationNotification(
      { goals: formData.goals },
      user,
      inputTracking
    );

    try {
      if (alternativeContext) {
        toast.info(`Generating new jump: "${alternativeContext.title}"...`);
      }

      const result = await generateWithProgression(
        effectiveFormData, 
        undefined, 
        turnstileToken
      );
      
      if (result.jumpId) {
        toast.success('Your Jump in AI is ready! Sign up to get 5 welcome credits and save your jumps.');
      }

      // Update guest usage info after successful generation
      if (guestUsageInfo) {
        setGuestUsageInfo({
          usageCount: guestUsageInfo.usageCount + 1,
          remaining: Math.max(0, guestUsageInfo.remaining - 1)
        });
      }
      
      // Reset Turnstile to get a fresh token for next generation (e.g., alternative jumps)
      setTimeout(() => {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }, 500);

    } catch (error: any) {
      console.error('Error generating Jump:', error);
      
      if (error.message?.includes('Rate limit exceeded') || error.message?.includes('429')) {
        toast.error('You\'ve used all 3 free tries. Please sign up to get 5 welcome credits and continue!');
      } else {
        toast.error('Failed to generate your Jump. Please try again.');
      }
      
      // Reset Turnstile on error to allow retry
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }, [formData, turnstileToken, generateWithProgression, guestUsageInfo]);

  const handleGenerateAlternativeJump = useCallback((alternative: AlternativeRoute, explorationHistory?: RouteExplorationHistory) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (explorationHistory) {
      console.log('🌳 Exploration History:', {
        level: explorationHistory.currentLevel,
        path: explorationHistory.explorationPath.map(n => n.jumpTitle)
      });
    }
    handleGenerate(alternative);
  }, [handleGenerate]);

  // Memoize Turnstile to prevent re-initialization - key component for stability
  const turnstileElement = useMemo(() => {
    // Don't render if loading or authenticated
    if (isLoading || isAuthenticated) return null;
    
    return (
      <div className="hidden">
        <Turnstile
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          onSuccess={(token) => {
            setTurnstileToken(token);
            turnstileErrorShownRef.current = false;
            console.log('✅ Turnstile verified');
          }}
          onError={() => {
            if (!turnstileErrorShownRef.current) {
              turnstileErrorShownRef.current = true;
              console.error('❌ Turnstile verification failed');
            }
          }}
          onExpire={() => {
            // Token expired, reset to get a fresh one
            console.log('⏰ Turnstile token expired, resetting...');
            setTurnstileToken(null);
            // Let Turnstile handle refreshExpired='auto' to avoid reset loops.
          }}
          options={{
            theme: 'light',
            size: 'invisible',
            refreshExpired: 'auto', // Automatically refresh when expired
          }}
        />
      </div>
    );
  }, [isLoading, isAuthenticated, turnstileSiteKey]);

  // Redirect authenticated users to dashboard studio - AFTER all hooks
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard/studio" replace />;
  }

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Guest view
  return (
    <>
      <Helmet>
        <title>JumpinAI Studio - AI-Powered Transformation Workspace</title>
        <meta name="description" content="Your AI-powered workspace for creating and managing strategic transformations with intelligent guidance." />
      </Helmet>
      
      <div 
        className="min-h-screen scroll-snap-container relative"
      >
        {/* Premium Background System - SCOPED to top input section only */}
        <div 
          ref={studioContainerRef}
          onMouseMove={handleStudioMouseMove}
          onMouseLeave={handleStudioMouseLeave}
          className="relative overflow-hidden"
        >
          {/* Background layers - contained within this wrapper */}
          <div className="absolute inset-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-slate-50/90 to-cyan-50/50 dark:from-[#110d08] dark:via-[#0c1420] dark:to-[#0a1018]"></div>
            
            {/* Primary Gradient Flow - Golden Warmth */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(234, 170, 50, 0.18) 0%, rgba(214, 145, 30, 0.10) 25%, transparent 50%, rgba(6, 182, 212, 0.08) 75%, rgba(34, 211, 238, 0.12) 100%)' }}></div>
            
            {/* Secondary Gradient Flow - Teal Accent */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(-45deg, rgba(20, 184, 166, 0.12) 0%, transparent 40%, transparent 60%, rgba(214, 160, 40, 0.08) 100%)' }}></div>
            
            {/* Radial Glow - Top Left Golden */}
            <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%]" style={{ background: 'radial-gradient(ellipse at center, rgba(218, 160, 45, 0.22) 0%, rgba(200, 140, 30, 0.10) 30%, transparent 60%)', filter: 'blur(80px)' }}></div>
            
            {/* Radial Glow - Top Right Cyan */}
            <div className="absolute -top-[10%] -right-[10%] w-[45%] h-[45%]" style={{ background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.1) 40%, transparent 65%)', filter: 'blur(70px)' }}></div>
            
            {/* Radial Glow - Bottom Center Warm */}
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[50%]" style={{ background: 'radial-gradient(ellipse at center, rgba(210, 140, 50, 0.13) 0%, rgba(200, 155, 45, 0.07) 50%, transparent 70%)', filter: 'blur(60px)' }}></div>
            
            {/* Interactive Dot Matrix */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <HeroDotMatrix isDark={studioIsDark} mousePos={studioMousePos} />
            </div>
            
            {/* Black overlay to darken - 30% opacity */}
            <div className="absolute inset-0 bg-black/[0.30] dark:bg-black/[0.30]"></div>
            
            {/* Bottom fade-out into standard background */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none"></div>
          </div>
          
          <Navigation />
          
          {/* Memoized Turnstile - won't re-render on typing */}
          {turnstileElement}
          
          <div className="relative z-10 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-4xl mx-auto">
              
              {/* Refined Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12 animate-fade-in">
                {/* Title - Clean typography */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    JumpinAI Studio
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1 font-medium">
                    Your AI adaptation roadmap in minutes
                  </p>
                </div>
                
                {/* Guest Status - Compact pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border border-amber-500/25 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                  {isLoadingGuestInfo ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></div>
                      <span>
                        {guestUsageInfo 
                          ? `${guestUsageInfo.remaining} free jump${guestUsageInfo.remaining !== 1 ? 's' : ''} left` 
                          : '3 free jumps'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* HERO FORM CARD - Premium Glassmorphism (synced with InlineStudioSection) */}
              <div className="mb-10 sm:mb-14">
                <div className="relative">
                  {/* Multi-layer ambient glow behind card */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-amber-500/[0.08] via-primary/[0.06] to-violet-500/[0.08] rounded-[4rem] blur-3xl opacity-70"></div>
                  <div className="absolute -inset-4 bg-primary/[0.04] rounded-[3rem] blur-xl opacity-50"></div>
                  
                  {/* Card with glassmorphism + gradient border via wrapper */}
                  <div className="relative rounded-[32px] sm:rounded-[40px] p-px bg-gradient-to-br from-amber-400/80 via-white/40 to-cyan-400/80 dark:from-amber-500/65 dark:via-white/30 dark:to-cyan-500/65">
                  <div className="relative rounded-[31px] sm:rounded-[39px] overflow-hidden 
                    bg-gradient-to-br from-zinc-900/85 via-zinc-950/80 to-zinc-900/85 
                    dark:from-zinc-950/90 dark:via-black/85 dark:to-zinc-950/90
                    backdrop-blur-3xl
                    shadow-[0_10px_50px_-4px_rgba(0,0,0,0.35),0_40px_100px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_1px_0_rgba(255,255,255,0.15)_inset]
                    dark:shadow-[0_10px_50px_-4px_rgba(0,0,0,0.6),0_40px_100px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_1px_0_rgba(255,255,255,0.06)_inset]">
                    
                    {/* Premium top highlight - refined shimmer */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/15 to-transparent"></div>
                    
                    {/* Bottom subtle edge */}
                    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 dark:via-zinc-500/10 to-transparent"></div>
                    
                    {/* Subtle inner glow - warm tint */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-cyan-500/[0.03] pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="relative p-8 sm:p-10 md:p-12 lg:p-14">
                      
                      {/* Hero text - Premium typography */}
                      <div className="text-center mb-10 sm:mb-12">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 tracking-tight leading-[1.15]">
                        Create Your{' '}
                        <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                          Jump in AI
                        </span>


                      </h2>
                      <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium">
                        Share your vision, goals, and challenges — we'll craft your personalized AI implementation roadmap.
                      </p>
                    </div>

                      {/* Form inputs */}
                      <div className="space-y-8 sm:space-y-10">
                        <div>
                          {/* Unified single input */}
                          <StudioTextarea
                            ref={visionTextareaRef}
                            label={"What are you building?\nAnd what's in your way?"}
                            value={formData.goals}
                            onChange={(value) => setFormData(prev => ({ ...prev, goals: value }))}
                            onTyped={() => setVisionTyped(true)}
                            onSttUsed={() => {
                              setSttUsed(true);
                              setVisionUsedStt(true);
                            }}
                            onSttDuration={(seconds) => setVisionSttDuration(prev => prev + seconds)}
                            placeholder="Describe what you're building and any obstacles you're facing — we'll map out your personalized AI integration strategy..."
                          />
                        </div>

                        {/* Generate Button - Matches InlineStudioSection exactly */}
                        <div ref={generateButtonRef} className="pt-4 sm:pt-6">
                          <div className="flex flex-col items-center">
                            <div className="relative group/btn w-full sm:w-auto">
                              {/* Subtle hover glow */}
                              <div className="absolute -inset-1 bg-primary/15 rounded-full blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                              
                              <button
                                onClick={() => handleGenerate()}
                                disabled={isGenerating}
                                className="relative w-full sm:w-auto px-12 sm:px-16 md:px-20 py-4 sm:py-5 
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
                                  {isGenerating ? (
                                    <div className="flex flex-col items-center gap-3 min-h-[36px] w-full">
                                      <div className="flex items-center gap-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                        <span className="text-lg font-semibold text-white">
                                          {typeof processingStatus === 'string' ? processingStatus : 'Generating...'}
                                        </span>
                                        <span className="text-base opacity-70 font-mono tabular-nums bg-white/10 px-3 py-1 rounded-full text-white">
                                          {formatTime(generationTimer)}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancel();
                                        }}
                                        className="text-sm text-white/60 hover:text-white transition-opacity underline underline-offset-4 decoration-dotted"
                                      >
                                        Cancel
                                      </button>
                                    </div>
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

              {/* Sign Up CTA - Premium redesign */}
              <div className="mb-12 sm:mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 sm:p-8 rounded-[32px] border-2 border-amber-500/25 dark:border-amber-400/20 bg-gradient-to-r from-amber-500/[0.06] via-orange-500/[0.04] to-amber-500/[0.06] dark:from-amber-500/[0.12] dark:via-orange-500/[0.08] dark:to-amber-500/[0.12] backdrop-blur-sm shadow-xl shadow-amber-500/5">
                  <p className="text-base text-muted-foreground text-center sm:text-left font-medium">
                    <span className="text-foreground font-semibold">Sign up free</span> to save your Jumps and unlock{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-bold">5 welcome credits</span>
                  </p>
                  <button
                    onClick={() => login('/dashboard/studio')}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-500 
                      bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-400 hover:via-amber-500 hover:to-orange-400 
                      text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 
                      hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap tracking-wide"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Get Started Free</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Premium Background Zone */}

        {/* Results section - on standard background */}
        {result && (
          <div className="bg-background">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div ref={progressDisplayRef} className="animate-fade-in-up pt-8">
                  <ProgressiveJumpDisplay
                    result={result}
                    generationTimer={generationTimer}
                    isAuthenticated={false}
                    onGenerateAlternativeJump={handleGenerateAlternativeJump}
                    onToolPromptsRefresh={refreshToolPrompts}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mini Footer - on standard background */}
        <div className="bg-background">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mt-16 py-2 text-center border-t border-border/20">
                <div className="text-sm text-muted-foreground/60">
                  <div>© 2026 JumpinAI, LLC. All rights reserved.</div>
                  <div>
                    <a 
                      href="/terms-of-use" 
                      className="text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4"
                    >
                      Terms of Use
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/privacy-policy" 
                      className="text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4"
                    >
                      Privacy Policy
                    </a>
                    .
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JumpinAIStudio;
