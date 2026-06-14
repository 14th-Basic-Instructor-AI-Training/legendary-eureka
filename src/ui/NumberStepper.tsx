"use client";

import { Minus, Add } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Jalat NumberStepper — labeled +/- counter for small bounded quantities
 * (booking traveler counts). Controlled: clamps to [min, max] and emits the next
 * value. Built from themed buttons so feature code never wires raw inputs.
 */
export interface UINumberStepperProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function NumberStepper({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 99,
  className,
}: UINumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const step = (delta: number) => onChange(clamp(value + delta));

  const btn =
    "border-border text-foreground flex h-8 w-8 items-center justify-center rounded-full border transition-colors enabled:hover:border-primary-lightskyblue enabled:hover:text-primary-lightskyblue disabled:opacity-40";

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex flex-col">
        <span className="text-foreground text-sm font-medium">{label}</span>
        {description ? <span className="text-muted text-xs">{description}</span> : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${label} −`}
          onClick={() => step(-1)}
          disabled={value <= min}
          className={btn}
        >
          <Minus size={16} color="currentColor" />
        </button>
        <span className="text-foreground w-6 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} +`}
          onClick={() => step(1)}
          disabled={value >= max}
          className={btn}
        >
          <Add size={16} color="currentColor" />
        </button>
      </div>
    </div>
  );
}
