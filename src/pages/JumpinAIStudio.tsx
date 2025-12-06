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
    
    const effectiveFormData = alternativeContext 
      ? {
          ...formData,
          goals: `${formData.goals}\n\n[ALTERNATIVE APPROACH SELECTED: "${alternativeContext.title}"]\nUser has explicitly chosen this alternative approach: ${alternativeContext.description}\nGenerate a jump that follows THIS specific approach, NOT the original default approach.`,
        }
      : formData;
    
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
      
      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background/95 via-background to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative">
        <Navigation />
        
        {/* Memoized Turnstile - won't re-render on typing */}
        {turnstileElement}
        
        <main className="relative">
          {/* Premium floating background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
            <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent opacity-40"></div>
          </div>
          
          <div className="relative pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
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
              <div className="text-center mb-8 sm:mb-12 lg:mb-20 animate-fade-in-up px-2">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/8 blur-3xl transform -translate-y-4"></div>
                  <h1 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-2">
                    JumpinAI Studio
                  </h1>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
                </div>
                
                <div className="relative px-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-2xl"></div>
                  <p className="relative text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground/90 mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                    Generate your personalized <span className="font-semibold text-primary bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent whitespace-nowrap">Jump in AI</span> in 2 minutes—a clear, structured implementation plan with strategic insights, actionable steps, tailored prompts, and the tools that fit your goals.
                  </p>
                </div>
              </div>

              {/* Compact Glass Form */}
              <div className="mb-6 sm:mb-8 lg:mb-12 animate-fade-in-up px-2 sm:px-4 lg:px-0" style={{ animationDelay: '0.5s' }}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/8 to-secondary/10 rounded-2xl blur-xl opacity-40"></div>
                  
                  <div className="relative glass rounded-2xl p-3 sm:p-4 md:p-6 border border-border backdrop-blur-2xl bg-card/80 dark:bg-background/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 rounded-2xl"></div>
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    
                    <div className="relative z-10">
                      <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent px-2">Let's understand your goals</h2>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full"></div>
                      </div>

                      <div className="grid gap-3 sm:gap-4 md:gap-5">
                        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                          <div className="group">
                            <label className="block text-xs sm:text-sm font-medium text-foreground/90 mb-2 sm:mb-3 transition-colors duration-300 group-focus-within:text-primary">
                              What are you working toward? *
                            </label>
                            <div className="relative">
                              <textarea
                                ref={goalsTextareaRef}
                                value={formData.goals}
                                onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                                className="w-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px] p-3 sm:p-4 pb-14 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-primary/10 resize-none placeholder:text-muted-foreground/60 text-base text-foreground bg-card/60 overflow-hidden"
                                style={{ fontSize: '16px' }}
                                placeholder="Your main goals & projects..."
                              />
                              <div className="absolute bottom-3 right-3">
                                <SpeechToTextButton 
                                  onTranscription={(text) => {
                                    setFormData(prev => ({ ...prev, goals: text }));
                                    setSttUsed(true);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-xs sm:text-sm font-medium text-foreground/90 mb-2 sm:mb-3 transition-colors duration-300 group-focus-within:text-primary">
                              What's keeping you from getting there? *
                            </label>
                            <div className="relative">
                              <textarea
                                ref={challengesTextareaRef}
                                value={formData.challenges}
                                onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                                className="w-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px] p-3 sm:p-4 pb-14 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-primary/10 resize-none placeholder:text-muted-foreground/60 text-base text-foreground bg-card/60 overflow-hidden"
                                style={{ fontSize: '16px' }}
                                placeholder="Your obstacles & challenges..."
                              />
                              <div className="absolute bottom-3 right-3">
                                <SpeechToTextButton 
                                  onTranscription={(text) => {
                                    setFormData(prev => ({ ...prev, challenges: text }));
                                    setSttUsed(true);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Generate Button */}
                        <div ref={generateButtonRef} className="text-center mt-4 sm:mt-6 md:mt-8">
                          <div className="relative inline-block group w-full sm:w-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                            
                            <button
                              onClick={() => handleGenerate()}
                              disabled={isGenerating}
                              className="relative w-full sm:max-w-4xl px-8 sm:px-16 md:px-24 py-3 sm:py-4 md:py-5 glass backdrop-blur-xl border border-border/40 hover:border-primary/50 focus:border-primary/60 transition-all duration-500 rounded-full shadow-xl hover:shadow-2xl hover:shadow-primary/20 bg-card/70 hover:scale-[1.02] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 rounded-full"></div>
                              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/25 to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/8 dark:via-transparent dark:to-white/8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              
                              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                                {isGenerating ? (
                                  <div className="flex flex-col items-center gap-1 sm:gap-2 min-h-[32px] w-full">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                                      <span className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                                        {typeof processingStatus === 'string' ? processingStatus : 'Generating your Jump...'}
                                      </span>
                                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                                        {formatTime(generationTimer)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel();
                                      }}
                                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                                    <span className="text-sm sm:text-base md:text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                                      Generate My Jump in AI
                                    </span>
                                  </>
                                )}
                              </div>
                            </button>
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
                  © 2025 JumpinAI, LLC. All rights reserved.{' '}
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
        </main>
      </div>
    </>
  );
};

export default JumpinAIStudio;
