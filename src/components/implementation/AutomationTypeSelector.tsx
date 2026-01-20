import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Workflow, 
  Bot, 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Lightbulb,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type AutomationType = "workflow" | "ai-agent";

interface AutomationTypeSelectorProps {
  value: AutomationType;
  onChange: (type: AutomationType) => void;
  disabled?: boolean;
}

interface AutomationOption {
  id: AutomationType;
  name: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  characteristics: { icon: React.ElementType; text: string }[];
  bestFor: string;
  complexity: string;
  credits: number;
  color: string;
  borderColor: string;
  hoverBorder: string;
  selectedBg: string;
  accentColor: string;
}

const automationOptions: AutomationOption[] = [
  {
    id: "workflow",
    name: "Workflow",
    tagline: "Simple Task Automation",
    description: "A linear sequence of steps that executes the same way every time. Perfect for repetitive tasks with predictable inputs and outputs.",
    icon: <Workflow className="w-6 h-6" />,
    characteristics: [
      { icon: Zap, text: "Fast & Lightweight" },
      { icon: ArrowRight, text: "Linear execution" },
      { icon: Clock, text: "Quick to set up" },
    ],
    bestFor: "Repetitive tasks, data transfers, scheduled automations, simple integrations",
    complexity: "Simple",
    credits: 1,
    color: "text-blue-500",
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/50",
    selectedBg: "from-blue-500/15 via-blue-500/10 to-blue-500/5",
    accentColor: "bg-blue-500",
  },
  {
    id: "ai-agent",
    name: "AI Agent",
    tagline: "Autonomous Decision-Making",
    description: "An intelligent system that analyzes, decides, and adapts. It can reason through problems, handle exceptions, and improve over time.",
    icon: <Brain className="w-6 h-6" />,
    characteristics: [
      { icon: Brain, text: "Reasoning & Analysis" },
      { icon: RefreshCw, text: "Adaptive behavior" },
      { icon: MessageSquare, text: "Natural language" },
    ],
    bestFor: "Complex decisions, dynamic situations, content creation, customer interactions",
    complexity: "Advanced",
    credits: 2,
    color: "text-yellow-500",
    borderColor: "border-yellow-500/30",
    hoverBorder: "hover:border-yellow-500/50",
    selectedBg: "from-yellow-500/15 via-yellow-500/10 to-yellow-500/5",
    accentColor: "bg-yellow-500",
  },
];

export function AutomationTypeSelector({ value, onChange, disabled }: AutomationTypeSelectorProps) {
  const [hoveredOption, setHoveredOption] = useState<AutomationType | null>(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            What do you want to build?
          </span>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automationOptions.map((option) => {
          const isSelected = value === option.id;
          const isHovered = hoveredOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => !disabled && onChange(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={disabled}
              className={cn(
                "relative w-full text-left p-5 rounded-2xl transition-all duration-300",
                "border-2 bg-gradient-to-br",
                isSelected
                  ? `${option.borderColor.replace('/30', '')} ${option.selectedBg}`
                  : `border-border/50 from-background to-muted/20 ${option.hoverBorder}`,
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "cursor-pointer",
                isHovered && !isSelected && "shadow-lg transform -translate-y-0.5"
              )}
            >
              {/* Selection Indicator */}
              <div className={cn(
                "absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                isSelected 
                  ? `${option.borderColor.replace('/30', '')} ${option.accentColor}`
                  : "border-muted-foreground/30"
              )}>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  isSelected ? `${option.accentColor}/20` : "bg-muted/50",
                  isSelected && option.color
                )}>
                  <div className={isSelected ? option.color : "text-muted-foreground"}>
                    {option.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "text-lg font-bold transition-colors",
                      isSelected ? option.color : "text-foreground"
                    )}>
                      {option.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0",
                        isSelected && option.color
                      )}
                    >
                      {option.credits} credit{option.credits > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    isSelected ? option.color : "text-muted-foreground"
                  )}>
                    {option.tagline}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {option.description}
              </p>

              {/* Characteristics */}
              <div className="flex flex-wrap gap-2 mb-4">
                {option.characteristics.map((char, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-medium gap-1.5 py-1",
                      isSelected && "bg-background/60"
                    )}
                  >
                    <char.icon className="w-3 h-3" />
                    {char.text}
                  </Badge>
                ))}
              </div>

              {/* Best For */}
              <div className={cn(
                "p-3 rounded-xl text-xs",
                isSelected ? "bg-background/50" : "bg-muted/30"
              )}>
                <span className="font-semibold text-muted-foreground">Best for: </span>
                <span className="text-foreground">{option.bestFor}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison Hint */}
      <div className={cn(
        "p-4 rounded-xl border border-border/50",
        "bg-gradient-to-r from-muted/30 via-transparent to-muted/30"
      )}>
        <div className="flex items-start gap-3">
          <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-foreground">Not sure which to choose? </span>
            <span className="text-muted-foreground">
              Start with a <span className="text-blue-500 font-medium">Workflow</span> for simple, 
              predictable tasks. Choose an <span className="text-yellow-500 font-medium">AI Agent</span> when 
              you need intelligent decision-making and the ability to handle exceptions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
