"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Trans, useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Box1, SearchNormal1 } from "iconsax-reactjs";
import { sileo } from "sileo";
import { Button, Input, Pagination, StatusChip, Tabs, useConfirm } from "@/ui";
import { formatPrice } from "@/lib/format";
import { sendRealtime, TOURS_CHANGED } from "@/lib/realtime";
import { approvePackageAction, rejectPackageAction } from "@/actions/tours";
import type { PackageApprovalStatus } from "../schema";
import { ApprovalsTable } from "./ApprovalsTable";
import type { TourPackageResponse } from "@/lib/api/packages";

/** Cards per page. */
const PAGE_SIZE = 9;

/** UPPER_SNAKE enum → "Title Case" (province label). */
function prettyEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Wire approval status (UPPER) → the lowercase keys the UI + StatusChip use. */
function approvalKey(p: TourPackageResponse): PackageApprovalStatus {
  return (p.approvalStatus?.toLowerCase() as PackageApprovalStatus) ?? "pending";
}

/** Status filter tabs shown when the host doesn't own the filter. */
const STATUS_FILTERS: Array<{ value: "all" | PackageApprovalStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

/**
 * Admin: review tour packages agencies submitted for approval. Reuses the
 * Requests-queue look (search + status tabs + card grid + approve/reject).
 * Data comes from `GET /tours/approvals` (fetched server-side and passed in);
 * approve / reject call server actions, then the page refreshes.
 */
type Props = {
  /** Packages submitted for approval (any approval status). */
  packages: TourPackageResponse[];
  /** Hide the "{n} awaiting approval" banner (e.g. when the host shows its own). */
  hidePendingBanner?: boolean;
  /** Status filter, owned by the host (a dropdown in the package-filter row). */
  statusFilter?: "all" | PackageApprovalStatus;
  /** When provided, the host owns the search box; the queue hides its own. */
  search?: string;
  /** Card grid (default) or table layout. */
  view?: "card" | "table";
};

export function TourApprovalsQueue({
  packages,
  hidePendingBanner = false,
  statusFilter: statusFilterProp,
  search: searchProp,
  view = "card",
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useRouter();
  const confirm = useConfirm();

  const [internalSearch, setInternalSearch] = useState("");
  // When the host passes `search`, it owns the input and we hide our own.
  const ownsSearch = searchProp === undefined;
  const search = searchProp ?? internalSearch;
  const [internalStatus, setInternalStatus] = useState<"all" | PackageApprovalStatus>("all");
  // When the host passes `statusFilter`, it owns the filter and we hide our own tabs.
  const ownsStatus = statusFilterProp === undefined;
  const statusFilter = statusFilterProp ?? internalStatus;
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = packages.filter((p) => {
    const status = approvalKey(p);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.agencyName.toLowerCase().includes(q) ||
      (p.province?.toLowerCase().includes(q) ?? false);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = packages.filter((p) => p.approvalStatus === "PENDING").length;

  // Pending (request-approval) cards first, then approved, then rejected — so the
  // requests needing action stay at the top-left. Stable within each group.
  const STATUS_ORDER: Record<PackageApprovalStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
    draft: 3,
  };
  const sorted = [...filtered].sort(
    (a, b) => (STATUS_ORDER[approvalKey(a)] ?? 9) - (STATUS_ORDER[approvalKey(b)] ?? 9),
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /** Run an approve/reject server action, emit the realtime frame, then refresh. */
  type ToastMessage = { title: string; description: ReactNode };
  const runAction = async (
    id: string,
    action: (id: string) => Promise<{ ok: boolean }>,
    messages?: { success: ToastMessage; error: ToastMessage },
  ) => {
    setBusyId(id);
    const res = await action(id);
    setBusyId(null);
    if (res?.ok) {
      sendRealtime({ event: TOURS_CHANGED, data: { id } });
      if (messages) sileo.success({ ...messages.success, position: "top-center" });
    } else if (messages) {
      sileo.error({ ...messages.error, position: "top-center" });
    }
    router.refresh();
  };

  /** Toast description with the package name rendered bold + a little larger. */
  const nameDesc = (i18nKey: string, name: string): ReactNode => (
    <Trans
      i18nKey={i18nKey}
      values={{ name }}
      components={{ b: <span style={{ fontWeight: 700, fontSize: "1.05em" }} /> }}
    />
  );

  const onApprove = async (p: TourPackageResponse) => {
    const ok = await confirm({
      title: t("tours.admin.approvals.approve"),
      description: p.title,
      intent: "primary",
    });
    if (ok)
      runAction(p.id, approvePackageAction, {
        success: {
          title: t("tours.admin.approvals.toast.approved"),
          description: nameDesc("tours.admin.approvals.toast.approvedDesc", p.title),
        },
        error: {
          title: t("tours.admin.approvals.toast.approveError"),
          description: t("tours.admin.approvals.toast.approveErrorDesc"),
        },
      });
  };

  const onReject = async (p: TourPackageResponse) => {
    const ok = await confirm({
      title: t("tours.admin.approvals.reject"),
      description: p.title,
      intent: "danger",
    });
    if (ok)
      runAction(p.id, (id) => rejectPackageAction(id), {
        success: {
          title: t("tours.admin.approvals.toast.rejected"),
          description: nameDesc("tours.admin.approvals.toast.rejectedDesc", p.title),
        },
        error: {
          title: t("tours.admin.approvals.toast.rejectError"),
          description: t("tours.admin.approvals.toast.rejectErrorDesc"),
        },
      });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {!hidePendingBanner && pendingCount > 0 ? (
        <div className="bg-warning/10 border-warning/30 flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-warning text-sm font-medium">
            {t("tours.admin.approvals.pendingCount", { count: pendingCount })}
          </span>
        </div>
      ) : null}

      {/* search + status tabs (hidden when the host owns these filters) */}
      {ownsSearch || ownsStatus ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {ownsSearch ? (
            <div className="relative min-w-48 flex-1">
              <SearchNormal1
                size={16}
                color="currentColor"
                className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <Input
                aria-label={t("tours.admin.approvals.search")}
                placeholder={t("tours.admin.approvals.search")}
                value={search}
                onChange={(e) => {
                  setInternalSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          ) : null}
          {ownsStatus ? (
            <Tabs
              selectedKey={statusFilter}
              onSelectionChange={(key) => {
                setInternalStatus(key as "all" | PackageApprovalStatus);
                setPage(1);
              }}
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label={t("tours.admin.approvals.search")}
                  className="bg-primary/15!"
                >
                  {STATUS_FILTERS.map((f) => (
                    <Tabs.Tab key={f.value} id={f.value}>
                      {t(f.labelKey)}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Box1 size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("tours.admin.approvals.empty")}</p>
        </div>
      ) : view === "table" ? (
        <>
          <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
            <ApprovalsTable
              rows={paged.map((p) => ({
                id: p.id,
                title: p.title,
                sub: p.agencyName,
                status: p.approvalStatus ?? "PENDING",
                createdAt: p.createdAt,
              }))}
              canReview
              busyId={busyId}
              onApprove={(id) => {
                const p = packages.find((x) => x.id === id);
                if (p) onApprove(p);
              }}
              onReject={(id) => {
                const p = packages.find((x) => x.id === id);
                if (p) onReject(p);
              }}
              titleHeader={t("admin.requests.colPackage")}
              subHeader={t("admin.requests.agencyLabel")}
              ariaLabel={t("admin.requests.tabs.tourApprovals")}
            />
          </div>
          <Pagination page={currentPage} total={pageCount} onChange={setPage} className="mt-2 shrink-0" />
        </>
      ) : (
        <>
          <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {paged.map((p) => {
              const status = approvalKey(p);
              return (
                <li
                  key={p.id}
                  className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.title}</p>
                      <p className="text-muted mt-0.5 truncate text-xs">
                        {t("tours.packages.byAgency", { name: p.agencyName })}
                      </p>
                    </div>
                    <StatusChip status={status} />
                  </div>

                  <p className="text-muted text-sm">
                    {p.province ? `${prettyEnum(p.province)} · ` : ""}
                    {t("tours.packages.days", { count: p.durationDays })} ·{" "}
                    {t("landing.tours.from")} {formatPrice(p.price, p.currency, lng)}
                  </p>

                  {status === "pending" ? (
                    <div className="border-border mt-auto flex items-center justify-between gap-2 border-t pt-3">
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="text-danger"
                        isPending={busyId === p.id}
                        onPress={() => onReject(p)}
                      >
                        <CloseCircle size={15} color="currentColor" />
                        {t("tours.admin.approvals.reject")}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        isPending={busyId === p.id}
                        onPress={() => onApprove(p)}
                      >
                        <TickCircle size={15} color="currentColor" />
                        {t("tours.admin.approvals.approve")}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          </div>
          <Pagination page={currentPage} total={pageCount} onChange={setPage} className="mt-2 shrink-0" />
        </>
      )}
    </div>
  );
}
