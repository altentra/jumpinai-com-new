import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserJumpsLight, deleteJump } from "@/services/jumpService";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import JumpCard from "@/components/dashboard/JumpCard";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type LightJump = {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  jump_type?: string;
  status?: string;
  completion_percentage?: number;
};

export default function MyJumpsNew() {
  const [jumps, setJumps] = useState<LightJump[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(20);
  const { isAuthenticated, isLoading: authLoading } = useOptimizedAuth();

  // Load user jumps with optimized query (only essential fields)
  const loadJumps = async () => {
    if (!isAuthenticated || authLoading) return;
    
    try {
      setLoading(true);
      const userJumps = await getUserJumpsLight();
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

  const handleViewJump = (jump: LightJump) => {
    // Navigation is now handled in JumpCard component
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

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  const displayedJumps = jumps.slice(0, displayLimit);
  const hasMore = displayLimit < jumps.length;

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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="space-y-3 sm:space-y-1">
        <div className="block sm:hidden">
          <h1 className="text-2xl font-bold tracking-tight">My Jumps</h1>
          <p className="text-sm text-muted-foreground">Your AI transformation plans</p>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-3xl font-bold tracking-tight">My Jumps</h1>
          <p className="text-muted-foreground">Your personal AI transformation plans ready to implement</p>
        </div>
      </div>

      <div className="glass rounded-xl p-3 sm:p-4 shadow-modern">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">My Jumps</h2>
            <Badge variant="secondary" className="text-xs">{jumps.length} {jumps.length === 1 ? 'jump' : 'jumps'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadJumps()}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/jumpinai-studio" className="flex-1 sm:flex-initial">
              <Button size="sm" className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {jumps.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {displayedJumps.map((jump, index) => {
              // Calculate jump number (oldest = #1, newest = highest)
              const jumpNumber = jumps.length - index;
              
              return (
                <div 
                  key={jump.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 20) * 50}ms` }}
                >
                  <JumpCard
                    jump={jump as any}
                    jumpNumber={jumpNumber}
                    onView={handleViewJump}
                    onDelete={handleDeleteJump}
                  />
                </div>
              );
            })}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
              >
                Load More ({jumps.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="glass text-center py-8 sm:py-12 rounded-xl shadow-modern">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-muted-foreground">
                No jumps yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate your personalized AI transformation plan to get started with JumpinAI
              </p>
              <Button 
                variant="outline" 
                className="text-sm mt-4" 
                onClick={() => window.location.href = '/jumpinai-studio'}
              >
                <Plus className="w-3 h-3 mr-2" />
                Create Your First Jump
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}