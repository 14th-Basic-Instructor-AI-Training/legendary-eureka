"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Buildings, SearchNormal1 } from "iconsax-reactjs";
import { Button, Chip, Input, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import type { AgencyRequestStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | AgencyRequestStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "approved", labelKey: "status.approved" },
  { value: "rejected", labelKey: "status.rejected" },
];

export function AgencyRequestsQueue() {
  const { t } = useTranslation();
  const { role } = useSession();
  const requests = useAdminStore((s) => s.agencyRequests);
  const approveAgency = useAdminStore((s) => s.approveAgency);
  const rejectAgency = useAdminStore((s) => s.rejectAgency);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgencyRequestStatus>("all");

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.agencyName.toLowerCase().includes(q) ||
      r.applicantName.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      {pendingCount > 0 ? (
        <div className="bg-warning/10 border-warning/30 flex items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-warning text-sm font-medium">
            {t("admin.requests.pendingCount", { count: pendingCount })}
          </span>
        </div>
      ) : null}

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label={t("admin.requests.searchPlaceholder")}
            placeholder={t("admin.requests.searchPlaceholder")}
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

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.requests.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="bg-surface border-border rounded-2xl border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="bg-violet-500/10 text-violet-600 mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Buildings size={18} color="currentColor" variant="Bold" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{r.agencyName}</p>
                        <StatusChip status={r.status} />
                      </div>
                      <p className="text-muted text-sm">
                        {t("admin.requests.by", { name: r.applicantName })}
                      </p>
                      <div className="text-muted/80 mt-1 flex flex-wrap gap-3 text-xs">
                        <span>{r.email}</span>
                        <span>·</span>
                        <span>{r.country}</span>
                        <span>·</span>
                        <span>{r.submittedAtLabel}</span>
                      </div>
                    </div>
                  </div>

                  {r.description ? (
                    <div className="mt-3 rounded-lg bg-black/5 px-3 py-2.5 dark:bg-white/5">
                      <p className="text-muted text-xs font-medium uppercase tracking-wide">
                        {t("admin.requests.applicationNote")}
                      </p>
                      <p className="text-foreground/80 mt-1 text-sm">{r.description}</p>
                    </div>
                  ) : null}
                </div>

                {r.status === "pending" ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-danger"
                      onPress={() => rejectAgency(role, r.id)}
                    >
                      <CloseCircle size={16} color="currentColor" />
                      {t("admin.requests.reject")}
                    </Button>
                    <Button variant="primary" size="sm" onPress={() => approveAgency(role, r.id)}>
                      <TickCircle size={16} color="currentColor" />
                      {t("admin.requests.approve")}
                    </Button>
                  </div>
                ) : (
                  <Chip
                    color={r.status === "approved" ? "success" : "danger"}
                    variant="soft"
                    size="sm"
                    className="shrink-0"
                  >
                    {t(`status.${r.status}`)}
                  </Chip>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
