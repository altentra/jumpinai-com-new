import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Briefcase, Target, Clock, DollarSign } from 'lucide-react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { userProfileService, UserProfile } from '@/services/userProfileService';
import { toast } from 'sonner';

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading?: boolean;
  initialData?: UserProfile;
  showNewProfileButton?: boolean;
  onNewProfile?: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  onSubmit, 
  isLoading, 
  initialData,
  showNewProfileButton,
  onNewProfile 
}) => {
  const { user } = useOptimizedAuth();
  const [profile, setProfile] = useState<UserProfile>(initialData || {
    currentRole: '',
    industry: '',
    experienceLevel: '',
    aiKnowledge: '',
    goals: '',
    challenges: '',
    timeCommitment: '',
    budget: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load user's existing profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id && !initialData) {
        try {
          const existingProfile = await userProfileService.getActiveProfile(user.id);
          if (existingProfile) {
            setProfile(existingProfile);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };

    loadProfile();
  }, [user?.id, initialData]);

  // Update profile when initialData changes
  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to save your profile');
      return;
    }

    setIsSaving(true);
    
    try {
      const savedProfile = await userProfileService.saveProfile(profile, user.id);
      toast.success('Profile saved successfully!');
      onSubmit(savedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto backdrop-blur-xl bg-gradient-to-br from-card/95 to-primary/5 rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm w-fit shadow-lg">
          <User className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Tell Us About Yourself</CardTitle>
        <CardDescription className="text-lg mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Help us create your personalized AI transformation plan with comprehensive insights
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="currentRole" className="flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                Current Role/Position
              </Label>
              <Input
                id="currentRole"
                value={profile.currentRole}
                onChange={(e) => updateProfile('currentRole', e.target.value)}
                placeholder="e.g., Marketing Manager, CEO, Freelancer"
                className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="industry" className="text-sm font-semibold">Industry/Sector</Label>
              <Select onValueChange={(value) => updateProfile('industry', value)} value={profile.industry} required>
                <SelectTrigger className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail/E-commerce</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="marketing">Marketing/Advertising</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="experienceLevel" className="text-sm font-semibold">Professional Experience Level</Label>
              <Select onValueChange={(value) => updateProfile('experienceLevel', value)} value={profile.experienceLevel} required>
                <SelectTrigger className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                  <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
                  <SelectItem value="executive">Executive (15+ years)</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur/Business Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="aiKnowledge" className="text-sm font-semibold">Current AI Knowledge</Label>
              <Select onValueChange={(value) => updateProfile('aiKnowledge', value)} value={profile.aiKnowledge} required>
                <SelectTrigger className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300">
                  <SelectValue placeholder="Select AI knowledge level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Just getting started)</SelectItem>
                  <SelectItem value="basic">Basic (Use ChatGPT occasionally)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Regular AI tool user)</SelectItem>
                  <SelectItem value="advanced">Advanced (Implement AI solutions)</SelectItem>
                  <SelectItem value="expert">Expert (AI strategy & development)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="timeCommitment" className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Time Commitment (per week)
              </Label>
              <Select onValueChange={(value) => updateProfile('timeCommitment', value)} value={profile.timeCommitment} required>
                <SelectTrigger className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300">
                  <SelectValue placeholder="How much time can you dedicate?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3">1-3 hours/week</SelectItem>
                  <SelectItem value="4-8">4-8 hours/week</SelectItem>
                  <SelectItem value="9-15">9-15 hours/week</SelectItem>
                  <SelectItem value="16+">16+ hours/week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-semibold">
                <DollarSign className="h-4 w-4 text-primary" />
                Budget for AI Tools/Training
              </Label>
              <Select onValueChange={(value) => updateProfile('budget', value)} value={profile.budget} required>
                <SelectTrigger className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm h-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">$0-$100/month</SelectItem>
                  <SelectItem value="100-500">$100-$500/month</SelectItem>
                  <SelectItem value="500-2000">$500-$2,000/month</SelectItem>
                  <SelectItem value="2000+">$2,000+/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="goals" className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-primary" />
                Primary Goals & Objectives
              </Label>
              <Textarea
                id="goals"
                value={profile.goals}
                onChange={(e) => updateProfile('goals', e.target.value)}
                placeholder="What do you want to achieve with AI? (e.g., increase productivity, automate processes, improve decision-making)"
                rows={4}
                className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300 resize-none"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="challenges" className="text-sm font-semibold">Biggest Challenges & Pain Points</Label>
              <Textarea
                id="challenges"
                value={profile.challenges}
                onChange={(e) => updateProfile('challenges', e.target.value)}
                placeholder="What are your current biggest challenges that AI could help solve?"
                rows={4}
                className="rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300 resize-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-lg font-semibold"
              disabled={isLoading || isSaving}
            >
              {isLoading || isSaving ? 'Saving Your Profile...' : 'Start My AI Transformation Journey'}
            </Button>
            {showNewProfileButton && onNewProfile && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onNewProfile}
                className="h-14 px-8 rounded-2xl border-primary/30 hover:bg-primary/10 transition-all duration-300"
              >
                New Profile
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;