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
          ring: 'ring-2 ring-amber-500/40 dark:ring-amber-400/30',
          border: 'border-amber-500/60 dark:border-amber-400/40',
          glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]',
          indicator: 'bg-amber-500',
          label: 'text-amber-600 dark:text-amber-400'
        };
      case 'listening':
        return {
          ring: 'ring-2 ring-emerald-500/40 dark:ring-emerald-400/30',
          border: 'border-emerald-500/60 dark:border-emerald-400/40',
          glow: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.35)]',
          indicator: 'bg-emerald-500 animate-pulse',
          label: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'focused':
        return {
          ring: 'ring-2 ring-primary/30 dark:ring-primary/20',
          border: 'border-primary/50 dark:border-primary/40',
          glow: 'shadow-[0_0_20px_-5px_hsl(var(--primary)/0.25)]',
          indicator: 'bg-primary',
          label: 'text-primary'
        };
      default:
        return {
          ring: '',
          border: 'border-border/40 dark:border-white/[0.06]',
          glow: '',
          indicator: 'bg-muted-foreground/30',
          label: 'text-foreground/90'
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
    <div className="group/input space-y-3">
      {/* Label with state indicator */}
      <label className={cn(
        "flex items-center gap-2.5 text-sm font-medium transition-colors duration-300",
        stateStyles.label
      )}>
        {/* State indicator dot */}
        <span className={cn(
          "w-2 h-2 rounded-full transition-all duration-300",
          stateStyles.indicator
        )} />
        <span className="tracking-wide">{label}</span>
      </label>

      {/* Input container with dynamic states */}
      <div className={cn(
        "relative rounded-2xl transition-all duration-300",
        stateStyles.glow
      )}>
        {/* Outer glow ring for active states */}
        <div className={cn(
          "absolute -inset-px rounded-2xl transition-all duration-300 pointer-events-none",
          inputState === 'listening' && "bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-emerald-500/20",
          inputState === 'connecting' && "bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-500/20",
          inputState === 'focused' && "bg-gradient-to-br from-primary/15 via-primary/5 to-primary/15",
          inputState === 'idle' && "opacity-0"
        )} />

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
            "relative w-full min-h-[170px] sm:min-h-[190px] p-5 sm:p-6 pb-16",
            "rounded-2xl",
            "bg-gradient-to-b from-muted/30 to-muted/50 dark:from-zinc-800/50 dark:to-zinc-800/70",
            "placeholder:text-muted-foreground/35",
            "text-foreground text-[15px] sm:text-base leading-relaxed",
            "resize-none",
            "transition-all duration-300 ease-out",
            "focus:outline-none",
            "focus:bg-background dark:focus:bg-zinc-800/90",
            "hover:border-border/60 dark:hover:border-white/10",
            "border",
            stateStyles.border,
            stateStyles.ring,
            className
          )}
        />

        {/* STT Button */}
        <div className="absolute bottom-4 right-4">
          <SpeechToTextButton
            onTranscription={handleTranscription}
            onStateChange={handleSttStateChange}
          />
        </div>

        {/* State label badge */}
        {inputState !== 'idle' && inputState !== 'focused' && (
          <div className={cn(
            "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
            "transition-all duration-300 animate-fade-in",
            inputState === 'connecting' && "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
            inputState === 'listening' && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          )}>
            {inputState === 'connecting' && 'Connecting...'}
            {inputState === 'listening' && '● Live'}
          </div>
        )}
      </div>
    </div>
  );
});

StudioTextarea.displayName = 'StudioTextarea';
