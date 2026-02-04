import React from 'react';
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
    if (isComplete && jumpName) return jumpName;
    if (jumpName && jumpName !== 'Generating Jump...') return jumpName;
    return null;
  }, [isComplete, jumpName]);

  return (
    <div className="relative group">
      {/* Ambient glow effect */}
      <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-50 transition-all duration-700 ${
        isComplete 
          ? 'bg-gradient-to-r from-emerald-500/40 via-green-400/30 to-emerald-500/40' 
          : 'bg-gradient-to-r from-blue-500/30 via-primary/20 to-blue-500/30 animate-pulse'
      }`} />
      
      {/* Main card */}
      <div className={`relative backdrop-blur-2xl border rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
        isComplete 
          ? 'bg-gradient-to-br from-emerald-500/10 via-background to-green-500/5 border-emerald-500/30' 
          : 'bg-gradient-to-br from-blue-500/10 via-background to-primary/5 border-blue-500/30'
      }`}>
        {/* Top gradient line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isComplete 
            ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse'
        }`} />
        
        <div className="relative p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-md animate-pulse ${
                  isComplete ? 'bg-emerald-500/40' : 'bg-blue-500/40'
                }`} />
                <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${
                  isComplete 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Zap className="w-5 h-5 text-white animate-pulse" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-bold text-base sm:text-lg leading-tight truncate ${
                  isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {isComplete ? 'Generation Complete!' : displayTitle || 'Generating Your Jump...'}
                </h3>
                {displayTitle && !isComplete && (
                  <p className="text-sm text-muted-foreground/80 truncate mt-0.5 font-medium">
                    {displayTitle}
                  </p>
                )}
                {isComplete && displayTitle && (
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 truncate mt-0.5 font-medium">
                    {displayTitle}
                  </p>
                )}
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-sm font-mono shrink-0 backdrop-blur border shadow-lg ${
                isComplete 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
              }`}
            >
              <Timer className="w-3.5 h-3.5 mr-1.5" />
              {formatTime(timer)}
            </Badge>
          </div>

          {/* Step status chips */}
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
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10'
                      : state === 'active'
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-blue-500/10 animate-pulse'
                        : 'bg-muted/30 border-border/40 text-muted-foreground/60'}
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
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium truncate pr-2">
                {status.currentTask || 'Starting...'}
              </span>
              <span className={`font-bold shrink-0 ${
                isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {status.progress || 0}%
              </span>
            </div>
            
            {/* Enhanced progress bar */}
            <div className={`relative h-3 rounded-full overflow-hidden shadow-inner border ${
              isComplete 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-blue-500/10 border-blue-500/20'
            }`}>
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${status.progress || 0}%`,
                  background: isComplete 
                    ? 'linear-gradient(90deg, #10b981, #22c55e, #10b981)'
                    : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
                  backgroundSize: '200% 100%',
                  animation: isComplete ? 'none' : 'shimmer 2s linear infinite',
                }}
              />
              {/* Barberpole overlay for active state */}
              {!isComplete && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)',
                    animation: 'barberpole 1s linear infinite',
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Completion message */}
          {isComplete && (
            <div className="flex items-center justify-center gap-2 pt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30">
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
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
};

export default GenerationProgressCard;
