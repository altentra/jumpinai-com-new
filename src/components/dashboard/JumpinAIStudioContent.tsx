import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, LogIn, Zap } from 'lucide-react';
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
    <div className="relative min-h-screen">
      {/* Refined Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary ambient glow - top right */}
        <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full blur-[100px] opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/15 to-transparent animate-pulse" style={{animationDuration: '4s'}}></div>
        </div>
        
        {/* Secondary ambient glow - bottom left */}
        <div className="absolute -bottom-48 -left-48 w-[40rem] h-[40rem] rounded-full blur-[120px] opacity-35">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/25 via-accent/15 to-transparent animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
        </div>
        
        {/* Centered soft glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] rounded-full blur-[140px] opacity-20">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-accent/10 to-transparent"></div>
        </div>
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:24px_24px] opacity-50 dark:opacity-30"></div>
      </div>
      
      <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Refined Hero Section */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-14 animate-fade-in-up">
            {/* Main Title with elegant underline */}
            <div className="relative inline-block mb-5 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                JumpinAI Studio
              </h1>
              {/* Elegant gradient underline */}
              <div className="mt-3 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full"></div>
            </div>
            
            {/* Refined subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Generate your personalized <span className="font-medium text-foreground">Jump in AI</span> in 2 minutes—a clear, structured implementation plan with strategic insights, actionable steps, tailored prompts, and the tools that fit your goals.
            </p>
          </div>

          {/* Refined Form Card */}
          <div className="mb-8 sm:mb-10 lg:mb-14 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="relative">
              {/* Subtle outer glow */}
              <div className="absolute -inset-px bg-gradient-to-b from-border/50 via-border/30 to-border/50 rounded-2xl sm:rounded-3xl opacity-60"></div>
              
              {/* Main card container */}
              <div className="relative glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-border/60 bg-card/70 dark:bg-card/40 backdrop-blur-2xl overflow-hidden shadow-lg">
                {/* Inner top highlight */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                
                {/* Subtle inner gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] rounded-2xl sm:rounded-3xl pointer-events-none"></div>
                
                <div className="relative z-10 space-y-6 sm:space-y-8">
                  {/* Section header */}
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-1">
                      Let's understand your goals
                    </h2>
                    <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto rounded-full"></div>
                  </div>

                  {/* Input fields grid */}
                  <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
                    {/* Goals Input */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-medium text-foreground/80">
                        What are you working toward? <span className="text-muted-foreground">*</span>
                      </label>
                      <div className="relative group/input">
                        <textarea
                          ref={goalsTextareaRef}
                          value={formData.goals}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, goals: e.target.value }));
                            setGoalsTyped(true);
                          }}
                          className="w-full min-h-[140px] sm:min-h-[160px] p-4 pb-14 rounded-xl sm:rounded-2xl border border-border/50 bg-background/60 dark:bg-background/40 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 resize-none transition-all duration-200 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 hover:border-border/80"
                          style={{ fontSize: '16px' }}
                          placeholder="Describe your main goals, projects, or what you want to achieve..."
                        />
                        <div className="absolute bottom-3 right-3 opacity-70 group-hover/input:opacity-100 transition-opacity">
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
                    
                    {/* Challenges Input */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-medium text-foreground/80">
                        What's keeping you from getting there? <span className="text-muted-foreground">*</span>
                      </label>
                      <div className="relative group/input">
                        <textarea
                          ref={challengesTextareaRef}
                          value={formData.challenges}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, challenges: e.target.value }));
                            setChallengesTyped(true);
                          }}
                          className="w-full min-h-[140px] sm:min-h-[160px] p-4 pb-14 rounded-xl sm:rounded-2xl border border-border/50 bg-background/60 dark:bg-background/40 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 resize-none transition-all duration-200 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 hover:border-border/80"
                          style={{ fontSize: '16px' }}
                          placeholder="Describe your obstacles, challenges, or what's holding you back..."
                        />
                        <div className="absolute bottom-3 right-3 opacity-70 group-hover/input:opacity-100 transition-opacity">
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

                  {/* Generate Button - Refined */}
                  <div ref={generateButtonRef} className="pt-2">
                    <div className="relative w-full max-w-2xl mx-auto">
                      {/* Subtle glow behind button */}
                      <div className="absolute inset-0 -m-2 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating}
                        className="relative w-full px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15 text-foreground font-medium transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/5 disabled:hover:border-primary/30 disabled:hover:shadow-none group overflow-hidden"
                      >
                        {/* Inner highlight */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                        
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          {isGenerating ? (
                            <div className="flex items-center gap-4 w-full justify-center">
                              <div className="relative">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                              <div className="text-center flex-1">
                                <div className="font-semibold text-foreground text-sm sm:text-base">{processingStatus.stage}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2">
                                  <span>{processingStatus.currentTask}</span>
                                  {generationTimer > 0 && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                      {formatTime(generationTimer)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm sm:text-base lg:text-lg font-semibold tracking-wide">
                              Generate My Jump in AI
                            </span>
                          )}
                        </div>
                      </button>
                      
                      {/* Cancel Button - inline on mobile */}
                      {isGenerating && (
                        <button
                          onClick={handleCancel}
                          className="mt-3 w-full sm:w-auto sm:absolute sm:left-full sm:ml-4 sm:top-1/2 sm:-translate-y-1/2 sm:mt-0 px-5 py-2.5 rounded-xl border border-border/50 hover:border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                      )}
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
