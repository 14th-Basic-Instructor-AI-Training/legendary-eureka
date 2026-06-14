"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Flag, SearchNormal1 } from "iconsax-reactjs";
import { Button, Chip, Input, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";
import type { Report, ReportSeverity, ReportStatus } from "../schema";

const STATUS_FILTERS: Array<{ value: "all" | ReportStatus; labelKey: string }> = [
  { value: "all", labelKey: "common.all" },
  { value: "open", labelKey: "status.open" },
  { value: "resolved", labelKey: "status.resolved" },
  { value: "dismissed", labelKey: "status.dismissed" },
];

const SEVERITY_COLOR: Record<ReportSeverity, string> = {
  low: "text-muted bg-muted/10",
  medium: "text-warning bg-warning/10",
  high: "text-danger bg-danger/10",
};

function agencyReportCount(reports: Report[], agency: string) {
  return reports.filter((r) => r.targetAgency === agency).length;
}

function ResolvePanel({ report }: { report: Report }) {
  const { t } = useTranslation();
  const { role } = useSession();
  const resolveReport = useAdminStore((s) => s.resolveReport);
  const dismissReport = useAdminStore((s) => s.dismissReport);
  const addReportNote = useAdminStore((s) => s.addReportNote);

  const [note, setNote] = useState(report.adminNote ?? "");
  const [showNote, setShowNote] = useState(false);

  const handleResolve = () => {
    if (note.trim()) addReportNote(role, report.id, note.trim());
    resolveReport(role, report.id);
  };

  const handleDismiss = () => {
    if (note.trim()) addReportNote(role, report.id, note.trim());
    dismissReport(role, report.id);
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {showNote ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("admin.reports.addNote")}
          rows={2}
          className="border-border bg-surface text-foreground placeholder:text-muted w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNote(true)}
          className="text-muted hover:text-foreground self-start text-xs underline underline-offset-2"
        >
          {t("admin.reports.addNote")}
        </button>
      )}
      <div className="flex gap-2">
        <Button variant="tertiary" size="sm" onPress={handleDismiss}>
          <CloseCircle size={16} color="currentColor" />
          {t("admin.reports.dismiss")}
        </Button>
        <Button variant="primary" size="sm" onPress={handleResolve}>
          <TickCircle size={16} color="currentColor" />
          {t("admin.reports.resolve")}
        </Button>
      </div>
    </div>
  );
}

export function ReportsQueue() {
  const { t } = useTranslation();
  const reports = useAdminStore((s) => s.reports);

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

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="flex flex-col gap-4">
      {openCount > 0 ? (
        <div className="bg-danger/8 border-danger/20 flex items-center gap-2 rounded-xl border px-4 py-2.5">
          <span className="text-danger text-sm font-medium">
            {t("admin.reports.openCount", { count: openCount })}
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
            aria-label={t("admin.reports.searchPlaceholder")}
            placeholder={t("admin.reports.searchPlaceholder")}
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
        <p className="text-muted py-8 text-center text-sm">{t("admin.reports.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((r) => {
            const totalAgencyReports = agencyReportCount(reports, r.targetAgency);
            return (
              <li key={r.id} className="bg-surface border-border rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <span className="bg-danger/10 text-danger mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Flag size={18} color="currentColor" variant="Bold" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {t("admin.reports.against", { agency: r.targetAgency })}
                          </p>
                          <StatusChip status={r.status} />
                          {/* Severity badge */}
                          <span
                            className={[
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              SEVERITY_COLOR[r.severity],
                            ].join(" ")}
                          >
                            {t(`admin.reports.severity.${r.severity}`)}
                          </span>
                        </div>
                        <p className="text-muted text-sm">
                          {t("admin.reports.by", { name: r.reporterName })} · {r.submittedAtLabel}
                        </p>
                        {/* Multiple reports warning */}
                        {totalAgencyReports > 1 ? (
                          <Chip color="danger" variant="soft" size="sm" className="mt-1.5">
                            {t("admin.reports.agencyCount", { count: totalAgencyReports })}
                          </Chip>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-foreground/80 mt-3 text-sm">{r.reason}</p>

                    {/* Admin note (resolved/dismissed) */}
                    {r.adminNote ? (
                      <div className="border-border mt-3 rounded-lg border-l-4 border-l-[var(--primary)] bg-black/5 px-3 py-2 dark:bg-white/5">
                        <p className="text-muted text-xs font-medium uppercase tracking-wide">
                          {t("admin.reports.adminNote")}
                        </p>
                        <p className="text-foreground/80 mt-1 text-sm">{r.adminNote}</p>
                      </div>
                    ) : null}

                    {r.status === "open" ? <ResolvePanel report={r} /> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
