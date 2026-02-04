import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2, CheckCircle, Sparkles, FileText, ListChecks, Wrench, Timer, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProcessingStatus } from '@/hooks/useProgressiveGeneration';

interface GenerationStep {
  id: string;
  label: string;
  icon: React.ElementType;
}

const GENERATION_STEPS: GenerationStep[] = [
  { id: 'naming', label: 'Name', icon: Sparkles },
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'plan', label: 'Plan', icon: ListChecks },
  { id: 'tool_prompts', label: 'Tools', icon: Wrench },
];

interface GenerationProgressCardProps {
  status: ProcessingStatus;
  timer: number;
  jumpName?: string;
  stepTimes?: { [key: string]: number };
}

const formatTime = (seconds: number): string => {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  return `${seconds}s`;
};

export const GenerationProgressCard: React.FC<GenerationProgressCardProps> = ({
  status,
  timer,
  jumpName,
  stepTimes = {}
}) => {
  const currentStep = status.currentStep || 'naming';
  const isComplete = status.isComplete;
  
  // Smooth animated progress that continuously interpolates toward target
  const [displayProgress, setDisplayProgress] = useState(0);
  const animationRef = useRef<number>();
  const targetProgress = status.progress || 0;
  
  // Micro-progress for continuous streaming feel
  const [microProgress, setMicroProgress] = useState(0);
  
  useEffect(() => {
    // Smoothly animate progress bar with easing
    const animate = () => {
      setDisplayProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.3) return targetProgress;
        
        // Dynamic speed: faster when far behind, slower when close
        const speed = Math.max(0.5, Math.min(3, Math.abs(diff) / 8));
        return prev + diff * 0.06 * speed;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetProgress]);
  
  // Micro-streaming animation within each step
  useEffect(() => {
    if (isComplete) {
      setMicroProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      setMicroProgress(prev => {
        // Subtle incremental progress that creates streaming feel
        const next = prev + 0.12;
        return next > 6 ? 0 : next;
      });
    }, 80);
    
    return () => clearInterval(interval);
  }, [isComplete, currentStep]);
  
  // Reset micro progress when actual step changes
  useEffect(() => {
    setMicroProgress(0);
  }, [currentStep]);
  
  const getStepState = (stepId: string): 'complete' | 'active' | 'pending' => {
    const stepOrder = ['naming', 'overview', 'plan', 'tool_prompts', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (isComplete || stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  // Get step time, checking both 'plan' and 'comprehensive' keys
  const getStepTime = (stepId: string): number | undefined => {
    if (stepId === 'plan') {
      return stepTimes['plan'] ?? stepTimes['comprehensive'];
    }
    return stepTimes[stepId];
  };

  // Determine display title
  const displayTitle = useMemo(() => {
    if (jumpName && jumpName !== 'Generating Jump...' && jumpName !== 'Generating Your Jump...') {
      return jumpName;
    }
    return null;
  }, [jumpName]);
  
  // Calculate smooth visual progress including micro-progress
  const visualProgress = Math.min(100, displayProgress + (isComplete ? 0 : microProgress * 0.4));

  return (
    <div className="relative group">
      {/* Subtle ambient glow */}
      <div className={`absolute -inset-1.5 rounded-2xl blur-xl transition-all duration-700 ${
        isComplete 
          ? 'bg-emerald-500/15 opacity-60' 
          : 'bg-primary/10 opacity-40'
      }`} />
      
      {/* Main card - premium glassmorphic aesthetic */}
      <div className={`relative backdrop-blur-xl border rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ${
        isComplete 
          ? 'bg-card/95 border-emerald-500/30' 
          : 'bg-card/90 border-border/50'
      }`}>
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-px ${
          isComplete 
            ? 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-primary/40 to-transparent'
        }`} />
        
        <div className="relative p-4 sm:p-5 space-y-4">
          {/* Compact header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Status icon */}
              <div className={`relative shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
                isComplete 
                  ? 'bg-emerald-500/15 border-emerald-500/40' 
                  : 'bg-primary/15 border-primary/40'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Zap className="w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
              
              {/* Title */}
              <h3 className="font-semibold text-sm sm:text-base leading-tight text-foreground truncate">
                {displayTitle || (isComplete ? 'Generation Complete' : 'Generating Your Jump...')}
              </h3>
            </div>
            
            {/* Timer badge */}
            <Badge 
              variant="outline" 
              className="text-xs font-mono shrink-0 bg-muted/50 border-border/60 text-foreground/70 px-2 py-1"
            >
              <Timer className="w-3 h-3 mr-1 text-muted-foreground" />
              {formatTime(timer)}
            </Badge>
          </div>

          {/* Step status chips - color-coded with icons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {GENERATION_STEPS.map((step) => {
              const state = getStepState(step.id);
              const Icon = step.icon;
              const stepTime = getStepTime(step.id);

              return (
                <div
                  key={step.id}
                  className={`
                    inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium
                    transition-all duration-300 shadow-sm
                    ${state === 'complete'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : state === 'active'
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-muted/30 border-border/40 text-muted-foreground/50'}
                  `}
                >
                  {state === 'complete' ? (
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  ) : state === 'active' ? (
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  ) : (
                    <Icon className="w-3 h-3 opacity-40" />
                  )}
                  <span>{step.label}</span>
                  {state === 'complete' && stepTime !== undefined && (
                    <span className="font-mono text-[10px] opacity-70 ml-0.5">{stepTime}s</span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate pr-2">
                {status.currentTask || 'Starting...'}
              </span>
              <span className={`font-semibold shrink-0 tabular-nums ${
                isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
              }`}>
                {Math.round(visualProgress)}%
              </span>
            </div>
            
            {/* Premium smooth progress bar */}
            <div className={`relative h-2 rounded-full overflow-hidden shadow-inner border ${
              isComplete 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-muted/30 border-border/30'
            }`}>
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ease-out"
                style={{ 
                  width: `${visualProgress}%`,
                  background: isComplete 
                    ? 'linear-gradient(90deg, rgb(16, 185, 129), rgb(34, 197, 94), rgb(16, 185, 129))'
                    : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.85), hsl(var(--primary)))',
                  backgroundSize: '200% 100%',
                  animation: isComplete ? 'none' : 'shimmer 2.5s linear infinite',
                }}
              />
              {/* Streaming barberpole effect */}
              {!isComplete && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)',
                    animation: 'barberpole 0.6s linear infinite',
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Completion message */}
          {isComplete && (
            <div className="flex items-center justify-center pt-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Explore your personalized roadmap below
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes barberpole {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
      `}</style>
    </div>
  );
};

export default GenerationProgressCard;
