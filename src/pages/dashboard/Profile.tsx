import { useState, useEffect } from 'react';
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
import { Loader2, Copy, Check } from 'lucide-react';
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

  const loadJumps = async (type: 'private' | 'public') => {
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
  };

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
    const link = `${window.location.origin}/@${formData.username}`;
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
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Profile Header - Always Visible */}
        <Card className="p-8 mb-6 bg-background/40 backdrop-blur-sm border-border/50">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback>
                <img src={logoTransparent} alt="Default" className="opacity-40 brightness-200" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{formData.display_name || user?.display_name || user?.email}</h2>
              <p className="text-muted-foreground mb-3">{user?.email}</p>
              {formData.bio && (
                <p className="text-foreground/80">{formData.bio}</p>
              )}
            </div>
          </div>
          
          {profile?.is_public && (
            <a
              href={`/@${profile.username?.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View my public profile →
            </a>
          )}
        </Card>

        <Tabs defaultValue="edit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            <TabsTrigger value="private" onClick={() => loadJumps('private')}>Private Jumps</TabsTrigger>
            <TabsTrigger value="public" onClick={() => loadJumps('public')}>Public Jumps</TabsTrigger>
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
                  Your profile URL: {window.location.origin}/@{formData.username}
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