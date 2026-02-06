import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Zap } from 'lucide-react';
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

// Input tracking for goals and challenges (type vs narrate)
interface InputTracking {
  goalsInputMethod: 'typed' | 'narrated' | 'mixed';
  challengesInputMethod: 'typed' | 'narrated' | 'mixed';
  goalsSttDurationSeconds: number;
  challengesSttDurationSeconds: number;
  totalSttDurationSeconds: number;
}

// Silently send notification to admin about jump generation
const sendJumpGenerationNotification = async (
  formData: { goals: string; challenges: string },
  user: { id?: string; email?: string; user_metadata?: { name?: string; full_name?: string } } | null,
  inputTracking: InputTracking
) => {
  try {
    // Get IP and location
    let ipAddress = 'Unknown';
    let location = 'Unknown';

    try {
      const ipResponse = await supabase.functions.invoke('get-client-ip');
      if (ipResponse.data) {
        ipAddress = ipResponse.data.ip || 'Unknown';
        location = ipResponse.data.location || 'Unknown';
      }
    } catch {
      // ignore
    }

    // Send notification silently
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
    // Silently fail - don't disrupt the main flow
  }
};

const JumpinAIStudioContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasCredits, deductCredit, creditsBalance, updateTransactionReference } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  const [generationTimer, setGenerationTimer] = useState(0);
  const [sttUsed, setSttUsed] = useState(false);
  
  // Input method tracking state
  const [goalsUsedStt, setGoalsUsedStt] = useState(false);
  const [challengesUsedStt, setChallengesUsedStt] = useState(false);
  const [goalsSttDuration, setGoalsSttDuration] = useState(0);
  const [challengesSttDuration, setChallengesSttDuration] = useState(0);
  const [goalsTyped, setGoalsTyped] = useState(false);
  const [challengesTyped, setChallengesTyped] = useState(false);
  
  const progressDisplayRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLDivElement>(null);
  const goalsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const challengesTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load saved form data for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
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

  const loadSavedFormData = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Database error loading user profile:', error);
        return;
      }
      
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
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

  const handleCancel = () => {
    toast.info('Generation cancelled. You can start a new request anytime.');
    window.location.reload();
  };

  const handleGenerate = async (alternativeContext?: { title: string; description: string }) => {
    // Calculate input methods first
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

    if (!hasCredits()) {
      toast.error('You don\'t have enough credits. Please purchase more credits to continue.');
      return;
    }

    try {
      const inputTracking: InputTracking = {
        goalsInputMethod: goalsMethod,
        challengesInputMethod: challengesMethod,
        goalsSttDurationSeconds: goalsSttDuration,
        challengesSttDurationSeconds: challengesSttDuration,
        totalSttDurationSeconds: goalsSttDuration + challengesSttDuration,
      };

      // Send silent notification to admin (fire and forget)
      sendJumpGenerationNotification(
        { goals: formData.goals, challenges: formData.challenges },
        user,
        inputTracking
      );

      let tempReferenceId: string | undefined;
      if (user?.id) {
        tempReferenceId = `generation_${Date.now()}`;
        const creditDeducted = await deductCredit(
          alternativeContext 
            ? `JumpinAI Studio - Alternative Jump: ${alternativeContext.title.substring(0, 30)}`
            : 'JumpinAI Studio generation', 
          tempReferenceId
        );
        
        if (!creditDeducted) {
          toast.error('Failed to deduct credit. Please try again.');
          return;
        }
        
        await saveFormData(effectiveFormData);
      }

      if (alternativeContext) {
        toast.info(`Generating new jump: "${alternativeContext.title}"...`);
      }

      const result = await generateWithProgression(effectiveFormData, user?.id, undefined);
      
      if (result.jumpId && tempReferenceId && user?.id) {
        await updateTransactionReference(tempReferenceId, result.jumpId);
      }
      
      if (result.jumpId && sttUsed) {
        await markJumpAsUsingSTT(result.jumpId);
        setSttUsed(false);
      }
      
      if (result.jumpId) {
        toast.success(alternativeContext 
          ? `Alternative Jump "${alternativeContext.title.substring(0, 25)}..." generated! 1 credit used.`
          : 'Jump has been generated. 1 credit used. It was saved to your Dashboard.');
      }

    } catch (error: any) {
      console.error('Error generating Jump:', error);
      toast.error('Failed to generate your Jump. Please try again.');
    }
  };

  const handleGenerateAlternativeJump = (alternative: AlternativeRoute, explorationHistory?: RouteExplorationHistory) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (explorationHistory) {
      console.log('🌳 Exploration History:', {
        level: explorationHistory.currentLevel,
        path: explorationHistory.explorationPath.map(n => n.jumpTitle)
      });
    }
    handleGenerate(alternative);
  };

  return (
    <div className="relative min-h-screen isolate">
      {/* Premium Background System - scoped to studio content (must NOT overlay the dashboard sidebar) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-background to-muted/40 dark:from-background dark:via-background dark:to-muted/30" />

        {/* Subtle noise texture for premium feel */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Premium ambient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-15%] right-[5%] w-[700px] h-[700px] bg-primary/[0.12] dark:bg-primary/[0.08] rounded-full blur-[150px] animate-pulse"
            style={{ animationDuration: '10s' }}
          />
          <div
            className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/[0.08] dark:bg-accent/[0.05] rounded-full blur-[130px] animate-pulse"
            style={{ animationDuration: '12s', animationDelay: '3s' }}
          />
          <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] bg-secondary/[0.06] rounded-full blur-[100px]" />
        </div>

        {/* Refined grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(hsl(var(--foreground)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.015)_1px,transparent_1px)]" />
      </div>

      <div className="relative pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* HERO FORM CARD - Premium Glassmorphism (matches guest studio exactly) */}
          <div className="mb-10 sm:mb-14 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
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
                  
                  {/* Hero text - Premium typography (inside the card) */}
                  <div className="text-center mb-10 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 tracking-tight leading-[1.15]">
                      Create Your{' '}
                      <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                        Jump in AI
                      </span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium">
                      Share your vision and challenges — we'll craft your personalized AI implementation roadmap.
                    </p>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-8 sm:space-y-10">
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
                      {/* Goals Input */}
                      <StudioTextarea
                        ref={goalsTextareaRef}
                        label="What are you building?"
                        value={formData.goals}
                        onChange={(value) => setFormData(prev => ({ ...prev, goals: value }))}
                        onTyped={() => setGoalsTyped(true)}
                        onSttUsed={() => {
                          setSttUsed(true);
                          setGoalsUsedStt(true);
                        }}
                        onSttDuration={(seconds) => setGoalsSttDuration(prev => prev + seconds)}
                        placeholder="Describe your goals, project, or what you want to achieve with AI..."
                      />
                      
                      {/* Challenges Input */}
                      <StudioTextarea
                        ref={challengesTextareaRef}
                        label="What's in your way?"
                        value={formData.challenges}
                        onChange={(value) => setFormData(prev => ({ ...prev, challenges: value }))}
                        onTyped={() => setChallengesTyped(true)}
                        onSttUsed={() => {
                          setSttUsed(true);
                          setChallengesUsedStt(true);
                        }}
                        onSttDuration={(seconds) => setChallengesSttDuration(prev => prev + seconds)}
                        placeholder="What obstacles, challenges, or frustrations are you facing..."
                      />
                    </div>

                    {/* Generate Button - Dark glassmorphic style (matches guest studio exactly) */}
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
                        
                        {/* Trust badges - Premium minimal (matches guest studio) */}
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

          {/* Progressive Results Display */}
          {result && (
            <div ref={progressDisplayRef} className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <ProgressiveJumpDisplay 
                result={result}
                generationTimer={generationTimer}
                isAuthenticated={isAuthenticated}
                onToolPromptsRefresh={refreshToolPrompts}
                onGenerateAlternativeJump={handleGenerateAlternativeJump}
                embedded={true}
              />
            </div>
          )}

          {/* Mini Footer - only show when not embedded in dashboard */}
          <div className="mt-16" />
        </div>
      </div>
    </div>
  );
};

export default JumpinAIStudioContent;
