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

const JumpinAIStudioContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasCredits, deductCredit, creditsBalance, updateTransactionReference } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  const [generationTimer, setGenerationTimer] = useState(0);
  const [sttUsed, setSttUsed] = useState(false);
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

    if (!hasCredits()) {
      toast.error('You don\'t have enough credits. Please purchase more credits to continue.');
      return;
    }

    try {
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
    <div className="relative">
      {/* Premium floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent opacity-40"></div>
      </div>
      
      <div className="relative pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Premium Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-20 animate-fade-in-up px-2">
            <div className="relative mb-4 sm:mb-6 lg:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/8 blur-3xl transform -translate-y-4"></div>
              <h1 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-2">
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
                        
                        {/* Cancel Button */}
                        {isGenerating && (
                          <div className="absolute left-full ml-6 top-1/2 transform -translate-y-1/2 animate-fade-in hidden sm:block">
                            <button
                              onClick={handleCancel}
                              className="relative px-6 py-3 glass backdrop-blur-xl border border-border/30 hover:border-muted-foreground/40 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl bg-card/70 hover:scale-105 active:scale-95"
                            >
                              <span className="font-medium text-muted-foreground hover:text-foreground text-sm tracking-wide transition-colors duration-300">Cancel</span>
                            </button>
                          </div>
                        )}
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

          {/* Mini Footer */}
          <div className="mt-16 py-2 text-center border-t border-border/20">
            <div className="text-sm text-muted-foreground/60">
              © 2025 JumpinAI, LLC. All rights reserved.{' '}
              <a href="/terms-of-use" className="text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4">
                Terms of Use
              </a>
              {' '}and{' '}
              <a href="/privacy-policy" className="text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4">
                Privacy Policy
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JumpinAIStudioContent;
