"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Box1, SearchNormal1 } from "iconsax-reactjs";
import { Button, Input, Pagination, StatusChip, Tabs, useConfirm } from "@/ui";
import { formatPrice } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { useToursStore } from "../store";
import type { PackageApprovalStatus, TourPackage } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | PackageApprovalStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

/** Cards per page. */
const PAGE_SIZE = 9;

/**
 * Admin: review tour packages agencies submitted for approval. Reuses the
 * Requests-queue look (search + status tabs + card grid + approve/reject).
 * Draft packages aren't shown — only those submitted for review.
 */
export function TourApprovalsQueue() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const packages = useToursStore((s) => s.packages);
  const approvePackage = useToursStore((s) => s.approvePackage);
  const rejectPackage = useToursStore((s) => s.rejectPackage);
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PackageApprovalStatus>("all");
  const [page, setPage] = useState(1);

  const submitted = packages.filter((p) => p.status !== "draft");
  const filtered = submitted.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.agencyName.toLowerCase().includes(q) ||
      p.destinationName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = submitted.filter((p) => p.status === "pending").length;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onApprove = (p: TourPackage) =>
    confirm({
      title: t("tours.admin.approvals.approve"),
      description: p.title,
      intent: "primary",
      onConfirm: () => {
        approvePackage(role, p.id);
      },
    });

  const onReject = (p: TourPackage) =>
    confirm({
      title: t("tours.admin.approvals.reject"),
      description: p.title,
      intent: "danger",
      onConfirm: () => {
        rejectPackage(role, p.id);
      },
    });

  return (
    <div className="flex flex-col gap-4">
      {pendingCount > 0 ? (
        <div className="bg-warning/10 border-warning/30 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-warning text-sm font-medium">
            {t("tours.admin.approvals.pendingCount", { count: pendingCount })}
          </span>
        </div>
      ) : null}

      {/* search + status filter */}
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
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => {
            setStatusFilter(key as "all" | PackageApprovalStatus);
            setPage(1);
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label={t("tours.admin.approvals.title")} className="bg-primary/15!">
              {STATUS_FILTERS.map((f) => (
                <Tabs.Tab key={f.value} id={f.value}>
                  {t(f.labelKey)}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

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
            {paged.map((p) => (
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
                  <StatusChip status={p.status} />
                </div>

                <p className="text-muted text-sm">
                  {p.destinationName} · {t("tours.packages.days", { count: p.days })} ·{" "}
                  {t("landing.tours.from")} {formatPrice(p.priceFrom, p.currency, lng)}
                </p>

                {p.status === "pending" ? (
                  <div className="border-border mt-auto flex items-center justify-end gap-2 border-t pt-3">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-danger"
                      onPress={() => onReject(p)}
                    >
                      <CloseCircle size={15} color="currentColor" />
                      {t("tours.admin.approvals.reject")}
                    </Button>
                    <Button variant="primary" size="sm" onPress={() => onApprove(p)}>
                      <TickCircle size={15} color="currentColor" />
                      {t("tours.admin.approvals.approve")}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <Pagination page={currentPage} total={pageCount} onChange={setPage} className="mt-2" />
        </>
      )}
    </div>
  );
}
