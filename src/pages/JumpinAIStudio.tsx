import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Loader2, LogIn, Zap } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { jumpinAIStudioService, type StudioFormData } from '@/services/jumpinAIStudioService';
import { toast } from 'sonner';
import ProgressiveJumpDisplay from '@/components/ProgressiveJumpDisplay';
import { useProgressiveGeneration } from '@/hooks/useProgressiveGeneration';
import { supabase } from '@/integrations/supabase/client';
import { SpeechToTextButton } from '@/components/SpeechToTextButton';
import { markJumpAsUsingSTT } from '@/services/sttTrackingService';
import type { AlternativeRoute, RouteExplorationHistory } from '@/types/alternativeRoutes';

// Input tracking for goals and challenges (type vs narrate)
interface InputTracking {
  goalsInputMethod: 'typed' | 'narrated' | 'mixed';
  challengesInputMethod: 'typed' | 'narrated' | 'mixed';
  goalsSttDurationSeconds: number;
  challengesSttDurationSeconds: number;
  totalSttDurationSeconds: number;
}

// Silently send notification to admin about jump generation (guest + authenticated)
const sendJumpGenerationNotification = async (
  formData: { goals: string; challenges: string },
  user: { id?: string; email?: string; user_metadata?: { name?: string; full_name?: string } } | null,
  inputTracking: InputTracking
) => {
  try {
    // Get IP and location
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
        challenges: formData.challenges,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        // Input method tracking
        goalsInputMethod: inputTracking.goalsInputMethod,
        challengesInputMethod: inputTracking.challengesInputMethod,
        goalsSttDurationSeconds: inputTracking.goalsSttDurationSeconds,
        challengesSttDurationSeconds: inputTracking.challengesSttDurationSeconds,
        totalSttDurationSeconds: inputTracking.totalSttDurationSeconds,
      },
    });
  } catch {
    // Silently fail - never disrupt generation
  }
};

