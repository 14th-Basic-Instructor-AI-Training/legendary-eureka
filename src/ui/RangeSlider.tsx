"use client";

import { Slider } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

/**
 * Jalat RangeSlider — a dual-handle range slider (e.g. the Explore price filter).
 * Built on Base UI's accessible Slider with `value` as a `[min, max]` tuple.
 * Styled with Jalat tokens; feature code imports from `@/ui`, never the primitive.
 */
export type UIRangeSliderProps = {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  /** Fires once at the end of an interaction — good for triggering a refetch. */
  onValueCommitted?: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  "aria-label"?: string;
};

const asTuple = (v: number | readonly number[]): [number, number] => {
  const arr = Array.isArray(v) ? v : [v, v];
  return [arr[0], arr[1] ?? arr[0]];
};

export function RangeSlider({
  value,
  onValueChange,
  onValueCommitted,
  min,
  max,
  step = 1,
  className,
  "aria-label": ariaLabel,
}: UIRangeSliderProps) {
  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onValueChange(asTuple(v))}
      onValueCommitted={(v) => onValueCommitted?.(asTuple(v))}
      aria-label={ariaLabel ?? "range"}
      className={cn("w-full", className)}
    >
      <Slider.Control className="flex w-full items-center py-2">
        <Slider.Track className="bg-border relative h-1.5 w-full rounded-full">
          <Slider.Indicator className="bg-primary-lightskyblue absolute rounded-full" />
          <Slider.Thumb className="border-primary-lightskyblue bg-background focus-visible:ring-primary-lightskyblue/40 block h-4 w-4 rounded-full border-2 shadow-sm outline-none focus-visible:ring-2" />
          <Slider.Thumb className="border-primary-lightskyblue bg-background focus-visible:ring-primary-lightskyblue/40 block h-4 w-4 rounded-full border-2 shadow-sm outline-none focus-visible:ring-2" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
