"use client";

import { Autocomplete as HeroAutocomplete } from "@heroui/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Jalat Autocomplete — HeroUI v3 Autocomplete (a Select with type-to-filter)
 * extended through the wrapper layer. Bakes in Jalat's input arrow color
 * (`--text-input-color`) on the indicator and the Input's `rounded-lg` radius on
 * the trigger, so it stays visually consistent with `Input` / `Select` without
 * per-call-site styling. Compose with `SearchField` + `ListBox` inside
 * `Autocomplete.Filter`, and `useFilter` for the match fn.
 */

/** Trigger with the Input's border radius baked in (a className still merges). */
function Trigger({ className, ...props }: ComponentProps<typeof HeroAutocomplete.Trigger>) {
  return <HeroAutocomplete.Trigger className={cn("rounded-lg", className)} {...props} />;
}

/** Trigger arrow with the default input color baked in. */
function Indicator({ className, ...props }: ComponentProps<typeof HeroAutocomplete.Indicator>) {
  return (
    <HeroAutocomplete.Indicator className={cn("text-text-input-color", className)} {...props} />
  );
}

/** Root passes straight through to HeroUI's Autocomplete. */
function Root(props: ComponentProps<typeof HeroAutocomplete>) {
  return <HeroAutocomplete {...props} />;
}

export const Autocomplete = Object.assign(Root, {
  Trigger,
  Value: HeroAutocomplete.Value,
  Indicator,
  Popover: HeroAutocomplete.Popover,
  Filter: HeroAutocomplete.Filter,
});
