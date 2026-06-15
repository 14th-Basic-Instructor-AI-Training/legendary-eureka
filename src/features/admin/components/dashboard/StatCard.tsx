"use client";

import { useTranslation } from "react-i18next";
import {
  Buildings,
  Flag,
  Map1,
  Profile2User,
  Routing,
  Receipt21,
  ArrowUp3,
  ArrowDown2,
  Minus,
} from "iconsax-reactjs";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";
import type { KpiKey, KpiMetric } from "../../schema";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

/** Each KPI gets an icon + a tinted accent drawn from globals.css tokens. */
const KPI_META: Record<KpiKey, { Icon: IconType; colorVar: string; tintVar: string }> = {
  totalUsers: { Icon: Profile2User, colorVar: "--primary-lightskyblue", tintVar: "--bg-aliceblue" },
  totalDestinations: { Icon: Map1, colorVar: "--blue", tintVar: "--bg-blue" },
  totalTours: { Icon: Routing, colorVar: "--purple", tintVar: "--bg-purple" },
  totalTrips: { Icon: Receipt21, colorVar: "--green", tintVar: "--bg-lightgreen" },
  pendingAgencies: { Icon: Buildings, colorVar: "--orange", tintVar: "--bg-seashell" },
  pendingReports: { Icon: Flag, colorVar: "--red", tintVar: "--bg-lightred" },
};

export function StatCard({ metric }: { metric: KpiMetric }) {
  const { t, i18n } = useTranslation();
  const meta = KPI_META[metric.key];
  if (!meta) return null;

  const { Icon, colorVar, tintVar } = meta;
  const Arrow =
    metric.deltaDir === "up" ? ArrowUp3 : metric.deltaDir === "down" ? ArrowDown2 : Minus;
  const deltaColorVar = metric.deltaGood ? "--green" : "--red";
  const showDelta = metric.deltaDir !== "neutral" && metric.deltaPct !== 0;

  return (
    <div className="bg-surface shadow-primary flex flex-col gap-3 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">{t(`admin.dashboard.kpi.${metric.key}`)}</p>
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `var(${tintVar})`, color: `var(${colorVar})` }}
        >
          <Icon size={18} color="currentColor" variant="Bold" />
        </span>
      </div>
      <p className="text-primary text-3xl font-bold tracking-tight">
        {formatNumber(metric.value, i18n.language)}
      </p>
      <div className="flex items-center gap-1.5 text-xs">
        {showDelta ? (
          <span
            className={cn("inline-flex items-center gap-0.5 font-semibold")}
            style={{ color: `var(${deltaColorVar})` }}
          >
            <Arrow size={14} color="currentColor" variant="Bold" />
            {formatNumber(metric.deltaPct, i18n.language)}%
          </span>
        ) : null}
        <span className="text-muted">{metric.comparison}</span>
      </div>
    </div>
  );
}
