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
import { UserJump, getUserJumps } from '@/services/jumpService';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import MiniJumpCard from '@/components/dashboard/MiniJumpCard';
import { generateJumpPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

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
  };

  const handlePlanGenerated = (data: { content: string; structuredPlan?: any; comprehensivePlan?: any }) => {
    setJumpPlan(data.content);
    setStructuredPlan(data.structuredPlan || data.comprehensivePlan);
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
    setStructuredPlan(null); // Reset structured plan for existing jumps
    setJumpName(jump.title);
    setIsNewJump(false);
    setShowChat(true); // Always show chat for existing jumps
    // Don't require profile form for existing jumps
    if (!userProfile) {
      setIsProfileFormOpen(false);
    }
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
    <div className="space-y-8">
      {/* Hero Section - Always visible */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold gradient-text-primary">Jumps Studio</h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Transform your vision into reality with AI-powered strategic planning. 
            Create your personalized transformation journey that bridges where you are today 
            with where you want to be tomorrow.
          </p>
        </div>
      </div>

      {/* Jump Selection Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gradient-to-br from-card to-muted/20 rounded-lg border border-border/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Choose Your Jump</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Start a new transformation plan or continue working on an existing one
              </p>
            </div>
            <Button onClick={handleCreateNewJump} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Jump
            </Button>
          </div>
          
          {existingJumps.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label>Continue Existing Jump</Label>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">
            {selectedJump ? `Working on: ${selectedJump.title}` : "Let's Create Your Personalized Jump"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {selectedJump 
              ? "Continue refining your transformation plan with AI-powered insights and guidance."
              : "To craft a transformation plan that truly fits your unique situation, we'll need to gather some key information about your goals, current position, and aspirations. This takes just a few minutes and enables us to create a highly tailored roadmap for your success."
            }
          </p>
        </div>

        {/* Jump Name Input for New Jumps */}
        {isNewJump && userProfile && (
          <div className="mb-6">
            <Label htmlFor="jump-name">Jump Name</Label>
            <Input
              id="jump-name"
              value={jumpName}
              onChange={(e) => setJumpName(e.target.value)}
              placeholder="Enter a name for your transformation plan..."
              className="mt-2"
            />
          </div>
        )}

        {/* Profile Form - Only show for new jumps or when no jump is selected */}
        {(!selectedJump || isNewJump) && (
          <div className="bg-gradient-to-br from-card to-muted/20 rounded-lg border border-border/50 p-6 shadow-sm">
            {userProfile ? (
              <Collapsible open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    {isProfileFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isProfileFormOpen ? 'Hide' : 'Show'} Profile Details
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
            <div className="mt-6 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                All information is kept strictly confidential and private. We do not sell or share your data.{' '}
                <a href="/privacy-policy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Jump Plan Display and Chat - Shows after profile submission or jump selection */}
      {(userProfile || selectedJump) && (
        <div className="space-y-6">
          {/* Jump Plan Display - Shows once generated */}
          {jumpPlan && (
            <JumpPlanDisplay 
              planContent={jumpPlan}
              structuredPlan={structuredPlan}
              onEdit={handleStartChat}
              onDownload={downloadPlan}
            />
          )}
          
          {/* Chat Interface - Shows for new jumps after profile or always for existing jumps */}
          {showChat && (
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
          )}
        </div>
      )}
    </div>
  );
}