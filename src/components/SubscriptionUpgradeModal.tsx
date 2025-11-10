import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap, Check, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  newPlan: string;
  priceDifference: number;
  creditDifference: number;
  newPlanFeatures: string[];
  isLoading?: boolean;
}

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  priceDifference,
  creditDifference,
  newPlanFeatures,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-primary" />
            Upgrade Your Subscription
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You're upgrading from {currentPlan} to {newPlan}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Upgrade Summary */}
          <div className="glass bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Additional Cost:</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-base font-bold px-3 py-1">
                +${priceDifference}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Additional Credits:</span>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-base font-bold px-3 py-1">
                  +{creditDifference}
                </Badge>
              </div>
            </div>
          </div>

          {/* New Plan Features */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span>What you'll get with {newPlan}:</span>
            </h4>
            <ul className="space-y-2">
              {newPlanFeatures.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Info */}
          <div className="glass bg-muted/30 border border-border/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong> The additional ${priceDifference} will be charged today, 
              and you'll receive {creditDifference} extra credits immediately. Your next billing will be at the new plan rate.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
