import { supabase } from '@/integrations/supabase/client';

export interface UserCredits {
  id: string;
  user_id: string;
  credits_balance: number;
  total_credits_purchased: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'usage' | 'welcome_bonus';
  credits_amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  stripe_price_id: string | null;
  active: boolean;
}

export const creditsService = {
  // Get user's current credits balance
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      return null;
    }
  },

  // Check if user has sufficient credits
  async hasCredits(userId: string): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    return credits ? credits.credits_balance > 0 : false;
  },

  // Deduct a credit from user's balance
  async deductCredit(userId: string, description: string = 'JumpinAI Studio generation', referenceId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('deduct_user_credit', {
        p_user_id: userId,
        p_description: description,
        p_reference_id: referenceId || null
      });

      if (error) {
        console.error('Error deducting credit:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      return false;
    }
  },

  // Add credits to user's balance (for purchases)
  async addCredits(userId: string, credits: number, description: string, referenceId?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_credits: credits,
        p_description: description,
        p_reference_id: referenceId || null
      });

      if (error) {
        console.error('Error adding credits:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  },

  // Get user's credit transactions history
  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Type assertion since we know the database constraint ensures valid transaction types
      return (data || []) as CreditTransaction[];
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }
  },

  // Get available credit packages
  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('active', true)
        .order('credits', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      return [];
    }
  },

  // Initialize credits for new user (called by trigger, but can be called manually if needed)
  async initializeUserCredits(userId: string): Promise<void> {
    try {
      // Check if user already has credits
      const existingCredits = await this.getUserCredits(userId);
      if (existingCredits) {
        return; // Already initialized
      }

      // Create credits record with 5 welcome credits
      const { error: creditsError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          credits_balance: 5,
          total_credits_purchased: 0
        });

      if (creditsError) {
        throw creditsError;
      }

      // Log welcome bonus transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'welcome_bonus',
          credits_amount: 5,
          description: 'Welcome bonus credits'
        });

      if (transactionError) {
        throw transactionError;
      }

      console.log('Initialized 5 welcome credits for user:', userId);
    } catch (error) {
      console.error('Error initializing user credits:', error);
      throw error;
    }
  }
};