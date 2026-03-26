// In-memory cache for profile data to prevent unnecessary refetches
interface CachedProfile {
  data: any;
  timestamp: number;
  avatarPreloaded: boolean;
}

const profileCache = new Map<string, CachedProfile>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload image and return promise
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve anyway to not block
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

export const profileCacheService = {
  // Get cached profile or null if expired/not found
  get(username: string): any | null {
    const cached = profileCache.get(username);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      profileCache.delete(username);
      return null;
    }
    
    return cached.data;
  },

  // Set profile in cache and preload avatar
  async set(username: string, profileData: any): Promise<void> {
    const cached: CachedProfile = {
      data: profileData,
      timestamp: Date.now(),
      avatarPreloaded: false
    };
    
    profileCache.set(username, cached);
    
    // Preload avatar in background
    if (profileData?.avatar_url) {
      try {
        await preloadImage(profileData.avatar_url);
        cached.avatarPreloaded = true;
      } catch (error) {
        console.warn('Avatar preload failed:', error);
      }
    }
  },

  // Clear specific profile from cache
  clear(username: string): void {
    profileCache.delete(username);
  },

  // Clear all cached profiles
  clearAll(): void {
    profileCache.clear();
  },

  // Check if profile is cached and fresh
  isFresh(username: string): boolean {
    const cached = profileCache.get(username);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) <= CACHE_DURATION;
  }
};
