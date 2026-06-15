"use client";

import { useTranslation } from "react-i18next";
import {
  Profile2User,
  Location,
  Box1,
  Airplane,
  Buildings,
  Flag,
  ArrowUp3,
  ArrowDown2,
} from "iconsax-reactjs";
import { formatNumber } from "@/lib/format";
import type { ComponentType } from "react";
import type { AdminKpiMetric } from "@/lib/api/admin";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

/** Icon + tint per backend KPI key. Falls back to a neutral tile for unknown keys. */
const KPI_META: Record<string, { Icon: IconType; colorVar: string; tintVar: string }> = {
  totalUsers: { Icon: Profile2User, colorVar: "--primary-lightskyblue", tintVar: "--bg-aliceblue" },
  totalDestinations: { Icon: Location, colorVar: "--blue", tintVar: "--bg-blue" },
  totalTours: { Icon: Box1, colorVar: "--purple", tintVar: "--bg-purple" },
  totalTrips: { Icon: Airplane, colorVar: "--green", tintVar: "--bg-lightgreen" },
  pendingAgencies: { Icon: Buildings, colorVar: "--orange", tintVar: "--bg-seashell" },
  pendingReports: { Icon: Flag, colorVar: "--red", tintVar: "--bg-lightred" },
};

const FALLBACK_META = {
  Icon: Box1 as IconType,
  colorVar: "--primary-lightskyblue",
  tintVar: "--bg-aliceblue",
};

/** Map the backend's free-text comparison to an i18n key (else show it raw). */
const COMPARISON_KEY: Record<string, string> = {
  "vs last month": "vsLastMonth",
  "awaiting review": "awaitingReview",
  "open issues": "openIssues",
};

export function StatCard({ metric }: { metric: AdminKpiMetric }) {
  const { t, i18n } = useTranslation();
  const { Icon, colorVar, tintVar } = KPI_META[metric.key] ?? FALLBACK_META;

  const showDelta = metric.deltaDir !== "neutral" && metric.deltaPct !== 0;
  const Arrow = metric.deltaDir === "up" ? ArrowUp3 : ArrowDown2;
  const deltaColorVar = metric.deltaGood ? "--green" : "--red";

  const comparisonKey = COMPARISON_KEY[metric.comparison];
  const comparisonText = comparisonKey
    ? t(`admin.dashboard.kpi.comparison.${comparisonKey}`)
    : metric.comparison;

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
            className="inline-flex items-center gap-0.5 font-semibold"
            style={{ color: `var(${deltaColorVar})` }}
          >
            <Arrow size={14} color="currentColor" variant="Bold" />
            {formatNumber(metric.deltaPct, i18n.language)}%
          </span>
        ) : null}
        <span className="text-muted">{comparisonText}</span>
      </div>
    </div>
  );
}
