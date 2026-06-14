"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight2 } from "iconsax-reactjs";
import { Avatar, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import type { AdminBooking } from "../../schema";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const COLLAPSED = 6;

/** Recent bookings, styled after the reference "API Usage" table. */
export function RecentBookingsCard({ bookings }: { bookings: AdminBooking[] }) {
  const { t, i18n } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const maxTotal = Math.max(1, ...bookings.map((b) => b.total));
  const rows = showAll ? bookings : bookings.slice(0, COLLAPSED);

  return (
    <section className="bg-surface shadow-primary flex flex-col rounded-2xl p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-primary font-semibold tracking-tight">
          {t("admin.bookings.overview.recent")}
        </h3>
        {bookings.length > COLLAPSED ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-muted hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
          >
            {t("admin.bookings.overview.viewAll")}
            <ArrowRight2 size={14} color="currentColor" />
          </button>
        ) : null}
      </header>

      {/* column headers */}
      <div className="text-muted border-border grid grid-cols-[1.6fr_1fr_0.9fr_auto] items-center gap-3 border-b pb-2 text-xs font-medium">
        <span>{t("admin.bookings.overview.cols.booking")}</span>
        <span>{t("admin.bookings.overview.cols.amount")}</span>
        <span>{t("admin.bookings.overview.cols.agency")}</span>
        <span className="text-right">{t("admin.bookings.overview.cols.status")}</span>
      </div>

      <ul className="flex flex-col">
        {rows.map((b) => (
          <li
            key={b.id}
            className="border-border grid grid-cols-[1.6fr_1fr_0.9fr_auto] items-center gap-3 border-b py-3 last:border-0"
          >
            {/* booking: avatar + traveler + package */}
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar size="sm">
                <Avatar.Fallback>{initialsOf(b.travelerName)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-text-primary truncate text-sm font-semibold">{b.travelerName}</p>
                <p className="text-muted truncate text-xs">{b.packageTitle}</p>
              </div>
            </div>

            {/* amount + bar */}
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-medium tabular-nums">
                {formatPrice(b.total, b.currency, i18n.language)}
              </p>
              <div className="bg-muted/10 mt-1 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${Math.round((b.total / maxTotal) * 100)}%` }}
                />
              </div>
            </div>

            <span className="text-muted truncate text-sm">{b.agencyName}</span>
            <span className="justify-self-end">
              <StatusChip status={b.status} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
