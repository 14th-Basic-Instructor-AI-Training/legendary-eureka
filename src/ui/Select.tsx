"use client";

import { Select as HeroSelect, ListBox } from "@heroui/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Jalat Select — HeroUI v3 Select (compound) extended through the wrapper layer
 * so feature code imports from `@/ui`, never `@heroui/react`. The extension bakes
 * Jalat's input arrow color (`--text-input-color`) into `Select.Indicator`, so
 * every Select arrow matches without per-call-site styling. Options render with
 * `ListBox` / `ListBox.Item` inside `Select.Popover` (also re-exported here).
 *
 *   <Select aria-label="…" selectedKey={k} onSelectionChange={setK} variant="secondary">
 *     <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
 *     <Select.Popover><ListBox>
 *       <ListBox.Item id="x" textValue="X">X</ListBox.Item>
 *     </ListBox></Select.Popover>
 *   </Select>
 */

/** Trigger with the Input's border radius baked in (a className still merges). */
function Trigger({ className, ...props }: ComponentProps<typeof HeroSelect.Trigger>) {
  return <HeroSelect.Trigger className={cn("rounded-lg", className)} {...props} />;
}

/** Trigger arrow with the default input color baked in (a className still merges). */
function Indicator({ className, ...props }: ComponentProps<typeof HeroSelect.Indicator>) {
  return <HeroSelect.Indicator className={cn("text-text-input-color", className)} {...props} />;
}

/** Root passes straight through to HeroUI's Select. */
function Root(props: ComponentProps<typeof HeroSelect>) {
  return <HeroSelect {...props} />;
}

export const Select = Object.assign(Root, {
  Trigger,
  Value: HeroSelect.Value,
  Indicator,
  Popover: HeroSelect.Popover,
});

export { ListBox };
