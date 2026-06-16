"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Trash, Box1, SearchNormal1, Filter } from "iconsax-reactjs";
import { Button, Chip, ListBox, Select, StatusChip, Tabs, useConfirm } from "@/ui";
import { formatPrice } from "@/lib/format";
import { useLocalizedRouter } from "@/lib/locale";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { sendRealtime, TOURS_CHANGED } from "@/lib/realtime";
import {
  archivePackageAction,
  deletePackageAction,
  publishPackageAction,
} from "@/actions/tours";
import { TourApprovalsQueue } from "@/features/tours/components/TourApprovalsQueue";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { PackageApprovalStatus } from "@/features/tours/schema";

/** Lowercased catalog statuses + the package-approval queue ("approvals"). */
type PackageFilter = "all" | "published" | "archived" | "approvals";

const STATUS_FILTERS: Array<{ value: PackageFilter; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "published", labelKey: "status.published" },
  { value: "archived", labelKey: "status.archived" },
  { value: "approvals", labelKey: "tours.nav.approvals" },
];

type ApprovalFilter = "all" | PackageApprovalStatus;

const APPROVAL_STATUS_FILTERS: Array<{ value: ApprovalFilter; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

export function PackagesAdmin({
  packages,
  approvals = [],
}: {
  packages: TourPackageResponse[];
  approvals?: TourPackageResponse[];
}) {
  const { t, i18n } = useTranslation();
  const { role } = useSession();
  const router = useRouter();
  const localizedRouter = useLocalizedRouter();
  const confirm = useConfirm();
  const canManage = can(role, "managePackages");

  const openDetail = (id: string) => localizedRouter.push(`/admin/content/packages/${id}`);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PackageFilter>("all");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalFilter>("all");

  const showApprovals = statusFilter === "approvals";
  const approvalStatusLabel =
    APPROVAL_STATUS_FILTERS.find((f) => f.value === approvalStatus)?.labelKey ?? "common.all";

  const filtered = packages.filter((p) => {
    const status = p.status.toLowerCase();
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || p.title.toLowerCase().includes(q) || p.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const publishedCount = packages.filter((p) => p.status === "PUBLISHED").length;

  // Pending package-approval requests (GET /tours/approvals), fetched server-side.
  const pendingApprovals = approvals.filter((p) => p.approvalStatus === "PENDING").length;

  /**
   * Run a mutation server action (publish / archive / delete), refresh the
   * server-fetched list, and — on success — emit a realtime `tours-changed`
   * frame so the public surfaces (explore Tours tab, landing Trending tours)
   * refetch their tours in real time.
   */
  const runAction = async (id: string, action: (id: string) => Promise<{ ok: boolean }>) => {
    setBusyId(id);
    const res = await action(id);
    setBusyId(null);
    if (res?.ok) sendRealtime({ event: TOURS_CHANGED, data: { id } });
    router.refresh();
  };

  /** Confirm, then archive the package. */
  const handleArchive = async (id: string) => {
    const ok = await confirm({
      title: t("admin.packages.archiveConfirm.title"),
      description: t("admin.packages.archiveConfirm.description"),
      intent: "warning",
      confirmLabel: t("admin.packages.actions.archive"),
    });
    if (ok) runAction(id, archivePackageAction);
  };

  /** Confirm, then permanently delete the package. */
  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t("admin.packages.deleteConfirm.title"),
      description: t("admin.packages.deleteConfirm.description"),
      intent: "danger",
      confirmLabel: t("admin.packages.actions.confirmDelete"),
    });
    if (ok) runAction(id, deletePackageAction);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="text-primary text-lg font-bold">{publishedCount}</span>
          <span className="text-muted text-sm">{t("admin.packages.publishedCount")}</span>
        </div>
        <div className="bg-surface border-border flex items-center gap-2 rounded-xl border px-4 py-2">
          <span className="text-foreground text-lg font-bold">{packages.length}</span>
          <span className="text-muted text-sm">{t("admin.content.tabs.packages")}</span>
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
            <Tabs.List aria-label={t("admin.content.tabs.packages")} className="bg-primary/15!">
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

      {/* Only the list scrolls — the summary + search/filter rows stay fixed. */}
      <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
      {/* Package-approval requests live under the "Request approval" filter */}
      {showApprovals ? (
        <TourApprovalsQueue
          packages={approvals}
          hidePendingBanner
          statusFilter={approvalStatus}
          search={search}
        />
      ) : filtered.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.packages.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((pkg) => {
            const status = pkg.status.toLowerCase();
            return (
              <li
                key={pkg.id}
                role="button"
                tabIndex={0}
                onClick={() => openDetail(pkg.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDetail(pkg.id);
                  }
                }}
                className="bg-surface border-border hover:ring-primary/30 flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition hover:ring-1"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-purple-500/10 text-purple-600 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Box1 size={18} color="currentColor" variant="Bold" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{pkg.title}</p>
                      <StatusChip status={status} />
                    </div>
                    <p className="text-muted mt-0.5 text-sm">
                      {t("admin.packages.by", { agency: pkg.agencyName })}
                    </p>
                    <div className="text-muted/80 mt-1 flex flex-wrap gap-3 text-xs">
                      <span>{t("admin.packages.days", { count: pkg.durationDays })}</span>
                      <span>·</span>
                      <span>{t("admin.packages.activities", { count: pkg.agenda.length })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Chip color="default" variant="soft" size="sm">
                    {formatPrice(pkg.price, pkg.currency, i18n.language)}
                  </Chip>

                  {canManage ? (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {status === "published" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          isPending={busyId === pkg.id}
                          onPress={() => handleArchive(pkg.id)}
                        >
                          {t("admin.packages.actions.archive")}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          isPending={busyId === pkg.id}
                          onPress={() => runAction(pkg.id, publishPackageAction)}
                        >
                          {t("admin.packages.actions.publish")}
                        </Button>
                      )}
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="text-danger"
                        isPending={busyId === pkg.id}
                        onPress={() => handleDelete(pkg.id)}
                      >
                        <Trash size={16} color="currentColor" />
                        {t("admin.packages.actions.delete")}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}
