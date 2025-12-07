import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Clock, Zap, Timer, Copy, Check, Wrench, AlertTriangle, Lightbulb, Target, Compass, TrendingUp, Shield, DollarSign, Heart, MapPin, Calendar, Play, Flag, LayoutDashboard, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatAIText } from '@/utils/aiTextFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ProgressiveResult } from '@/hooks/useProgressiveGeneration';
import { ToolPromptComboCard } from '@/components/dashboard/ToolPromptComboCard';
import JumpPlanDisplay from '@/components/dashboard/JumpPlanDisplay';
import { toast } from 'sonner';

interface ViewJumpDisplayProps {
  result: ProgressiveResult;
  generationTimer: number;
  onToolPromptGenerated?: () => void;
  isPublicView?: boolean;
}

const ViewJumpDisplay: React.FC<ViewJumpDisplayProps> = ({
  result, 
  generationTimer,
  onToolPromptGenerated,
  isPublicView = false
}) => {
  const navigate = useNavigate();
  const [copiedPrompts, setCopiedPrompts] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isHeaderHidden, setIsHeaderHidden] = React.useState(false);
  const skipScrollToTopRef = React.useRef(false);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const overviewContentRef = React.useRef<HTMLDivElement>(null);
  const planContentRef = React.useRef<HTMLDivElement>(null);
  const toolPromptsContentRef = React.useRef<HTMLDivElement>(null);

  // Listen to header visibility changes for perfect sync on mobile
  React.useEffect(() => {
    const handleHeaderVisibilityChange = (event: CustomEvent) => {
      if (window.innerWidth < 768) {
        setIsHeaderHidden(!event.detail.visible);
      } else {
        setIsHeaderHidden(false);
      }
    };

    window.addEventListener('headerVisibilityChange', handleHeaderVisibilityChange as EventListener);
    
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        const isTabsSticky = tabsRect.top <= 0;
        
        if (isTabsSticky) {
          requestAnimationFrame(() => {
            try {
              let contentRef: React.RefObject<HTMLDivElement> | null = null;
              if (newTab === 'overview') contentRef = overviewContentRef;
              else if (newTab === 'plan') contentRef = planContentRef;
              else if (newTab === 'toolPrompts') contentRef = toolPromptsContentRef;
              
              if (contentRef?.current) {
                const elementPosition = contentRef.current.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = Math.max(0, elementPosition - 110);
                
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
        const offsetPosition = elementPosition - 100; // Offset for sticky tabs + some padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 3000);
      }
    }, 100);
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
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />;
    }
    
    // If current step is past this step and we have content, it's complete
    if (currentStepIndex > thisStepIndex && hasContent) {
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />;
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
    <div className="w-full max-w-full space-y-4" style={{ overflow: 'visible' }}>
      {/* Content Tabs - Ultra Premium Design with Sticky Behavior */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" style={{ overflow: 'visible', display: 'block' }}>
        <div ref={tabsContainerRef} className={`sticky z-[60] mb-6 bg-background/95 backdrop-blur-lg border-b border-border/40 shadow-lg pb-2 -mt-2 pt-1 transition-[top] duration-300 ease-out ${isHeaderHidden ? 'top-0' : 'top-20'} md:top-16`} style={{ pointerEvents: 'auto' }}>
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
              {/* NEW FORMAT: THE JUMP FORWARD */}
              {result.comprehensive_plan.jumpForward && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        The Jump Forward
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed text-foreground/90">
                        {result.comprehensive_plan.jumpForward}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* NEW FORMAT: STRATEGIC EDGE */}
              {result.comprehensive_plan.strategicEdge && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Strategic Edge
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comprehensive_plan.strategicEdge.analysis && (
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                          {result.comprehensive_plan.strategicEdge.analysis}
                        </p>
                      )}
                      {result.comprehensive_plan.strategicEdge.keyPoints?.length > 0 && (
                        <ul className="space-y-2">
                          {result.comprehensive_plan.strategicEdge.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
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
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Flight Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {result.comprehensive_plan.flightPath.vision && (
                        <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                            <span className="text-xs sm:text-sm font-semibold text-primary">Victory Vision</span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                            {result.comprehensive_plan.flightPath.vision}
                          </p>
                        </div>
                      )}
                      {result.comprehensive_plan.flightPath.roadmap?.length > 0 && (
                        <div className="space-y-3">
                          {result.comprehensive_plan.flightPath.roadmap.map((phase: any, idx: number) => (
                            <div key={idx} className="p-3 sm:p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                                  {idx === 0 && <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />}
                                  {idx === 1 && <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />}
                                  {idx === 2 && <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />}
                                  {phase.phase}
                                </h4>
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30">
                                  {phase.timeframe}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-foreground/70">{phase.focus}</p>
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
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        New Baseline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs sm:text-sm md:text-base font-medium text-foreground/90 leading-relaxed italic">
                        "{result.comprehensive_plan.newBaseline}"
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* LEGACY FORMAT: Action Plan Phases - for old jumps with action_plan structure */}
              {!result.comprehensive_plan.jumpForward && !result.comprehensive_plan.executiveSummary && result.comprehensive_plan.action_plan?.phases && (
                <div className="space-y-6">
                  {/* Overview/Summary Card */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                    <Card className="relative glass backdrop-blur-lg bg-card/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          Your Strategic Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed text-foreground/90">
                          This jump contains {result.comprehensive_plan.action_plan.phases.length} implementation phases to help you achieve your goals. Review the Plan tab for detailed steps.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Phases Overview */}
                  {result.comprehensive_plan.action_plan.phases.map((phase: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                              {idx === 0 && <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                              {idx === 1 && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                              {idx === 2 && <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                              {idx > 2 && <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                              Phase {phase.phase_number}: {phase.title}
                            </CardTitle>
                            {phase.duration && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30">
                                {phase.duration}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {phase.description && (
                            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                              {phase.description}
                            </p>
                          )}
                          {phase.steps && phase.steps.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key Steps</h4>
                              <ul className="space-y-1.5">
                                {phase.steps.slice(0, 3).map((step: any, stepIdx: number) => (
                                  <li key={stepIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                                    <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-foreground/70">{step.title}</span>
                                  </li>
                                ))}
                                {phase.steps.length > 3 && (
                                  <li className="text-xs text-muted-foreground pl-5">
                                    + {phase.steps.length - 3} more steps in Plan tab
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}

              {/* LEGACY FORMAT: Executive Summary - for old jumps */}
              {!result.comprehensive_plan.jumpForward && result.comprehensive_plan.executiveSummary && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative glass backdrop-blur-lg bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Situation Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comprehensive_plan.situationAnalysis.currentState && (
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm mb-2">Current State</h4>
                          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.situationAnalysis.currentState)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {result.comprehensive_plan.situationAnalysis.challenges?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                              Key Challenges
                            </h4>
                            <ul className="space-y-2">
                              {result.comprehensive_plan.situationAnalysis.challenges.map((challenge: string, idx: number) => (
                                <li key={idx} className="text-[11px] sm:text-xs pl-4 border-l-2 border-destructive/30">{challenge}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.comprehensive_plan.situationAnalysis.opportunities?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              Opportunities
                            </h4>
                            <ul className="space-y-2">
                              {result.comprehensive_plan.situationAnalysis.opportunities.map((opp: string, idx: number) => (
                                <li key={idx} className="text-[11px] sm:text-xs pl-4 border-l-2 border-primary/30">{opp}</li>
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
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Strategic Vision
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
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
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Roadmap
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comprehensive_plan.roadmap.immediate && (
                        <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-xs sm:text-sm text-primary flex items-center gap-2">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              Immediate Actions
                            </h4>
                            <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30">0-30 days</Badge>
                          </div>
                          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.roadmap.immediate)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {result.comprehensive_plan.roadmap.shortTerm && (
                        <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                              Short-term Milestones
                            </h4>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">30-90 days</Badge>
                          </div>
                          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {formatAIText(result.comprehensive_plan.roadmap.shortTerm)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {result.comprehensive_plan.roadmap.longTerm && (
                        <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                              Long-term Goals
                            </h4>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">90+ days</Badge>
                          </div>
                          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
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
                toast.info('Edit feature coming soon!');
              }}
              onDownload={() => {
                toast.info('Download feature coming soon!');
              }}
              jumpId={result.jumpId || undefined}
              toolPromptIds={result.components?.toolPrompts?.map((tp: any) => tp?.id || null) || []}
              onToolPromptClick={handleToolPromptClick}
              onToolPromptGenerated={onToolPromptGenerated}
              isPublicView={isPublicView}
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
          <div ref={toolPromptsContentRef} className="grid gap-4">
            {result.components?.toolPrompts && result.components.toolPrompts.length > 0 ? (
              result.components.toolPrompts.map((combo: any, index: number) => (
                <div key={index} data-tool-combo={index + 1} className="animate-fade-in">
                  <ToolPromptComboCard
                    combo={combo}
                    index={index + 1}
                    jumpId={result.jumpId || undefined}
                    onClick={() => {/* Detail modal will be added later */}}
                  />
                </div>
              ))
            ) : (
              <div className="glass backdrop-blur-lg bg-card/80 border border-border rounded-xl flex items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Generating tools & prompts...
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewJumpDisplay;