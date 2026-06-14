"use client";

import { useTranslation } from "react-i18next";
import { Buildings, Flag, Category, Profile2User, ArrowUp3, ArrowDown2 } from "iconsax-reactjs";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";
import type { KpiKey, KpiMetric } from "../../schema";

type IconType = ComponentType<{ size?: number; color?: string; variant?: "Bold" | "Linear" }>;

/** Each KPI gets an icon + a tinted accent drawn from globals.css tokens. */
const KPI_META: Record<KpiKey, { Icon: IconType; colorVar: string; tintVar: string }> = {
  pendingRequests: { Icon: Buildings, colorVar: "--blue", tintVar: "--bg-blue" },
  openReports: { Icon: Flag, colorVar: "--orange", tintVar: "--bg-seashell" },
  activities: { Icon: Category, colorVar: "--purple", tintVar: "--bg-purple" },
  users: { Icon: Profile2User, colorVar: "--primary-lightskyblue", tintVar: "--bg-aliceblue" },
};

export function StatCard({ metric }: { metric: KpiMetric }) {
  const { t, i18n } = useTranslation();
  const { Icon, colorVar, tintVar } = KPI_META[metric.key];
  const Arrow = metric.deltaDir === "up" ? ArrowUp3 : ArrowDown2;
  const deltaColorVar = metric.deltaGood ? "--green" : "--red";

  return (
    <div className="bg-surface border-border flex flex-col gap-3 rounded-2xl border p-5">
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
        <span
          className={cn("inline-flex items-center gap-0.5 font-semibold")}
          style={{ color: `var(${deltaColorVar})` }}
        >
          <Arrow size={14} color="currentColor" variant="Bold" />
          {formatNumber(metric.deltaPct, i18n.language)}%
        </span>
        <span className="text-muted">{t(`admin.dashboard.kpi.comparison.${metric.comparison}`)}</span>
      </div>
    </div>
  );
}
