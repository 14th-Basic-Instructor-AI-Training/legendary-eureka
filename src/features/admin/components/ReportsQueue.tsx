"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flag, SearchNormal1 } from "iconsax-reactjs";
import { Input, Pagination, Tabs } from "@/ui";
import { cn } from "@/lib/utils";
import { useAdminStore } from "../store";
import { useReportRealtime } from "../hooks";
import { ReportCard } from "./ReportCard";
import type { Report, ReportStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | ReportStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "open", labelKey: "status.open" },
  { value: "resolved", labelKey: "status.resolved" },
  { value: "dismissed", labelKey: "status.dismissed" },
];

function agencyReportCount(reports: Report[], agency: string) {
  return reports.filter((r) => r.targetAgency === agency).length;
}

/** Report cards per page. */
const PAGE_SIZE = 9;

/** A single summary metric tile in the header strip. */
function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "muted";
}) {
  const toneText =
    tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-muted";
  const toneDot =
    tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-muted/50";
  return (
    <div className="bg-surface border-border flex flex-col gap-1 rounded-2xl border p-4 shadow-primary">
      <span className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", toneDot)} aria-hidden />
        <span className="text-muted text-xs font-medium">{label}</span>
      </span>
      <span className={cn("text-2xl font-bold tabular-nums", toneText)}>{value}</span>
    </div>
  );
}

export function ReportsQueue({
  initialReports = [],
  loadError = false,
}: {
  /** Server-fetched reports (GET /admin/reports), adapted in the route file. */
  initialReports?: Report[];
  loadError?: boolean;
}) {
  const { t } = useTranslation();
  const reports = useAdminStore((s) => s.reports);
  const setReports = useAdminStore((s) => s.setReports);

  // Hydrate the store once from the server fetch. The store is module-global, so
  // a ref guard keeps later re-renders from clobbering in-progress triage.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    setReports(initialReports);
  }, [initialReports, setReports]);

  // Live ingest: new reports emitted by travelers/agencies (tag
  // `agency-report-<uuid>`) stream into the queue without a refresh.
  useReportRealtime();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");

  const filtered = reports.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.targetAgency.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Client-side pagination. `page` is clamped at render so it stays valid when
  // the filtered set shrinks (no setState-in-effect needed).
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCount = reports.filter((r) => r.status === "open").length;
  const highCount = reports.filter((r) => r.status === "open" && r.severity === "high").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="flex flex-col gap-5">
      {/* summary strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label={t("admin.reports.summary.open")} value={openCount} tone="danger" />
        <StatTile
          label={t("admin.reports.summary.highSeverity")}
          value={highCount}
          tone="warning"
        />
        <StatTile
          label={t("admin.reports.summary.resolved")}
          value={resolvedCount}
          tone="muted"
        />
      </div>

      {/* search + status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            aria-label={t("admin.reports.searchPlaceholder")}
            placeholder={t("admin.reports.searchPlaceholder")}
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
            setStatusFilter(key as "all" | ReportStatus);
            setPage(1);
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label={t("admin.reports.title")} className="bg-primary/15!">
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

      {/* list */}
      {loadError && reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-danger/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Flag size={22} color="currentColor" className="text-danger" />
          </span>
          <p className="text-muted text-sm">{t("admin.reports.error")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="bg-muted/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Flag size={22} color="currentColor" className="text-muted" />
          </span>
          <p className="text-muted text-sm">{t("admin.reports.empty")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                agencyReportCount={agencyReportCount(reports, r.targetAgency)}
              />
            ))}
          </div>
          <Pagination
            page={currentPage}
            total={pageCount}
            onChange={setPage}
            className="mt-2"
          />
        </>
      )}
    </div>
  );
}
