"use client";

import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, gridProps, tooltipProps } from "../dashboard/chartTheme";
import type { MonthlyBookingResponse } from "@/lib/api/profile";

/** Number of months to always show on the trend axis. */
const MONTHS = 12;

/**
 * Build the full last-12-months axis (oldest → newest) using the same
 * `'Mon YYYY'` label format the backend emits (e.g. "Jun 2026"), then merge
 * in the backend counts. Months without bookings stay on the axis with a 0 bar
 * so the chart always shows 12 months and the months with data stand out.
 */
function buildTwelveMonths(data: MonthlyBookingResponse[]) {
  const counts = new Map(data.map((d) => [d.month, d.bookings]));
  const now = new Date();
  const months: { label: string; value: number }[] = [];

  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
    months.push({ label, value: counts.get(label) ?? 0 });
  }

  return months;
}

/**
 * Platform booking volume per month (last 12 months) from the backend.
 * The peak bar is accented.
 */
export function BookingsTrendCard({ data }: { data: MonthlyBookingResponse[] }) {
  const { t } = useTranslation();

  const chartData = buildTwelveMonths(data);
  const peak = Math.max(0, ...chartData.map((d) => d.value));

  return (
    <section className="bg-surface shadow-primary flex min-h-0 flex-1 flex-col gap-4 rounded-2xl p-5">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-primary font-semibold tracking-tight">
          {t("admin.bookings.overview.trend.title")}
        </h3>
      </header>

      {data.length === 0 ? (
        <p className="text-muted flex min-h-[16rem] flex-1 items-center justify-center text-sm">
          {t("admin.bookings.overview.trend.empty")}
        </p>
      ) : (
        <div className="min-h-[16rem] w-full flex-1 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 8 }} barCategoryGap="28%">
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
                {chartData.map((d) => (
                  <Cell
                    key={d.label}
                    fill={d.value === peak && peak > 0 ? "url(#bookings-bar-peak)" : "var(--primary)"}
                    fillOpacity={d.value === peak && peak > 0 ? 1 : 0.15}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
