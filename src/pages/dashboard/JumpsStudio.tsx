import React, { useState } from 'react';
import { Sparkles, Brain, Target, Rocket } from 'lucide-react';
import UserProfileForm, { type UserProfile } from '@/components/dashboard/UserProfileForm';
import AICoachChat from '@/components/dashboard/AICoachChat';

export default function JumpsStudio() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSubmit = async (profile: UserProfile) => {
    setIsLoading(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setUserProfile(profile);
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    setUserProfile(null);
  };

  if (userProfile) {
    return <AICoachChat userProfile={userProfile} onBack={handleBack} />;
  }

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
      {/* Hero Section */}
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
            goals, and industry. Powered by ChatGPT-5 for world-class strategic guidance.
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

      {/* Profile Form */}
      <UserProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} />
    </div>
  );
}