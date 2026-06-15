"use client";

import type { ComponentProps } from "react";
import { Calendar } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/**
 * Jalat DatePicker — the single date-input seam for feature code (booking dates,
 * trip dates). Built on a themed native `<input type="date">` so it is reliable
 * and accessible in the static-UI phase; the value is an ISO `YYYY-MM-DD` string.
 * Swap the internals for HeroUI's Calendar popover later without touching callers.
 */
export type UIDatePickerProps = Omit<
  ComponentProps<"input">,
  "type" | "onChange" | "value"
> & {
  label?: string;
  value?: string;
  /** Fires with the ISO `YYYY-MM-DD` string (empty when cleared). */
  onChange?: (value: string) => void;
};

export function DatePicker({
  label,
  value,
  onChange,
  className,
  id,
  min,
  ...props
}: UIDatePickerProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-muted text-xs font-medium tracking-wide">{label}</span>
      ) : null}
      <span className="relative flex items-center">
        <Calendar
          size={16}
          color="currentColor"
          variant="Bold"
          className="text-muted pointer-events-none absolute left-3"
        />
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "border-border bg-surface text-foreground w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm outline-none",
            "focus:border-primary-lightskyblue focus:ring-primary-lightskyblue/30 focus:ring-2",
            className,
          )}
          {...props}
        />
      </span>
    </label>
  );
}
