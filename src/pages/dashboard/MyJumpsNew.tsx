import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserJumps, deleteJump, UserJump } from "@/services/jumpService";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import JumpCard from "@/components/dashboard/JumpCard";
import JumpDetailModal from "@/components/dashboard/JumpDetailModal";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function MyJumpsNew() {
  const [jumps, setJumps] = useState<UserJump[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJump, setSelectedJump] = useState<UserJump | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useOptimizedAuth();

  // Load user jumps
  const loadJumps = async () => {
    if (!isAuthenticated || authLoading) return;
    
    try {
      setLoading(true);
      const userJumps = await getUserJumps();
      setJumps(userJumps);
    } catch (error) {
      console.error('Error loading jumps:', error);
      toast.error('Failed to load your jumps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJumps();
  }, [isAuthenticated, authLoading]);

  // Add visibility change listener to refresh data when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && isAuthenticated) {
        loadJumps();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, isAuthenticated]);

  const handleViewJump = (jump: UserJump) => {
    setSelectedJump(jump);
    setIsModalOpen(true);
  };

  const handleDeleteJump = async (jumpId: string) => {
    if (!confirm('Are you sure you want to delete this jump? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteJump(jumpId);
      setJumps(jumps.filter(jump => jump.id !== jumpId));
      toast.success('Jump deleted successfully');
    } catch (error) {
      console.error('Error deleting jump:', error);
      toast.error('Failed to delete jump');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJump(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Loading Your Jumps...</h3>
            <p className="text-muted-foreground">Fetching your AI transformation plans</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass border-0 ring-1 ring-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/80 via-card/60 to-primary/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-lg">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                My Jumps
              </h1>
              <p className="text-muted-foreground font-medium">Your personal AI transformation plans</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadJumps()}
              disabled={loading}
              className="rounded-2xl border-0 ring-1 ring-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link to="/jumpinai-studio">
              <Button className="gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-primary/30">
                <Plus className="h-4 w-4" />
                Create New Jump
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Jumps Grid */}
      {jumps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jumps.map((jump, index) => (
            <div 
              key={jump.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <JumpCard
                jump={jump}
                onView={handleViewJump}
                onDelete={handleDeleteJump}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="glass border-0 ring-1 ring-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/80 via-card/60 to-primary/5 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-30"></div>
          
          <CardHeader className="text-center relative z-10 pb-4">
            <div className="mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/20 shadow-lg w-fit">
              <Rocket className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              No Jumps Yet
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground font-medium">
              Create your first AI transformation plan to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center relative z-10 pt-0">
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Head to JumpinAI Studio to create personalized transformation plans powered by AI.
            </p>
            <Link to="/jumpinai-studio">
              <Button className="gap-3 text-base px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-primary/30">
                <Plus className="h-5 w-5" />
                Create Your First Jump
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Jump Detail Modal */}
      <JumpDetailModal
        jump={selectedJump}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}