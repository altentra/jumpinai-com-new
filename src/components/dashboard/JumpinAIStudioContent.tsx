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
      {/* Premium Ambient Background with enhanced depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient layer for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30"></div>
        
        {/* Primary ambient orb - top right with stronger presence */}
        <div className="absolute -top-20 -right-20 w-[32rem] h-[32rem] rounded-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-[80px] animate-pulse" style={{animationDuration: '6s'}}></div>
        </div>
        
        {/* Secondary ambient orb - bottom left */}
        <div className="absolute -bottom-32 -left-32 w-[36rem] h-[36rem] rounded-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-secondary/10 to-transparent blur-[100px] animate-pulse" style={{animationDuration: '8s', animationDelay: '2s'}}></div>
        </div>
        
        {/* Center glow for focus */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] rounded-full">
          <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent blur-[120px]"></div>
        </div>
        
        {/* Refined dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[length:32px_32px] dark:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--foreground)/0.02)_1px,transparent_1px)]"></div>
      </div>
      
      <div className="relative pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Premium Hero Section with enhanced typography */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in-up">
            {/* Badge/chip above title */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">AI Adaptation Studio</span>
            </div>
            
            {/* Main Title with premium styling */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                JumpinAI Studio
              </span>
            </h1>
            
            {/* Refined subtitle with better hierarchy */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Generate your personalized <span className="font-medium text-foreground/90">Jump in AI</span> in 2 minutes—strategic insights, actionable steps, and tailored tools.
            </p>
          </div>

          {/* Premium Form Card with elevated design */}
          <div className="mb-10 sm:mb-14 lg:mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative group">
              {/* Premium shadow layer */}
              <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 via-border/30 to-border/10 rounded-3xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              
              {/* Outer glow ring */}
              <div className="absolute -inset-px bg-gradient-to-b from-border/80 via-border/40 to-border/60 rounded-2xl sm:rounded-3xl"></div>
              
              {/* Main card with premium glass effect */}
              <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 bg-card dark:bg-card/80 backdrop-blur-xl border-0 overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20">
                {/* Premium inner glow at top */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none"></div>
                
                {/* Highlight line at top */}
                <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                
                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/20 rounded-tl-lg pointer-events-none"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/20 rounded-tr-lg pointer-events-none"></div>
                
                <div className="relative z-10 space-y-8 sm:space-y-10">
                  {/* Section header with refined styling */}
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                      Tell us about your goals
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">We'll create a personalized implementation roadmap</p>
                  </div>

                  {/* Premium input fields grid */}
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Goals Input - Premium styling */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">1</span>
                        What are you working toward?
                      </label>
                      <div className="relative group/input">
                        {/* Input glow on focus */}
                        <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-primary/5 rounded-xl sm:rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        
                        <textarea
                          ref={goalsTextareaRef}
                          value={formData.goals}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, goals: e.target.value }));
                            setGoalsTyped(true);
                          }}
                          className="relative w-full min-h-[150px] sm:min-h-[180px] p-4 sm:p-5 pb-14 rounded-xl sm:rounded-2xl border-2 border-border/60 bg-background/80 dark:bg-background/60 text-foreground placeholder:text-muted-foreground/40 resize-none transition-all duration-300 focus:outline-none focus:border-primary/50 focus:bg-background hover:border-border shadow-inner shadow-black/[0.02] dark:shadow-black/[0.08]"
                          style={{ fontSize: '16px' }}
                          placeholder="Describe your main goals, projects, or what you want to achieve..."
                        />
                        <div className="absolute bottom-4 right-4 opacity-60 group-hover/input:opacity-100 transition-opacity">
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
                    
                    {/* Challenges Input - Premium styling */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">2</span>
                        What's keeping you from getting there?
                      </label>
                      <div className="relative group/input">
                        {/* Input glow on focus */}
                        <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-primary/5 rounded-xl sm:rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 blur-sm"></div>
                        
                        <textarea
                          ref={challengesTextareaRef}
                          value={formData.challenges}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, challenges: e.target.value }));
                            setChallengesTyped(true);
                          }}
                          className="relative w-full min-h-[150px] sm:min-h-[180px] p-4 sm:p-5 pb-14 rounded-xl sm:rounded-2xl border-2 border-border/60 bg-background/80 dark:bg-background/60 text-foreground placeholder:text-muted-foreground/40 resize-none transition-all duration-300 focus:outline-none focus:border-primary/50 focus:bg-background hover:border-border shadow-inner shadow-black/[0.02] dark:shadow-black/[0.08]"
                          style={{ fontSize: '16px' }}
                          placeholder="Describe your obstacles, challenges, or what's holding you back..."
                        />
                        <div className="absolute bottom-4 right-4 opacity-60 group-hover/input:opacity-100 transition-opacity">
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

                  {/* Premium Generate Button */}
                  <div ref={generateButtonRef} className="pt-4">
                    <div className="relative w-full max-w-xl mx-auto">
                      {/* Button glow effect */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
                      
                      <button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating}
                        className="relative w-full px-8 sm:px-12 py-5 sm:py-6 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none group/btn overflow-hidden"
                      >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                        
                        {/* Top highlight */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          {isGenerating ? (
                            <div className="flex items-center gap-4 w-full justify-center">
                              <div className="relative">
                                <Loader2 className="w-5 h-5 animate-spin" />
                              </div>
                              <div className="text-center flex-1">
                                <div className="font-semibold text-sm sm:text-base">{processingStatus.stage}</div>
                                <div className="text-xs sm:text-sm opacity-80 mt-1 flex items-center justify-center gap-2">
                                  <span>{processingStatus.currentTask}</span>
                                  {generationTimer > 0 && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                                      {formatTime(generationTimer)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              <span className="text-base sm:text-lg font-semibold tracking-wide">
                                Generate My Jump
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                      
                      {/* Cancel Button */}
                      {isGenerating && (
                        <button
                          onClick={handleCancel}
                          className="mt-4 w-full sm:w-auto sm:absolute sm:left-full sm:ml-6 sm:top-1/2 sm:-translate-y-1/2 sm:mt-0 px-6 py-3 rounded-xl border border-border hover:border-border/80 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground text-sm font-medium transition-all duration-200 shadow-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    
                    {/* Trust indicators */}
                    <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        2-minute generation
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Personalized roadmap
                      </span>
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
