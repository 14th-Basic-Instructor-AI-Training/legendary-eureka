"use client";

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;
type Tone = "success" | "info" | "warning";

const DELTA_TONE: Record<Tone, string> = {
  success: "bg-green/10 text-green",
  info: "bg-primary/10 text-primary",
  warning: "bg-orange/10 text-orange",
};

/**
 * Booking KPI card — header (icon + label), a large value with a delta pill,
 * a one-line description, and a gradient progress bar. Mirrors the reference
 * dashboard's stat tiles, themed with Jalat tokens.
 */
export function BookingStatCard({
  Icon,
  label,
  value,
  delta,
  tone,
  description,
  progress,
}: {
  Icon: IconType;
  label: string;
  value: ReactNode;
  delta: string;
  tone: Tone;
  description: string;
  /** 0–1 fill ratio for the progress bar. */
  progress: number;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="bg-surface shadow-primary flex flex-col gap-4 rounded-2xl p-5">
      <div className="text-muted flex items-center gap-2 text-sm font-medium">
        <span className="bg-primary/10 text-primary inline-flex h-8 w-8 items-center justify-center rounded-lg">
          <Icon size={16} color="currentColor" variant="Bold" />
        </span>
        {label}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-primary text-3xl font-bold tracking-tight">{value}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", DELTA_TONE[tone])}>
          {delta}
        </span>
      </div>

      <p className="text-muted line-clamp-2 text-sm">{description}</p>

      <div className="bg-muted/10 mt-auto h-2 w-full overflow-hidden rounded-full">
        <div
          className="from-primary h-full rounded-full bg-gradient-to-r to-[#84CDE9]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
