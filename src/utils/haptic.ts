/**
 * Triggers haptic feedback on mobile devices
 * Falls back gracefully on desktop/unsupported devices
 */
export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  // Check if device supports haptic feedback
  if ('vibrate' in navigator) {
    // Map styles to vibration durations (in milliseconds)
    const vibrationMap = {
      light: 10,
      medium: 20,
      heavy: 40
    };
    
    navigator.vibrate(vibrationMap[style]);
  }
};
