import React from 'react';
import { Zap, Loader2, Plus } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CreditsDisplayProps {
  showBuyButton?: boolean;
  className?: string;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ 
  showBuyButton = true, 
  className = '' 
}) => {
  const { credits, isLoading, creditsBalance } = useCredits();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  const handleBuyCredits = () => {
    navigate('/pricing');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Credits Balance Display */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/8 dark:to-accent/8 rounded-xl px-3 py-2 border border-primary/20">
        <Zap className="w-4 h-4 text-primary" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {creditsBalance}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {creditsBalance === 1 ? 'credit' : 'credits'}
            </span>
          </div>
        </div>
      </div>

      {/* Buy Credits Button */}
      {showBuyButton && (
        <Button
          onClick={handleBuyCredits}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs hover:bg-primary/5 hover:border-primary/30"
        >
          <Plus className="w-3 h-3 mr-1" />
          Buy Credits
        </Button>
      )}
    </div>
  );
};