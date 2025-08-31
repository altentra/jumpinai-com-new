import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Memoized Button to prevent unnecessary re-renders
export const MemoizedButton = React.memo(Button);
MemoizedButton.displayName = 'MemoizedButton';

// Memoized Badge to prevent unnecessary re-renders
export const MemoizedBadge = React.memo(Badge);
MemoizedBadge.displayName = 'MemoizedBadge';

// Generic memoized card wrapper
export const MemoizedCard = React.memo(({ children, className, onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div className={className} onClick={onClick}>
    {children}
  </div>
));
MemoizedCard.displayName = 'MemoizedCard';