import { Minus, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCallback, useState } from "react";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  disabled = false,
  className,
  placeholder = "0",
}: NumberStepperProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  const clamp = useCallback((n: number) => Math.max(min, Math.min(max, n)), [min, max]);

  function handleDecrement() {
    onChange(clamp(value - 1));
  }

  function handleIncrement() {
    onChange(clamp(value + 1));
  }

  function handleFocus() {
    setIsFocused(true);
    setInputValue(value === min ? "" : String(value));
  }

  function handleBlur() {
    setIsFocused(false);
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed)) {
      onChange(min);
      setInputValue(String(min));
    } else {
      const clamped = clamp(parsed);
      onChange(clamped);
      setInputValue(String(clamped));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setInputValue("");
      return;
    }
    if (/^\d*$/.test(raw)) {
      setInputValue(raw);
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) {
        onChange(clamp(parsed));
      }
    }
  }

  const showPlaceholder = !isFocused && value === 0;
  const displayValue = isFocused ? inputValue : showPlaceholder ? "" : String(value);

  return (
    <div
      className={cn(
        "flex h-10 w-[120px] shrink-0 items-center rounded-md border border-input bg-background",
        disabled && "opacity-50",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className="flex h-full w-10 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder={showPlaceholder ? placeholder : ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="h-full w-0 flex-1 border-x border-input bg-transparent text-center text-sm font-medium tabular-nums outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className="flex h-full w-10 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
