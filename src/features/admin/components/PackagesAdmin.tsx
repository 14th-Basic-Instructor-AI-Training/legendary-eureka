"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash, CloseCircle, Box1, SearchNormal1 } from "iconsax-reactjs";
import { Button, Chip, StatusChip } from "@/ui";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";
import type { AdminPackageStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | AdminPackageStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "published", labelKey: "status.published" },
  { value: "draft", labelKey: "status.draft" },
  { value: "archived", labelKey: "status.archived" },
];

export function PackagesAdmin() {
  const { t, i18n } = useTranslation();
  const { role } = useSession();
  const packages = useAdminStore((s) => s.adminPackages);
  const deletePackage = useAdminStore((s) => s.deletePackage);
  const setPackageStatus = useAdminStore((s) => s.setPackageStatus);
  const canManage = can(role, "managePackages");

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminPackageStatus>("all");

  const filtered = packages.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || p.title.toLowerCase().includes(q) || p.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const publishedCount = packages.filter((p) => p.status === "published").length;
  const totalBookings = packages.reduce((sum, p) => sum + p.bookingsCount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="text-primary text-lg font-bold">{publishedCount}</span>
          <span className="text-muted text-sm">{t("admin.packages.publishedCount")}</span>
        </div>
        <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="text-foreground text-lg font-bold">{totalBookings}</span>
          <span className="text-muted text-sm">{t("admin.packages.totalBookings")}</span>
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
            aria-label={t("admin.packages.searchPlaceholder")}
            placeholder={t("admin.packages.searchPlaceholder")}
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
        <p className="text-muted py-8 text-center text-sm">{t("admin.packages.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((pkg) => (
            <li
              key={pkg.id}
              className="bg-surface border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-purple-500/10 text-purple-600 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Box1 size={18} color="currentColor" variant="Bold" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{pkg.title}</p>
                    <StatusChip status={pkg.status} />
                  </div>
                  <p className="text-muted mt-0.5 text-sm">
                    {t("admin.packages.by", { agency: pkg.agencyName })}
                  </p>
                  <div className="text-muted/80 mt-1 flex flex-wrap gap-3 text-xs">
                    <span>{t("admin.packages.days", { count: pkg.days })}</span>
                    <span>·</span>
                    <span>{t("admin.packages.activities", { count: pkg.activityCount })}</span>
                    <span>·</span>
                    <span>{t("admin.packages.bookings", { count: pkg.bookingsCount })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Chip color="default" variant="soft" size="sm">
                  {formatPrice(pkg.priceFrom, pkg.currency, i18n.language)}
                </Chip>

                {canManage ? (
                  confirmingId === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-xs">{t("admin.packages.deleteConfirm")}</span>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-danger"
                        onPress={() => {
                          deletePackage(role, pkg.id);
                          setConfirmingId(null);
                        }}
                      >
                        {t("admin.packages.actions.confirmDelete")}
                      </Button>
                      <Button variant="tertiary" size="sm" onPress={() => setConfirmingId(null)}>
                        <CloseCircle size={16} color="currentColor" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {pkg.status === "published" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => setPackageStatus(role, pkg.id, "archived")}
                        >
                          {t("admin.packages.actions.archive")}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => setPackageStatus(role, pkg.id, "published")}
                        >
                          {t("admin.packages.actions.publish")}
                        </Button>
                      )}
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="text-danger"
                        onPress={() => setConfirmingId(pkg.id)}
                      >
                        <Trash size={16} color="currentColor" />
                        {t("admin.packages.actions.delete")}
                      </Button>
                    </div>
                  )
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
