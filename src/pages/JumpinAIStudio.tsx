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
        {/* Layered Background System */}
        <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20"></div>
        
        {/* Ambient glow orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/[0.08] dark:bg-primary/[0.06] rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}}></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/[0.06] dark:bg-accent/[0.04] rounded-full blur-[100px] animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-secondary/[0.04] rounded-full blur-[80px] animate-pulse" style={{animationDuration: '12s', animationDelay: '4s'}}></div>
        </div>
        
        {/* Subtle texture overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:24px_24px] opacity-50 dark:opacity-30 pointer-events-none"></div>
        
        <Navigation />
        
        {/* Memoized Turnstile - won't re-render on typing */}
        {turnstileElement}
        
        <main className="relative z-10">          
          <div className="relative pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Guest Status Indicator */}
              <div className="flex justify-start mb-4 sm:mb-6 animate-fade-in-left">
                <div className="relative group w-full sm:w-auto">
                  <div className="relative glass rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm border border-border backdrop-blur-xl bg-card/80 shadow-lg transition-all duration-300 w-full sm:max-w-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/3 rounded-xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-600">
                        {isLoadingGuestInfo ? (
                          <>
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            <span className="font-medium text-xs sm:text-sm">
                              Checking availability...
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="relative">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                            </div>
                            <span className="font-medium text-xs sm:text-sm">
                              {guestUsageInfo 
                                ? `Guest: ${guestUsageInfo.remaining} jumps remaining` 
                                : 'Guest: 3 free tries available'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Hero Section */}
              <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in-up px-2">
                {/* Floating badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 text-primary text-xs font-medium mb-6 backdrop-blur-sm">
                  <Zap className="w-3 h-3" />
                  <span>AI Adaptation Studio</span>
                </div>
                
                <div className="relative mb-4 sm:mb-6">
                  <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-[1.1] tracking-tight">
                    JumpinAI Studio
                  </h1>
                  {/* Elegant gradient underline */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 sm:w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-80"></div>
                </div>
                
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mt-6">
                  Generate your personalized <span className="font-semibold text-foreground">Jump in AI</span> in 2 minutes—a clear, structured implementation plan with strategic insights, actionable steps, tailored prompts, and the tools that fit your goals.
                </p>
              </div>

              {/* Premium Glass Form Card */}
              <div className="mb-8 sm:mb-10 lg:mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="relative group/card">
                  {/* Outer glow */}
                  <div className="absolute -inset-px bg-gradient-to-b from-border/60 via-border/30 to-border/60 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Main card */}
                  <div className="relative backdrop-blur-2xl bg-card/70 dark:bg-card/50 rounded-2xl border border-border/50 overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20">
                    {/* Top edge highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
                    
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-primary/40 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-primary/40 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-primary/40 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-primary/40 to-transparent"></div>
                    
                    {/* Content */}
                    <div className="relative p-5 sm:p-6 md:p-8 lg:p-10">
                      {/* Section header */}
                      <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2">
                          Let's understand your goals
                        </h2>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto rounded-full"></div>
                      </div>

                      <div className="grid gap-5 sm:gap-6 md:gap-8">
                        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                          {/* Goals Input */}
                          <div className="group/input relative">
                            {/* Glow on focus */}
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-focus-within/input:opacity-100 blur-sm transition-opacity duration-500"></div>
                            
                            <div className="relative">
                              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-3 transition-colors duration-300 group-focus-within/input:text-primary">
                                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary text-xs font-bold">1</span>
                                What are you working toward? *
                              </label>
                              <div className="relative">
                                <textarea
                                  ref={goalsTextareaRef}
                                  value={formData.goals}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, goals: e.target.value }));
                                    setGoalsTyped(true);
                                  }}
                                  className="w-full min-h-[140px] sm:min-h-[160px] p-4 pb-14 rounded-xl border border-border/60 bg-background/50 dark:bg-background/30 placeholder:text-muted-foreground/50 text-foreground resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 hover:border-border"
                                  style={{ fontSize: '16px' }}
                                  placeholder="Your main goals & projects..."
                                />
                                <div className="absolute bottom-3 right-3">
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
                          
                          {/* Challenges Input */}
                          <div className="group/input relative">
                            {/* Glow on focus */}
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-focus-within/input:opacity-100 blur-sm transition-opacity duration-500"></div>
                            
                            <div className="relative">
                              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-3 transition-colors duration-300 group-focus-within/input:text-primary">
                                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary text-xs font-bold">2</span>
                                What's keeping you from getting there? *
                              </label>
                              <div className="relative">
                                <textarea
                                  ref={challengesTextareaRef}
                                  value={formData.challenges}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, challenges: e.target.value }));
                                    setChallengesTyped(true);
                                  }}
                                  className="w-full min-h-[140px] sm:min-h-[160px] p-4 pb-14 rounded-xl border border-border/60 bg-background/50 dark:bg-background/30 placeholder:text-muted-foreground/50 text-foreground resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 hover:border-border"
                                  style={{ fontSize: '16px' }}
                                  placeholder="Your obstacles & challenges..."
                                />
                                <div className="absolute bottom-3 right-3">
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

                        {/* Premium Generate Button */}
                        <div ref={generateButtonRef} className="text-center mt-4 sm:mt-6">
                          <div className="relative inline-block group/btn w-full sm:w-auto">
                            {/* Outer glow ring */}
                            <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-500"></div>
                            
                            <button
                              onClick={() => handleGenerate()}
                              disabled={isGenerating}
                              className="relative w-full sm:w-auto px-10 sm:px-16 md:px-20 py-4 sm:py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 overflow-hidden"
                            >
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                              
                              <div className="relative z-10 flex items-center justify-center gap-3">
                                {isGenerating ? (
                                  <div className="flex flex-col items-center gap-2 min-h-[32px] w-full">
                                    <div className="flex items-center gap-3">
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      <span className="text-base sm:text-lg">
                                        {typeof processingStatus === 'string' ? processingStatus : 'Generating your Jump...'}
                                      </span>
                                      <span className="text-sm opacity-80">
                                        {formatTime(generationTimer)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel();
                                      }}
                                      className="text-xs opacity-70 hover:opacity-100 hover:text-destructive-foreground transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <Zap className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                                    <span className="text-base sm:text-lg">Generate My Jump in AI</span>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>
                          
                          {/* Trust indicators */}
                          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground/60">
                            <span>✓ 2-minute generation</span>
                            <span>✓ Personalized plan</span>
                            <span>✓ Ready-to-use prompts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign Up CTA for Guests */}
              <div className="mb-8 animate-fade-in-up max-w-4xl mx-auto" style={{ animationDelay: '0.7s' }}>
                <div className="relative glass rounded-2xl p-5 sm:p-6 border border-amber-400/20 backdrop-blur-xl bg-gradient-to-br from-amber-500/5 via-card/90 to-orange-400/5">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-sm sm:text-base text-amber-600/90 dark:text-amber-400/90 font-medium leading-relaxed">
                      Want to be able to save your Jump? Sign up now and get <span className="font-semibold">3 welcome credits</span>!
                    </p>
                    <button
                      onClick={() => login('/dashboard/studio')}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-full transition-all duration-300 backdrop-blur-md bg-amber-600/80 hover:bg-amber-600/90 text-white/95 border border-amber-500/30 shadow-lg shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-900/15"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="font-medium">Sign Up Now</span>
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
