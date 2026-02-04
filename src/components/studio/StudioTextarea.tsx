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

  // Determine the border/ring color based on state - refined and premium
  const getStateStyles = useCallback(() => {
    switch (inputState) {
      case 'connecting':
        return {
          ring: 'ring-2 ring-amber-500/50',
          border: 'border-amber-500/60',
          indicator: 'bg-amber-500',
          label: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-zinc-200 dark:bg-zinc-900',
          shadow: 'shadow-[0_4px_20px_-4px_rgba(245,158,11,0.25)]'
        };
      case 'listening':
        return {
          ring: 'ring-2 ring-emerald-500/50',
          border: 'border-emerald-500/60',
          indicator: 'bg-emerald-500 animate-pulse',
          label: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-zinc-200 dark:bg-zinc-900',
          shadow: 'shadow-[0_4px_20px_-4px_rgba(16,185,129,0.25)]'
        };
      case 'focused':
        return {
          ring: 'ring-2 ring-blue-500/50',
          border: 'border-blue-500/60',
          indicator: 'bg-blue-500',
          label: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-zinc-100 dark:bg-zinc-950',
          shadow: 'shadow-[0_4px_20px_-4px_rgba(59,130,246,0.25)]'
        };
      default:
        return {
          ring: '',
          border: 'border-zinc-400 dark:border-zinc-600',
          indicator: 'bg-zinc-400 dark:bg-zinc-500',
          label: 'text-foreground',
          bg: 'bg-zinc-200 dark:bg-zinc-900',
          shadow: 'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]'
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
      {/* Label - Premium typography */}
      <label className={cn(
        "flex items-center gap-2.5 text-sm font-semibold tracking-wide transition-colors duration-200",
        stateStyles.label
      )}>
        {/* State indicator dot */}
        <span className={cn(
          "w-2 h-2 rounded-full transition-all duration-200",
          stateStyles.indicator
        )} />
        <span className="uppercase text-xs tracking-[0.15em]">{label}</span>
      </label>

      {/* Input container with premium depth */}
      <div className="relative">
        <div className={cn(
          "relative rounded-2xl overflow-hidden transition-all duration-200",
          "border-2",
          stateStyles.ring,
          stateStyles.border,
          stateStyles.shadow
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
              "relative w-full min-h-[180px] sm:min-h-[200px] p-5 sm:p-6 pb-16",
              "rounded-xl",
              stateStyles.bg,
              // Placeholder - HIGH visibility with good contrast
              "placeholder:text-foreground/50 dark:placeholder:text-foreground/40",
              "placeholder:font-medium",
              // Text styling - excellent readability
              "text-foreground text-[15px] sm:text-base leading-[1.75] font-medium",
              "resize-none",
              "transition-colors duration-200",
              "focus:outline-none",
              className
            )}
          />

          {/* STT Button */}
          <div className="absolute bottom-4 right-4 z-10">
            <SpeechToTextButton
              onTranscription={handleTranscription}
              onStateChange={handleSttStateChange}
            />
          </div>

          {/* State badge */}
          {inputState !== 'idle' && inputState !== 'focused' && (
            <div className={cn(
              "absolute top-4 right-4 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide",
              "transition-all duration-200 animate-fade-in z-10",
              inputState === 'connecting' && "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
              inputState === 'listening' && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
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
