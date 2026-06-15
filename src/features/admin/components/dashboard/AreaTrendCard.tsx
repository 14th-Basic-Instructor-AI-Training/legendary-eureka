"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, ListBox } from "@/ui";
import { Panel } from "./Panel";
import { axisProps, gridProps, tooltipProps } from "./chartTheme";
import type { AdminTrendPoint } from "@/lib/api/admin";

const RANGES = ["last7d", "last30d", "last90d"] as const;

/** Daily volume trend. The range control is presentational in the static phase. */
export function AreaTrendCard({ data }: { data: AdminTrendPoint[] }) {
  const { t } = useTranslation();
  const [range, setRange] = useState<string>("last30d");

  const chartData = data.map((p) => ({
    label: p.label,
    value: p.count ?? p.bookings ?? p.packages ?? 0,
  }));

  return (
    <Panel
      title={t("admin.dashboard.volume.title")}
      subtitle={t("admin.dashboard.volume.subtitle")}
      action={
        <Select
          aria-label={t("admin.dashboard.volume.title")}
          selectedKey={range}
          onSelectionChange={(key) => setRange(String(key))}
          variant="secondary"
        >
          <Select.Trigger className="min-w-32 text-sm">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {RANGES.map((r) => (
                <ListBox.Item key={r} id={r} textValue={t(`admin.dashboard.range.${r}`)}>
                  {t(`admin.dashboard.range.${r}`)}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="adminVolumeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary-lightskyblue)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary-lightskyblue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={36} />
            <Tooltip {...tooltipProps} />
            <Area
              type="monotone"
              dataKey="value"
              name={t("admin.dashboard.volume.seriesLabel")}
              stroke="var(--primary-lightskyblue)"
              strokeWidth={2}
              fill="url(#adminVolumeFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
