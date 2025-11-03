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
      "relative h-4 w-full overflow-hidden rounded-full bg-muted/30 border border-border/50 shadow-inner",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
      style={{ 
        width: `${value || 0}%`,
        background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, hsl(var(--primary) / 0.7) 50%, hsl(var(--primary)) 60%, hsl(var(--primary)) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s ease-in-out infinite'
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
