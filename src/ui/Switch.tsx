"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

/**
 * Jalat Switch — the toggle seam for feature code (Family-Friendly filters,
 * settings). Built on Base UI's accessible Switch; styled with Jalat tokens so
 * feature code imports from `@/ui`, never the primitive directly. Optional inline
 * label keeps the control + caption together for compact filter rows.
 */
export type UISwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  label,
  id,
  disabled,
  className,
  "aria-label": ariaLabel,
}: UISwitchProps) {
  const control = (
    <BaseSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel ?? (label ? undefined : "toggle")}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none",
        "bg-border data-[checked]:bg-primary-lightskyblue",
        "focus-visible:ring-primary-lightskyblue/40 focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        !label && className,
      )}
    >
      <BaseSwitch.Thumb className="bg-background pointer-events-none mx-0.5 block h-5 w-5 rounded-full shadow-sm transition-transform data-[checked]:translate-x-5" />
    </BaseSwitch.Root>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 text-sm",
        className,
      )}
    >
      <span className="text-foreground">{label}</span>
      {control}
    </label>
  );
}
