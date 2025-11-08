import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, AlertCircle, Loader2, LogIn, Zap } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { guestLimitService } from '@/services/guestLimitService';
import { jumpinAIStudioService, type StudioFormData } from '@/services/jumpinAIStudioService';
import { toast } from 'sonner';
import ProgressiveJumpDisplay from '@/components/ProgressiveJumpDisplay';
import { useProgressiveGeneration } from '@/hooks/useProgressiveGeneration';
import { CreditsDisplay } from '@/components/CreditsDisplay';
import { supabase } from '@/integrations/supabase/client';
import ReCAPTCHA from 'react-google-recaptcha';

// reCAPTCHA v2 site key (public key - safe to expose)
const RECAPTCHA_SITE_KEY = '6LcNLAYsAAAAANpysLVw3g_CdlDs8zHaozOZG_7k';

const JumpinAIStudio = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { hasCredits, deductCredit, creditsBalance, updateTransactionReference } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  const [guestCanUse, setGuestCanUse] = useState(true);
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const [generationTimer, setGenerationTimer] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const progressDisplayRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLDivElement>(null);
  const goalsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const challengesTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);
  
  // Helper function to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Check guest limits on component mount and load saved form data
  useEffect(() => {
    if (!isAuthenticated) {
      checkGuestLimits();
    } else {
      loadSavedFormData();
    }
  }, [isAuthenticated]);

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

  // Auto-scroll ONLY when generation starts (button click)
  useEffect(() => {
    if (isGenerating && progressDisplayRef.current) {
      console.log('Generation started - scrolling to jump module');
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

  // Auto-adjust textarea heights when content changes - keep both equal
  useEffect(() => {
    if (goalsTextareaRef.current && challengesTextareaRef.current) {
      // Reset heights to calculate scroll height properly
      goalsTextareaRef.current.style.height = 'auto';
      challengesTextareaRef.current.style.height = 'auto';
      
      // Get the maximum height needed
      const goalsHeight = goalsTextareaRef.current.scrollHeight;
      const challengesHeight = challengesTextareaRef.current.scrollHeight;
      const maxHeight = Math.max(goalsHeight, challengesHeight);
      
      // Set both to the same height
      goalsTextareaRef.current.style.height = maxHeight + 'px';
      challengesTextareaRef.current.style.height = maxHeight + 'px';
    }
  }, [formData.goals, formData.challenges]);

  const loadSavedFormData = async () => {
    // SECURITY: Only load data for authenticated users with verified user ID
    if (!isAuthenticated || !user?.id) {
      console.log('No authenticated user - keeping empty form fields');
      return;
    }
    
    try {
      console.log('Loading saved form data for authenticated user:', user.id);
      
      // SECURITY: Query with explicit user_id filter to ensure data isolation
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id) // CRITICAL: Only get data for THIS specific user
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Database error loading user profile:', error);
        return;
      }
      
      // Only populate fields if user has previously saved data
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        console.log('Populating form with user saved data');
        
        // SECURITY: Only update with saved data, never expose other users' data
        setFormData({
          currentRole: profile.current_role_value || '',
          industry: profile.industry || '',
          experienceLevel: profile.experience_level || '',
          aiKnowledge: profile.ai_knowledge || '',
          goals: profile.goals || '',
          challenges: profile.challenges || '',
          timeCommitment: profile.time_commitment || '',
          budget: profile.budget || '',
        });
      } else {
        console.log('No saved data found - keeping empty fields');
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  const saveFormData = async (data: StudioFormData) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      await jumpinAIStudioService.saveFormData(data, user.id);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const checkGuestLimits = async () => {
    try {
      const { canUse, usageCount } = await guestLimitService.checkGuestLimit();
      setGuestCanUse(canUse);
      setGuestUsageCount(usageCount);
    } catch (error) {
      console.error('Error checking guest limits:', error);
    }
  };

  const handleCancel = () => {
    // Show confirmation toast
    toast.info('Generation cancelled. You can start a new request anytime.');
    
    // Reset the generation state
    // Note: The actual implementation would depend on your useProgressiveGeneration hook
    // You might need to add a cancel method to that hook
    window.location.reload(); // Simple approach - reload to reset state
  };

  const handleGenerate = async () => {
    console.log('=== GENERATE BUTTON CLICKED ===');
    console.log('Form data:', formData);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('guestUsageCount:', guestUsageCount);
    
    // Validate required fields
    if (!formData.goals.trim() || !formData.challenges.trim()) {
      console.log('Validation failed: missing goals or challenges');
      toast.error('Please fill in your goals and challenges');
      return;
    }

    // Verify reCAPTCHA is available
    if (!recaptchaRef.current) {
      console.error('reCAPTCHA not ready!');
      toast.error('reCAPTCHA is loading... Please wait a moment and try again.');
      return;
    }

    console.log('Attempting reCAPTCHA verification...');
    let recaptchaToken: string | null = null;
    
    try {
      console.log('Executing reCAPTCHA...');
      recaptchaToken = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset(); // Reset for next use
      
      console.log('✅ reCAPTCHA token received:', recaptchaToken ? 'SUCCESS' : 'FAILED');
      console.log('Token length:', recaptchaToken?.length || 0);
      
      if (!recaptchaToken) {
        console.error('❌ reCAPTCHA returned null token');
        toast.error('reCAPTCHA verification failed. Please try again.');
        return;
      }
      
    } catch (error) {
      console.error('❌ reCAPTCHA error:', error);
      console.error('Error type:', typeof error);
      console.error('Current domain:', window.location.hostname);
      console.error('reCAPTCHA key:', RECAPTCHA_SITE_KEY);
      toast.error('reCAPTCHA verification failed. Please refresh the page and try again.');
      return;
    }

    // Check limits based on user authentication status
    if (isAuthenticated) {
      // Authenticated users: Check credits
      if (!hasCredits()) {
        toast.error('You don\'t have enough credits. Please purchase more credits to continue.');
        return;
      }
    } else {
      // Guest users: 3 tries per 24 hours
      if (guestUsageCount >= 3) {
        toast.error('You\'ve used all 3 free tries. Please sign up and get 5 welcome credits to continue!');
        return;
      }
    }

    try {
      // Deduct credit for authenticated users BEFORE generation
      let tempReferenceId: string | undefined;
      if (isAuthenticated && user?.id) {
        tempReferenceId = `generation_${Date.now()}`;
        const creditDeducted = await deductCredit(
          'JumpinAI Studio generation', 
          tempReferenceId
        );
        
        if (!creditDeducted) {
          toast.error('Failed to deduct credit. Please try again.');
          return;
        }
        
        // Save form data
        await saveFormData(formData);
      }

      // Record guest usage if not authenticated (BEFORE generation)
      if (!isAuthenticated) {
        await guestLimitService.recordGuestUsage();
      }

      // Generate with progressive display (pass recaptcha token)
      const result = await generateWithProgression(formData, user?.id, recaptchaToken!);
      
      // Update credit transaction with actual jump ID
      if (result.jumpId && tempReferenceId && isAuthenticated && user?.id) {
        await updateTransactionReference(tempReferenceId, result.jumpId);
      }
      
      if (result.jumpId) {
        toast.success('Jump has been generated. 1 credit used. It was saved to your Dashboard.');
      } else if (!isAuthenticated) {
        toast.success('Your Jump in AI is ready! Sign up to get 5 welcome credits and save your jumps.');
      }

      // Update guest limits - increment count and check if limit reached
      if (!isAuthenticated) {
        const newCount = guestUsageCount + 1;
        setGuestUsageCount(newCount);
        if (newCount >= 3) {
          setGuestCanUse(false);
        }
      }

    } catch (error) {
      console.error('Error generating Jump:', error);
      toast.error('Failed to generate your Jump. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>JumpinAI Studio - AI-Powered Transformation Workspace</title>
        <meta name="description" content="Your AI-powered workspace for creating and managing strategic transformations with intelligent guidance." />
      </Helmet>
      
      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background/95 via-background to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative">
        {/* Premium floating background elements with liquid glass effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs with enhanced blur and liquid animation */}
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          
          {/* Liquid glass floating elements */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
          
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent opacity-40"></div>
        </div>
        
        <Navigation />
        
        <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Auth Status and Credits Display - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 sm:mb-6 animate-fade-in-right gap-3 sm:gap-4">
              {/* Credits display for authenticated users */}
              {isAuthenticated && (
                <div className="flex-1 order-2 sm:order-1">
                  <CreditsDisplay showBuyButton={true} />
                </div>
              )}
              
              {/* Auth status notification */}
              <div className="relative group order-1 sm:order-2 w-full sm:w-auto">
                <div className="relative glass rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm border border-border backdrop-blur-xl bg-card/80 shadow-lg transition-all duration-300 w-full sm:max-w-sm">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/3 rounded-xl"></div>
                  
                  <div className="relative z-10">
                    {isAuthenticated ? (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600">
                        <div className="relative">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        </div>
                        <span className="font-medium truncate text-xs sm:text-sm">
                          {user?.display_name || user?.email}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-600">
                        <div className="relative">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        </div>
                        <span className="font-medium text-xs sm:text-sm">
                          Guest: {guestUsageCount >= 3 ? 'limit reached' : `${3 - guestUsageCount} free tries remaining`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Premium Hero Section - Mobile Optimized */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-20 animate-fade-in-up px-2">
              {/* Liquid glass backdrop for title */}
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/8 blur-3xl transform -translate-y-4"></div>
                <h1 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-2">
                  JumpinAI Studio
                </h1>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
              </div>
              
              <div className="relative px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-2xl"></div>
                <p className="relative text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground/90 mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                  Tell us your goals and challenges, and we'll generate your personalized <span className="font-semibold text-primary bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent whitespace-nowrap">Jump in AI</span>: 
                  a clear step-by-step plan with AI tools, custom prompts, and actionable strategies.
                </p>
              </div>
              
              {/* Simple feature indicators - Mobile optimized */}
              <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-muted-foreground/70 px-2">
                <span className="bg-background/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-md border border-border/30">Strategic Action Plan</span>
                <span className="hidden sm:inline text-muted-foreground/50">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-md border border-border/30">AI Tools & Resources</span>
                <span className="hidden sm:inline text-muted-foreground/50">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-md border border-border/30">Custom Prompts</span> 
                <span className="hidden sm:inline text-muted-foreground/50">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-md border border-border/30">Implementation Guide</span>
              </div>
            </div>

            {/* Compact Glass Form - Mobile Optimized */}
            <div className="mb-6 sm:mb-8 lg:mb-12 animate-fade-in-up px-2 sm:px-4 lg:px-0" style={{ animationDelay: '0.5s' }}>
              <div className="relative group">
                {/* Subtle backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/8 to-secondary/10 rounded-2xl blur-xl opacity-40"></div>
                
                {/* Compact glass container */}
                <div className="relative glass rounded-2xl p-3 sm:p-4 md:p-6 border border-border backdrop-blur-2xl bg-card/80 dark:bg-background/20 overflow-hidden">
                  {/* Minimal glass overlay */}
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
                              className="w-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px] p-3 sm:p-4 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-primary/10 resize-none placeholder:text-muted-foreground/60 text-sm sm:text-base text-foreground bg-card/60 overflow-hidden"
                              placeholder="Your main goals & projects with AI..."
                            />
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
                              className="w-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px] p-3 sm:p-4 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-primary/10 resize-none placeholder:text-muted-foreground/60 text-sm sm:text-base text-foreground bg-card/60 overflow-hidden"
                              placeholder="Your obstacles & challenges..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Glass Morphism Generate Button - Mobile Optimized */}
                      <div ref={generateButtonRef} className="text-center mt-4 sm:mt-6 md:mt-8">
                        <div className="relative inline-block group w-full sm:w-auto">
                          {/* Subtle glow backdrop */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                          
                          <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="relative w-full sm:max-w-4xl px-8 sm:px-16 md:px-24 py-3 sm:py-4 md:py-5 glass backdrop-blur-xl border border-border/40 hover:border-primary/50 focus:border-primary/60 transition-all duration-500 rounded-full shadow-xl hover:shadow-2xl hover:shadow-primary/20 bg-card/70 hover:scale-[1.02] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
                          >
                            {/* Glass morphism overlay effects */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/25 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/8 dark:via-transparent dark:to-white/8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                              {isGenerating ? (
                                <div className="flex flex-col items-center gap-1 sm:gap-2 min-h-[32px] w-full">
                                  <div className="flex items-center gap-3 sm:gap-4 w-full justify-center">
                                    <div className="relative">
                                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                                      <div className="absolute inset-0 animate-ping">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border border-primary/30 rounded-full"></div>
                                      </div>
                                    </div>
                                    <div className="text-center flex-1">
                                      <div className="font-semibold text-foreground text-sm sm:text-base md:text-lg">{processingStatus.stage}</div>
                                      <div className="text-xs sm:text-sm text-muted-foreground/80 mt-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                        <span className="text-xs sm:text-sm">{processingStatus.currentTask}</span>
                                        {generationTimer > 0 && (
                                          <span className="px-2 py-0.5 glass backdrop-blur-sm bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                                            {formatTime(generationTimer)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <span className="font-semibold text-foreground text-sm sm:text-base md:text-lg tracking-wide">Generate My Jump in AI</span>
                                </div>
                              )}
                            </div>
                          </button>
                          
                          {/* Cancel Button - only visible during processing */}
                          {isGenerating && (
                            <div className="absolute left-full ml-6 top-1/2 transform -translate-y-1/2 animate-fade-in">
                              <div className="relative group">
                                {/* Subtle backdrop for cancel button */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/5 to-muted-foreground/10 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                                
                                <button
                                  onClick={handleCancel}
                                  className="relative px-6 py-3 glass backdrop-blur-xl border border-border/30 hover:border-muted-foreground/40 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl bg-card/70 hover:scale-105 active:scale-95 group overflow-hidden"
                                >
                                  {/* Subtle glass overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/5 via-transparent to-muted-foreground/3 rounded-full"></div>
                                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/15 to-transparent"></div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-white/8 dark:from-white/6 dark:via-transparent dark:to-white/6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  <div className="relative z-10 flex items-center justify-center">
                                    <span className="font-medium text-muted-foreground group-hover:text-foreground text-sm tracking-wide transition-colors duration-300">Cancel</span>
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Compact Guest User Notification */}
                      {!isAuthenticated && (
                        <div className="mt-6 relative group animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                          {/* Subtle backdrop */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-400/15 to-amber-500/20 dark:from-amber-400/15 dark:via-orange-300/10 dark:to-amber-400/15 rounded-xl blur-lg opacity-40"></div>
                          
                          {/* Compact notification container */}
                          <div className="relative glass-dark rounded-xl p-4 border border-amber-400/25 dark:border-amber-300/20 backdrop-blur-xl bg-gradient-to-br from-amber-50/10 via-orange-50/5 to-amber-50/3 dark:from-amber-900/15 dark:via-orange-900/10 dark:to-amber-900/8 overflow-hidden">
                            {/* Minimal overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-orange-400/5 dark:from-amber-300/4 dark:via-transparent dark:to-orange-300/4 rounded-xl"></div>
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/30 dark:via-amber-300/20 to-transparent"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400/15 via-orange-400/10 to-amber-400/15 dark:from-amber-300/10 dark:via-orange-300/8 dark:to-amber-300/10 border border-amber-400/20 dark:border-amber-300/15">
                                  <LogIn className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Want to save your Jump?</h3>
                                  <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mb-3">
                                    Sign up to save your Jump and access unlimited generations.
                                  </p>
                                  <button
                                    onClick={() => login()}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white text-sm rounded-lg font-medium hover:scale-105 transition-all duration-300"
                                  >
                                    <LogIn className="w-3 h-3" />
                                    Sign Up Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progressive Results Display */}
            {result && (
              <div ref={progressDisplayRef} className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <ProgressiveJumpDisplay 
                  result={result}
                  generationTimer={generationTimer}
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

            {/* Invisible reCAPTCHA v2 */}
            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={RECAPTCHA_SITE_KEY}
            />
          </div>
        </main>


      </div>
    </>
  );
};

export default JumpinAIStudio;