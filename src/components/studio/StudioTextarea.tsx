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

  // Determine the border/ring color based on state - simplified and refined
  const getStateStyles = useCallback(() => {
    switch (inputState) {
      case 'connecting':
        return {
          ring: 'ring-2 ring-amber-500/40',
          border: 'border-amber-500/50',
          glow: '',
          indicator: 'bg-amber-500',
          label: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-background'
        };
      case 'listening':
        return {
          ring: 'ring-2 ring-emerald-500/40',
          border: 'border-emerald-500/50',
          glow: '',
          indicator: 'bg-emerald-500 animate-pulse',
          label: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-background'
        };
      case 'focused':
        return {
          ring: 'ring-2 ring-primary/30',
          border: 'border-primary/40',
          glow: '',
          indicator: 'bg-primary',
          label: 'text-primary',
          bg: 'bg-background'
        };
      default:
        return {
          ring: '',
          border: 'border-border/60',
          glow: '',
          indicator: 'bg-muted-foreground/30',
          label: 'text-muted-foreground',
          bg: 'bg-muted/30'
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
    <div className="group/input space-y-2.5">
      {/* Label with state indicator */}
      <label className={cn(
        "flex items-center gap-2 text-sm font-medium transition-colors duration-200",
        stateStyles.label
      )}>
        {/* State indicator dot */}
        <span className={cn(
          "w-1.5 h-1.5 rounded-full transition-all duration-200",
          stateStyles.indicator
        )} />
        <span>{label}</span>
      </label>

      {/* Input container - cleaner, simpler */}
      <div className="relative">
        <div className={cn(
          "relative rounded-2xl overflow-hidden transition-all duration-200",
          "border",
          stateStyles.ring,
          stateStyles.border
        )}>
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
              "relative w-full min-h-[140px] sm:min-h-[160px] p-4 sm:p-5 pb-14",
              "rounded-xl",
              stateStyles.bg,
              // Placeholder - HIGH visibility
              "placeholder:text-foreground/40 dark:placeholder:text-foreground/35",
              "placeholder:font-normal",
              // Text styling
              "text-foreground text-[15px] sm:text-base leading-relaxed",
              "resize-none",
              "transition-colors duration-200",
              "focus:outline-none",
              className
            )}
          />

          {/* STT Button */}
          <div className="absolute bottom-3 right-3 z-10">
            <SpeechToTextButton
              onTranscription={handleTranscription}
              onStateChange={handleSttStateChange}
            />
          </div>

          {/* State badge - subtle */}
          {inputState !== 'idle' && inputState !== 'focused' && (
            <div className={cn(
              "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium",
              "transition-all duration-200 animate-fade-in z-10",
              inputState === 'connecting' && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
              inputState === 'listening' && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
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
