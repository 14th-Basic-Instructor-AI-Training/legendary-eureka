"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Box1, SearchNormal1 } from "iconsax-reactjs";
import { Button, Input, Pagination, StatusChip, useConfirm } from "@/ui";
import { formatPrice } from "@/lib/format";
import { sendRealtime, TOURS_CHANGED } from "@/lib/realtime";
import { approvePackageAction, rejectPackageAction } from "@/actions/tours";
import type { PackageApprovalStatus } from "../schema";
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
};

export function TourApprovalsQueue({
  packages,
  hidePendingBanner = false,
  statusFilter = "all",
  search: searchProp,
}: Props) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useRouter();
  const confirm = useConfirm();

  const [internalSearch, setInternalSearch] = useState("");
  // When the host passes `search`, it owns the input and we hide our own.
  const ownsSearch = searchProp === undefined;
  const search = searchProp ?? internalSearch;
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
  const runAction = async (id: string, action: (id: string) => Promise<{ ok: boolean }>) => {
    setBusyId(id);
    const res = await action(id);
    setBusyId(null);
    if (res?.ok) sendRealtime({ event: TOURS_CHANGED, data: { id } });
    router.refresh();
  };

  const onApprove = async (p: TourPackageResponse) => {
    const ok = await confirm({
      title: t("tours.admin.approvals.approve"),
      description: p.title,
      intent: "primary",
    });
    if (ok) runAction(p.id, approvePackageAction);
  };

  const onReject = async (p: TourPackageResponse) => {
    const ok = await confirm({
      title: t("tours.admin.approvals.reject"),
      description: p.title,
      intent: "danger",
    });
    if (ok) runAction(p.id, (id) => rejectPackageAction(id));
  };

  return (
    <div className="flex flex-col gap-4">
      {!hidePendingBanner && pendingCount > 0 ? (
        <div className="bg-warning/10 border-warning/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-warning text-sm font-medium">
            {t("tours.admin.approvals.pendingCount", { count: pendingCount })}
          </span>
        </div>
      ) : null}

      {/* search (status filter is the host's dropdown in the package row) */}
      {ownsSearch ? (
        <div className="flex flex-wrap items-center gap-3">
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
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Box1 size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("tours.admin.approvals.empty")}</p>
        </div>
      ) : (
        <>
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
          <Pagination page={currentPage} total={pageCount} onChange={setPage} className="mt-2" />
        </>
      )}
    </div>
  );
}
