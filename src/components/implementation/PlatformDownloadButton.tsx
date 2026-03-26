import { Download, Brain, Workflow, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformDownloadButtonProps {
  platform: "n8n" | "make";
  automationType?: "workflow" | "ai-agent" | string;
  onClick: () => void;
  className?: string;
}

export function PlatformDownloadButton({
  platform,
  automationType,
  onClick,
  className,
}: PlatformDownloadButtonProps) {
  const isN8n = platform === "n8n";
  
  // Standardized terminology:
  // - "workflow" = Workflow (Blue)
  // - "ai-agent" = AI Agent (Yellow)
  // - undefined/unknown = Automation (Green)
  const isAIAgent = automationType === "ai-agent";
  const isWorkflow = automationType === "workflow";
  const isUnknown = !isAIAgent && !isWorkflow;
  
  // Build dynamic label
  const platformLabel = isN8n ? "n8n" : "Make.com";
  const typeLabel = isAIAgent ? "AI Agent" : isWorkflow ? "Workflow" : "Automation";
  
  // Icon based on type
  const IconComponent = isAIAgent ? Brain : isWorkflow ? Workflow : Bot;
  
  // Color based on type
  const getIconColor = () => {
    if (isAIAgent) return "text-yellow-500";
    if (isWorkflow) return "text-blue-500";
    return "text-green-500"; // Automation
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("relative group w-full overflow-hidden", className)}
    >
      {/* Subtle platform glow */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-3xl blur-md opacity-0 group-hover:opacity-60 transition duration-500",
          isN8n ? "bg-amber-500/20" : "bg-violet-500/20"
        )}
      />

      {/* Button body (same structure as 'View Full Instructions') */}
      <div
        className={cn(
          "relative flex items-center justify-center gap-2.5 px-6 py-3",
          "bg-gradient-to-br from-background/80 via-muted/30 to-background/80",
          "backdrop-blur-xl rounded-3xl",
          "border border-border/60 transition-all duration-300",
          "group-hover:border-primary/35",
          isN8n
            ? "shadow-lg shadow-amber-500/20"
            : "shadow-lg shadow-violet-500/20"
        )}
      >
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl" />

        {/* Platform indicator dot */}
        <span
          className={cn(
            "relative w-2 h-2 rounded-full shrink-0",
            isN8n ? "bg-amber-500" : "bg-violet-500"
          )}
        />
        
        {/* Type icon */}
        <IconComponent className={cn(
          "relative w-4 h-4 shrink-0",
          getIconColor()
        )} />
        
        <Download className="relative w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        
        <span className="relative font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Download {platformLabel} {typeLabel}
        </span>
      </div>
    </button>
  );
}
