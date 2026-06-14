"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { axisProps, gridProps, tooltipProps } from "../dashboard/chartTheme";

type Range = "week" | "month" | "year";

/** Static booking volume per range (dummy data — no API yet). */
const SERIES: Record<Range, number[]> = {
  week: [12, 18, 9, 22, 16, 28, 20],
  month: [120, 180, 96, 210],
  year: [42, 58, 47, 64, 86, 52, 60, 98, 50, 78, 66, 72],
};

/** Localized labels for each range, derived via Intl (no hardcoded copy). */
function useLabels(range: Range, lng: string, weekWord: string): string[] {
  return useMemo(() => {
    if (range === "year") {
      const fmt = new Intl.DateTimeFormat(lng, { month: "short" });
      return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2021, i, 1)));
    }
    if (range === "week") {
      const fmt = new Intl.DateTimeFormat(lng, { weekday: "short" });
      return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2021, 0, 4 + i)));
    }
    return Array.from({ length: 4 }, (_, i) => `${weekWord} ${i + 1}`);
  }, [range, lng, weekWord]);
}

/** Bookings volume bar chart with a Week / Month / Year toggle; peak bar accented. */
export function BookingsTrendCard() {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState<Range>("year");
  const labels = useLabels(range, i18n.language, t("admin.bookings.overview.trend.week"));

  const values = SERIES[range];
  const peak = Math.max(...values);
  const data = values.map((value, i) => ({ label: labels[i], value }));

  const RANGES: Range[] = ["week", "month", "year"];

  return (
    <section className="bg-surface shadow-primary flex flex-col gap-4 rounded-2xl p-5">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-primary font-semibold tracking-tight">
          {t("admin.bookings.overview.trend.title")}
        </h3>
        <div className="bg-muted/10 flex items-center gap-1 rounded-full p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                range === r
                  ? "bg-surface text-primary shadow-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t(`admin.bookings.overview.trend.${r}`)}
            </button>
          ))}
        </div>
      </header>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <linearGradient id="bookings-bar-peak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="#84CDE9" />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={36} allowDecimals={false} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="value" name={t("admin.bookings.overview.trend.title")} radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={d.value === peak ? "url(#bookings-bar-peak)" : "var(--primary)"}
                  fillOpacity={d.value === peak ? 1 : 0.15}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
