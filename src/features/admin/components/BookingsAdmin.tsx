"use client";

import { useTranslation } from "react-i18next";
import { Receipt21, TickCircle, WalletMoney } from "iconsax-reactjs";
import { formatNumber, formatPrice } from "@/lib/format";
import { BookingStatCard } from "./bookings/BookingStatCard";
import { RecentBookingsCard } from "./bookings/RecentBookingsCard";
import { BookingsTrendCard } from "./bookings/BookingsTrendCard";
import { BookingRevenueCard } from "./bookings/BookingRevenueCard";
import type { TripResponse } from "@/lib/api/bookings";
import type { MonthlyBookingResponse } from "@/lib/api/profile";

/**
 * Admin bookings dashboard. Left column: KPI tiles + a bookings-volume bar
 * chart; right column: a recent-bookings table + a revenue-by-status donut.
 * Data is fetched server-side (see `admin/bookings/page.tsx`): `totalCount` is
 * the platform-wide trip count; the per-status/revenue figures derive from the
 * fetched page of trips.
 */
export function BookingsAdmin({
  bookings,
  totalCount,
  monthly,
}: {
  bookings: TripResponse[];
  totalCount: number;
  monthly: MonthlyBookingResponse[];
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  const total = totalCount;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const processed = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "APPROVED",
  ).length;

  const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);
  const completedRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-3 xl:grid-rows-1">
      {/* left column: KPIs + trend */}
      <div className="flex min-h-0 flex-col gap-4 xl:col-span-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BookingStatCard
            Icon={Receipt21}
            label={t("admin.bookings.overview.stats.total.title")}
            value={formatNumber(total, lng)}
            delta="+15%"
            tone="success"
            description={t("admin.bookings.overview.stats.total.desc")}
            progress={total ? processed / total : 0}
          />
          <BookingStatCard
            Icon={TickCircle}
            label={t("admin.bookings.overview.stats.completed.title")}
            value={formatNumber(completed, lng)}
            delta="+10%"
            tone="info"
            description={t("admin.bookings.overview.stats.completed.desc")}
            progress={total ? completed / total : 0}
          />
          <BookingStatCard
            Icon={WalletMoney}
            label={t("admin.bookings.overview.stats.revenue.title")}
            value={formatPrice(totalRevenue, "USD", lng)}
            delta="+5%"
            tone="warning"
            description={t("admin.bookings.overview.stats.revenue.desc")}
            progress={totalRevenue ? completedRevenue / totalRevenue : 0}
          />
        </div>

        <BookingsTrendCard data={monthly} />
      </div>

      {/* right column: recent bookings + revenue donut */}
      <div className="flex min-h-0 flex-col gap-4">
        <RecentBookingsCard bookings={bookings} />
        <BookingRevenueCard bookings={bookings} />
      </div>
    </div>
  );
}
