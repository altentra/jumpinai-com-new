/**
 * Triggers haptic feedback on mobile devices
 * Note: iOS Safari doesn't support the Vibration API
 * Only works on Android browsers and some desktop browsers
 */
export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  console.log('🔔 Haptic feedback triggered:', style);
  
  // Check if device supports haptic feedback
  if ('vibrate' in navigator) {
    // Map styles to vibration durations (in milliseconds)
    // Increased durations for more noticeable feedback
    const vibrationMap = {
      light: 20,
      medium: 50,
      heavy: 100
    };
    
    const duration = vibrationMap[style];
    const success = navigator.vibrate(duration);
    
    console.log(`✅ Vibration API called (${duration}ms):`, success);
    return success;
  } else {
    console.warn('⚠️ Vibration API not supported on this device/browser');
    return false;
  }
};
