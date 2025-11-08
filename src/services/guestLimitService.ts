import { supabase } from '@/integrations/supabase/client';

interface GuestUsage {
  ip_address: string;
  usage_count: number;
  first_used_at: string;
  last_used_at: string;
}

export const guestLimitService = {
  // STRICT ENFORCEMENT: Check if guest has remaining usage (3 TRIES LIFETIME - NO RESET)
  async checkGuestLimit(): Promise<{ canUse: boolean; usageCount: number }> {
    try {
      // Get client IP through edge function for robust tracking
      const { data: ipData } = await supabase.functions.invoke('get-client-ip');
      const clientIP = ipData?.ip || 'unknown';
      
      // Multiple tracking methods for strict enforcement
      const trackingKeys = [
        `jumpinai_guest_usage_${clientIP}`,
        `jumpinai_guest_usage_${navigator.userAgent.slice(0, 50)}`, // Browser fingerprint
        'jumpinai_guest_usage_fallback'
      ];
      
      let maxUsageCount = 0;
      
      // Check all tracking methods - track the highest usage count (PERMANENT - NO DATE CHECK)
      for (const key of trackingKeys) {
        const localUsage = localStorage.getItem(key);
        if (localUsage) {
          try {
            const usage = JSON.parse(localUsage);
            const count = usage.count || 0;
            maxUsageCount = Math.max(maxUsageCount, count);
            if (count >= 3) {
              return { canUse: false, usageCount: count };
            }
          } catch (parseError) {
            // Invalid data, continue checking other keys
            continue;
          }
        }
      }
      
      // Additional check: session storage for extra security (count up to 3)
      const sessionKey = 'jumpinai_session_count';
      const sessionCount = sessionStorage.getItem(sessionKey);
      if (sessionCount) {
        const count = parseInt(sessionCount, 10);
        maxUsageCount = Math.max(maxUsageCount, count);
        if (count >= 3) {
          return { canUse: false, usageCount: count };
        }
      }
      
      return { canUse: true, usageCount: maxUsageCount };
    } catch (error) {
      console.error('Error checking guest limit:', error);
      
      // Fallback: still enforce strict limit using localStorage only
      const fallbackUsage = localStorage.getItem('jumpinai_guest_usage_fallback');
      if (fallbackUsage) {
        try {
          const usage = JSON.parse(fallbackUsage);
          const count = usage.count || 0;
          if (count >= 3) {
            return { canUse: false, usageCount: count };
          }
          return { canUse: true, usageCount: count };
        } catch (parseError) {
          // Corrupted data, allow usage but will be tracked on next attempt
        }
      }
      
      return { canUse: true, usageCount: 0 };
    }
  },

  // STRICT ENFORCEMENT: Record guest usage across multiple tracking methods (PERMANENT COUNT)
  async recordGuestUsage(): Promise<void> {
    try {
      // Get client IP for robust tracking
      const { data: ipData } = await supabase.functions.invoke('get-client-ip');
      const clientIP = ipData?.ip || 'unknown';
      
      // Update multiple tracking methods for strict enforcement
      const trackingMethods = [
        { key: `jumpinai_guest_usage_${clientIP}`, storage: localStorage },
        { key: `jumpinai_guest_usage_${navigator.userAgent.slice(0, 50)}`, storage: localStorage },
        { key: 'jumpinai_guest_usage_fallback', storage: localStorage }
      ];
      
      // Record usage in all tracking methods (PERMANENT - NO DATE RESET)
      for (const method of trackingMethods) {
        try {
          const currentUsage = method.storage.getItem(method.key);
          if (currentUsage) {
            const usage = JSON.parse(currentUsage);
            usage.count = (usage.count || 0) + 1;
            method.storage.setItem(method.key, JSON.stringify(usage));
          } else {
            method.storage.setItem(method.key, JSON.stringify({ count: 1 }));
          }
        } catch (error) {
          console.error(`Error updating tracking method ${method.key}:`, error);
        }
      }
      
      // Update session count for immediate enforcement
      const currentSessionCount = sessionStorage.getItem('jumpinai_session_count');
      const newCount = currentSessionCount ? parseInt(currentSessionCount, 10) + 1 : 1;
      sessionStorage.setItem('jumpinai_session_count', newCount.toString());
      
      console.log('Guest usage recorded permanently across all tracking methods');
      
    } catch (error) {
      console.error('Error recording guest usage:', error);
      
      // Fallback: still record in localStorage
      try {
        const fallbackKey = 'jumpinai_guest_usage_fallback';
        const currentUsage = localStorage.getItem(fallbackKey);
        if (currentUsage) {
          const usage = JSON.parse(currentUsage);
          usage.count = (usage.count || 0) + 1;
          localStorage.setItem(fallbackKey, JSON.stringify(usage));
        } else {
          localStorage.setItem(fallbackKey, JSON.stringify({ count: 1 }));
        }
        const currentSessionCount = sessionStorage.getItem('jumpinai_session_count');
        const newCount = currentSessionCount ? parseInt(currentSessionCount, 10) + 1 : 1;
        sessionStorage.setItem('jumpinai_session_count', newCount.toString());
      } catch (fallbackError) {
        console.error('Error in fallback usage recording:', fallbackError);
      }
    }
  }
};