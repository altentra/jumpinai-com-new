import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CompactUserProfileForm from '@/components/dashboard/CompactUserProfileForm';
import { UserProfile } from '@/services/userProfileService';
import CompactAICoachChat from '@/components/dashboard/CompactAICoachChat';
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
    <div className="min-h-screen relative">
      {/* Page Title - Top Left */}
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">Jumps Studio</h1>
      </div>

      {/* Jump Selection - Sticky Top */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 md:px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card/60 border border-border/30 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-medium">Choose Your Jump</h2>
                <p className="text-xs text-muted-foreground">Start new or continue existing</p>
              </div>
              <Button 
                onClick={handleCreateNewJump} 
                variant="default" 
                size="sm"
                className="gap-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
              >
                <Plus className="h-4 w-4" />
                New Jump
              </Button>
            </div>
            
            {existingJumps.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {existingJumps.map((jump) => (
                  <MiniJumpCard
                    key={jump.id}
                    jump={jump}
                    onClick={handleSelectExistingJump}
                    isSelected={selectedJump?.id === jump.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-6 pb-32 max-w-5xl mx-auto space-y-6">
        {/* Jump Name Input for New Jumps */}
        {isNewJump && userProfile && (
          <div className="bg-card/30 border border-border/30 rounded-lg p-4">
            <Label htmlFor="jump-name" className="text-sm font-medium">Jump Name</Label>
            <Input
              id="jump-name"
              value={jumpName}
              onChange={(e) => setJumpName(e.target.value)}
              placeholder="Enter a name for your transformation plan..."
              className="mt-2 rounded-md border-border/40 focus:border-primary/50 transition-colors"
            />
          </div>
        )}

        {/* Tell us About Yourself - Compact */}
        {(!selectedJump || isNewJump) && (
          <div className="bg-card/40 border border-border/30 rounded-lg p-4">
            <h3 className="text-base font-medium mb-3">Tell us About Yourself</h3>
            {userProfile ? (
              <Collapsible open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-2 rounded-md shadow-sm transition-all duration-200"
                  >
                    {isProfileFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isProfileFormOpen ? 'Hide' : 'Show'} Profile Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <CompactUserProfileForm 
                    onSubmit={handleProfileSubmit} 
                    isLoading={isLoading} 
                    initialData={userProfile}
                    showNewProfileButton={true}
                    onNewProfile={handleNewProfile}
                  />
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <CompactUserProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} />
            )}
          </div>
        )}

        {/* Jump Plan Display */}
        {(userProfile || selectedJump) && (
          <div className="bg-card/30 border border-border/30 rounded-lg overflow-hidden">
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
        )}
      </div>

      {/* Chat Interface - Sticky Bottom */}
      {showChat && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 p-3">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card/80 border border-border/40 rounded-lg overflow-hidden shadow-sm">
              <CompactAICoachChat 
                userProfile={userProfile || ({ currentRole: 'Professional' } as UserProfile)} 
                onPlanGenerated={handlePlanGenerated}
                onJumpSaved={handleJumpSaved}
                initialPlan={jumpPlan}
                isRefinementMode={!!jumpPlan || !!selectedJump}
                currentJumpId={currentJumpId}
                jumpName={jumpName}
                isNewJump={isNewJump}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}