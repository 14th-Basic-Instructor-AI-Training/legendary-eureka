"use client";

import type { ComponentType, ReactNode } from "react";
import { Gallery } from "iconsax-reactjs";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

/**
 * Per-tab empty state: an illustration placeholder + a localized message and an
 * optional call to action. Used across Bookmarks / Trip Plans / Bookings /
 * Reviews when a list has no items.
 */
export function EmptyState({
  message,
  hint,
  Icon = Gallery,
  action,
}: {
  message: string;
  hint?: string;
  Icon?: IconType;
  action?: ReactNode;
}) {
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="bg-primary/10 text-primary inline-flex h-16 w-16 items-center justify-center rounded-2xl">
        <Icon size={28} color="currentColor" variant="Bold" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-foreground font-medium">{message}</p>
        {hint ? <p className="text-muted text-sm">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
