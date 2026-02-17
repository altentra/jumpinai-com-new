import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import HeroDotMatrix from '@/components/HeroDotMatrix';

// Input tracking (simplified for single input)
interface InputTracking {
  inputMethod: 'typed' | 'narrated' | 'mixed';
  sttDurationSeconds: number;
}

// Silently send notification to admin about jump generation
const sendJumpGenerationNotification = async (
  formData: { goals: string },
  user: { id?: string; email?: string; user_metadata?: { name?: string; full_name?: string } } | null,
  inputTracking: InputTracking
) => {
  try {
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
    // Silently fail
  }
};

const JumpinAIStudioContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasCredits, deductCredit, creditsBalance, updateTransactionReference } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  const [generationTimer, setGenerationTimer] = useState(0);
  const [sttUsed, setSttUsed] = useState(false);
  const [studioIsDark, setStudioIsDark] = useState(false);
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
  const [visionUsedStt, setVisionUsedStt] = useState(false);
  const [visionSttDuration, setVisionSttDuration] = useState(0);
  const [visionTyped, setVisionTyped] = useState(false);
  
  const progressDisplayRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLDivElement>(null);
  const visionTextareaRef = useRef<HTMLTextAreaElement>(null);

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
  // Theme detection
  useEffect(() => {
    const check = () => setStudioIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

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

  // Auto-adjust textarea height
  useEffect(() => {
    if (visionTextareaRef.current) {
      visionTextareaRef.current.style.height = 'auto';
      visionTextareaRef.current.style.height = visionTextareaRef.current.scrollHeight + 'px';
    }
  }, [formData.goals]);

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

    if (!hasCredits()) {
      toast.error('You don\'t have enough credits. Please purchase more credits to continue.');
      return;
    }

    try {
      const inputTracking: InputTracking = {
        inputMethod: overallInputMethod,
        sttDurationSeconds: visionSttDuration,
      };

      // Send silent notification to admin (fire and forget)
      sendJumpGenerationNotification(
        { goals: formData.goals },
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
      {/* Premium Background System - Matching Guest Studio */}
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

        <div className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
          
          {/* HERO FORM CARD - Premium Glassmorphism (matches guest studio exactly) */}
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
                  
                  {/* Hero text - Premium typography (inside the card) */}
                  <div className="text-center mb-10 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground mb-4 tracking-tight leading-[1.15]">
                      What's Your Next{' '}
                      <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                        Big Move
                      </span>
                      ?
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
                        label="Tell us everything"
                        value={formData.goals}
                        onChange={(value) => setFormData(prev => ({ ...prev, goals: value }))}
                        onTyped={() => setVisionTyped(true)}
                        onSttUsed={() => {
                          setSttUsed(true);
                          setVisionUsedStt(true);
                        }}
                        onSttDuration={(seconds) => setVisionSttDuration(prev => prev + seconds)}
                        placeholder="What are you building? What do you want to achieve with AI? What challenges or obstacles are standing in your way? Tell us everything..."
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
        </div>
        </div>
      </div>
      {/* END: Premium Background Zone */}

      {/* Results section - on standard background */}
      {result && (
        <div className="bg-background">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div ref={progressDisplayRef} className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <ProgressiveJumpDisplay 
                  result={result}
                  generationTimer={generationTimer}
                  isAuthenticated={isAuthenticated}
                  onToolPromptsRefresh={refreshToolPrompts}
                  onGenerateAlternativeJump={handleGenerateAlternativeJump}
                  embedded={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Footer - only show when not embedded in dashboard */}
      <div className="mt-16" />
    </div>
  );
};

export default JumpinAIStudioContent;
