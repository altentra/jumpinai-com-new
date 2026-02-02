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
          <div className="relative pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Compact Header Row - Title left, Guest status right */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12 animate-fade-in">
                {/* Small Title - Upper Left */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      JumpinAI Studio
                    </h1>
                    <p className="text-xs text-muted-foreground">AI Adaptation Engine</p>
                  </div>
                </div>
                
                {/* Guest Status - Compact */}
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border border-amber-500/30 dark:border-amber-400/20 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 backdrop-blur-sm">
                    {isLoadingGuestInfo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                        <span>
                          {guestUsageInfo 
                            ? `${guestUsageInfo.remaining} jump${guestUsageInfo.remaining !== 1 ? 's' : ''} left` 
                            : '3 free tries'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* HERO FORM CARD - The Main Event */}
              <div className="mb-10 sm:mb-14 lg:mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative">
                  {/* Sophisticated shadow layers */}
                  <div className="absolute -inset-6 bg-gradient-radial from-primary/8 via-transparent to-transparent rounded-[3rem] blur-3xl opacity-60"></div>
                  <div className="absolute -inset-px bg-gradient-to-b from-white/20 dark:from-white/5 via-transparent to-transparent rounded-[2rem]"></div>
                  
                  {/* Main card */}
                  <div className="relative rounded-[2rem] overflow-hidden 
                    bg-gradient-to-b from-card via-card to-card/95
                    dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95
                    border border-border/40 dark:border-white/[0.08]
                    shadow-[0_25px_80px_-20px_rgba(0,0,0,0.2),0_10px_30px_-10px_rgba(0,0,0,0.1)]
                    dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6),0_10px_30px_-10px_rgba(0,0,0,0.4)]">
                    
                    {/* Subtle top edge glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent"></div>
                    <div className="absolute top-0 inset-x-[20%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                    
                    {/* Content area with generous padding */}
                    <div className="relative p-8 sm:p-10 md:p-14 lg:p-16">
                      
                      {/* Hero text inside the card */}
                      <div className="text-center mb-10 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight leading-tight">
                          Create Your Personalized <br className="hidden sm:block" />
                          <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">Jump in AI</span>
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                          Share your goals and challenges. In under 2 minutes, get a strategic roadmap with actionable steps and AI tools tailored for you.
                        </p>
                      </div>

                      <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                          {/* Goals Input - Ultra Premium */}
                          <div className="group/input relative">
                            <div className="relative">
                              <label className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 mb-3 transition-colors duration-300 group-focus-within/input:text-foreground">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[11px] font-bold shadow-sm">1</span>
                                <span>Your Goals</span>
                                <span className="text-destructive/70 text-xs">*</span>
                              </label>
                              <div className="relative rounded-2xl overflow-hidden">
                                {/* Focus ring effect */}
                                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/50 via-primary/30 to-primary/50 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
                                <textarea
                                  ref={goalsTextareaRef}
                                  value={formData.goals}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, goals: e.target.value }));
                                    setGoalsTyped(true);
                                  }}
                                  className="relative w-full min-h-[180px] sm:min-h-[200px] p-5 pb-16 
                                    rounded-2xl border border-border/50
                                    bg-gradient-to-b from-muted/30 to-muted/50
                                    dark:from-zinc-800/50 dark:to-zinc-800/30
                                    placeholder:text-muted-foreground/50 
                                    text-foreground resize-none 
                                    transition-all duration-300 
                                    focus:outline-none focus:border-transparent
                                    focus:bg-gradient-to-b focus:from-background focus:to-background/95
                                    hover:border-border"
                                  style={{ fontSize: '16px' }}
                                  placeholder="What do you want to achieve with AI? Describe your vision..."
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
                          
                          {/* Challenges Input - Ultra Premium */}
                          <div className="group/input relative">
                            <div className="relative">
                              <label className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 mb-3 transition-colors duration-300 group-focus-within/input:text-foreground">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[11px] font-bold shadow-sm">2</span>
                                <span>Your Challenges</span>
                                <span className="text-destructive/70 text-xs">*</span>
                              </label>
                              <div className="relative rounded-2xl overflow-hidden">
                                {/* Focus ring effect */}
                                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/50 via-primary/30 to-primary/50 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
                                <textarea
                                  ref={challengesTextareaRef}
                                  value={formData.challenges}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, challenges: e.target.value }));
                                    setChallengesTyped(true);
                                  }}
                                  className="relative w-full min-h-[180px] sm:min-h-[200px] p-5 pb-16 
                                    rounded-2xl border border-border/50
                                    bg-gradient-to-b from-muted/30 to-muted/50
                                    dark:from-zinc-800/50 dark:to-zinc-800/30
                                    placeholder:text-muted-foreground/50 
                                    text-foreground resize-none 
                                    transition-all duration-300 
                                    focus:outline-none focus:border-transparent
                                    focus:bg-gradient-to-b focus:from-background focus:to-background/95
                                    hover:border-border"
                                  style={{ fontSize: '16px' }}
                                  placeholder="What obstacles are holding you back? What frustrates you..."
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

                        {/* Generate Button Section */}
                        <div ref={generateButtonRef} className="pt-6 sm:pt-8">
                          <div className="flex flex-col items-center">
                            {/* Glassmorphism Button */}
                            <div className="relative group/btn w-full sm:w-auto">
                              <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 rounded-full blur-xl opacity-0 group-hover/btn:opacity-80 transition-opacity duration-500"></div>
                              
                              <button
                                onClick={() => handleGenerate()}
                                disabled={isGenerating}
                                className="relative w-full sm:w-auto px-14 sm:px-20 md:px-28 py-5 sm:py-6 
                                  bg-gradient-to-br from-muted/90 via-muted/70 to-muted/90
                                  dark:from-zinc-800 dark:via-zinc-700/90 dark:to-zinc-800
                                  backdrop-blur-xl
                                  text-foreground font-semibold text-base sm:text-lg
                                  rounded-full
                                  border border-border/60 dark:border-white/10
                                  transition-all duration-300 
                                  hover:scale-[1.02] active:scale-[0.98] 
                                  hover:border-primary/40 dark:hover:border-white/20
                                  hover:shadow-xl hover:shadow-primary/10
                                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 
                                  shadow-lg shadow-black/10 dark:shadow-black/40
                                  overflow-hidden"
                              >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out rounded-full"></div>
                                
                                {/* Top highlight */}
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent"></div>
                                
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                  {isGenerating ? (
                                    <div className="flex flex-col items-center gap-2 min-h-[32px] w-full">
                                      <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-base font-medium">
                                          {typeof processingStatus === 'string' ? processingStatus : 'Generating...'}
                                        </span>
                                        <span className="text-sm opacity-70 font-mono tabular-nums">
                                          {formatTime(generationTimer)}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancel();
                                        }}
                                        className="text-xs opacity-60 hover:opacity-100 transition-opacity underline underline-offset-2"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <Zap className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6" />
                                      <span>Generate My Jump</span>
                                    </>
                                  )}
                                </div>
                              </button>
                            </div>
                            
                            {/* Trust badges - minimal */}
                            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground/70">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                2 min
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                Personalized
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-primary/50"></span>
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

              {/* Sign Up CTA - Cleaner */}
              <div className="mb-10 sm:mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-amber-500/20 dark:border-amber-400/15 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-orange-500/10">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    <span className="text-foreground font-medium">Sign up free</span> to save your Jumps • <span className="text-amber-600 dark:text-amber-400 font-semibold">3 welcome credits</span>
                  </p>
                  <button
                    onClick={() => login('/dashboard/studio')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 
                      bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 
                      text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 
                      hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
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
