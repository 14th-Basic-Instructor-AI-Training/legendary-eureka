"use client";

import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "./Panel";
import { axisProps, gridProps, tooltipProps } from "./chartTheme";
import type { AdminApprovalPoint } from "@/lib/api/admin";

/** Agency requests resolved per period — approved vs rejected, stacked. */
export function BarSeriesCard({ data }: { data: AdminApprovalPoint[] }) {
  const { t } = useTranslation();

  return (
    <Panel title={t("admin.dashboard.approvals.title")} subtitle={t("admin.dashboard.approvals.subtitle")}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={36} allowDecimals={false} />
            <Tooltip {...tooltipProps} />
            <Bar
              dataKey="approved"
              stackId="requests"
              name={t("admin.dashboard.approvals.approved")}
              fill="var(--green)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="rejected"
              stackId="requests"
              name={t("admin.dashboard.approvals.rejected")}
              fill="var(--orange)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend />
    </Panel>
  );
}

function Legend() {
  const { t } = useTranslation();
  return (
    <div className="mt-3 flex items-center justify-center gap-5 text-xs">
      <LegendDot colorVar="--green" label={t("admin.dashboard.approvals.approved")} />
      <LegendDot colorVar="--orange" label={t("admin.dashboard.approvals.rejected")} />
    </div>
  );
}

function LegendDot({ colorVar, label }: { colorVar: string; label: string }) {
  return (
    <span className="text-muted flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(${colorVar})` }} />
      {label}
    </span>
  );
}
