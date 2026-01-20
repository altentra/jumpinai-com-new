import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Workflow, Sparkles, Code2, Users, Zap, Scale } from "lucide-react";

export type Platform = "n8n" | "make" | "both";

interface PlatformSelectorProps {
  value: Platform;
  onChange: (platform: Platform) => void;
  disabled?: boolean;
}

interface PlatformOption {
  id: Platform;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  bestFor: string;
  features: { icon: typeof Code2; text: string }[];
  color: string;
  borderColor: string;
  hoverBorder: string;
  selectedBg: string;
}

const platformOptions: PlatformOption[] = [
  {
    id: "n8n",
    name: "n8n",
    logo: "⚡",
    tagline: "Developer-Friendly Automation",
    description: "Self-hostable, code-extensible workflow automation with maximum flexibility and control.",
    bestFor: "Technical users, developers & teams seeking full customization",
    features: [
      { icon: Code2, text: "Custom code nodes" },
      { icon: Scale, text: "Cost-effective at scale" },
      { icon: Workflow, text: "400+ integrations" },
    ],
    color: "text-orange-500",
    borderColor: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500/50",
    selectedBg: "from-orange-500/15 via-orange-500/10 to-orange-500/5",
  },
  {
    id: "make",
    name: "Make",
    logo: "🔮",
    tagline: "Visual Automation Made Simple",
    description: "Intuitive visual builder with powerful features, no coding required.",
    bestFor: "Non-technical users & teams wanting quick implementation",
    features: [
      { icon: Users, text: "No-code friendly" },
      { icon: Sparkles, text: "Beautiful interface" },
      { icon: Zap, text: "1,500+ integrations" },
    ],
    color: "text-violet-500",
    borderColor: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500/50",
    selectedBg: "from-violet-500/15 via-violet-500/10 to-violet-500/5",
  },
];

export function PlatformSelector({ value, onChange, disabled }: PlatformSelectorProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<Platform | null>(null);

  const isSelected = (id: Platform) => value === id || value === "both";
  const isBothSelected = value === "both";

  const handleSelect = (id: Platform) => {
    if (disabled) return;
    
    if (value === id) {
      // Deselecting current - default to other
      onChange(id === "n8n" ? "make" : "n8n");
    } else if (value === "both") {
      // If both selected, clicking one deselects it
      onChange(id === "n8n" ? "make" : "n8n");
    } else {
      // Single selection - check if we should enable "both"
      onChange(id);
    }
  };

  const handleBothToggle = () => {
    if (disabled) return;
    onChange(value === "both" ? "n8n" : "both");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Workflow className="w-4 h-4 text-primary" />
            Choose Your Automation Platform
          </h3>
          <p className="text-xs text-muted-foreground">
            Select where you'll run your automated workflow
          </p>
        </div>
        
        {/* Both Button */}
        <button
          onClick={handleBothToggle}
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300",
            "border backdrop-blur-sm",
            isBothSelected
              ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 text-primary shadow-lg shadow-primary/10"
              : "bg-background/50 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all",
            isBothSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
          )}>
            {isBothSelected && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          Generate Both
        </button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {platformOptions.map((platform) => {
          const selected = isSelected(platform.id);
          const hovered = hoveredPlatform === platform.id;
          
          return (
            <button
              key={platform.id}
              onClick={() => handleSelect(platform.id)}
              onMouseEnter={() => setHoveredPlatform(platform.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
              disabled={disabled}
              className={cn(
                "relative group text-left p-4 rounded-2xl transition-all duration-300",
                "border backdrop-blur-xl overflow-hidden",
                selected
                  ? cn("bg-gradient-to-br", platform.selectedBg, platform.borderColor, "shadow-lg")
                  : cn("bg-background/50", "border-border/50", platform.hoverBorder),
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                selected 
                  ? cn(platform.color.replace('text-', 'border-').replace('500', '400'), platform.color.replace('text-', 'bg-'))
                  : "border-muted-foreground/30"
              )}>
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>
              
              {/* Shimmer effect on hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent",
                "transition-transform duration-700",
                hovered ? "translate-x-full" : "-translate-x-full"
              )} />
              
              {/* Content */}
              <div className="relative space-y-3">
                {/* Logo & Name */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                    "bg-gradient-to-br from-background/80 to-muted/50",
                    "border border-border/50 shadow-sm"
                  )}>
                    {platform.logo}
                  </div>
                  <div>
                    <h4 className={cn("font-bold", selected ? platform.color : "text-foreground")}>
                      {platform.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{platform.tagline}</p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {platform.description}
                </p>
                
                {/* Best For */}
                <div className={cn(
                  "text-xs font-medium px-2.5 py-1.5 rounded-lg inline-block",
                  selected 
                    ? cn(platform.color.replace('text-', 'bg-').replace('500', '500/20'), platform.color)
                    : "bg-muted/50 text-muted-foreground"
                )}>
                  <Users className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                  {platform.bestFor}
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {platform.features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
                        "bg-background/60 border border-border/30"
                      )}
                    >
                      <feature.icon className={cn("w-3 h-3", selected ? platform.color : "text-muted-foreground")} />
                      <span className="text-muted-foreground">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center px-4">
        {value === "both" 
          ? "You'll receive both n8n and Make.com workflows with platform-specific instructions."
          : value === "n8n"
            ? "Perfect for developers who want full control and self-hosting capabilities."
            : "Ideal for quick setup with an intuitive visual interface."}
      </p>
    </div>
  );
}
