import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { userProfileService, UserProfile } from '@/services/userProfileService';
import { toast } from 'sonner';

interface CompactUserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading?: boolean;
  initialData?: UserProfile;
  showNewProfileButton?: boolean;
  onNewProfile?: () => void;
}

const CompactUserProfileForm: React.FC<CompactUserProfileFormProps> = ({ 
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentRole" className="text-sm font-medium">
            Current Role/Position
          </Label>
          <Input
            id="currentRole"
            value={profile.currentRole}
            onChange={(e) => updateProfile('currentRole', e.target.value)}
            placeholder="e.g., Marketing Manager, CEO"
            className="rounded-md border-border/40 bg-background/50 h-9 text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry" className="text-sm font-medium">Industry/Sector</Label>
          <Select onValueChange={(value) => updateProfile('industry', value)} value={profile.industry} required>
            <SelectTrigger className="rounded-md border-border/40 bg-background/50 h-9 text-sm">
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
          <Label htmlFor="experienceLevel" className="text-sm font-medium">Experience Level</Label>
          <Select onValueChange={(value) => updateProfile('experienceLevel', value)} value={profile.experienceLevel} required>
            <SelectTrigger className="rounded-md border-border/40 bg-background/50 h-9 text-sm">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
              <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
              <SelectItem value="executive">Executive Level (15+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aiKnowledge" className="text-sm font-medium">AI Knowledge Level</Label>
          <Select onValueChange={(value) => updateProfile('aiKnowledge', value)} value={profile.aiKnowledge} required>
            <SelectTrigger className="rounded-md border-border/40 bg-background/50 h-9 text-sm">
              <SelectValue placeholder="Select AI knowledge level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner - Just getting started</SelectItem>
              <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
              <SelectItem value="advanced">Advanced - Very experienced</SelectItem>
              <SelectItem value="expert">Expert - Deep technical knowledge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals" className="text-sm font-medium">Primary Goals & Objectives</Label>
        <Textarea
          id="goals"
          value={profile.goals}
          onChange={(e) => updateProfile('goals', e.target.value)}
          placeholder="What do you want to achieve? (e.g., increase productivity, automate tasks, grow revenue)"
          className="rounded-md border-border/40 bg-background/50 min-h-[60px] text-sm resize-none"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="challenges" className="text-sm font-medium">Current Challenges</Label>
        <Textarea
          id="challenges"
          value={profile.challenges}
          onChange={(e) => updateProfile('challenges', e.target.value)}
          placeholder="What obstacles are you facing? What's holding you back?"
          className="rounded-md border-border/40 bg-background/50 min-h-[60px] text-sm resize-none"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeCommitment" className="text-sm font-medium">Time Commitment</Label>
          <Select onValueChange={(value) => updateProfile('timeCommitment', value)} value={profile.timeCommitment} required>
            <SelectTrigger className="rounded-md border-border/40 bg-background/50 h-9 text-sm">
              <SelectValue placeholder="How much time can you dedicate?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2-hours">1-2 hours per week</SelectItem>
              <SelectItem value="3-5-hours">3-5 hours per week</SelectItem>
              <SelectItem value="6-10-hours">6-10 hours per week</SelectItem>
              <SelectItem value="10-plus-hours">10+ hours per week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="text-sm font-medium">Investment Budget</Label>
          <Select onValueChange={(value) => updateProfile('budget', value)} value={profile.budget} required>
            <SelectTrigger className="rounded-md border-border/40 bg-background/50 h-9 text-sm">
              <SelectValue placeholder="What's your budget range?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal ($0-100/month)</SelectItem>
              <SelectItem value="moderate">Moderate ($100-500/month)</SelectItem>
              <SelectItem value="substantial">Substantial ($500-2000/month)</SelectItem>
              <SelectItem value="enterprise">Enterprise ($2000+/month)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSaving || isLoading}
          className="rounded-md"
        >
          {isSaving ? 'Starting AI Journey...' : 'Start AI Journey'}
        </Button>
        
        {showNewProfileButton && onNewProfile && (
          <Button
            type="button"
            variant="outline"
            onClick={onNewProfile}
            className="rounded-md"
          >
            New Profile
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        All information is kept strictly confidential and private.{' '}
        <a href="/privacy-policy" className="underline hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </div>
    </form>
  );
};

export default CompactUserProfileForm;