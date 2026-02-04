import React from 'react';
import { Loader2, CheckCircle, Sparkles, FileText, ListChecks, Wrench, Timer, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
        
        <div className="relative p-6 space-y-6">
          {/* Header with timer */}
          <div className="flex items-center justify-between">
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
                <h3 className="font-bold text-lg text-foreground">
                  {isComplete ? 'Generation Complete!' : 'Generating Your Jump...'}
                </h3>
                <p className="text-sm text-muted-foreground">
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
          
          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-3">
            {GENERATION_STEPS.map((step, index) => {
              const state = getStepState(step.id);
              const Icon = step.icon;
              const stepTime = stepTimes[step.id];
              
              return (
                <div
                  key={step.id}
                  className={`relative group/step transition-all duration-500 ${
                    state === 'active' ? 'scale-[1.02]' : ''
                  }`}
                >
                  {/* Step card */}
                  <div className={`
                    relative rounded-xl p-3 border transition-all duration-500
                    ${state === 'complete' 
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' 
                      : state === 'active'
                        ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/20'
                        : 'bg-muted/20 border-border/30'
                    }
                  `}>
                    {/* Active step glow */}
                    {state === 'active' && (
                      <div className="absolute inset-0 bg-primary/5 rounded-xl animate-pulse" />
                    )}
                    
                    <div className="relative flex flex-col items-center gap-2">
                      {/* Icon container */}
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                        ${state === 'complete'
                          ? 'bg-primary/20 text-primary'
                          : state === 'active'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/30 text-muted-foreground/60'
                        }
                      `}>
                        {state === 'complete' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : state === 'active' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      
                      {/* Step number */}
                      <span className={`
                        text-[10px] font-bold uppercase tracking-wider
                        ${state === 'complete'
                          ? 'text-primary'
                          : state === 'active'
                            ? 'text-primary'
                            : 'text-muted-foreground/50'
                        }
                      `}>
                        Step {index + 1}
                      </span>
                      
                      {/* Step label */}
                      <span className={`
                        text-xs font-medium text-center leading-tight min-h-[2rem] flex items-center
                        ${state === 'complete'
                          ? 'text-primary'
                          : state === 'active'
                            ? 'text-foreground'
                            : 'text-muted-foreground/70'
                        }
                      `}>
                        {step.label}
                      </span>
                      
                      {/* Step time (if complete) */}
                      {state === 'complete' && stepTime && (
                        <span className="text-[10px] font-mono text-primary/80">
                          {stepTime}s
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < GENERATION_STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-1/2 -right-1.5 w-3 h-px">
                      <div className={`
                        h-full transition-colors duration-500
                        ${state === 'complete' ? 'bg-primary/50' : 'bg-border/50'}
                      `} />
                    </div>
                  )}
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
              {/* Shimmer effect */}
              {!isComplete && (
                <div 
                  className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{
                    left: `${(status.progress || 0) - 25}%`,
                    animation: 'shimmerMove 2s ease-in-out infinite',
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
        @keyframes shimmerMove {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(400%); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GenerationProgressCard;
