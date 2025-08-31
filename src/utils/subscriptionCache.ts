// Subscription cache utility for improved performance
interface CachedSubscription {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
  timestamp: number;
}

const CACHE_KEY = 'jumpinai_subscription_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const subscriptionCache = {
  get(): CachedSubscription | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedSubscription = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  },

  set(subscription: { subscribed: boolean; subscription_tier?: string | null; subscription_end?: string | null }) {
    try {
      const cacheData: CachedSubscription = {
        ...subscription,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Ignore cache errors
    }
  },

  clear() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore cache errors
    }
  }
};