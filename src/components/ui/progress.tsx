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
      className="h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden animate-shimmer"
      style={{ 
        width: `${value || 0}%`,
        background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 25%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.6) 75%, hsl(var(--primary)) 100%)',
        backgroundSize: '200% 100%'
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
