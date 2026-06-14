"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Receipt21, CloseCircle, SearchNormal1 } from "iconsax-reactjs";
import { Button, Chip, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";
import type { AdminBookingStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | AdminBookingStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "completed", labelKey: "status.completed" },
  { value: "rejected", labelKey: "status.rejected" },
];

export function BookingsAdmin() {
  const { t, i18n } = useTranslation();
  const { role } = useSession();
  const bookings = useAdminStore((s) => s.adminBookings);
  const cancelBooking = useAdminStore((s) => s.cancelBooking);
  const canManage = can(role, "managePackages");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminBookingStatus>("all");

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.packageTitle.toLowerCase().includes(q) ||
      b.travelerName.toLowerCase().includes(q) ||
      b.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const confirmedRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.total, 0);
  const pendingRevenue = bookings
    .filter((b) => b.status === "approved" || b.status === "pending")
    .reduce((sum, b) => sum + b.total, 0);
  const totalRevenue = confirmedRevenue + pendingRevenue;

  return (
    <div className="flex flex-col gap-4">
      {/* Revenue summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="bg-surface border-border flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-green-500/10 text-green-600 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Receipt21 size={20} color="currentColor" variant="Bold" />
          </span>
          <div>
            <p className="text-muted text-xs">{t("admin.bookings.totalRevenue")}</p>
            <p className="text-lg font-bold">{formatPrice(totalRevenue, "USD", i18n.language)}</p>
          </div>
        </div>
        <div className="bg-surface border-border flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Receipt21 size={20} color="currentColor" />
          </span>
          <div>
            <p className="text-muted text-xs">{t("admin.bookings.confirmedRevenue")}</p>
            <p className="text-lg font-bold">{formatPrice(confirmedRevenue, "USD", i18n.language)}</p>
          </div>
        </div>
        <div className="bg-surface border-border flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-warning/10 text-warning inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Receipt21 size={20} color="currentColor" />
          </span>
          <div>
            <p className="text-muted text-xs">{t("admin.bookings.pendingRevenue")}</p>
            <p className="text-lg font-bold">{formatPrice(pendingRevenue, "USD", i18n.language)}</p>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            aria-label={t("admin.bookings.searchPlaceholder")}
            placeholder={t("admin.bookings.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-surface text-foreground placeholder:text-muted w-full rounded-xl border px-3 py-2 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-muted/10 text-muted hover:bg-muted/20",
              ].join(" ")}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.bookings.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((b) => (
            <li
              key={b.id}
              className="bg-surface border-border flex flex-wrap items-center gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{b.packageTitle}</p>
                  <StatusChip status={b.status} />
                </div>
                <p className="text-muted mt-0.5 text-sm">
                  {t("admin.bookings.by", { agency: b.agencyName })} ·{" "}
                  {t("admin.bookings.traveler", { name: b.travelerName })}
                </p>
                <p className="text-muted/70 mt-0.5 text-xs">
                  {b.datesLabel} · {t("admin.bookings.guests", { count: b.guests })} · {b.requestedAtLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Chip color="default" variant="soft" size="sm">
                  {formatPrice(b.total, b.currency, i18n.language)}
                </Chip>
                {canManage && (b.status === "pending" || b.status === "approved") ? (
                  <Button
                    variant="tertiary"
                    size="sm"
                    className="text-danger"
                    onPress={() => cancelBooking(role, b.id)}
                  >
                    <CloseCircle size={16} color="currentColor" />
                    {t("admin.bookings.cancel")}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
