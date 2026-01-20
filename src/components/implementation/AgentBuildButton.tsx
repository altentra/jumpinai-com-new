import { useState, useEffect } from "react";
import { Rocket, ArrowRight, Loader2, Sparkles, Zap, Bot, CheckCircle2, Brain, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { AutomationType } from "./AutomationTypeSelector";

interface AgentBuildButtonProps {
  isBuilding: boolean;
  onBuild: () => void;
  disabled?: boolean;
  automationType?: AutomationType;
}

// Estimated phases and their approximate durations in seconds
const WORKFLOW_BUILD_PHASES = [
  { name: "Analyzing automation...", duration: 6, icon: Sparkles },
  { name: "Designing workflow structure...", duration: 10, icon: Workflow },
  { name: "Generating nodes...", duration: 12, icon: Zap },
  { name: "Creating setup instructions...", duration: 8, icon: Rocket },
  { name: "Finalizing workflow...", duration: 4, icon: CheckCircle2 },
];

const AI_AGENT_BUILD_PHASES = [
  { name: "Analyzing decision requirements...", duration: 10, icon: Sparkles },
  { name: "Designing reasoning architecture...", duration: 15, icon: Brain },
  { name: "Building decision nodes...", duration: 18, icon: Bot },
  { name: "Configuring adaptive logic...", duration: 12, icon: Zap },
  { name: "Creating implementation guide...", duration: 10, icon: Rocket },
  { name: "Finalizing AI Agent...", duration: 5, icon: CheckCircle2 },
];

export function AgentBuildButton({ isBuilding, onBuild, disabled, automationType = 'workflow' }: AgentBuildButtonProps) {
  const BUILD_PHASES = automationType === 'ai-agent' ? AI_AGENT_BUILD_PHASES : WORKFLOW_BUILD_PHASES;
  const TOTAL_ESTIMATED_TIME = BUILD_PHASES.reduce((acc, phase) => acc + phase.duration, 0);
  
  const isAIAgent = automationType === 'ai-agent';
  const buttonLabel = isAIAgent ? "Build AI Agent" : "Build Workflow";
  const ButtonIcon = isAIAgent ? Brain : Workflow;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBuilding) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
      setCurrentPhaseIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBuilding]);

  // Calculate current phase based on elapsed time
  useEffect(() => {
    if (!isBuilding) return;
    
    let accumulatedTime = 0;
    for (let i = 0; i < BUILD_PHASES.length; i++) {
      accumulatedTime += BUILD_PHASES[i].duration;
      if (elapsedSeconds < accumulatedTime) {
        setCurrentPhaseIndex(i);
        return;
      }
    }
    // If we've exceeded all phases, stay on last phase
    setCurrentPhaseIndex(BUILD_PHASES.length - 1);
  }, [elapsedSeconds, isBuilding]);

  // Calculate progress percentage (capped at 95% to show completion only when done)
  const progressPercentage = Math.min((elapsedSeconds / TOTAL_ESTIMATED_TIME) * 100, 95);
  
  // Get current phase info
  const currentPhase = BUILD_PHASES[currentPhaseIndex];
  const CurrentIcon = currentPhase?.icon || Loader2;

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isBuilding) {
    return (
      <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Building State Button */}
        <button
          disabled
          className="relative group w-full overflow-hidden cursor-wait"
        >
          {/* Animated pulsing glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-[2rem] blur-lg opacity-60 animate-pulse" />
          
          {/* Button body with gradient */}
          <div className={cn(
            "relative flex flex-col items-center gap-3 px-6 py-5",
            "bg-gradient-to-br from-primary/15 via-accent/10 to-primary/15",
            "backdrop-blur-xl rounded-[2rem]",
            "border border-primary/40",
            "shadow-2xl shadow-primary/20"
          )}>
            {/* Animated shimmer that loops */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-[2rem]" />
            
            {/* Phase info with icon */}
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <CurrentIcon className="h-5 w-5 text-primary animate-pulse" />
                <div className="absolute inset-0 h-5 w-5 bg-primary/30 blur-md rounded-full" />
              </div>
              <span className="text-base font-semibold text-foreground">
                {currentPhase?.name}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-2 bg-background/50 rounded-full overflow-hidden border border-border/30">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Shimmer on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {/* Stats row */}
            <div className="relative flex items-center justify-between w-full text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground font-medium">
                  Phase {currentPhaseIndex + 1} of {BUILD_PHASES.length}
                </span>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono font-bold text-foreground tabular-nums">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Phase indicators */}
            <div className="relative flex items-center gap-1.5 mt-1">
              {BUILD_PHASES.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx < currentPhaseIndex 
                      ? "w-4 bg-primary" 
                      : idx === currentPhaseIndex 
                        ? "w-6 bg-primary animate-pulse" 
                        : "w-3 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </button>

        {/* Estimated time remaining hint */}
        <p className="text-center text-xs text-muted-foreground">
          Estimated time remaining: ~{Math.max(TOTAL_ESTIMATED_TIME - elapsedSeconds, 5)} seconds
        </p>
      </div>
    );
  }

  // Idle State - Premium liquid glass button
  return (
    <div className="p-1"> {/* Padding container to prevent overflow on scale */}
      <button
        onClick={onBuild}
        disabled={disabled}
        className="relative group w-full overflow-visible disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Liquid glass glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/25 to-primary/30 rounded-[2rem] blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
        
        {/* Button body */}
        <div className={cn(
          "relative flex items-center justify-center gap-3 px-8 py-4",
          "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10",
          "backdrop-blur-xl rounded-[2rem]",
          "border border-primary/30 group-hover:border-primary/50",
          "shadow-xl shadow-primary/10 group-hover:shadow-2xl group-hover:shadow-primary/20",
          "transition-all duration-300 ease-out",
          "group-hover:scale-[1.015]"
        )}>
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-[2rem]" />
        
        {/* Content */}
        <div className={cn(
          "relative p-2 rounded-xl transition-colors",
          isAIAgent ? "bg-yellow-500/10 group-hover:bg-yellow-500/20" : "bg-blue-500/10 group-hover:bg-blue-500/20"
        )}>
          <ButtonIcon className={cn(
            "h-5 w-5 transition-colors",
            isAIAgent ? "text-yellow-500" : "text-blue-500"
          )} />
        </div>
        <span className="relative text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
          {buttonLabel}
        </span>
        <ArrowRight className="relative h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </button>
  </div>
  );
}
