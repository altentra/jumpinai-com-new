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
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary/50 border border-border/40",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all duration-700 ease-out relative overflow-hidden"
      style={{ 
        transform: `translateX(-${100 - (value || 0)})%`,
        background: 'linear-gradient(90deg, hsl(var(--muted-foreground) / 0.4) 0%, hsl(var(--muted-foreground) / 0.6) 50%, hsl(var(--muted-foreground) / 0.8) 100%)',
        boxShadow: '0 0 20px hsl(var(--muted-foreground) / 0.3), inset 0 1px 2px hsl(var(--foreground) / 0.1)'
      }}
    >
      {/* Animated shimmer effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--background) / 0.4) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s ease-in-out infinite'
        }}
      />
      {/* Inner highlight for depth */}
      <div 
        className="absolute top-0 left-0 right-0 h-[40%]"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background) / 0.3) 0%, transparent 100%)',
        }}
      />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
