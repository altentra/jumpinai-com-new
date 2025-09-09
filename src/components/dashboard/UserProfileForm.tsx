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
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-fit">
          <User className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Tell Us About Yourself</CardTitle>
        <CardDescription className="text-lg">
          Help us create your personalized AI transformation plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentRole" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Current Role/Position
              </Label>
              <Input
                id="currentRole"
                value={profile.currentRole}
                onChange={(e) => updateProfile('currentRole', e.target.value)}
                placeholder="e.g., Marketing Manager, CEO, Freelancer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry/Sector</Label>
              <Select onValueChange={(value) => updateProfile('industry', value)} value={profile.industry} required>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Professional Experience Level</Label>
              <Select onValueChange={(value) => updateProfile('experienceLevel', value)} value={profile.experienceLevel} required>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="aiKnowledge">Current AI Knowledge</Label>
              <Select onValueChange={(value) => updateProfile('aiKnowledge', value)} value={profile.aiKnowledge} required>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="timeCommitment" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Commitment (per week)
              </Label>
              <Select onValueChange={(value) => updateProfile('timeCommitment', value)} value={profile.timeCommitment} required>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget for AI Tools/Training
              </Label>
              <Select onValueChange={(value) => updateProfile('budget', value)} value={profile.budget} required>
                <SelectTrigger>
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Primary Goals & Objectives
              </Label>
              <Textarea
                id="goals"
                value={profile.goals}
                onChange={(e) => updateProfile('goals', e.target.value)}
                placeholder="What do you want to achieve with AI? (e.g., increase productivity, automate processes, improve decision-making)"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Biggest Challenges & Pain Points</Label>
              <Textarea
                id="challenges"
                value={profile.challenges}
                onChange={(e) => updateProfile('challenges', e.target.value)}
                placeholder="What are your current biggest challenges that AI could help solve?"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || isSaving}
            >
              {isLoading || isSaving ? 'Saving Your Profile...' : 'Start My AI Transformation Journey'}
            </Button>
            {showNewProfileButton && onNewProfile && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onNewProfile}
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