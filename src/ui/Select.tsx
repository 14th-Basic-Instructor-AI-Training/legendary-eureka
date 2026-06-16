"use client";

import { Select as HeroSelect, ListBox as HeroListBox } from "@heroui/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Jalat Select — HeroUI v3 Select (compound) extended through the wrapper layer
 * so feature code imports from `@/ui`, never `@heroui/react`. The extension bakes
 * Jalat's input arrow color (`--text-input-color`) into `Select.Indicator`, a
 * solid surface + border/shadow into `Select.Popover`, and readable hover /
 * selected states into `ListBox.Item` — so options never blend into the page
 * background and no Select needs per-call-site styling. Options render with
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

/** Popover with a solid surface so options sit on an opaque, bordered panel. */
function Popover({ className, ...props }: ComponentProps<typeof HeroSelect.Popover>) {
  return (
    <HeroSelect.Popover
      className={cn(
        "bg-surface border-border shadow-primary z-50 overflow-auto rounded-lg border p-1",
        className,
      )}
      {...props}
    />
  );
}

/** Root passes straight through to HeroUI's Select. */
function Root(props: ComponentProps<typeof HeroSelect>) {
  return <HeroSelect {...props} />;
}

export const Select = Object.assign(Root, {
  Trigger,
  Value: HeroSelect.Value,
  Indicator,
  Popover,
});

/** ListBox.Item with readable hover / focus / selected contrast baked in. */
function ListBoxItem({ className, ...props }: ComponentProps<typeof HeroListBox.Item>) {
  return (
    <HeroListBox.Item
      className={cn(
        "text-foreground flex cursor-pointer items-center rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
        "data-[hovered]:bg-bg-ghostwhite data-[focused]:bg-bg-ghostwhite",
        "data-[selected]:bg-primary/10 data-[selected]:text-primary data-[selected]:font-medium",
        "data-[disabled]:text-muted data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Wrapped ListBox so `ListBox` / `ListBox.Item` carry Jalat styling. All other
 * HeroUI sub-components (`ItemIndicator`, `Section`, …) are preserved by copying
 * the original statics before overriding `Item`.
 */
export const ListBox = Object.assign(
  (props: ComponentProps<typeof HeroListBox>) => <HeroListBox {...props} />,
  HeroListBox,
  { Item: ListBoxItem },
);
