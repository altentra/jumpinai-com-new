import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformDownloadButton({
  platform,
  onClick,
  className,
}: {
  platform: "n8n" | "make";
  onClick: () => void;
  className?: string;
}) {
  const isN8n = platform === "n8n";

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
          "relative flex items-center justify-center gap-2 px-6 py-3",
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

        <Download className="relative w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="relative font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Download {isN8n ? "n8n" : "Make.com"} Workflow
        </span>
      </div>
    </button>
  );
}
