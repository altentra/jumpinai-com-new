import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Plus } from "lucide-react";
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
  useEffect(() => {
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

    loadJumps();
  }, [isAuthenticated, authLoading]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Jumps</h1>
            <p className="text-muted-foreground">Your personal AI transformation plans</p>
          </div>
        </div>
        
        <Link to="/dashboard/jumps-studio">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Jump
          </Button>
        </Link>
      </div>

      {/* Jumps Grid */}
      {jumps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jumps.map((jump) => (
            <JumpCard
              key={jump.id}
              jump={jump}
              onView={handleViewJump}
              onDelete={handleDeleteJump}
            />
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-muted w-fit">
              <Rocket className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No Jumps Yet</CardTitle>
            <CardDescription className="text-lg">
              Create your first AI transformation plan to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foregoing mb-6">
              Head to Jumps Studio to create personalized transformation plans powered by AI.
            </p>
            <Link to="/dashboard/jumps-studio">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
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