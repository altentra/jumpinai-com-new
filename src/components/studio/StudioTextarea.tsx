import React, { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { SpeechToTextButton } from '@/components/SpeechToTextButton';

export type InputState = 'idle' | 'focused' | 'connecting' | 'listening';

interface StudioTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onTyped?: () => void;
  onSttUsed?: () => void;
  onSttDuration?: (seconds: number) => void;
  placeholder?: string;
  className?: string;
}

export const StudioTextarea = forwardRef<HTMLTextAreaElement, StudioTextareaProps>(({
  label,
  value,
  onChange,
  onTyped,
  onSttUsed,
  onSttDuration,
  placeholder,
  className
}, ref) => {
  const [inputState, setInputState] = useState<InputState>('idle');
  const [isFocused, setIsFocused] = useState(false);

  // Determine the border/ring color based on state
  const getStateStyles = useCallback(() => {
    switch (inputState) {
      case 'connecting':
        return {
          ring: 'ring-[3px] ring-amber-500/50 dark:ring-amber-400/40',
          border: 'border-amber-500/70 dark:border-amber-400/50',
          glow: 'shadow-[0_0_40px_-8px_rgba(245,158,11,0.5)]',
          indicator: 'bg-amber-500',
          label: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50/50 dark:bg-amber-950/30'
        };
      case 'listening':
        return {
          ring: 'ring-[3px] ring-emerald-500/50 dark:ring-emerald-400/40',
          border: 'border-emerald-500/70 dark:border-emerald-400/50',
          glow: 'shadow-[0_0_50px_-8px_rgba(16,185,129,0.55)]',
          indicator: 'bg-emerald-500 animate-pulse',
          label: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50/50 dark:bg-emerald-950/30'
        };
      case 'focused':
        return {
          ring: 'ring-[3px] ring-primary/40 dark:ring-primary/30',
          border: 'border-primary/60 dark:border-primary/50',
          glow: 'shadow-[0_0_40px_-8px_hsl(var(--primary)/0.4)]',
          indicator: 'bg-primary',
          label: 'text-primary',
          bg: 'bg-background dark:bg-zinc-900/90'
        };
      default:
        return {
          ring: '',
          border: 'border-border/50 dark:border-white/[0.08]',
          glow: 'shadow-lg shadow-black/[0.03] dark:shadow-black/20',
          indicator: 'bg-muted-foreground/40',
          label: 'text-foreground',
          bg: 'bg-muted/50 dark:bg-zinc-800/60'
        };
    }
  }, [inputState]);

  const stateStyles = getStateStyles();

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (inputState === 'idle') {
      setInputState('focused');
    }
  }, [inputState]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (inputState === 'focused') {
      setInputState('idle');
    }
  }, [inputState]);

  const handleSttStateChange = useCallback((state: 'connecting' | 'listening' | 'idle') => {
    if (state === 'idle') {
      setInputState(isFocused ? 'focused' : 'idle');
    } else {
      setInputState(state);
    }
  }, [isFocused]);

  const handleTranscription = useCallback((text: string, durationSeconds?: number) => {
    onChange(text);
    onSttUsed?.();
    if (durationSeconds) {
      onSttDuration?.(durationSeconds);
    }
  }, [onChange, onSttUsed, onSttDuration]);

  return (
    <div className="group/input space-y-4">
      {/* Label with state indicator - Premium typography */}
      <label className={cn(
        "flex items-center gap-3 text-sm font-semibold transition-all duration-300 tracking-wide",
        stateStyles.label
      )}>
        {/* State indicator dot with glow */}
        <span className={cn(
          "relative w-2.5 h-2.5 rounded-full transition-all duration-300",
          stateStyles.indicator
        )}>
          {/* Glow effect for active states */}
          {inputState !== 'idle' && (
            <span className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-60",
              stateStyles.indicator
            )} />
          )}
        </span>
        <span className="uppercase text-xs tracking-[0.2em]">{label}</span>
      </label>

      {/* Input container with dynamic states - Super rounded */}
      <div className={cn(
        "relative rounded-[28px] transition-all duration-500 ease-out",
        stateStyles.glow
      )}>
        {/* Outer glow ring for active states */}
        <div className={cn(
          "absolute -inset-1 rounded-[32px] transition-all duration-500 pointer-events-none opacity-0",
          inputState === 'listening' && "opacity-100 bg-gradient-to-br from-emerald-500/25 via-emerald-400/15 to-emerald-500/25 blur-md",
          inputState === 'connecting' && "opacity-100 bg-gradient-to-br from-amber-500/25 via-amber-400/15 to-amber-500/25 blur-md",
          inputState === 'focused' && "opacity-100 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 blur-md"
        )} />

        {/* Inner container for the textarea */}
        <div className={cn(
          "relative rounded-[28px] overflow-hidden transition-all duration-300",
          "border-2",
          stateStyles.border
        )}>
          {/* Top edge highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent z-10" />

          <textarea
            ref={ref}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              onTyped?.();
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "relative w-full min-h-[200px] sm:min-h-[220px] p-6 sm:p-8 pb-20",
              "rounded-[26px]",
              stateStyles.bg,
              // Premium placeholder styling - much better visibility
              "placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40",
              "placeholder:font-medium placeholder:text-[15px]",
              // Text styling - excellent readability
              "text-foreground text-[16px] sm:text-[17px] leading-[1.8] font-medium",
              "resize-none",
              "transition-all duration-300 ease-out",
              "focus:outline-none",
              // Hover state
              "hover:border-border/80 dark:hover:border-white/15",
              className
            )}
          />

          {/* STT Button - Premium positioning */}
          <div className="absolute bottom-5 right-5 z-10">
            <SpeechToTextButton
              onTranscription={handleTranscription}
              onStateChange={handleSttStateChange}
            />
          </div>

          {/* State label badge - more prominent */}
          {inputState !== 'idle' && inputState !== 'focused' && (
            <div className={cn(
              "absolute top-5 right-5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em]",
              "transition-all duration-300 animate-fade-in backdrop-blur-sm z-10",
              inputState === 'connecting' && "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
              inputState === 'listening' && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            )}>
              {inputState === 'connecting' && 'Connecting...'}
              {inputState === 'listening' && '● Recording'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StudioTextarea.displayName = 'StudioTextarea';
