import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 dark:from-gray-500 dark:via-gray-400 dark:to-gray-300 transition-all duration-500 ease-out relative overflow-hidden shadow-lg"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        boxShadow: '0 0 15px rgba(107, 114, 128, 0.4)'
      }}
    >
      {/* Animated shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s ease-in-out infinite'
        }}
      />
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 via-gray-200/30 to-gray-300/20 blur-sm" />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
