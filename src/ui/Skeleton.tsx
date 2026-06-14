import type { ComponentProps } from "react";
import { Skeleton as HeroSkeleton } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Jalat Skeleton — thin wrapper over HeroUI v3's Skeleton. Its variants are
 * slot-based (not a single class string), so we merge className rather than use
 * the `tv({ extend })` pattern. Callers supply box dimensions via className
 * (e.g. "h-4 w-32 rounded-md"); `animationType` ("none" | "pulse" | "shimmer")
 * passes straight through.
 */
export type UISkeletonProps = ComponentProps<typeof HeroSkeleton>;

export function Skeleton({ className, ...props }: UISkeletonProps) {
  return <HeroSkeleton className={cn("bg-muted/15 rounded-md", className)} {...props} />;
}
