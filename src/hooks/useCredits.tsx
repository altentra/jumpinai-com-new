import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { creditsService, type UserCredits } from '@/services/creditsService';
import { toast } from 'sonner';

export const useCredits = () => {
  const { user, isAuthenticated } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user credits
  const fetchCredits = async () => {
    if (!isAuthenticated || !user?.id) {
      setCredits(null);
      return;
    }

    setIsLoading(true);
    try {
      const userCredits = await creditsService.getUserCredits(user.id);
      setCredits(userCredits);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Failed to load credits balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has credits
  const hasCredits = (): boolean => {
    return credits ? credits.credits_balance > 0 : false;
  };

  // Deduct a credit
  const deductCredit = async (description?: string, referenceId?: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await creditsService.deductCredit(user.id, description, referenceId);
      if (success) {
        // Refresh credits balance
        await fetchCredits();
        return true;
      } else {
        toast.error('Insufficient credits');
        return false;
      }
    } catch (error) {
      console.error('Error deducting credit:', error);
      toast.error('Failed to use credit');
      return false;
    }
  };

  // Add credits (for purchases)
  const addCredits = async (creditAmount: number, description: string, referenceId?: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await creditsService.addCredits(user.id, creditAmount, description, referenceId);
      await fetchCredits();
      toast.success(`${creditAmount} credits added to your account!`);
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  // Update transaction reference (link jump ID to credit usage)
  const updateTransactionReference = async (oldReferenceId: string, newReferenceId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await creditsService.updateTransactionReference(user.id, oldReferenceId, newReferenceId);
    } catch (error) {
      console.error('Error updating transaction reference:', error);
    }
  };

  // Initialize credits for new users
  const initializeCredits = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      await creditsService.initializeUserCredits(user.id);
      await fetchCredits();
    } catch (error) {
      console.error('Error initializing credits:', error);
    }
  };

  // Fetch credits when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [isAuthenticated, user?.id]);

  return {
    credits,
    isLoading,
    hasCredits,
    deductCredit,
    addCredits,
    fetchCredits,
    initializeCredits,
    updateTransactionReference,
    creditsBalance: credits?.credits_balance || 0
  };
};