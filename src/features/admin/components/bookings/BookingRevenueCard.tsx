"use client";

import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPrice } from "@/lib/format";
import { tooltipProps } from "../dashboard/chartTheme";
import type { TripResponse } from "@/lib/api/bookings";

/** Token color per booking status — drives the donut slices + legend dots. */
const STATUS_COLOR: Record<string, string> = {
  pending: "var(--orange)",
  approved: "var(--primary)",
  completed: "var(--green)",
  rejected: "var(--red)",
  cancelled: "var(--text-secondary)",
};

const ORDER = ["completed", "approved", "pending", "rejected", "cancelled"];

/** Revenue split by booking status, as a donut with a center total + legend. */
export function BookingRevenueCard({ bookings }: { bookings: TripResponse[] }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  const byStatus = ORDER.map((status) => ({
    status,
    label: t(`status.${status}`),
    color: STATUS_COLOR[status],
    value: bookings
      .filter((b) => b.status.toLowerCase() === status)
      .reduce((sum, b) => sum + b.total, 0),
  })).filter((s) => s.value > 0);

  const total = byStatus.reduce((sum, s) => sum + s.value, 0);

  return (
    <section className="bg-surface shadow-primary flex flex-col gap-5 rounded-2xl p-5">
      <h3 className="text-primary font-semibold tracking-tight">
        {t("admin.bookings.overview.revenue.title")}
      </h3>

      <div className="flex flex-wrap items-center gap-5">
        <div className="relative h-48 w-48 shrink-0 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="value"
                nameKey="label"
                innerRadius={54}
                outerRadius={72}
                paddingAngle={2}
                cornerRadius={6}
                stroke="none"
              >
                {byStatus.map((s) => (
                  <Cell key={s.status} fill={s.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-muted text-xs">{t("admin.bookings.overview.revenue.total")}</span>
            <span className="text-primary text-xl font-bold">{formatPrice(total, "USD", lng)}</span>
          </div>
        </div>

        <ul className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {byStatus.map((s) => (
            <li key={s.status} className="min-w-0">
              <span className="text-muted flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="text-text-primary text-base font-bold tabular-nums">
                {formatPrice(s.value, "USD", lng)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
