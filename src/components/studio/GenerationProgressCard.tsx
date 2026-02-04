import React from 'react';
import { Loader2, CheckCircle, Sparkles, FileText, ListChecks, Wrench, Timer, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProcessingStatus } from '@/hooks/useProgressiveGeneration';

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const GENERATION_STEPS: GenerationStep[] = [
  { id: 'naming', label: 'Jump Name', description: 'Creating your unique journey name', icon: Sparkles },
  { id: 'overview', label: 'Strategic Overview', description: 'Building your transformation vision', icon: FileText },
  { id: 'plan', label: 'Action Plan', description: 'Designing your implementation phases', icon: ListChecks },
  { id: 'tool_prompts', label: 'Tools & Prompts', description: 'Generating AI-powered combos', icon: Wrench },
];

interface GenerationProgressCardProps {
  status: ProcessingStatus;
  timer: number;
  jumpName?: string;
  stepTimes?: { [key: string]: number };
}

// Format time display
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
  
  // Determine step states
  const getStepState = (stepId: string): 'complete' | 'active' | 'pending' => {
    const stepOrder = ['naming', 'overview', 'plan', 'tool_prompts', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (isComplete || stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="relative group">
      {/* Ambient glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-2xl opacity-40 animate-pulse" />
      
      {/* Main card */}
      <div className="relative glass backdrop-blur-2xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="relative p-5 sm:p-6 space-y-4">
          {/* Header with timer */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary-foreground animate-pulse" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                  {isComplete ? 'Generation Complete!' : 'Generating Your Jump...'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {jumpName || 'Creating your AI transformation journey'}
                </p>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className="text-sm font-mono bg-background/80 backdrop-blur border-border/50 shadow-lg"
            >
              <Timer className="w-3.5 h-3.5 mr-1.5" />
              {formatTime(timer)}
            </Badge>
          </div>

          {/* Compact step status row (no large cards) */}
          <div className="flex flex-wrap items-center gap-2">
            {GENERATION_STEPS.map((step) => {
              const state = getStepState(step.id);
              const Icon = step.icon;
              const stepTime = stepTimes[step.id];

              return (
                <div
                  key={step.id}
                  className={`
                    inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium
                    transition-colors duration-300
                    ${state === 'complete'
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : state === 'active'
                        ? 'bg-primary/10 border-primary/50 text-foreground'
                        : 'bg-muted/20 border-border/30 text-muted-foreground'}
                  `}
                >
                  {state === 'complete' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : state === 'active' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span>{step.label}</span>
                  {state === 'complete' && stepTime ? (
                    <span className="font-mono text-[11px] text-primary/80">{stepTime}s</span>
                  ) : null}
                </div>
              );
            })}
          </div>
          
          {/* Progress bar section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                {status.currentTask || 'Starting...'}
              </span>
              <span className="text-primary font-bold">{status.progress || 0}%</span>
            </div>
            
            {/* Enhanced progress bar */}
            <div className="relative h-3 rounded-full bg-muted/30 border border-border/30 overflow-hidden shadow-inner">
              {/* Animated gradient fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${status.progress || 0}%`,
                  background: isComplete 
                    ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(142.1 76.2% 36.3%))'
                    : 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%)',
                  backgroundSize: '200% 100%',
                  animation: isComplete ? 'none' : 'shimmer 2s linear infinite',
                }}
              />
              {/* Indeterminate movement overlay while streaming */}
              {!isComplete && (
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      'repeating-linear-gradient(135deg, rgba(255,255,255,0.00) 0px, rgba(255,255,255,0.00) 10px, rgba(255,255,255,0.14) 10px, rgba(255,255,255,0.14) 18px)',
                    animation: 'barberpole 1.3s linear infinite',
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Completion message */}
          {isComplete && (
            <div className="flex items-center justify-center gap-2 pt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Jump generation complete! Explore your personalized roadmap below.
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for shimmer animation */}
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
