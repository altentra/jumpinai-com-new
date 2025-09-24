import { supabase } from '@/integrations/supabase/client';

interface GuestUsage {
  ip_address: string;
  usage_count: number;
  first_used_at: string;
  last_used_at: string;
}

export const guestLimitService = {
  // Check if guest has remaining usage
  async checkGuestLimit(): Promise<{ canUse: boolean; usageCount: number }> {
    try {
      // Get client IP through edge function
      const { data: ipData } = await supabase.functions.invoke('get-client-ip');
      const clientIP = ipData?.ip || 'unknown';
      
      // Check current usage from localStorage for immediate feedback
      const localKey = `jumpinai_guest_usage_${clientIP}`;
      const localUsage = localStorage.getItem(localKey);
      
      if (localUsage) {
        const usage = JSON.parse(localUsage);
        const today = new Date().toDateString();
        
        if (usage.date === today && usage.count >= 1) {
          return { canUse: false, usageCount: usage.count };
        }
      }
      
      return { canUse: true, usageCount: 0 };
    } catch (error) {
      console.error('Error checking guest limit:', error);
      // Fallback to localStorage only
      const localKey = 'jumpinai_guest_usage_fallback';
      const localUsage = localStorage.getItem(localKey);
      
      if (localUsage) {
        const usage = JSON.parse(localUsage);
        const today = new Date().toDateString();
        
        if (usage.date === today && usage.count >= 1) {
          return { canUse: false, usageCount: usage.count };
        }
      }
      
      return { canUse: true, usageCount: 0 };
    }
  },

  // Record guest usage
  async recordGuestUsage(): Promise<void> {
    try {
      // Get client IP
      const { data: ipData } = await supabase.functions.invoke('get-client-ip');
      const clientIP = ipData?.ip || 'unknown';
      
      // Update localStorage
      const localKey = `jumpinai_guest_usage_${clientIP}`;
      const today = new Date().toDateString();
      const currentUsage = localStorage.getItem(localKey);
      
      if (currentUsage) {
        const usage = JSON.parse(currentUsage);
        if (usage.date === today) {
          usage.count += 1;
          localStorage.setItem(localKey, JSON.stringify(usage));
        } else {
          localStorage.setItem(localKey, JSON.stringify({ date: today, count: 1 }));
        }
      } else {
        localStorage.setItem(localKey, JSON.stringify({ date: today, count: 1 }));
      }
      
      // Also update fallback
      const fallbackKey = 'jumpinai_guest_usage_fallback';
      const currentFallback = localStorage.getItem(fallbackKey);
      
      if (currentFallback) {
        const usage = JSON.parse(currentFallback);
        if (usage.date === today) {
          usage.count += 1;
          localStorage.setItem(fallbackKey, JSON.stringify(usage));
        } else {
          localStorage.setItem(fallbackKey, JSON.stringify({ date: today, count: 1 }));
        }
      } else {
        localStorage.setItem(fallbackKey, JSON.stringify({ date: today, count: 1 }));
      }
      
    } catch (error) {
      console.error('Error recording guest usage:', error);
    }
  }
};