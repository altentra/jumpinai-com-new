import { useState, useEffect, useCallback } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { profileService, ProfileData } from '@/services/profileService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check, User, Lock, Globe } from 'lucide-react';
import MiniJumpCard from '@/components/dashboard/MiniJumpCard';
import logoTransparent from '@/assets/logo-transparent.png';

export default function Profile() {
  const { user, isLoading: authLoading } = useOptimizedAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    is_public: false
  });

  const [privateJumps, setPrivateJumps] = useState<any[]>([]);
  const [publicJumps, setPublicJumps] = useState<any[]>([]);
  const [jumpsLoading, setJumpsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const profileData = await profileService.getProfileByUserId(user.id);
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          username: profileData.username?.replace('@', '') || '',
          display_name: profileData.display_name || '',
          bio: profileData.bio || '',
          is_public: profileData.is_public
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadJumps = useCallback(async (type: 'private' | 'public') => {
    if (!user) return;
    
    try {
      setJumpsLoading(true);
      if (type === 'private') {
        const jumps = await profileService.getPrivateJumps(user.id);
        setPrivateJumps(jumps);
      } else {
        const jumps = await profileService.getPublicJumps(user.id);
        setPublicJumps(jumps);
      }
    } catch (error) {
      console.error(`Error loading ${type} jumps:`, error);
    } finally {
      setJumpsLoading(false);
    }
  }, [user]);

  const handleToggleJumpPublic = useCallback(async (jumpId: string, isPublic: boolean) => {
    if (!user) return;
    
    try {
      await profileService.toggleJumpVisibility(jumpId, isPublic);
      
      // Refresh both lists to move jump between tabs
      await Promise.all([
        profileService.getPrivateJumps(user.id).then(setPrivateJumps),
        profileService.getPublicJumps(user.id).then(setPublicJumps)
      ]);
    } catch (error) {
      console.error('Error toggling jump visibility:', error);
      throw error;
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Check username availability if changed
      if (formData.username !== profile?.username?.replace('@', '')) {
        const isAvailable = await profileService.isUsernameAvailable(formData.username, user.id);
        if (!isAvailable) {
          toast({
            title: "Username taken",
            description: "This username is already in use. Please choose another.",
            variant: "destructive"
          });
          return;
        }
      }

      await profileService.updateProfile(user.id, formData);
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      await loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/u/${formData.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Profile link copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Premium background elements optimized for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-56 sm:w-[28rem] h-56 sm:h-[28rem] bg-gradient-to-br from-primary/20 sm:from-primary/25 via-primary/10 sm:via-primary/15 to-primary/5 rounded-full blur-2xl sm:blur-3xl animate-pulse opacity-50 sm:opacity-60"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-64 sm:w-[32rem] h-64 sm:h-[32rem] bg-gradient-to-tr from-secondary/15 sm:from-secondary/20 via-accent/8 sm:via-accent/10 to-secondary/5 rounded-full blur-2xl sm:blur-3xl animate-pulse opacity-40 sm:opacity-50" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative container max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Profile Header - Premium Design */}
        <Card className="p-4 sm:p-6 md:p-8 mb-6 bg-background/40 backdrop-blur-sm border-border/50 relative overflow-hidden">
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start mb-6">
            {/* Smaller premium avatar */}
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/20 shadow-lg ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-300 hover-scale flex-shrink-0">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
                <img src={logoTransparent} alt="Default" className="opacity-40 brightness-200" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                {formData.display_name || user?.display_name || user?.email}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2 truncate">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {user?.email}
                </span>
              </p>
              {formData.bio && (
                <p className="text-foreground/80 text-sm line-clamp-2">{formData.bio}</p>
              )}
            </div>
          </div>
          
          {profile?.is_public && (
            <div className="relative">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
              <a
                href={`/u/${profile.username?.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                View my public profile →
              </a>
            </div>
          )}
        </Card>

        <Tabs defaultValue="edit" className="space-y-6">
          <TabsList className="flex flex-row w-full gap-1 sm:gap-2 rounded-xl sm:rounded-2xl glass border border-border/50 p-1 sm:p-1.5 h-auto justify-center max-w-full sm:max-w-4xl mx-auto backdrop-blur-sm">
            <TabsTrigger 
              value="edit" 
              className="flex-1 sm:max-w-52 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm py-2.5 sm:py-3.5 px-2 sm:px-6 transition-all duration-300 hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm rounded-lg sm:rounded-xl font-medium"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="leading-tight">Edit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="private" 
              onClick={() => loadJumps('private')} 
              className="flex-1 sm:max-w-52 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm py-2.5 sm:py-3.5 px-2 sm:px-6 transition-all duration-300 hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm rounded-lg sm:rounded-xl font-medium"
            >
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="leading-tight">Private</span>
            </TabsTrigger>
            <TabsTrigger 
              value="public" 
              onClick={() => loadJumps('public')} 
              className="flex-1 sm:max-w-52 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm py-2.5 sm:py-3.5 px-2 sm:px-6 transition-all duration-300 hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm rounded-lg sm:rounded-xl font-medium"
            >
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="leading-tight">Public</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Card className="p-6 space-y-6 bg-background/40 backdrop-blur-sm border-border/50">

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-muted-foreground">@</span>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                      placeholder="username"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={copyProfileLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your profile URL: {window.location.origin}/u/{formData.username}
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="public">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your profile and public jumps
                  </p>
                </div>
                <Switch
                  id="public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>

              {/* Save Button */}
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="private">
            <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4">Private Jumps</h3>
              {jumpsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : privateJumps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No private jumps yet</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {privateJumps.map((jump) => (
                    <MiniJumpCard 
                      key={jump.id} 
                      jump={jump} 
                      onClick={(j) => window.location.href = `/dashboard/jump/${j.id}`}
                      onTogglePublic={handleToggleJumpPublic}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="public">
            <Card className="p-6 bg-background/40 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4">Public Jumps</h3>
              {jumpsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : publicJumps.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No public jumps yet</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {publicJumps.map((jump) => (
                    <MiniJumpCard 
                      key={jump.id} 
                      jump={jump} 
                      onClick={(j) => window.location.href = `/dashboard/jump/${j.id}`}
                      onTogglePublic={handleToggleJumpPublic}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}