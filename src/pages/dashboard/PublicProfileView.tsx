import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { profileService, ProfileData } from '@/services/profileService';
import { jumpLikesService } from '@/services/jumpLikesService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Heart, Upload, ArrowLeft } from 'lucide-react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useToast } from '@/hooks/use-toast';
import logoTransparent from '@/assets/logo-transparent.png';
import { Helmet } from 'react-helmet-async';
import { profileCacheService } from '@/utils/profileCache';

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [publicJumps, setPublicJumps] = useState<any[]>([]);
  const [likedJumps, setLikedJumps] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username) {
      loadPublicProfile();
    }
  }, [username]);

  useEffect(() => {
    if (user && publicJumps.length > 0) {
      checkLikedJumps();
    }
  }, [user?.id]);

  const checkLikedJumps = async () => {
    if (!user || publicJumps.length === 0) return;
    
    const liked = new Set<string>();
    for (const jump of publicJumps) {
      const hasLiked = await jumpLikesService.hasUserLiked(jump.id, user.id);
      if (hasLiked) {
        liked.add(jump.id);
      }
    }
    setLikedJumps(liked);
  };

  const handleLikeToggle = async (jumpId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like jumps"
      });
      return;
    }

    const isLiked = likedJumps.has(jumpId);
    
    if (isLiked) {
      setLikedJumps(prev => {
        const newSet = new Set(prev);
        newSet.delete(jumpId);
        return newSet;
      });
      setPublicJumps(prev => prev.map(jump => 
        jump.id === jumpId ? { ...jump, likes_count: Math.max(0, (jump.likes_count || 0) - 1) } : jump
      ));
    } else {
      setLikedJumps(prev => new Set(prev).add(jumpId));
      setPublicJumps(prev => prev.map(jump => 
        jump.id === jumpId ? { ...jump, likes_count: (jump.likes_count || 0) + 1 } : jump
      ));
    }

    try {
      if (isLiked) {
        await jumpLikesService.unlikeJump(jumpId, user.id);
      } else {
        await jumpLikesService.likeJump(jumpId, user.id);
      }
    } catch (error: any) {
      if (isLiked) {
        setLikedJumps(prev => new Set(prev).add(jumpId));
        setPublicJumps(prev => prev.map(jump => 
          jump.id === jumpId ? { ...jump, likes_count: (jump.likes_count || 0) + 1 } : jump
        ));
      } else {
        setLikedJumps(prev => {
          const newSet = new Set(prev);
          newSet.delete(jumpId);
          return newSet;
        });
        setPublicJumps(prev => prev.map(jump => 
          jump.id === jumpId ? { ...jump, likes_count: Math.max(0, (jump.likes_count || 0) - 1) } : jump
        ));
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleShareJump = async (jumpId: string, jumpTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const url = `${window.location.origin}/jump/${jumpId}/public/${profile?.username}`;
    const shareData = {
      title: jumpTitle,
      text: `Check out this Jump: ${jumpTitle}`,
      url: url
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied to clipboard!' });
      } catch (error) {
        toast({ title: 'Failed to copy link', variant: 'destructive' });
      }
    }
  };

  const loadPublicProfile = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      
      const cachedProfile = profileCacheService.get(username);
      
      if (cachedProfile) {
        setProfile(cachedProfile);
        setIsLoading(false);
        
        const jumps = await profileService.getPublicJumpsByUsername(username);
        setPublicJumps(jumps);
        return;
      }
      
      const profileData = await profileService.getProfileByUsername(username);
      
      if (!profileData) {
        setNotFound(true);
        return;
      }

      await profileCacheService.set(username, profileData);
      setProfile(profileData);

      const jumps = await profileService.getPublicJumpsByUsername(username);
      setPublicJumps(jumps);
    } catch (error) {
      console.error('Error loading public profile:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJump = (jumpId: string) => {
    navigate(`/dashboard/public-jump/${jumpId}/${profile?.username}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !profile) {
    return <Navigate to="/404" replace />;
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <>
      <Helmet>
        <title>{profile.display_name || profile.username} - JumpinAI</title>
        <meta 
          name="description" 
          content={profile.bio || `View ${profile.display_name || profile.username}'s AI adaptation journey on JumpinAI`} 
        />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Back button for own profile */}
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/profile')}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile Settings
          </Button>
        )}

        {/* Profile Header */}
        <Card className="p-6 sm:p-8 mb-8 bg-background/40 backdrop-blur-sm border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/20 shadow-lg ring-2 ring-primary/10 flex-shrink-0">
              {profile.avatar_url ? (
                <AvatarImage 
                  src={profile.avatar_url} 
                  alt={profile.display_name || profile.username}
                  loading="eager"
                  fetchPriority="high"
                  crossOrigin="anonymous"
                  className="object-cover"
                  decoding="async"
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
                <img src={logoTransparent} alt="Avatar" className="opacity-40 brightness-200" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {profile.display_name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mb-3">{profile.username}</p>
              {profile.bio && (
                <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Public Jumps Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Public Jumps</h2>
          {publicJumps.length === 0 ? (
            <Card className="p-12 bg-background/40 backdrop-blur-sm border-border/50">
              <p className="text-center text-muted-foreground">No public jumps to display</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {publicJumps.map((jump) => {
                const isLiked = likedJumps.has(jump.id);
                const displayTitle = jump.title.replace(/^Jump\s*#\d+\s*[:\-–]\s*/i, '');
                
                return (
                  <Card 
                    key={jump.id}
                    className="p-6 bg-gradient-to-br from-background/70 to-background/50 backdrop-blur-xl border-2 border-border/70 hover:border-primary/50 rounded-3xl transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl relative overflow-hidden"
                    onClick={() => handleViewJump(jump.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative space-y-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-8 w-8 rounded-full bg-background/60 hover:bg-background/80 border border-border/40 backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleShareJump(jump.id, displayTitle, e)}
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </Button>

                      <div className="space-y-2 pr-10">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                          {displayTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(jump.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })} at {new Date(jump.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-6 pt-2 border-t border-border/50">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">{jump.views_count || 0}</span>
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-2 h-auto px-3 py-1.5 rounded-full ${
                            isLiked 
                              ? 'text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20' 
                              : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                          } transition-all duration-200`}
                          onClick={(e) => handleLikeToggle(jump.id, e)}
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{jump.likes_count || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
