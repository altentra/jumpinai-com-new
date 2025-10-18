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

const JumpinAIStudio = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { hasCredits, deductCredit, creditsBalance } = useCredits();
  const { isGenerating, result, processingStatus, generateWithProgression } = useProgressiveGeneration();
  const [guestCanUse, setGuestCanUse] = useState(true);
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const [generationTimer, setGenerationTimer] = useState(0);
  const progressDisplayRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (result && !isGenerating && progressDisplayRef.current) {
      console.log('Auto-scroll triggered - result exists and generation complete');
      setTimeout(() => {
        if (progressDisplayRef.current) {
          console.log('Scrolling to jump display...');
          progressDisplayRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500); // Increased delay to ensure content is rendered
    }
  }, [result, isGenerating]);

  // Alternative scroll trigger when result first appears
  useEffect(() => {
    if (result && progressDisplayRef.current) {
      console.log('Alternative scroll trigger - result appeared');
      setTimeout(() => {
        if (progressDisplayRef.current) {
          console.log('Alternative scroll executing...');
          progressDisplayRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 800);
    }
  }, [result]);

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
    // Validate required fields
    if (!formData.goals.trim() || !formData.challenges.trim()) {
      toast.error('Please fill in your goals and challenges');
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
      // Guest users: Strict 1-try limit
      if (!guestCanUse) {
        toast.error('You\'ve used your free try. Please sign up and get 5 welcome credits to continue!');
        return;
      }
    }

    try {
      // Deduct credit for authenticated users BEFORE generation
      if (isAuthenticated && user?.id) {
        const creditDeducted = await deductCredit(
          'JumpinAI Studio generation', 
          `generation_${Date.now()}`
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

      // Generate with progressive display
      const result = await generateWithProgression(formData, user?.id);
      
      if (result.jumpId) {
        toast.success('Your Jump in AI has been saved to your dashboard! 1 credit used.');
      } else if (!isAuthenticated) {
        toast.success('Your Jump in AI is ready! Sign up to get 5 welcome credits and save your jumps.');
      }

      // Update guest limits
      if (!isAuthenticated) {
        setGuestCanUse(false);
        setGuestUsageCount(1);
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
      
      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60 relative overflow-hidden">
        {/* Premium floating background elements with liquid glass effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs with enhanced blur and liquid animation */}
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 dark:bg-gradient-to-br dark:from-primary/20 dark:via-primary/10 dark:to-transparent rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 dark:bg-gradient-to-tr dark:from-secondary/15 dark:via-accent/8 dark:to-transparent rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          
          {/* Liquid glass floating elements */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gradient-conic from-primary/15 via-accent/10 to-secondary/15 dark:from-primary/12 dark:via-accent/8 dark:to-secondary/12 rounded-full blur-2xl animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-accent/20 via-primary/10 to-transparent dark:from-accent/15 dark:via-primary/8 dark:to-transparent rounded-full blur-xl animate-pulse opacity-30" style={{animationDelay: '3s'}}></div>
          
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent dark:via-primary/3 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent dark:via-accent/2 opacity-40"></div>
        </div>
        
        <Navigation />
        
        <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Auth Status and Credits Display - Integrated into page layout */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 animate-fade-in-right gap-4">
              {/* Credits display for authenticated users */}
              {isAuthenticated && (
                <div className="flex-1">
                  <CreditsDisplay showBuyButton={true} />
                </div>
              )}
              
              {/* Auth status notification */}
              <div className="relative group">
                <div className="relative glass-dark rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm border border-white/20 dark:border-white/15 backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-white/2 dark:from-black/15 dark:via-black/8 dark:to-black/5 shadow-lg transition-all duration-300 max-w-sm">
                  {/* Subtle glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/3 dark:from-primary/4 dark:via-transparent dark:to-accent/2 rounded-xl"></div>
                  
                  <div className="relative z-10">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <div className="relative">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        </div>
                        <span className="font-medium truncate text-xs sm:text-sm">
                          {user?.display_name || user?.email}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <div className="relative">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        </div>
                        <span className="font-medium text-xs sm:text-sm">
                          Guest: {guestCanUse ? '1 free try remaining' : 'limit reached'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Premium Hero Section with enhanced gradients */}
            <div className="text-center mb-12 sm:mb-20 animate-fade-in-up">
              {/* Liquid glass backdrop for title */}
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent dark:via-primary/8 blur-3xl transform -translate-y-4"></div>
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent leading-tight tracking-tight px-4 sm:px-0">
                  JumpinAI Studio
                </h1>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full"></div>
              </div>
              
              <div className="relative px-4 sm:px-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-2xl"></div>
                <p className="relative text-base sm:text-lg md:text-xl text-muted-foreground/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                  Tell us your goals and challenges, and we'll generate your personalized <span className="font-semibold text-primary bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent whitespace-nowrap">Jump in AI</span>: 
                  a clear step-by-step plan, essential resources, custom prompts, workflows, blueprints, and strategies.
                </p>
              </div>
              
              {/* Simple feature indicators - Mobile optimized */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground/70 px-4">
                <span className="bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:rounded-none sm:border-none">Strategic Action Plan</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:rounded-none sm:border-none">List of AI tools</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:rounded-none sm:border-none">4 Custom Prompts</span> 
                <span className="hidden sm:inline">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:rounded-none sm:border-none">4 Workflows</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:rounded-none sm:border-none">4 Blueprints</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:rounded-none sm:border-none">4 Strategies</span>
              </div>
            </div>

            {/* Compact Glass Form */}
            <div className="mb-8 sm:mb-12 animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.5s' }}>
              <div className="relative group">
                {/* Subtle backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-accent/8 to-secondary/10 dark:from-primary/8 dark:via-accent/6 dark:to-secondary/8 rounded-2xl blur-xl opacity-40"></div>
                
                {/* Compact glass container */}
                <div className="relative glass-dark rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-white/15 backdrop-blur-2xl bg-gradient-to-br from-white/8 via-white/4 to-white/2 dark:from-black/20 dark:via-black/10 dark:to-black/5 overflow-hidden">
                  {/* Minimal glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 dark:from-primary/3 dark:via-transparent dark:to-secondary/3 rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h2 className="text-lg sm:text-xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-transparent">Let's understand your goals</h2>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto rounded-full"></div>
                    </div>

                    <div className="grid gap-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="group">
                          <label className="block text-sm font-medium text-foreground/90 mb-3 transition-colors duration-300 group-focus-within:text-primary">
                            What are you after? *
                          </label>
                          <div className="relative">
                            <textarea
                              value={formData.goals}
                              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                              className="w-full h-32 p-4 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-primary/10 resize-none placeholder:text-muted-foreground/60 text-foreground bg-gradient-to-br from-background/60 to-background/40 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40"
                              placeholder="Your main goals & projects with AI..."
                            />
                          </div>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-medium text-foreground/90 mb-3 transition-colors duration-300 group-focus-within:text-primary">
                            What prevents you? *
                          </label>
                          <div className="relative">
                            <textarea
                              value={formData.challenges}
                              onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                              className="w-full h-32 p-4 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-primary/10 resize-none placeholder:text-muted-foreground/60 text-foreground bg-gradient-to-br from-background/60 to-background/40 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40"
                              placeholder="Your obstacles & challenges..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="group">
                          <label className="block text-sm font-medium text-foreground/90 mb-3 transition-colors duration-300 group-focus-within:text-primary">
                            Industry
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.industry}
                              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                              className="w-full p-3 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl focus:shadow-2xl focus:shadow-primary/10 placeholder:text-muted-foreground/60 text-foreground bg-gradient-to-br from-background/60 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/70 dark:to-gray-900/40"
                              placeholder="Marketing, Tech, Finance..."
                            />
                          </div>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-medium text-foreground/90 mb-3 transition-colors duration-300 group-focus-within:text-primary">
                            AI Experience
                          </label>
                          <div className="relative">
                            <select 
                              value={formData.aiKnowledge}
                              onChange={(e) => setFormData(prev => ({ ...prev, aiKnowledge: e.target.value }))}
                              className="w-full p-3 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl focus:shadow-2xl focus:shadow-primary/10 text-foreground bg-gradient-to-br from-background/60 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/70 dark:to-gray-900/40"
                            >
                              <option value="">Select level</option>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="group">
                          <label className="block text-sm font-medium text-foreground/90 mb-3 transition-colors duration-300 group-focus-within:text-primary">
                            Urgency
                          </label>
                          <div className="relative">
                            <select 
                              value={formData.timeCommitment}
                              onChange={(e) => setFormData(prev => ({ ...prev, timeCommitment: e.target.value }))}
                              className="w-full p-3 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl focus:shadow-2xl focus:shadow-primary/10 text-foreground bg-gradient-to-br from-background/60 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/70 dark:to-gray-900/40"
                            >
                              <option value="">Select urgency</option>
                              <option value="asap">ASAP - Need immediate results</option>
                              <option value="weeks">Within few weeks</option>
                              <option value="months">Within few months</option>
                              <option value="exploring">Just exploring</option>
                            </select>
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-sm font-medium text-foreground/90 mb-3 transition-colors duration-300 group-focus-within:text-primary">
                            Budget
                          </label>
                          <div className="relative">
                            <select 
                              value={formData.budget}
                              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                              className="w-full p-3 glass backdrop-blur-xl border border-border/40 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl focus:shadow-2xl focus:shadow-primary/10 text-foreground bg-gradient-to-br from-background/60 to-background/30 dark:bg-gradient-to-br dark:from-gray-950/70 dark:to-gray-900/40"
                            >
                              <option value="">Select budget</option>
                              <option value="minimal">Minimal ($0-500)</option>
                              <option value="moderate">Moderate ($500-2K)</option>
                              <option value="substantial">Substantial ($2K-10K)</option>
                              <option value="enterprise">Enterprise ($10K+)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Glass Morphism Generate Button - Mobile Optimized */}
                      <div ref={generateButtonRef} className="text-center mt-6 sm:mt-8">
                        <div className="relative inline-block group w-full sm:w-auto">
                          {/* Subtle glow backdrop */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 dark:from-primary/15 dark:via-accent/12 dark:to-secondary/15 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                          
                          <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (!isAuthenticated && !guestCanUse)}
                            className="relative w-full sm:max-w-4xl px-12 sm:px-24 py-4 sm:py-5 glass backdrop-blur-xl border border-border/40 hover:border-primary/50 focus:border-primary/60 transition-all duration-500 rounded-full shadow-xl hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br from-background/60 to-background/40 dark:bg-gradient-to-br dark:from-gray-950/60 dark:to-gray-900/40 hover:scale-[1.02] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
                          >
                            {/* Glass morphism overlay effects */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 dark:from-primary/6 dark:via-transparent dark:to-secondary/6 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/25 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/8 dark:via-transparent dark:to-white/8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                              {isGenerating ? (
                                <div className="flex flex-col items-center gap-2 min-h-[32px] w-full">
                                  <div className="flex items-center gap-4 w-full justify-center">
                                    <div className="relative">
                                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                                      <div className="absolute inset-0 animate-ping">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border border-primary/30 rounded-full"></div>
                                      </div>
                                    </div>
                                    <div className="text-center flex-1">
                                      <div className="font-semibold text-foreground text-base sm:text-lg">{processingStatus.stage}</div>
                                      <div className="text-xs sm:text-sm text-muted-foreground/80 mt-1 flex flex-col sm:flex-row items-center gap-2">
                                        <span>{processingStatus.currentTask}</span>
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
                                  <span className="font-semibold text-foreground text-base sm:text-lg tracking-wide">Generate My Jump in AI</span>
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
                                  className="relative px-6 py-3 glass backdrop-blur-xl border border-border/30 hover:border-muted-foreground/40 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-br from-background/70 to-background/50 dark:bg-gradient-to-br dark:from-gray-950/70 dark:to-gray-900/50 hover:scale-105 active:scale-95 group overflow-hidden"
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
          </div>
        </main>
      </div>
    </>
  );
};

export default JumpinAIStudio;