"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, NoteText, SearchNormal1, ArrowRight } from "iconsax-reactjs";
import { Button, Input, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import type { EditRequestStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | EditRequestStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

export function EditRequestsQueue() {
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
      {pendingCount > 0 ? (
        <div className="bg-primary/8 border-primary/20 flex items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-primary text-sm font-medium">
            {t("admin.editRequests.pendingCount", { count: pendingCount })}
          </span>
        </div>
      ) : null}

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

      {filtered.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.editRequests.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((r) => (
            <li key={r.id} className="bg-surface border-border rounded-2xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary/10 text-primary mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <NoteText size={18} color="currentColor" variant="Bold" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{r.activityTitle}</p>
                        <StatusChip status={r.status} />
                      </div>
                      <p className="text-muted text-sm">
                        {t("admin.editRequests.by", { agency: r.agencyName })} · {r.submittedAtLabel}
                      </p>
                    </div>
                  </div>

                  {/* Before / After comparison */}
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr]">
                    {r.currentValue ? (
                      <>
                        <div className="rounded-lg bg-red-500/8 px-3 py-2.5">
                          <p className="text-muted text-xs font-medium uppercase tracking-wide">
                            {t("admin.editRequests.current")}
                          </p>
                          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                            {r.currentValue}
                          </p>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight size={16} color="currentColor" className="text-muted" />
                        </div>
                      </>
                    ) : null}
                    <div className="rounded-lg bg-green-500/8 px-3 py-2.5">
                      <p className="text-muted text-xs font-medium uppercase tracking-wide">
                        {t("admin.editRequests.proposed")}
                      </p>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                        {r.requestedChanges}
                      </p>
                    </div>
                  </div>
                </div>

                {r.status === "pending" ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-danger"
                      onPress={() => rejectEditRequest(role, r.id)}
                    >
                      <CloseCircle size={16} color="currentColor" />
                      {t("admin.editRequests.reject")}
                    </Button>
                    <Button variant="primary" size="sm" onPress={() => approveEditRequest(role, r.id)}>
                      <TickCircle size={16} color="currentColor" />
                      {t("admin.editRequests.approve")}
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
