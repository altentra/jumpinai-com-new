import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench, AlertTriangle, Lightbulb, Target, Compass, TrendingUp, Shield, DollarSign, Heart, MapPin, Calendar, Play, Flag, Sparkles, ArrowRight, Route, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { ToolPromptComboCard } from '@/components/dashboard/ToolPromptComboCard';
import JumpPlanDisplay from '@/components/dashboard/JumpPlanDisplay';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { RouteExplorationBreadcrumb } from '@/components/RouteExplorationBreadcrumb';
import type { 
  AlternativeRoute, 
  RouteExplorationHistory, 
  JumpHierarchyNode 
} from '@/types/alternativeRoutes';
import { createExplorationHistory, addExplorationLevel } from '@/types/alternativeRoutes';

interface ProgressiveJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
  isAuthenticated?: boolean;
  onToolPromptsRefresh?: () => Promise<any[]>;
  onGenerateAlternativeJump?: (alternative: AlternativeRoute, explorationHistory?: RouteExplorationHistory) => void;
  embedded?: boolean; // When true, adjusts sticky offset for dashboard embedding
}

const ProgressiveJumpDisplay: React.FC<ProgressiveJumpDisplayProps> = ({ 
  result, 
  generationTimer,
  isAuthenticated = false,
  onToolPromptsRefresh,
  onGenerateAlternativeJump,
  embedded = false
}) => {
  const navigate = useNavigate();
  const { hasCredits, deductCredit, creditsBalance } = useCredits();
  const { isAuthenticated: authCheck } = useAuth();
  const [copiedPrompts, setCopiedPrompts] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [toolPrompts, setToolPrompts] = React.useState<any[]>(result.components?.toolPrompts || []);
  const [isHeaderHidden, setIsHeaderHidden] = React.useState(false);
  const skipScrollToTopRef = React.useRef(false);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const overviewContentRef = React.useRef<HTMLDivElement>(null);
  const planContentRef = React.useRef<HTMLDivElement>(null);
  const toolPromptsContentRef = React.useRef<HTMLDivElement>(null);
  
  // Alternative jumps state
  const [alternativeJumps, setAlternativeJumps] = React.useState<AlternativeRoute[]>([]);
  const [isGeneratingAlternatives, setIsGeneratingAlternatives] = React.useState(false);
  const [showAlternatives, setShowAlternatives] = React.useState(false);
  const [generatingJumpIndex, setGeneratingJumpIndex] = React.useState<number | null>(null);
  const [selectedAlternative, setSelectedAlternative] = React.useState<AlternativeRoute | null>(null);
  const [alternativesCollapsed, setAlternativesCollapsed] = React.useState(false);
  const [generatedJumpIndex, setGeneratedJumpIndex] = React.useState<number | null>(null);
  const [jumpGenerationComplete, setJumpGenerationComplete] = React.useState(false);
  
  // Route exploration history - tracks the full tree of alternative explorations
  const [explorationHistory, setExplorationHistory] = React.useState<RouteExplorationHistory | null>(null);
  const explorationHistoryRef = React.useRef<RouteExplorationHistory | null>(null);

  // Track previous jumpId to detect when a NEW jump is generated
  const previousJumpIdRef = React.useRef<string | undefined>(undefined);
  
  // Update exploration history when a new jump is fully generated (from alternative route)
  React.useEffect(() => {
    if (result.processing_status?.isComplete && generatingJumpIndex !== null) {
      // The alternative jump generation is complete
      setGeneratingJumpIndex(null);
      setJumpGenerationComplete(true);
      
      // Update the exploration history with the new jump's ID and title
      if (explorationHistoryRef.current && result.jumpId) {
        const updatedPath = [...explorationHistoryRef.current.explorationPath];
        const lastNode = updatedPath[updatedPath.length - 1];
        if (lastNode) {
          lastNode.jumpId = result.jumpId;
          lastNode.jumpTitle = result.title || lastNode.jumpTitle;
        }
        const updatedHistory = {
          ...explorationHistoryRef.current,
          explorationPath: updatedPath,
        };
        explorationHistoryRef.current = updatedHistory;
        setExplorationHistory(updatedHistory);
      }
      
      // After a brief delay, reset ONLY the alternatives UI for the NEW jump
      // to show its own "Explore Alternative Routes" button
      // BUT PRESERVE the exploration history!
      setTimeout(() => {
        setShowAlternatives(false);
        setAlternativeJumps([]);
        setSelectedAlternative(null);
        setAlternativesCollapsed(false);
        // Keep generatedJumpIndex to show "Jump Generated" state briefly
        // Keep explorationHistory - this is the key change!
      }, 100);
    }
  }, [result.processing_status?.isComplete, generatingJumpIndex, result.jumpId, result.title]);

  // Handle when a completely new jump starts generating (not from alternative route)
  React.useEffect(() => {
    // Detect when jumpId changes to a NEW jump
    if (result.jumpId && result.jumpId !== previousJumpIdRef.current) {
      const previousJumpId = previousJumpIdRef.current;
      previousJumpIdRef.current = result.jumpId;
      
      // If we're starting fresh (generation in progress)
      if (!result.processing_status?.isComplete) {
        setShowAlternatives(false);
        setAlternativeJumps([]);
        setSelectedAlternative(null);
        setAlternativesCollapsed(false);
        setGeneratedJumpIndex(null);
        setGeneratingJumpIndex(null);
        setJumpGenerationComplete(false);
        
        // If there's no previous jump (first generation) or it's an alternative jump
        // don't reset the exploration history - it was already updated
        // Only reset if this is a completely fresh generation (not from alternative)
        if (!previousJumpId && !explorationHistoryRef.current) {
          // This is the first jump - will initialize history when exploring alternatives
        }
      }
    }
  }, [result.jumpId, result.processing_status?.isComplete]);

  // Update tool prompts when they change
  React.useEffect(() => {
    if (result.components?.toolPrompts) {
      setToolPrompts(result.components.toolPrompts);
    }
  }, [result.components?.toolPrompts]);

  // Listen to header visibility changes for perfect sync
  React.useEffect(() => {
    const handleHeaderVisibilityChange = (event: CustomEvent) => {
      if (window.innerWidth < 768) {
        setIsHeaderHidden(!event.detail.visible);
      } else {
        setIsHeaderHidden(false);
      }
    };

    window.addEventListener('headerVisibilityChange', handleHeaderVisibilityChange as EventListener);
    
    // Also handle resize to reset state on desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsHeaderHidden(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('headerVisibilityChange', handleHeaderVisibilityChange as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToolPromptGenerated = async () => {
    if (!result.jumpId || !onToolPromptsRefresh) return;
    
    setIsRefreshing(true);
    try {
      // Fetch updated tool prompts from database
      const updatedToolPrompts = await onToolPromptsRefresh();
      if (updatedToolPrompts) {
        setToolPrompts(updatedToolPrompts);
        toast.success('Tools & Prompts refreshed!');
      }
    } catch (error) {
      console.error('Error refreshing tool prompts:', error);
      toast.error('Failed to refresh Tools & Prompts');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Explore alternative routes
  const handleGenerateAlternatives = async () => {
    if (!result.comprehensive_plan?.jumpForward || !result.formGoals) {
      toast.error('Cannot explore alternatives: missing required data');
      return;
    }

    setIsGeneratingAlternatives(true);
    // Reset previous state when generating new alternatives
    setGeneratedJumpIndex(null);
    setSelectedAlternative(null);
    setAlternativesCollapsed(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('explore-alternative-routes', {
        body: {
          jumpForward: result.comprehensive_plan.jumpForward,
          formGoals: result.formGoals,
          formChallenges: result.formChallenges || '',
          jumpTitle: result.title
        }
      });

      if (error) throw error;

      if (data?.alternatives && Array.isArray(data.alternatives)) {
        setAlternativeJumps(data.alternatives);
        setShowAlternatives(true);
        toast.success('Alternative routes discovered!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error exploring alternatives:', error);
      toast.error('Failed to explore alternatives. Please try again.');
    } finally {
      setIsGeneratingAlternatives(false);
    }
  };

  // Handle generating a new jump from an alternative with credit check
  const handleGenerateThisJump = async (alternative: AlternativeRoute, index: number) => {
    if (!onGenerateAlternativeJump) {
      toast.error('Generation not available in this context');
      return;
    }

    // Prepare the updated exploration history
    const prepareHistoryUpdate = () => {
      // Get current history or create new one
      let currentHistory = explorationHistoryRef.current;
      
      if (!currentHistory) {
        // Create initial history from current jump
        currentHistory = createExplorationHistory(
          result.jumpId,
          result.title || 'Origin Jump',
          result.formGoals || '',
          result.formChallenges || ''
        );
      }
      
      // Add this exploration level (the new jump will update with its own jumpId when generated)
      const updatedHistory = addExplorationLevel(
        currentHistory,
        alternativeJumps,
        index,
        undefined, // New jumpId will be set when jump is generated
        alternative.title
      );
      
      return updatedHistory;
    };

    // For authenticated users, check credits
    if (authCheck) {
      if (!hasCredits()) {
        toast.error('Insufficient credits. Please purchase more credits to generate a new jump.', {
          duration: 5000,
          action: {
            label: 'Buy Credits',
            onClick: () => navigate('/pricing')
          }
        });
        return;
      }

      // Show confirmation toast with credit warning
      toast(
        <div className="space-y-2">
          <p className="font-medium">Generate New Jump?</p>
          <p className="text-sm text-muted-foreground">
            This will use <span className="font-semibold text-primary">1 credit</span> from your balance ({creditsBalance} credits available).
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                toast.dismiss();
                // Deduct credit first
                const success = await deductCredit('Jump generation (alternative route)', `alt-jump-${Date.now()}`);
                if (success) {
                  const updatedHistory = prepareHistoryUpdate();
                  explorationHistoryRef.current = updatedHistory;
                  setExplorationHistory(updatedHistory);
                  
                  setSelectedAlternative(alternative);
                  setAlternativesCollapsed(true);
                  setGeneratingJumpIndex(index);
                  setGeneratedJumpIndex(index);
                  onGenerateAlternativeJump(alternative, updatedHistory);
                }
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Generate Jump
            </Button>
          </div>
        </div>,
        {
          duration: 15000,
        }
      );
    } else {
      // Guest users - proceed without credit check but show confirmation
      toast(
        <div className="space-y-2">
          <p className="font-medium">Generate New Jump?</p>
          <p className="text-sm text-muted-foreground">
            This will generate a new jump following the selected alternative route.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.dismiss();
                const updatedHistory = prepareHistoryUpdate();
                explorationHistoryRef.current = updatedHistory;
                setExplorationHistory(updatedHistory);
                
                setSelectedAlternative(alternative);
                setAlternativesCollapsed(true);
                setGeneratingJumpIndex(index);
                setGeneratedJumpIndex(index);
                onGenerateAlternativeJump(alternative, updatedHistory);
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Generate Jump
            </Button>
          </div>
        </div>,
        {
          duration: 15000,
        }
      );
    }
  };

  const handleCopyPrompt = async (promptText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompts(prev => new Set([...prev, index]));
      toast.success("Prompt copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedPrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const handleDownload = () => {
    toast.info('Download feature coming soon!');
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Scroll to top of tab content unless it's a programmatic change from View button
    if (!skipScrollToTopRef.current) {
      const isMobile = window.innerWidth < 768;
      
      // On mobile, skip complex scroll logic to prevent touch interference
      if (isMobile) {
        skipScrollToTopRef.current = false;
        return;
      }
      
      // Desktop only: Check if tabs are sticky and scroll accordingly
      if (tabsContainerRef.current) {
        const tabsRect = tabsContainerRef.current.getBoundingClientRect();
        const isTabsSticky = tabsRect.top <= 80;
        
        if (isTabsSticky) {
          requestAnimationFrame(() => {
            try {
              let contentRef: React.RefObject<HTMLDivElement> | null = null;
              if (newTab === 'overview') contentRef = overviewContentRef;
              else if (newTab === 'plan') contentRef = planContentRef;
              else if (newTab === 'toolPrompts') contentRef = toolPromptsContentRef;
              
              if (contentRef?.current) {
                const elementPosition = contentRef.current.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = Math.max(0, elementPosition - 130);
                
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            } catch (error) {
              console.error('Tab scroll error:', error);
            }
          });
        }
      }
    }
    skipScrollToTopRef.current = false;
  };
  
  const handleToolPromptClick = (comboIndex: number, comboId: string) => {
    // Mark this as a programmatic change to skip scroll-to-top
    skipScrollToTopRef.current = true;
    
    // Switch to the Tools & Prompts tab
    setActiveTab('toolPrompts');
    
    // Wait for tab to switch, then scroll to the combo with offset for sticky tabs
    setTimeout(() => {
      const element = document.getElementById(comboId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 120; // Offset for sticky tabs + header + some padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 3000);
      }
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (stepName: string, hasContent: boolean) => {
    const currentStep = result.processing_status?.currentStep;
    const isComplete = result.processing_status?.isComplete;
    
    // Determine if this step is complete
    const stepOrder = ['naming', 'overview', 'plan', 'tool_prompts', 'complete'];
    const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;
    const thisStepIndex = stepOrder.indexOf(stepName);
    
    // If generation is complete, all steps get checkmark
    if (isComplete && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    // If current step is past this step and we have content, it's complete
    if (currentStepIndex > thisStepIndex && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    // If this is the current step, show spinning
    if (currentStep === stepName) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    // Otherwise, waiting
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Add null safety checks
  if (!result || !result.processing_status) {
    return (
      <div className="w-full space-y-6">
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Initializing generation system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4" style={{ overflow: 'visible' }}>
      {/* Compact Glass Progress Header with enhanced glass morphism */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-2xl blur-xl opacity-40"></div>
        <div className="relative glass backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all duration-500 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:shadow-primary/10 bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {result.fullTitle || result.title}
                  </h2>
                  {result.jumpNumber && result.jumpName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mt-1">
                      <span>Jump #{result.jumpNumber}</span>
                      <span>•</span>
                      <span>{result.jumpName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs flex items-center gap-1.5 border-border/40 bg-background/50 backdrop-blur-sm">
                  <Timer className="w-3 h-3" />
                  {formatTime(generationTimer)}
                </Badge>
                <Badge 
                  variant={result.processing_status?.isComplete ? "default" : "secondary"}
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {result.processing_status?.stage || 'Initializing...'}
                </Badge>
              </div>
            </div>
            
            {/* Compact Generation Performance Section */}
            {result.processing_status?.isComplete && result.stepTimes && (() => {
              // Map technical step names to user-friendly labels
              const stepLabels: Record<string, string> = {
                naming: 'Name',
                overview: 'Overview',
                comprehensive: 'Plan',
                plan: 'Plan',
                tool_prompts: 'Tools & Prompts',
                tools: 'Tools & Prompts'
              };
              
              // Transform stepTimes into display format, excluding internal steps
              const displaySteps = Object.entries(result.stepTimes)
                .filter(([key]) => key !== 'jump_created' && stepLabels[key]) // Only show mapped steps
                .map(([key, time]) => ({
                  label: stepLabels[key],
                  time
                }))
                .filter((step, index, self) => 
                  // Remove duplicates (e.g., if both 'comprehensive' and 'plan' exist)
                  index === self.findIndex(s => s.label === step.label)
                );
              
              return (
                <div className="mb-3 inline-block">
                  <div className="text-xs font-semibold mb-1.5 text-muted-foreground flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-primary" />
                    Generation Performance
                  </div>
                  <div className="space-y-0.5">
                    {displaySteps.map((step) => (
                      <div 
                        key={step.label}
                        className="text-[11px] font-medium text-foreground/70 flex items-center gap-1.5"
                      >
                        <span className="min-w-[110px]">{step.label}</span>
                        <span className="text-primary font-semibold">{step.time}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {result.processing_status?.currentTask?.replace(/\(\d+s\)/, (match) => {
                    const seconds = parseInt(match.match(/\d+/)?.[0] || '0');
                    return `(${formatDuration(seconds)})`;
                  }) || 'Starting...'}
                </span>
                <span className="text-foreground font-semibold">{result.processing_status?.progress || 0}%</span>
              </div>
              <div className="relative">
                {/* Premium Animated Progress Bar */}
                <Progress 
                  value={result.processing_status?.progress || 0} 
                  className="h-3 bg-muted/40 border border-border/30 shadow-inner" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Content Tabs - Ultra Premium Design with Sticky Behavior */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" style={{ overflow: 'visible', display: 'block' }}>
        <div 
          ref={tabsContainerRef} 
          className="sticky top-20 md:top-16 z-[60] mb-6 bg-background/95 backdrop-blur-lg border-b border-border/40 shadow-lg pb-2 -mt-2 pt-1"
          style={{ 
            pointerEvents: 'auto',
          }}
        >
          {/* Mobile: Equal width tabs */}
          <div className="sm:hidden">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1.5 bg-background rounded-xl border border-border/50 shadow-lg shadow-primary/10" style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}>
              <TabsTrigger 
                value="overview" 
                className="relative flex flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold px-1.5 py-1.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-lg hover:scale-[1.02]"
              >
                {getStatusIcon('overview', !!result.full_content)}
                <span className="tracking-wide text-center">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="plan" 
                className="relative flex flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold px-1.5 py-1.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-lg hover:scale-[1.02]"
              >
                {getStatusIcon('plan', !!result.structured_plan)}
                <span className="tracking-wide text-center">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="toolPrompts" 
                className="relative flex flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold px-1.5 py-1.5 
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                  data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                  data-[state=active]:border data-[state=active]:border-primary/30
                  text-muted-foreground hover:text-foreground hover:bg-accent/50
                  transition-all duration-300 rounded-lg hover:scale-[1.02]"
              >
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
                <span className="tracking-wide text-center">Tools & Prompts</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout with premium effects */}
          <TabsList className="hidden sm:grid h-auto w-full grid-cols-3 gap-1.5 p-2 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl rounded-xl border border-border/50 shadow-lg shadow-primary/10">
            <TabsTrigger 
              value="overview" 
              className="relative flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-lg hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('overview', !!result.full_content)}
              </span>
              <span className="tracking-wide">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="plan" 
              className="relative flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-lg hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('plan', !!result.structured_plan)}
              </span>
              <span className="tracking-wide">Plan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="toolPrompts" 
              className="relative flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/10 
                data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20
                data-[state=active]:border data-[state=active]:border-primary/30
                text-muted-foreground hover:text-foreground hover:bg-accent/50
                transition-all duration-300 rounded-lg hover:scale-[1.02] group"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {getStatusIcon('tool_prompts', (result.components?.toolPrompts?.length || 0) > 0)}
              </span>
              <span className="tracking-wide">Tools & Prompts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0" style={{ overflow: 'visible', maxHeight: 'none', height: 'auto', display: 'block' }}>
          {result.comprehensive_plan ? (
            <div ref={overviewContentRef} className="space-y-6">
              {/* Route Exploration Breadcrumb - shows when we're in an alternative route */}
              {explorationHistory && explorationHistory.explorationPath.length > 1 && (
                <RouteExplorationBreadcrumb history={explorationHistory} />
              )}
              
              {/* NEW FORMAT: THE JUMP FORWARD with Alternative Jumps Feature */}
              {result.comprehensive_plan.jumpForward && (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary" />
                          The Jump Forward
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
                          {result.comprehensive_plan.jumpForward}
                        </p>
                        
                        {/* Explore Alternative Routes Button - Always visible, disabled during generation */}
                        {!showAlternatives && (
                          <div className="pt-4 border-t border-border/30">
                            {!result.processing_status?.isComplete ? (
                              /* Button disabled during jump generation with professional explainer */
                              <div className="space-y-2">
                                <button
                                  disabled={true}
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg
                                    bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 
                                    border border-muted/30
                                    text-muted-foreground
                                    backdrop-blur-sm cursor-not-allowed opacity-60"
                                >
                                  <Route className="w-3.5 h-3.5" />
                                  Explore Alternative Routes
                                </button>
                                <p className="text-xs text-muted-foreground/70 italic">
                                  Available after generation completes — typically under a minute
                                </p>
                              </div>
                            ) : (
                              /* Button enabled after generation complete */
                              <button
                                onClick={handleGenerateAlternatives}
                                disabled={isGeneratingAlternatives}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg
                                  bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 
                                  border border-primary/30 hover:border-primary/50
                                  text-primary hover:text-primary
                                  backdrop-blur-sm transition-all duration-300
                                  hover:from-primary/15 hover:via-accent/10 hover:to-primary/15
                                  hover:shadow-lg hover:shadow-primary/20
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGeneratingAlternatives ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Exploring Routes...
                                  </>
                                ) : (
                                  <>
                                    <Route className="w-3.5 h-3.5" />
                                    Explore Alternative Routes
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  </div>

                  {/* Alternative Jumps Cards - Responsive Grid (Expanded View) */}
                  {showAlternatives && alternativeJumps.length > 0 && !alternativesCollapsed && (
                    <div className="space-y-4">
                      {/* Header with Hide Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Route className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">Explore Alternative Routes</span>
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                            3 Options
                          </Badge>
                        </div>
                        <button
                          onClick={() => setAlternativesCollapsed(true)}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          Hide
                        </button>
                      </div>

                      {/* Responsive Grid: 3 columns on desktop, 1 on mobile */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {alternativeJumps.map((alt, index) => {
                          const isSelected = generatedJumpIndex === index;
                          const isCurrentlyGenerating = generatingJumpIndex === index;
                          const isGenerationComplete = isSelected && jumpGenerationComplete;
                          const shouldDisableButton = generatingJumpIndex !== null; // Only disable while actively generating
                          
                          return (
                            <div 
                              key={index}
                              className="relative group"
                            >
                              <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-xl blur transition duration-300 ${
                                isGenerationComplete 
                                  ? 'from-green-500/30 via-green-400/20 to-green-500/30 opacity-50' 
                                  : isCurrentlyGenerating
                                    ? 'from-primary/40 via-accent/30 to-primary/40 opacity-60'
                                    : 'from-secondary/20 via-accent/15 to-primary/20 opacity-30 group-hover:opacity-50'
                              }`}></div>
                              <Card className={`relative h-full glass backdrop-blur-lg bg-card/60 transition-all duration-300 rounded-xl ${
                                isGenerationComplete 
                                  ? 'border-green-500/50' 
                                  : isCurrentlyGenerating
                                    ? 'border-primary/60'
                                    : 'border border-border/50 hover:border-primary/40'
                              }`}>
                                <CardContent className="p-4 flex flex-col h-full">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={`text-xs ${
                                        isGenerationComplete 
                                          ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                                          : isCurrentlyGenerating
                                            ? 'bg-primary/10 text-primary border-primary/40'
                                            : 'bg-primary/5 text-primary border-primary/20'
                                      }`}>
                                        {isGenerationComplete ? (
                                          <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Generated
                                          </>
                                        ) : isCurrentlyGenerating ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Generating
                                          </>
                                        ) : (
                                          `Route ${index + 1}`
                                        )}
                                      </Badge>
                                    </div>
                                    <h4 className="font-semibold text-sm text-foreground">{alt.title}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{alt.description}</p>
                                  </div>
                                  
                                  {/* Button with different states */}
                                  {isGenerationComplete ? (
                                    <div className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg
                                      bg-green-500/10 border border-green-500/30 text-green-500">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Jump Generated
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleGenerateThisJump(alt, index)}
                                      disabled={shouldDisableButton}
                                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg
                                        bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 
                                        border border-primary/30 hover:border-primary/50
                                        text-primary hover:text-primary
                                        backdrop-blur-sm transition-all duration-300
                                        hover:from-primary/15 hover:via-accent/10 hover:to-primary/15
                                        hover:shadow-lg hover:shadow-primary/20
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isCurrentlyGenerating ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3.5 h-3.5" />
                                          Generate this Jump
                                        </>
                                      )}
                                    </button>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Collapsed View with Expand Option - shows when alternatives exist but are hidden */}
                  {showAlternatives && alternativeJumps.length > 0 && alternativesCollapsed && (
                    <div className="p-3 rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Route className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {generatingJumpIndex !== null ? (
                              /* Actively generating - show spinner */
                              <>
                                <span className="text-primary">
                                  {alternativeJumps[generatingJumpIndex]?.title}
                                </span>
                                <span className="text-muted-foreground ml-1 inline-flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  generating...
                                </span>
                              </>
                            ) : generatedJumpIndex !== null && jumpGenerationComplete ? (
                              /* Generation complete - show green */
                              <>
                                <span className="text-green-500">
                                  {alternativeJumps[generatedJumpIndex]?.title}
                                </span>
                                <span className="text-green-500/70 ml-1">(generated)</span>
                              </>
                            ) : (
                              <>Alternative Routes <span className="text-muted-foreground">({alternativeJumps.length} options)</span></>
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => setAlternativesCollapsed(false)}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          View Routes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NEW FORMAT: STRATEGIC EDGE */}
              {result.comprehensive_plan.strategicEdge && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" />
                        Strategic Edge
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comprehensive_plan.strategicEdge.analysis && (
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {result.comprehensive_plan.strategicEdge.analysis}
                        </p>
                      )}
                      {result.comprehensive_plan.strategicEdge.keyPoints?.length > 0 && (
                        <ul className="space-y-2">
                          {result.comprehensive_plan.strategicEdge.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground/80">{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* NEW FORMAT: FLIGHT PATH */}
              {result.comprehensive_plan.flightPath && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Flight Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {result.comprehensive_plan.flightPath.vision && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Victory Vision</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {result.comprehensive_plan.flightPath.vision}
                          </p>
                        </div>
                      )}
                      {result.comprehensive_plan.flightPath.roadmap?.length > 0 && (
                        <div className="space-y-3">
                          {result.comprehensive_plan.flightPath.roadmap.map((phase: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  {idx === 0 && <Play className="w-4 h-4 text-primary" />}
                                  {idx === 1 && <TrendingUp className="w-4 h-4 text-primary" />}
                                  {idx === 2 && <Flag className="w-4 h-4 text-primary" />}
                                  {phase.phase}
                                </h4>
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                  {phase.timeframe}
                                </Badge>
                              </div>
                              <p className="text-sm text-foreground/70">{phase.focus}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* NEW FORMAT: NEW BASELINE */}
              {result.comprehensive_plan.newBaseline && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/25 via-accent/20 to-secondary/25 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-gradient-to-br from-primary/10 via-card/80 to-secondary/10 border border-primary/30 hover:border-primary/50 transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Flag className="w-5 h-5 text-primary" />
                        New Baseline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm sm:text-base font-medium text-foreground/90 leading-relaxed italic">
                        "{result.comprehensive_plan.newBaseline}"
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* LEGACY FORMAT: Executive Summary - for old jumps */}
              {!result.comprehensive_plan.jumpForward && result.comprehensive_plan.executiveSummary && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere text-xs sm:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formatAIText(result.comprehensive_plan.executiveSummary)}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* LEGACY FORMAT: Situation Analysis - for old jumps */}
              {!result.comprehensive_plan.jumpForward && result.comprehensive_plan.situationAnalysis && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" />
                        Situation Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comprehensive_plan.situationAnalysis.currentState && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Current State</h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.situationAnalysis.currentState)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        {result.comprehensive_plan.situationAnalysis.challenges?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                              Key Challenges
                            </h4>
                            <ul className="space-y-2">
                              {result.comprehensive_plan.situationAnalysis.challenges.map((challenge: string, idx: number) => (
                                <li key={idx} className="text-xs pl-4 border-l-2 border-destructive/30">{challenge}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.comprehensive_plan.situationAnalysis.opportunities?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              Opportunities
                            </h4>
                            <ul className="space-y-2">
                              {result.comprehensive_plan.situationAnalysis.opportunities.map((opp: string, idx: number) => (
                                <li key={idx} className="text-xs pl-4 border-l-2 border-primary/30">{opp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* LEGACY FORMAT: Strategic Vision - for old jumps */}
              {!result.comprehensive_plan.jumpForward && result.comprehensive_plan.strategicVision && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Strategic Vision
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formatAIText(result.comprehensive_plan.strategicVision)}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* LEGACY FORMAT: Roadmap - for old jumps */}
              {!result.comprehensive_plan.jumpForward && result.comprehensive_plan.roadmap && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Roadmap
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comprehensive_plan.roadmap.immediate && (
                        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Immediate Actions
                            </h4>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">0-30 days</Badge>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.roadmap.immediate)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {result.comprehensive_plan.roadmap.shortTerm && (
                        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Short-term Milestones
                            </h4>
                            <Badge variant="outline" className="text-xs">30-90 days</Badge>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.roadmap.shortTerm)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {result.comprehensive_plan.roadmap.longTerm && (
                        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Long-term Goals
                            </h4>
                            <Badge variant="outline" className="text-xs">90+ days</Badge>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.roadmap.longTerm)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Generating strategic overview...
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan" className="mt-0" style={{ overflow: 'visible', maxHeight: 'none', height: 'auto', display: 'block' }}>
          <div ref={planContentRef}>
            {result.structured_plan && result.structured_plan.phases ? (
              <JumpPlanDisplay
              planContent={result.full_content || ''}
              structuredPlan={result.comprehensive_plan}
              onEdit={() => {
                // Scroll to chat to refine
                const chatSection = document.querySelector('[data-chat-section]');
                if (chatSection) {
                  chatSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onDownload={() => handleDownload()}
              jumpId={result.jumpId}
              toolPromptIds={toolPrompts?.map((tp: any) => tp?.id || null) || []}
              onToolPromptClick={handleToolPromptClick}
              onToolPromptGenerated={handleToolPromptGenerated}
              isGenerationComplete={result.processing_status?.isComplete || false}
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Creating implementation plan...
            </div>
          )}
          </div>
        </TabsContent>

        <TabsContent value="toolPrompts" className="mt-0" style={{ overflow: 'visible', maxHeight: 'none', height: 'auto', display: 'block' }}>
          {(() => {
            console.log('🔍 Tools & Prompts Tab - Checking data:', {
              hasComponents: !!result.components,
              hasToolPrompts: !!toolPrompts,
              toolPromptsLength: toolPrompts.length,
              toolPromptsData: toolPrompts
            });

            if (!toolPrompts || toolPrompts.length === 0) {
              return (
                <div className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl flex items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Generating tools & prompts...
                </div>
              );
            }

            // Validate and map combos with original indices preserved
            const validCombosWithIndices = toolPrompts
              .map((combo: any, originalIndex: number) => ({ combo, originalIndex }))
              .filter(({ combo, originalIndex }) => {
                const promptText = combo.prompt_text || combo.custom_prompt || combo.prompt;
                const toolName = combo.tool_name || combo.name;
                const hasTitle = combo.title;
                const hasDescription = combo.description;
                
                // More robust validation - check all essential rendering fields
                const isValid = !!(promptText && toolName && hasTitle);
                
                if (!isValid) {
                  console.warn(`⚠️ Combo ${originalIndex + 1} missing required fields:`, {
                    hasPromptText: !!promptText,
                    hasToolName: !!toolName,
                    hasTitle: !!hasTitle,
                    hasDescription: !!hasDescription,
                    combo
                  });
                }
                
                return isValid;
              });

            console.log(`✅ Validated: ${validCombosWithIndices.length} of ${toolPrompts.length} combos have complete data`);

            // Show loading if we're expecting more combos (target is 9)
            const expectedCount = 9;
            const isGenerating = validCombosWithIndices.length < expectedCount && toolPrompts.length < expectedCount;

            return (
              <div ref={toolPromptsContentRef} className="grid gap-4">
                {validCombosWithIndices.map(({ combo, originalIndex }) => {
                  const displayNumber = originalIndex + 1;
                  console.log(`🔧 Rendering valid combo ${displayNumber}:`, {
                    title: combo.title,
                    tool_name: combo.tool_name,
                    hasPrompt: !!(combo.prompt_text || combo.custom_prompt),
                    hasDescription: !!combo.description
                  });
                  return (
                    <ErrorBoundary 
                      key={combo.id || `combo-${originalIndex}`}
                      fallback={
                        <div className="p-6 border border-destructive/30 rounded-lg bg-destructive/5 text-center">
                          <h3 className="text-lg font-semibold mb-2">Error loading tool #{displayNumber}</h3>
                          <p className="text-sm text-muted-foreground">This tool-prompt combo couldn't be displayed.</p>
                        </div>
                      }
                    >
                      <div data-tool-combo={displayNumber} className="animate-fade-in">
                        <ToolPromptComboCard
                          combo={combo}
                          index={displayNumber}
                          onClick={() => {/* Detail modal will be added later */}}
                        />
                      </div>
                    </ErrorBoundary>
                  );
                })}
                
                {/* Show loading indicators for remaining combos */}
                {isGenerating && Array.from({ length: expectedCount - validCombosWithIndices.length }).map((_, idx) => (
                  <div 
                    key={`loading-${idx}`}
                    className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl p-6 flex items-center justify-center h-32 text-muted-foreground animate-pulse"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Generating tool combo #{validCombosWithIndices.length + idx + 1}...
                  </div>
                ))}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressiveJumpDisplay;