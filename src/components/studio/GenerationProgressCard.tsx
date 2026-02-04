import React, { useState, useEffect, useRef } from 'react';
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
  
  // Smooth animated progress that interpolates toward target
  const [displayProgress, setDisplayProgress] = useState(0);
  const animationRef = useRef<number>();
  const targetProgress = status.progress || 0;
  
  useEffect(() => {
    // Smoothly animate progress bar
    const animate = () => {
      setDisplayProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) return targetProgress;
        
        // Faster catch-up when far behind, slower when close
        const speed = Math.max(0.3, Math.min(2, Math.abs(diff) / 10));
        return prev + diff * 0.08 * speed;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetProgress]);
  
  // Add micro-progress within each step (smooth continuous feel)
  const [microProgress, setMicroProgress] = useState(0);
  
  useEffect(() => {
    if (isComplete) {
      setMicroProgress(0);
      return;
    }
    
    // Micro-animation within current step
    const interval = setInterval(() => {
      setMicroProgress(prev => {
        // Small incremental progress that resets when real progress updates
        const next = prev + 0.15;
        return next > 8 ? 0 : next;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isComplete, targetProgress]);
  
  // Reset micro progress when actual progress changes
  useEffect(() => {
    setMicroProgress(0);
  }, [targetProgress]);
  
  const getStepState = (stepId: string): 'complete' | 'active' | 'pending' => {
    const stepOrder = ['naming', 'overview', 'plan', 'tool_prompts', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (isComplete || stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  // Determine display title
  const displayTitle = React.useMemo(() => {
    if (jumpName && jumpName !== 'Generating Jump...' && jumpName !== 'Generating Your Jump...') {
      return jumpName;
    }
    return null;
  }, [jumpName]);
  
  // Calculate smooth visual progress including micro-progress
  const visualProgress = Math.min(100, displayProgress + (isComplete ? 0 : microProgress * 0.5));

  return (
    <div className="relative group">
      {/* Subtle ambient glow - white/neutral only */}
      <div className={`absolute -inset-2 rounded-3xl blur-2xl transition-all duration-700 ${
        isComplete 
          ? 'bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-40' 
          : 'bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-30'
      }`} />
      
      {/* Main card - neutral/white premium aesthetic */}
      <div className={`relative backdrop-blur-2xl border rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
        isComplete 
          ? 'bg-gradient-to-br from-background via-background to-muted/20 border-border/60' 
          : 'bg-gradient-to-br from-background via-background to-muted/10 border-border/40'
      }`}>
        {/* Top gradient line - subtle neutral */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
          isComplete 
            ? 'bg-gradient-to-r from-transparent via-foreground/30 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-foreground/20 to-transparent'
        }`} />
        
        <div className="relative p-5 sm:p-6 space-y-4">
          {/* Header - clean minimal */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Status icon - subtle with appropriate color inside only */}
              <div className="relative">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${
                  isComplete 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-primary/10 border-primary/30'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                  )}
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                {/* Title display */}
                <h3 className="font-bold text-base sm:text-lg leading-tight text-foreground">
                  {displayTitle || (isComplete ? 'Generation Complete' : 'Generating Your Jump...')}
                </h3>
                {/* Subtitle when complete */}
                {isComplete && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                    Ready to explore
                  </p>
                )}
              </div>
            </div>
            
            {/* Timer badge - clean neutral */}
            <Badge 
              variant="outline" 
              className="text-sm font-mono shrink-0 backdrop-blur border shadow-sm bg-muted/30 border-border/50 text-foreground/80"
            >
              <Timer className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              {formatTime(timer)}
            </Badge>
          </div>

          {/* Step status chips - improved icons and colors */}
          <div className="flex flex-wrap items-center gap-2">
            {GENERATION_STEPS.map((step) => {
              const state = getStepState(step.id);
              const Icon = step.icon;
              const stepTime = stepTimes[step.id];

              return (
                <div
                  key={step.id}
                  className={`
                    inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold
                    transition-all duration-300 shadow-sm
                    ${state === 'complete'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : state === 'active'
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-muted/40 border-border/40 text-muted-foreground/60'}
                  `}
                >
                  {state === 'complete' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : state === 'active' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 opacity-50" />
                  )}
                  <span>{step.label}</span>
                  {state === 'complete' && stepTime !== undefined && (
                    <span className="font-mono text-[10px] opacity-75">{stepTime}s</span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress bar - smooth continuous animation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium truncate pr-2">
                {status.currentTask || 'Starting...'}
              </span>
              <span className={`font-bold shrink-0 ${
                isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
              }`}>
                {Math.round(visualProgress)}%
              </span>
            </div>
            
            {/* Enhanced smooth progress bar */}
            <div className={`relative h-2.5 rounded-full overflow-hidden shadow-inner border ${
              isComplete 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-muted/40 border-border/30'
            }`}>
              {/* Progress fill with smooth transition */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ 
                  width: `${visualProgress}%`,
                  background: isComplete 
                    ? 'linear-gradient(90deg, #10b981, #22c55e, #10b981)'
                    : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.8), hsl(var(--primary)))',
                  backgroundSize: '200% 100%',
                  transition: 'width 0.3s ease-out',
                  animation: isComplete ? 'none' : 'shimmer 2s linear infinite',
                }}
              />
              {/* Continuous moving barberpole for streaming feel */}
              {!isComplete && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 6px, rgba(255,255,255,0.12) 6px, rgba(255,255,255,0.12) 12px)',
                    animation: 'barberpole 0.8s linear infinite',
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Completion message */}
          {isComplete && (
            <div className="flex items-center justify-center gap-2 pt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
          100% { background-position: 24px 0; }
        }
      `}</style>
    </div>
  );
};

export default GenerationProgressCard;
