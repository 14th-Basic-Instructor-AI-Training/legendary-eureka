"use client";

import { useTranslation } from "react-i18next";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "./Panel";
import { axisProps, gridProps, tooltipProps } from "./chartTheme";
import type { AdminTrendPoint } from "@/lib/api/admin";

/** New sign-ups per weekday, last 7 days. */
export function LineTrendCard({ data }: { data: AdminTrendPoint[] }) {
  const { t } = useTranslation();

  const chartData = data.map((p) => ({
    label: p.label,
    value: p.count ?? p.bookings ?? p.packages ?? 0,
  }));

  return (
    <Panel title={t("admin.dashboard.newUsers.title")} subtitle={t("admin.dashboard.newUsers.subtitle")}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={36} allowDecimals={false} />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey="value"
              name={t("admin.dashboard.newUsers.seriesLabel")}
              stroke="var(--blue)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--blue)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
