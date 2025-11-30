import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { profileService, ProfileData } from '@/services/profileService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import logoTransparent from '@/assets/logo-transparent.png';
import { Helmet } from 'react-helmet-async';

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [publicJumps, setPublicJumps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username) {
      loadPublicProfile();
    }
  }, [username]);

  const loadPublicProfile = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      const profileData = await profileService.getProfileByUsername(username);
      
      if (!profileData) {
        setNotFound(true);
        return;
      }

      setProfile(profileData);

      // Load public jumps
      const jumps = await profileService.getPublicJumpsByUsername(username);
      setPublicJumps(jumps);
    } catch (error) {
      console.error('Error loading public profile:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (!profile) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{profile.display_name || profile.username} - JumpinAI</title>
        <meta 
          name="description" 
          content={profile.bio || `View ${profile.display_name || profile.username}'s AI adaptation journey on JumpinAI`} 
        />
      </Helmet>

      <Navigation />

      <div className="min-h-screen pt-24 pb-16 relative">
        {/* Background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-secondary/20 via-accent/10 to-secondary/5 rounded-full blur-3xl animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative container max-w-5xl mx-auto px-4">
          {/* Profile Header - Premium Design */}
          <Card className="p-6 sm:p-8 mb-8 bg-background/40 backdrop-blur-sm border-border/50 relative overflow-hidden">
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/20 shadow-lg ring-2 ring-primary/10 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} />
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
              <div className="flex flex-col gap-4">
                {publicJumps.map((jump) => (
                  <Card 
                    key={jump.id}
                    className="p-6 bg-background/40 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => window.location.href = `/dashboard/jump/${jump.id}`}
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {jump.title}
                      </h3>
                      {jump.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {jump.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span>
                          {new Date(jump.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {jump.views_count > 0 && (
                          <span>{jump.views_count} views</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}