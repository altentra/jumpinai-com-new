import React, { useState } from 'react';
import { Sparkles, Brain, Target, Rocket, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import UserProfileForm, { type UserProfile } from '@/components/dashboard/UserProfileForm';
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
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Jumps Studio</h1>
            <p className="text-xl text-muted-foreground">AI-Powered Transformation Coach</p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Get your personalized "Jump" - a comprehensive AI transformation plan tailored to your unique situation, 
            goals, and industry. Powered by GPT-4.1 for world-class strategic guidance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <div className="mx-auto p-3 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 w-fit">
              <Brain className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Personalized Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Deep assessment of your current situation, skills, and goals
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="mx-auto p-3 rounded-full bg-gradient-to-br from-green-500/10 to-green-500/5 w-fit">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold">Strategic Roadmap</h3>
            <p className="text-sm text-muted-foreground">
              Step-by-step implementation plan with tools and timelines
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="mx-auto p-3 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-500/5 w-fit">
              <Rocket className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold">Actionable Results</h3>
            <p className="text-sm text-muted-foreground">
              Practical tools, workflows, and strategies you can implement today
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form - Collapsible after submission */}
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