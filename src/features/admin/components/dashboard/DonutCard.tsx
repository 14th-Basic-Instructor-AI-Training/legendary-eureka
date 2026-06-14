"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/format";
import { tooltipProps } from "./chartTheme";
import { Panel } from "./Panel";
import type { DistributionSlice } from "../../schema";

/** Share of platform activities by category, as a donut with a legend + center total. */
export function DonutCard({ data }: { data: DistributionSlice[] }) {
  const { t, i18n } = useTranslation();
  const total = useMemo(() => data.reduce((sum, s) => sum + s.value, 0), [data]);

  const chartData = data.map((s) => ({
    ...s,
    label: t(`destinations.categories.${s.key}`),
    color: `var(${s.colorVar})`,
  }));

  return (
    <Panel
      title={t("admin.dashboard.distribution.title")}
      subtitle={t("admin.dashboard.distribution.subtitle")}
    >
      <div className="relative h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-primary text-2xl font-bold">{formatNumber(total, i18n.language)}</span>
          <span className="text-muted text-xs">{t("admin.dashboard.distribution.total")}</span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {chartData.map((s) => (
          <li key={s.key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-primary">{s.label}</span>
            </span>
            <span className="text-muted font-medium">
              {formatNumber(Math.round((s.value / total) * 100), i18n.language)}%
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
