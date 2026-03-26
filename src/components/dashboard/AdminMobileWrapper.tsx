import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminMobileWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that provides mobile-specific classes and context
 * for the admin dashboard
 */
export function AdminMobileWrapper({ children }: AdminMobileWrapperProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`
      min-h-screen 
      bg-gradient-to-br from-background via-background to-muted/20
      ${isMobile ? 'px-2 py-3' : 'px-6 py-6'}
    `}>
      {children}
    </div>
  );
}
