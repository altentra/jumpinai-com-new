import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import UserProfileForm from '@/components/dashboard/UserProfileForm';
import { UserProfile } from '@/services/userProfileService';
import AICoachChat from '@/components/dashboard/AICoachChat';
import JumpPlanDisplay from '@/components/dashboard/JumpPlanDisplay';

export default function JumpsStudio() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jumpPlan, setJumpPlan] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(true);

  const handleProfileSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setIsProfileFormOpen(false);
    setShowChat(true); // Show chat immediately
  };

  const handlePlanGenerated = (plan: string) => {
    setJumpPlan(plan);
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  const downloadPlan = () => {
    if (!jumpPlan.trim()) return;
    
    const blob = new Blob([jumpPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-jump-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewProfile = () => {
    setUserProfile(null);
    setJumpPlan('');
    setShowChat(false);
    setIsProfileFormOpen(true);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preparing Your AI Coach...</h3>
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

      {/* Information Collection Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">Let's Create Your Personalized Jump</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            To craft a transformation plan that truly fits your unique situation, we'll need to gather 
            some key information about your goals, current position, and aspirations. This takes just 
            a few minutes and enables us to create a highly tailored roadmap for your success.
          </p>
        </div>

        {/* Profile Form - Collapsible after submission */}
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
      </div>

      {/* Jump Plan Display and Chat - Shows after profile submission */}
      {userProfile && (
        <div className="space-y-6">
          {/* Jump Plan Display - Shows once generated */}
          {jumpPlan && (
            <JumpPlanDisplay 
              planContent={jumpPlan}
              onEdit={handleStartChat}
              onDownload={downloadPlan}
            />
          )}
          
          {/* Chat Interface - Shows immediately after profile submission */}
          {showChat && (
            <AICoachChat 
              userProfile={userProfile} 
              onPlanGenerated={handlePlanGenerated}
              initialPlan={jumpPlan}
              isRefinementMode={!!jumpPlan}
              hideChat={false}
            />
          )}
        </div>
      )}
    </div>
  );
}