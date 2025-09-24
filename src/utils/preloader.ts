// Preloader utility for better performance
export const preloadPage = (pageName: string) => {
  try {
    // Preload pages on demand
    switch (pageName) {
      case 'jumps':
        import('../pages/Jumps');
        break;
      case 'resources':
        import('../pages/Resources');
        break;
      case 'pricing':
        import('../pages/Pricing');
        break;
      case 'dashboard':
        import('../pages/Dashboard');
        break;
      case 'profile':
        import('../pages/Profile');
        break;
      case 'auth':
        import('../pages/Auth');
        break;
      default:
        break;
    }
  } catch (error) {
    // Silently fail if preloading doesn't work
    console.debug('Preloading failed for:', pageName);
  }
};

// Preload critical pages after initial load
export const preloadCriticalPages = () => {
  // Wait for initial page to load, then preload others
  setTimeout(() => {
    preloadPage('auth');
    preloadPage('dashboard');
  }, 2000);
  
  setTimeout(() => {
    preloadPage('jumps');
    preloadPage('resources');
    preloadPage('pricing');
  }, 4000);
};