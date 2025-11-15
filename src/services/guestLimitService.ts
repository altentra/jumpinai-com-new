import { supabase } from '@/integrations/supabase/client';

interface GuestUsage {
  ip_address: string;
  usage_count: number;
  first_used_at: string;
  last_used_at: string;
}

export const guestLimitService = {
  // SERVER-SIDE ONLY: No client-side checking anymore - all enforcement happens on server
  async checkGuestLimit(): Promise<{ canUse: boolean; usageCount: number }> {
    // Always return true - server will enforce the limit
    // This function is kept for backward compatibility but does nothing
    console.log('✅ Client-side guest limit check bypassed - server-side enforcement active');
    return { canUse: true, usageCount: 0 };
  },

  // NO-OP: Server records usage automatically via check_and_record_guest_usage RPC
  async recordGuestUsage(): Promise<void> {
    // Server handles this automatically in the edge function
    // This function is kept for backward compatibility but does nothing
    console.log('✅ Guest usage recording handled by server');
  },

  // ADMIN FUNCTION: Clear all guest limit tracking (localStorage + sessionStorage)
  clearAllGuestLimits(): void {
    try {
      // Clear all localStorage keys related to guest usage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('jumpinai_guest_usage_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage
      sessionStorage.removeItem('jumpinai_session_count');
      
      console.log('All guest limit tracking cleared from browser storage');
    } catch (error) {
      console.error('Error clearing guest limits:', error);
    }
  }
};