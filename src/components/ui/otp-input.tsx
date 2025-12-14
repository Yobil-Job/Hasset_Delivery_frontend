import * as React from "react";
import { cn } from "./utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  className,
  disabled = false 
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newValue = value.split('');
    newValue[index] = digit;
    const updatedValue = newValue.join('').slice(0, length);
    onChange(updatedValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/\D/g, '');
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2",
            "bg-background border-border text-foreground",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "dark:bg-card dark:border-border dark:text-foreground",
            "dark:focus:border-primary dark:focus:ring-primary/30"
          )}
        />
      ))}
    </div>
  );
}

