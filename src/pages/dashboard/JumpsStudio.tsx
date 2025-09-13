import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserProfileForm from '@/components/dashboard/UserProfileForm';
import { UserProfile } from '@/services/userProfileService';
import AICoachChat from '@/components/dashboard/AICoachChat';
import JumpPlanDisplay from '@/components/dashboard/JumpPlanDisplay';
import ComprehensiveJumpDisplay from '@/components/dashboard/ComprehensiveJumpDisplay';
import { UserJump, getUserJumps } from '@/services/jumpService';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import MiniJumpCard from '@/components/dashboard/MiniJumpCard';
import { generateJumpPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { safeParseJSON } from '@/utils/safeJson';

export default function JumpsStudio() {
  const { userDisplay } = useOptimizedAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jumpPlan, setJumpPlan] = useState<string>('');
  const [structuredPlan, setStructuredPlan] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(true);
  const [existingJumps, setExistingJumps] = useState<UserJump[]>([]);
  const [selectedJump, setSelectedJump] = useState<UserJump | null>(null);
  const [currentJumpId, setCurrentJumpId] = useState<string | null>(null);
  const [jumpName, setJumpName] = useState<string>('');
  const [isNewJump, setIsNewJump] = useState(true);

  const scrollToChat = () => {
    try {
      setTimeout(() => document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {}
  };

  const emptyPlan = React.useMemo(() => ({
    title: jumpName || 'Your Jump Plan',
    executive_summary: '',
    overview: {
      vision_statement: '',
      transformation_scope: '',
      expected_outcomes: [],
      timeline_overview: ''
    },
    analysis: {
      current_state: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      },
      gap_analysis: [],
      readiness_assessment: { score: 0, factors: [] },
      market_context: ''
    },
    action_plan: {
      phases: [1,2,3].map((n) => ({
        phase_number: n,
        title: `Phase ${n}`,
        description: '',
        duration: '',
        objectives: [],
        key_actions: [],
        milestones: [],
        deliverables: [],
        risks: []
      }))
    },
    tools_prompts: {
      recommended_ai_tools: [],
      custom_prompts: [],
      templates: []
    },
    workflows_strategies: {
      workflows: [],
      strategies: []
    },
    metrics_tracking: {
      kpis: [],
      tracking_methods: [],
      reporting_schedule: { daily: [], weekly: [], monthly: [], quarterly: [] },
      success_criteria: []
    },
    investment: {
      time_investment: { total_hours: '', weekly_commitment: '', phase_breakdown: [] },
      financial_investment: { total_budget: '', categories: [] },
      roi_projection: { timeframe: '', expected_roi: '', break_even_point: '' }
    }
  }), [jumpName]);

  // Load existing jumps when component mounts
  useEffect(() => {
    const loadExistingJumps = async () => {
      try {
        const jumps = await getUserJumps();
        setExistingJumps(jumps);
      } catch (error) {
        console.error('Error loading jumps:', error);
      }
    };
    loadExistingJumps();
  }, []);

  // Generate automatic jump name
  const generateJumpName = () => {
    const userName = userDisplay?.name || 'User';
    const jumpNumber = existingJumps.length + 1;
    return `${userName}'s Jump #${jumpNumber}`;
  };

  const handleProfileSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setIsProfileFormOpen(false);
    // Auto-generate jump name for new jumps
    if (isNewJump && !jumpName) {
      setJumpName(generateJumpName());
    }
    setShowChat(true); // Show chat immediately
    scrollToChat();
  };

  const handlePlanGenerated = (data: { content: string; structuredPlan?: any; comprehensivePlan?: any }) => {
    setJumpPlan(data.content);
    if (data.structuredPlan || data.comprehensivePlan) {
      setStructuredPlan(data.structuredPlan || data.comprehensivePlan);
    } else {
      const parsed = safeParseJSON(data.content);
      if (parsed) setStructuredPlan(parsed);
    }
  };

  const handleJumpSaved = (jumpId: string) => {
    console.log('Jump saved with ID:', jumpId);
    setCurrentJumpId(jumpId);
    // Refresh the jumps list
    getUserJumps().then(setExistingJumps).catch(console.error);
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  const downloadPlan = () => {
    if (!jumpPlan.trim()) return;
    
    const jumpTitle = jumpName || selectedJump?.title || 'My Jump Plan';
    const jumpSummary = selectedJump?.summary;
    const createdAt = selectedJump?.created_at || new Date().toISOString();
    
    generateJumpPDF({
      title: jumpTitle,
      summary: jumpSummary,
      content: jumpPlan,
      createdAt: createdAt
    });
  };

  const handleNewProfile = () => {
    setUserProfile(null);
    setJumpPlan('');
    setStructuredPlan(null);
    setShowChat(false);
    setIsProfileFormOpen(true);
    setSelectedJump(null);
    setCurrentJumpId(null);
    setIsNewJump(true);
    setJumpName('');
  };

  const handleSelectExistingJump = (jump: UserJump) => {
    setSelectedJump(jump);
    setCurrentJumpId(jump.id);
    setJumpPlan(jump.full_content);
    setStructuredPlan(jump.comprehensive_plan || jump.structured_plan || null);
    setJumpName(jump.title);
    setIsNewJump(false);
    setShowChat(true); // Always show chat for existing jumps
    // Don't require profile form for existing jumps
    if (!userProfile) {
      setIsProfileFormOpen(false);
    }
    scrollToChat();
  };

  const handleCreateNewJump = () => {
    setSelectedJump(null);
    setCurrentJumpId(null);
    setJumpPlan('');
    setStructuredPlan(null);
    setJumpName(generateJumpName());
    setIsNewJump(true);
    setShowChat(false);
    setIsProfileFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preparing JumpinAI Studio...</h3>
            <p className="text-muted-foreground">Analyzing your profile and customizing your experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-12 px-4 md:px-6 py-8">
      {/* Hero Section - Always visible */}
      <div className="text-center space-y-2 md:space-y-3 py-3 md:py-6">
        <div className="space-y-2 md:space-y-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl opacity-30 -z-10"></div>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold gradient-text-primary tracking-tight drop-shadow-sm">Jumps Studio</h1>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl md:max-w-4xl mx-auto leading-relaxed px-2 font-medium">
            Transform your vision into reality with AI-powered strategic planning. 
            Create your personalized transformation journey that bridges where you are today 
            with where you want to be tomorrow.
          </p>
        </div>
      </div>

      {/* Jump Selection Section */}
      <div className="max-w-5xl mx-auto mb-4 md:mb-6">
        <div className="glass backdrop-blur-xl bg-gradient-to-br from-card/95 to-primary/5 rounded-2xl border border-primary/20 p-4 md:p-5 shadow-xl shadow-primary/8 hover:shadow-primary/15 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Choose Your Jump</h2>
                <p className="text-muted-foreground text-xs md:text-sm max-w-md">
                  Start a new transformation plan or continue working on an existing one
                </p>
              </div>
              <Button 
                onClick={handleCreateNewJump} 
                variant="default" 
                size="lg"
                className="gap-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 shrink-0 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline font-semibold">New Jump</span>
                <span className="sm:hidden font-semibold">Create New</span>
              </Button>
            </div></div>
          
          {existingJumps.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <div>
                <Label className="text-xs md:text-sm font-medium text-foreground/90 mb-2 block">Continue Existing Jump</Label>
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent touch-pan-x pointer-events-auto" style={{ scrollbarWidth: 'thin' }}>
                  {existingJumps.map((jump) => (
                    <MiniJumpCard
                      key={jump.id}
                      jump={jump}
                      onClick={handleSelectExistingJump}
                      isSelected={selectedJump?.id === jump.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information Collection Section */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur-sm">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold gradient-text-primary px-2">
            {selectedJump ? `Working on: ${selectedJump.title}` : "Let's Create Your Personalized Jump"}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl md:max-w-3xl mx-auto px-4 leading-relaxed">
            {selectedJump 
              ? "Continue refining your transformation plan with AI-powered insights and guidance."
              : "To craft a transformation plan that truly fits your unique situation, we'll need to gather some key information about your goals, current position, and aspirations. This takes just a few minutes and enables us to create a highly tailored roadmap for your success."
            }
          </p>
        </div>

        {/* Jump Name Input for New Jumps */}
        {isNewJump && userProfile && (
          <div className="mb-6 md:mb-10 p-6 md:p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 rounded-3xl border border-primary/20 shadow-xl shadow-primary/5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50"></div>
            <div className="relative z-10">
              <Label htmlFor="jump-name" className="text-base font-semibold text-foreground/90">Jump Name</Label>
              <Input
                id="jump-name"
                value={jumpName}
                onChange={(e) => setJumpName(e.target.value)}
                placeholder="Enter a name for your transformation plan..."
                className="mt-3 rounded-2xl border-border/30 focus:border-primary/60 focus:ring-4 focus:ring-primary/20 transition-all duration-300 text-base py-3 px-4 bg-background/80 backdrop-blur-sm shadow-md"
              />
            </div>
          </div>
        )}

        {/* Profile Form - Only show for new jumps or when no jump is selected */}
        {(!selectedJump || isNewJump) && (
          <div className="glass backdrop-blur-xl bg-gradient-to-br from-card/95 to-primary/10 rounded-3xl border border-primary/20 p-6 md:p-10 shadow-2xl shadow-primary/15 hover:shadow-primary/25 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              {userProfile ? (
                <Collapsible open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full gap-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-primary/20 bg-background/80 backdrop-blur-sm py-4"
                    >
                      {isProfileFormOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      <span className="hidden sm:inline text-base font-semibold">{isProfileFormOpen ? 'Hide' : 'Show'} Profile Details</span>
                      <span className="sm:hidden text-base font-semibold">{isProfileFormOpen ? 'Hide' : 'Show'} Profile</span>
                    </Button>
                  </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <UserProfileForm 
                    onSubmit={handleProfileSubmit} 
                    isLoading={isLoading} 
                    initialData={userProfile}
                    showNewProfileButton={true}
                    onNewProfile={handleNewProfile}
                  />
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <UserProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} />
            )}
            
              {/* Privacy Notice */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-primary/20">
                <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                  All information is kept strictly confidential and private. We do not sell or share your data.{' '}
                  <a href="/privacy-policy" className="underline hover:text-foreground transition-colors font-semibold hover:text-primary">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jump Plan Display and Chat - Shows after profile submission or jump selection */}
      {(userProfile || selectedJump) && (
        <div className="space-y-6 md:space-y-10">
          {/* Jump Plan Display - Always show the module */}
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 border border-primary/10 bg-gradient-to-br from-background/95 to-primary/5 backdrop-blur-sm">
            {jumpPlan || structuredPlan ? (
              <JumpPlanDisplay 
                planContent={jumpPlan}
                structuredPlan={structuredPlan}
                onEdit={handleStartChat}
                onDownload={downloadPlan}
              />
            ) : (
              <ComprehensiveJumpDisplay
                jump={emptyPlan}
                onEdit={handleStartChat}
                onDownload={() => {}}
              />
            )}
          </div>
          
          {/* Chat Interface - Shows for new jumps after profile or always for existing jumps */}
          {showChat && (
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 border border-primary/10 bg-gradient-to-br from-background/95 to-secondary/5 backdrop-blur-sm">
              <AICoachChat 
                userProfile={userProfile || ({ currentRole: 'Professional' } as UserProfile)} 
                onPlanGenerated={handlePlanGenerated}
                onJumpSaved={handleJumpSaved}
                initialPlan={jumpPlan}
                isRefinementMode={!!jumpPlan || !!selectedJump}
                hideChat={false}
                currentJumpId={currentJumpId}
                jumpName={jumpName}
                isNewJump={isNewJump}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}