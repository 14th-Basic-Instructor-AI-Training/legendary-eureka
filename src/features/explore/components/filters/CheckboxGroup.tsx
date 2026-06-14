"use client";

import { TickSquare } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type CheckboxOption<T extends string> = { value: T; label: string };

/**
 * A multi-select checkbox list used by every array-valued sidebar facet (regions,
 * seasons, activity types, durations, languages…). Toggling a value emits the
 * single value; the caller patches the array in the store.
 */
export function CheckboxGroup<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: ReadonlyArray<CheckboxOption<T>>;
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <li key={opt.value}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onToggle(opt.value)}
              />
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  checked
                    ? "border-primary-lightskyblue bg-primary-lightskyblue text-white"
                    : "border-border bg-background text-transparent",
                )}
              >
                <TickSquare size={14} color="currentColor" variant="Bold" />
              </span>
              <span className={cn(checked ? "text-foreground" : "text-muted")}>
                {opt.label}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
