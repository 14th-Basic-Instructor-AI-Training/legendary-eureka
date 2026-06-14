"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash, CloseCircle, Box1, SearchNormal1, Filter } from "iconsax-reactjs";
import { Button, Chip, ListBox, Select, StatusChip, Tabs } from "@/ui";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useAdminStore } from "../store";
import { TourApprovalsQueue } from "@/features/tours/components/TourApprovalsQueue";
import { useToursStore } from "@/features/tours/store";
import type { AdminPackageStatus } from "../schema";
import type { PackageApprovalStatus } from "@/features/tours/schema";

/** Catalog status filters plus the package-approval queue ("approvals"). */
type PackageFilter = "all" | AdminPackageStatus | "approvals";

const STATUS_FILTERS: Array<{ value: PackageFilter; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "published", labelKey: "status.published" },
  { value: "draft", labelKey: "status.draft" },
  { value: "archived", labelKey: "status.archived" },
  { value: "approvals", labelKey: "tours.nav.approvals" },
];

/** Status filter for the approval queue, shown as a dropdown when approvals is active. */
type ApprovalFilter = "all" | PackageApprovalStatus;

const APPROVAL_STATUS_FILTERS: Array<{ value: ApprovalFilter; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
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
  const [statusFilter, setStatusFilter] = useState<PackageFilter>("all");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalFilter>("all");

  const showApprovals = statusFilter === "approvals";
  const approvalStatusLabel =
    APPROVAL_STATUS_FILTERS.find((f) => f.value === approvalStatus)?.labelKey ?? "common.all";

  const filtered = packages.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || p.title.toLowerCase().includes(q) || p.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const publishedCount = packages.filter((p) => p.status === "published").length;
  const totalBookings = packages.reduce((sum, p) => sum + p.bookingsCount, 0);

  // Pending package-approval requests come from the tours store (Flow 2).
  const pendingApprovals = useToursStore(
    (s) => s.packages.filter((p) => p.status === "pending").length,
  );

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
        {showApprovals ? (
          <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
            <span className="text-warning text-lg font-bold">{pendingApprovals}</span>
            <span className="text-muted text-sm">{t("tours.admin.approvals.awaiting")}</span>
          </div>
        ) : null}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative min-w-40 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            aria-label={t(
              showApprovals ? "tours.admin.approvals.search" : "admin.packages.searchPlaceholder",
            )}
            placeholder={t(
              showApprovals ? "tours.admin.approvals.search" : "admin.packages.searchPlaceholder",
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-surface text-foreground placeholder:text-muted w-full rounded-xl border px-3 py-2 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => setStatusFilter(key as PackageFilter)}
        >
          <Tabs.ListContainer>
            <Tabs.List
              aria-label={t("admin.content.tabs.packages")}
              className="bg-primary/15!"
            >
              {STATUS_FILTERS.map((f) => (
                <Tabs.Tab key={f.value} id={f.value}>
                  <span className="whitespace-nowrap">{t(f.labelKey)}</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        {showApprovals ? (
          <Select
            aria-label={t("tours.admin.approvals.statusFilter")}
            selectedKey={approvalStatus}
            onSelectionChange={(key) => key !== null && setApprovalStatus(key as ApprovalFilter)}
            className="ml-auto min-w-44 shrink-0"
          >
            <Select.Trigger>
              <Filter size={16} color="currentColor" className="text-muted" />
              <Select.Value>{() => t(approvalStatusLabel)}</Select.Value>
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {APPROVAL_STATUS_FILTERS.map((f) => (
                  <ListBox.Item key={f.value} id={f.value} textValue={t(f.labelKey)}>
                    {t(f.labelKey)}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : null}
      </div>

      {/* Package-approval requests live under the "Request approval" filter */}
      {showApprovals ? (
        <TourApprovalsQueue hidePendingBanner statusFilter={approvalStatus} search={search} />
      ) : filtered.length === 0 ? (
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
