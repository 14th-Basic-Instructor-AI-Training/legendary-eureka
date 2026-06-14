import type { ComponentProps } from "react";
import { Chip as HeroChip } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Jalat Chip — wrapper over HeroUI v3's compound Chip (status pills, tags).
 * Variants are slot-based, so we merge className and pass `color`/`variant`/`size`
 * through. Preserves the compound `Chip.Label` API (Card-style wrapping).
 *
 * Colors: "default" | "accent" | "success" | "warning" | "danger".
 * Variants: "primary" | "secondary" | "tertiary" | "soft".
 */
type ChipRootProps = ComponentProps<typeof HeroChip>;

function ChipRoot({ className, ...props }: ChipRootProps) {
  return <HeroChip className={cn(className)} {...props} />;
}

export const Chip = Object.assign(ChipRoot, {
  Label: HeroChip.Label,
});