const JumpinAIStudio = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { hasCredits, deductCredit, updateTransactionReference } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  
  // State
  const [generationTimer, setGenerationTimer] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [guestUsageInfo, setGuestUsageInfo] = useState<{ usageCount: number; remaining: number } | null>(null);
  const [isLoadingGuestInfo, setIsLoadingGuestInfo] = useState(true);
  const [sttUsed, setSttUsed] = useState(false);
  
  // Input method tracking state
  const [goalsUsedStt, setGoalsUsedStt] = useState(false);
  const [challengesUsedStt, setChallengesUsedStt] = useState(false);
  const [goalsSttDuration, setGoalsSttDuration] = useState(0);
  const [challengesSttDuration, setChallengesSttDuration] = useState(0);
  const [goalsTyped, setGoalsTyped] = useState(false);
  const [challengesTyped, setChallengesTyped] = useState(false);
  
  const [formData, setFormData] = useState<StudioFormData>({
    currentRole: '',
    industry: '',
    experienceLevel: '',
    aiKnowledge: '',
    goals: '',
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
  const goalsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const challengesTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-adjust textarea heights
  useEffect(() => {
    if (goalsTextareaRef.current && challengesTextareaRef.current) {
      goalsTextareaRef.current.style.height = 'auto';
      challengesTextareaRef.current.style.height = 'auto';
      
      const goalsHeight = goalsTextareaRef.current.scrollHeight;
      const challengesHeight = challengesTextareaRef.current.scrollHeight;
      const maxHeight = Math.max(goalsHeight, challengesHeight);
      
      goalsTextareaRef.current.style.height = maxHeight + 'px';
      challengesTextareaRef.current.style.height = maxHeight + 'px';
    }
  }, [formData.goals, formData.challenges]);

  const handleCancel = useCallback(() => {
    toast.info('Generation cancelled. You can start a new request anytime.');
    window.location.reload();
  }, []);

  const handleGenerate = useCallback(async (alternativeContext?: { title: string; description: string }) => {
    console.log('=== GENERATE BUTTON CLICKED ===');
    
    // Calculate input methods
    const getInputMethod = (usedStt: boolean, typed: boolean): 'typed' | 'narrated' | 'mixed' => {
      if (usedStt && typed) return 'mixed';
      if (usedStt) return 'narrated';
      return 'typed';
    };
    
    // Determine overall input method
    const goalsMethod = getInputMethod(goalsUsedStt, goalsTyped);
    const challengesMethod = getInputMethod(challengesUsedStt, challengesTyped);
    let overallInputMethod: 'typed' | 'narrated' | 'mixed' = 'typed';
    if (goalsMethod === 'narrated' && challengesMethod === 'narrated') {
      overallInputMethod = 'narrated';
    } else if (goalsUsedStt || challengesUsedStt) {
      overallInputMethod = 'mixed';
    }
    
    const effectiveFormData = alternativeContext 
      ? {
          ...formData,
          goals: `${formData.goals}\n\n[ALTERNATIVE APPROACH SELECTED: "${alternativeContext.title}"]\nUser has explicitly chosen this alternative approach: ${alternativeContext.description}\nGenerate a jump that follows THIS specific approach, NOT the original default approach.`,
          // Add STT tracking data to formData for edge function
          sttUsed: goalsUsedStt || challengesUsedStt,
          inputMethod: overallInputMethod,
          goalsSttSeconds: goalsSttDuration,
          challengesSttSeconds: challengesSttDuration,
        }
      : {
          ...formData,
          // Add STT tracking data to formData for edge function
          sttUsed: goalsUsedStt || challengesUsedStt,
          inputMethod: overallInputMethod,
          goalsSttSeconds: goalsSttDuration,
          challengesSttSeconds: challengesSttDuration,
        };
    
    if (!effectiveFormData.goals.trim() || !effectiveFormData.challenges.trim()) {
      toast.error('Please fill in your goals and challenges');
      return;
    }

    // Guest users: Verify Turnstile token
    if (!turnstileToken) {
      // If no token, try to get a fresh one by triggering reset
      if (turnstileRef.current) {
        toast.info('Security verification in progress. Please wait a moment and try again.');
        turnstileRef.current.reset();
      } else {
        toast.error('Security verification required. Please refresh the page and try again.');
      }
      return;
    }
    
    const inputTracking: InputTracking = {
      goalsInputMethod: goalsMethod,
      challengesInputMethod: challengesMethod,
      goalsSttDurationSeconds: goalsSttDuration,
      challengesSttDurationSeconds: challengesSttDuration,
      totalSttDurationSeconds: goalsSttDuration + challengesSttDuration,
    };

    // Send silent notification to admin (fire and forget)
    void sendJumpGenerationNotification(
      { goals: formData.goals, challenges: formData.challenges },
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
        toast.success('Your Jump in AI is ready! Sign up to get 3 welcome credits and save your jumps.');
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
        toast.error('You\'ve used all 3 free tries. Please sign up to get 3 welcome credits and continue!');
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
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
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
            turnstileRef.current?.reset();
          }}
          options={{
            theme: 'light',
            size: 'invisible',
            refreshExpired: 'auto', // Automatically refresh when expired
          }}
        />
      </div>
    );
  }, [isLoading, isAuthenticated]);

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
      
      <div className="min-h-screen scroll-snap-container relative overflow-hidden">
        {/* Premium Background System - Dark base for contrast */}
        <div className="fixed inset-0 bg-gradient-to-br from-muted/60 via-background to-muted/40 dark:from-background dark:via-background dark:to-muted/30"></div>
        
        {/* Subtle noise texture for premium feel */}
        <div className="fixed inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
        
        {/* Premium ambient orbs with stronger presence */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] right-[5%] w-[700px] h-[700px] bg-primary/[0.12] dark:bg-primary/[0.08] rounded-full blur-[150px] animate-pulse" style={{animationDuration: '10s'}}></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/[0.08] dark:bg-accent/[0.05] rounded-full blur-[130px] animate-pulse" style={{animationDuration: '12s', animationDelay: '3s'}}></div>
          <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] bg-secondary/[0.06] rounded-full blur-[100px]"></div>
        </div>
        
        {/* Refined grid pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(hsl(var(--foreground)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.015)_1px,transparent_1px)] pointer-events-none"></div>
        
        <Navigation />
        
        {/* Memoized Turnstile - won't re-render on typing */}
        {turnstileElement}
        
        <main className="relative z-10">          
          <div className="relative pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Guest Status Indicator - More refined */}
              <div className="flex justify-start mb-6 sm:mb-8 animate-fade-in-left">
                <div className="relative group w-full sm:w-auto">
                  <div className="relative rounded-2xl p-3 sm:p-4 text-xs sm:text-sm border border-amber-500/30 dark:border-amber-400/20 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/20 shadow-lg shadow-amber-500/5 transition-all duration-300 w-full sm:max-w-sm backdrop-blur-sm">
                    <div className="relative z-10">
                      <div className="flex items-center justify-center sm:justify-start gap-2.5 text-amber-700 dark:text-amber-400">
                        {isLoadingGuestInfo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="font-medium">Checking availability...</span>
                          </>
                        ) : (
                          <>
                            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 dark:bg-amber-400/20">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold">
                              {guestUsageInfo 
                                ? `Guest Mode: ${guestUsageInfo.remaining} jump${guestUsageInfo.remaining !== 1 ? 's' : ''} remaining` 
                                : 'Guest Mode: 3 free tries available'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PREMIUM Hero Section */}
              <div className="text-center mb-10 sm:mb-14 lg:mb-16 animate-fade-in-up px-2">
                {/* Floating badge with premium styling */}
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold mb-8 shadow-lg shadow-primary/25">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="tracking-wide uppercase">AI Adaptation Studio</span>
                </div>
                
                <div className="relative mb-6 sm:mb-8">
                  <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
                    JumpinAI Studio
                  </h1>
                  {/* Elegant underline accent */}
                  <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full shadow-lg shadow-primary/30"></div>
                </div>
                
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-8 sm:mt-10">
                  Generate your personalized <span className="font-semibold text-foreground">Jump in AI</span> in 2 minutes—strategic insights, actionable steps, and tailored tools for your goals.
                </p>
              </div>

              {/* PREMIUM Form Card - Elevated Design */}
              <div className="mb-10 sm:mb-14 lg:mb-16 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="relative">
                  {/* Multi-layer shadow system for depth */}
                  <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-[2rem] blur-2xl"></div>
                  <div className="absolute -inset-1 bg-gradient-to-b from-border/50 via-border/20 to-border/50 rounded-[1.75rem] opacity-50"></div>
                  
                  {/* Main card container */}
                  <div className="relative rounded-3xl overflow-hidden bg-card dark:bg-card/95 border border-border/60 dark:border-border/40 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)]">
                    {/* Premium top gradient bar */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                    
                    {/* Inner highlight at top */}
                    <div className="absolute top-1 inset-x-0 h-24 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none"></div>
                    
                    {/* Corner decorations */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-primary/30 rounded-tl-xl pointer-events-none"></div>
                    <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-primary/30 rounded-tr-xl pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
                      {/* Section header */}
                      <div className="text-center mb-8 sm:mb-10">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                          Tell us about your goals
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">We'll create your personalized implementation roadmap</p>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full mt-4"></div>
                      </div>

                      <div className="grid gap-6 sm:gap-8 md:gap-10">
                        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                          {/* Goals Input - Premium styling */}
                          <div className="group/input relative">
                            {/* Glow effect on focus */}
                            <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 group-focus-within/input:opacity-100 blur-md transition-opacity duration-300"></div>
                            
                            <div className="relative">
                              <label className="flex items-center gap-3 text-sm font-semibold text-foreground mb-3 transition-colors duration-300 group-focus-within/input:text-primary">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/25">1</span>
                                <span>What are you working toward?</span>
                                <span className="text-destructive">*</span>
                              </label>
                              <div className="relative">
                                <textarea
                                  ref={goalsTextareaRef}
                                  value={formData.goals}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, goals: e.target.value }));
                                    setGoalsTyped(true);
                                  }}
                                  className="w-full min-h-[160px] sm:min-h-[180px] p-5 pb-16 rounded-2xl border-2 border-border/70 bg-background/80 dark:bg-background/50 placeholder:text-muted-foreground/40 text-foreground resize-none transition-all duration-300 focus:outline-none focus:border-primary/50 focus:bg-background hover:border-border shadow-inner"
                                  style={{ fontSize: '16px' }}
                                  placeholder="Describe your main goals and what you want to achieve with AI..."
                                />
                                <div className="absolute bottom-4 right-4">
                                  <SpeechToTextButton 
                                    onTranscription={(text, durationSeconds) => {
                                      setFormData(prev => ({ ...prev, goals: text }));
                                      setSttUsed(true);
                                      setGoalsUsedStt(true);
                                      if (durationSeconds) {
                                        setGoalsSttDuration(prev => prev + durationSeconds);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Challenges Input - Premium styling */}
                          <div className="group/input relative">
                            {/* Glow effect on focus */}
                            <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 group-focus-within/input:opacity-100 blur-md transition-opacity duration-300"></div>
                            
                            <div className="relative">
                              <label className="flex items-center gap-3 text-sm font-semibold text-foreground mb-3 transition-colors duration-300 group-focus-within/input:text-primary">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/25">2</span>
                                <span>What's keeping you from getting there?</span>
                                <span className="text-destructive">*</span>
                              </label>
                              <div className="relative">
                                <textarea
                                  ref={challengesTextareaRef}
                                  value={formData.challenges}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, challenges: e.target.value }));
                                    setChallengesTyped(true);
                                  }}
                                  className="w-full min-h-[160px] sm:min-h-[180px] p-5 pb-16 rounded-2xl border-2 border-border/70 bg-background/80 dark:bg-background/50 placeholder:text-muted-foreground/40 text-foreground resize-none transition-all duration-300 focus:outline-none focus:border-primary/50 focus:bg-background hover:border-border shadow-inner"
                                  style={{ fontSize: '16px' }}
                                  placeholder="What obstacles or challenges are you facing right now..."
                                />
                                <div className="absolute bottom-4 right-4">
                                  <SpeechToTextButton 
                                    onTranscription={(text, durationSeconds) => {
                                      setFormData(prev => ({ ...prev, challenges: text }));
                                      setSttUsed(true);
                                      setChallengesUsedStt(true);
                                      if (durationSeconds) {
                                        setChallengesSttDuration(prev => prev + durationSeconds);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PREMIUM Generate Button - Glassmorphism Style */}
                        <div ref={generateButtonRef} className="text-center pt-4 sm:pt-6">
                          <div className="relative inline-block group/btn w-full sm:w-auto">
                            {/* Subtle outer glow on hover */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[2rem] blur-lg opacity-0 group-hover/btn:opacity-60 transition-opacity duration-500"></div>
                            
                            <button
                              onClick={() => handleGenerate()}
                              disabled={isGenerating}
                              className="relative w-full sm:w-auto px-12 sm:px-20 md:px-24 py-5 sm:py-6 
                                bg-gradient-to-br from-muted/80 via-muted/60 to-muted/80
                                dark:from-zinc-800/90 dark:via-zinc-700/80 dark:to-zinc-800/90
                                backdrop-blur-xl
                                text-foreground font-bold text-lg 
                                rounded-full
                                border border-border/50 dark:border-white/10
                                transition-all duration-300 
                                hover:scale-[1.02] active:scale-[0.98] 
                                hover:border-primary/30 dark:hover:border-white/20
                                hover:shadow-lg hover:shadow-primary/10
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 
                                shadow-lg shadow-black/10 dark:shadow-black/30
                                overflow-hidden"
                            >
                              {/* Animated shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out rounded-full"></div>
                              
                              {/* Inner highlight for glass effect */}
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent"></div>
                              
                              <div className="relative z-10 flex items-center justify-center gap-3">
                                {isGenerating ? (
                                  <div className="flex flex-col items-center gap-2 min-h-[32px] w-full">
                                    <div className="flex items-center gap-3">
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      <span className="text-base sm:text-lg font-semibold">
                                        {typeof processingStatus === 'string' ? processingStatus : 'Generating your Jump...'}
                                      </span>
                                      <span className="text-sm opacity-80 font-mono">
                                        {formatTime(generationTimer)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel();
                                      }}
                                      className="text-xs opacity-70 hover:opacity-100 hover:text-destructive-foreground transition-all underline"
                                    >
                                      Cancel generation
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <Zap className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                                    <span>Generate My Jump in AI</span>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>
                          
                          {/* Trust indicators with better styling */}
                          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">✓</span>
                              2-minute generation
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">✓</span>
                              Personalized plan
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">✓</span>
                              Ready-to-use prompts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Sign Up CTA */}
              <div className="mb-10 sm:mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-orange-500/10 dark:from-amber-500/15 dark:via-amber-400/10 dark:to-orange-500/15 border border-amber-400/30 dark:border-amber-400/20 shadow-lg">
                  <div className="absolute inset-0 bg-card/60 dark:bg-card/40"></div>
                  <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8">
                    <p className="text-sm sm:text-base text-amber-800 dark:text-amber-200 font-medium text-center sm:text-left">
                      Save your Jump and unlock more features — <span className="font-bold">3 welcome credits</span> on sign up!
                    </p>
                    <button
                      onClick={() => login('/dashboard/studio')}
                      className="flex items-center gap-2.5 px-8 py-3 rounded-xl transition-all duration-300 bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign Up Free</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Progressive Jump Display */}
              {result && (
                <div ref={progressDisplayRef} className="animate-fade-in-up">
                  <ProgressiveJumpDisplay
                    result={result}
                    generationTimer={generationTimer}
                    isAuthenticated={false}
                    onGenerateAlternativeJump={handleGenerateAlternativeJump}
                    onToolPromptsRefresh={refreshToolPrompts}
                  />
                </div>
              )}

              {/* Mini Footer */}
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
        </main>
      </div>
    </>
  );
};

export default JumpinAIStudio;
