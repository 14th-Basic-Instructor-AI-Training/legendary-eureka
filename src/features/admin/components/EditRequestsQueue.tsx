"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, NoteText, SearchNormal1, ArrowRight } from "iconsax-reactjs";
import { Button, Input, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import { cn } from "@/lib/utils";
import type { EditRequestStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | EditRequestStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

type Props = { view: "card" | "table" };

export function EditRequestsQueue({ view }: Props) {
  const { t } = useTranslation();
  const { role } = useSession();
  const editRequests = useAdminStore((s) => s.editRequests);
  const approveEditRequest = useAdminStore((s) => s.approveEditRequest);
  const rejectEditRequest = useAdminStore((s) => s.rejectEditRequest);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EditRequestStatus>("all");

  const filtered = editRequests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.activityTitle.toLowerCase().includes(q) ||
      r.agencyName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = editRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      {/* pending banner */}
      {pendingCount > 0 ? (
        <div className="bg-primary/8 border-primary/20 flex items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-primary text-sm font-medium">
            {t("admin.editRequests.pendingCount", { count: pendingCount })}
          </span>
        </div>
      ) : null}

      {/* search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label={t("admin.editRequests.searchPlaceholder")}
            placeholder={t("admin.editRequests.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-muted/10 text-muted hover:bg-muted/20",
              )}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <NoteText size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("admin.editRequests.empty")}</p>
        </div>
      ) : view === "table" ? (
        <TableView
          filtered={filtered}
          role={role}
          approveEditRequest={approveEditRequest}
          rejectEditRequest={rejectEditRequest}
          t={t}
        />
      ) : (
        <CardView
          filtered={filtered}
          role={role}
          approveEditRequest={approveEditRequest}
          rejectEditRequest={rejectEditRequest}
          t={t}
        />
      )}
    </div>
  );
}

// ─── shared prop type ────────────────────────────────────────────────────────

type QueueViewProps = {
  filtered: ReturnType<typeof useAdminStore.getState>["editRequests"];
  role: ReturnType<typeof useSession>["role"];
  approveEditRequest: ReturnType<typeof useAdminStore.getState>["approveEditRequest"];
  rejectEditRequest: ReturnType<typeof useAdminStore.getState>["rejectEditRequest"];
  t: (key: string, opts?: Record<string, unknown>) => string;
};

// ─── card view ───────────────────────────────────────────────────────────────

function CardView({ filtered, role, approveEditRequest, rejectEditRequest, t }: QueueViewProps) {
  return (
    <ul className="flex flex-col gap-3">
      {filtered.map((r) => (
        <li
          key={r.id}
          className={cn(
            "bg-surface border-border overflow-hidden rounded-2xl border",
            r.status === "pending" && "border-l-4 border-l-primary",
            r.status === "approved" && "border-l-4 border-l-green",
            r.status === "rejected" && "border-l-4 border-l-red",
          )}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  r.status === "pending" && "bg-primary/10 text-primary",
                  r.status === "approved" && "bg-green/10 text-green",
                  r.status === "rejected" && "bg-red/10 text-red",
                )}
              >
                <NoteText size={17} color="currentColor" variant="Bold" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-text-primary">{r.activityTitle}</p>
                  <StatusChip status={r.status} />
                </div>
                <p className="text-muted mt-0.5 text-sm">
                  {t("admin.editRequests.by", { agency: r.agencyName })}
                  {" · "}
                  {r.submittedAtLabel}
                </p>
              </div>
            </div>

            {/* before / after diff */}
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr]">
              {r.currentValue ? (
                <>
                  <div className="rounded-lg border-l-2 border-red pl-3 pr-2 py-2.5">
                    <p className="text-muted text-[10px] font-semibold uppercase tracking-wide">
                      {t("admin.editRequests.current")}
                    </p>
                    <p className="mt-1 text-sm text-red">{r.currentValue}</p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center">
                    <ArrowRight size={14} color="currentColor" className="text-muted" />
                  </div>
                </>
              ) : null}
              <div className="rounded-lg border-l-2 border-green pl-3 pr-2 py-2.5">
                <p className="text-muted text-[10px] font-semibold uppercase tracking-wide">
                  {t("admin.editRequests.proposed")}
                </p>
                <p className="mt-1 text-sm text-green">{r.requestedChanges}</p>
              </div>
            </div>
          </div>

          {/* action footer */}
          {r.status === "pending" ? (
            <div className="border-t border-border bg-bg-ghostwhite flex items-center justify-end gap-2 px-4 py-2.5">
              <Button
                variant="tertiary"
                size="sm"
                className="text-danger"
                onPress={() => rejectEditRequest(role, r.id)}
              >
                <CloseCircle size={15} color="currentColor" />
                {t("admin.editRequests.reject")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={() => approveEditRequest(role, r.id)}
              >
                <TickCircle size={15} color="currentColor" />
                {t("admin.editRequests.approve")}
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

// ─── table view ──────────────────────────────────────────────────────────────

function TableView({ filtered, role, approveEditRequest, rejectEditRequest, t }: QueueViewProps) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-ghostwhite border-b border-border">
            {["Activity", "Agency", "Requested Change", "Submitted", "Status", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr
              key={r.id}
              className="border-b border-border last:border-0 transition-colors hover:bg-bg-ghostwhite"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      r.status === "pending" && "bg-primary/10 text-primary",
                      r.status === "approved" && "bg-lightgreen text-green",
                      r.status === "rejected" && "bg-lightred text-red",
                    )}
                  >
                    <NoteText size={14} color="currentColor" variant="Bold" />
                  </span>
                  <span className="font-medium text-text-primary max-w-[160px] truncate">
                    {r.activityTitle}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-text-secondary">{r.agencyName}</td>
              <td className="px-4 py-3 text-text-secondary max-w-[200px]">
                <p className="truncate">{r.requestedChanges}</p>
              </td>
              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                {r.submittedAtLabel}
              </td>
              <td className="px-4 py-3">
                <StatusChip status={r.status} />
              </td>
              <td className="px-4 py-3">
                {r.status === "pending" ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-danger"
                      onPress={() => rejectEditRequest(role, r.id)}
                    >
                      <CloseCircle size={14} color="currentColor" />
                      {t("admin.editRequests.reject")}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => approveEditRequest(role, r.id)}
                    >
                      <TickCircle size={14} color="currentColor" />
                      {t("admin.editRequests.approve")}
                    </Button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
