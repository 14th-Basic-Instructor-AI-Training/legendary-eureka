"use client";

import { SearchField as HeroSearchField } from "@heroui/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Jalat SearchField — HeroUI v3 SearchField extended through the wrapper layer so
 * the leading search icon uses Jalat's input color (`--text-input-color`) by
 * default, matching `Input` / `Select` / `Autocomplete`. Compose with
 * `SearchField.Group` containing the icon, input, and clear button.
 */

/** Leading search icon with the default input color baked in (a className merges). */
function SearchIcon({ className, ...props }: ComponentProps<typeof HeroSearchField.SearchIcon>) {
  return (
    <HeroSearchField.SearchIcon className={cn("text-text-input-color", className)} {...props} />
  );
}

/** Root passes straight through to HeroUI's SearchField. */
function Root(props: ComponentProps<typeof HeroSearchField>) {
  return <HeroSearchField {...props} />;
}

export const SearchField = Object.assign(Root, {
  Group: HeroSearchField.Group,
  SearchIcon,
  Input: HeroSearchField.Input,
  ClearButton: HeroSearchField.ClearButton,
});
