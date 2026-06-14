"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Flag } from "iconsax-reactjs";
import { Button, Chip, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAdminStore } from "../store";
import type { Report, ReportSeverity } from "../schema";

/** Accent + soft tones per severity (white-card theme). */
const SEVERITY: Record<ReportSeverity, { rail: string; soft: string; text: string }> = {
  low: { rail: "bg-muted/40", soft: "bg-muted/10", text: "text-muted" },
  medium: { rail: "bg-warning", soft: "bg-warning/10", text: "text-warning" },
  high: { rail: "bg-danger", soft: "bg-danger/10", text: "text-danger" },
};

/** Inline resolve/dismiss controls with an optional admin note. */
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
    <div className="border-border bg-bg-ghostwhite -mx-4 -mb-4 mt-1 flex flex-col gap-2 border-t px-4 py-3">
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
      <div className="flex justify-end gap-2">
        <Button variant="tertiary" size="sm" className="text-danger" onPress={handleDismiss}>
          <CloseCircle size={15} color="currentColor" />
          {t("admin.reports.dismiss")}
        </Button>
        <Button variant="primary" size="sm" onPress={handleResolve}>
          <TickCircle size={15} color="currentColor" />
          {t("admin.reports.resolve")}
        </Button>
      </div>
    </div>
  );
}

type Props = {
  report: Report;
  /** Total reports filed against the same agency — drives the repeat-offender chip. */
  agencyReportCount: number;
};

export function ReportCard({ report: r, agencyReportCount }: Props) {
  const { t } = useTranslation();
  const sev = SEVERITY[r.severity];

  return (
    <div className="bg-surface border-border relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 pl-5 shadow-primary">
      {/* severity accent rail */}
      <span className={cn("absolute inset-y-0 left-0 w-1", sev.rail)} aria-hidden />

      {/* header: type + timestamp / status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              sev.soft,
              sev.text,
            )}
          >
            <Flag size={16} color="currentColor" variant="Bold" />
          </span>
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-semibold leading-tight">
              {t("admin.reports.cardType")}
            </p>
            <p className="text-muted text-xs">{r.submittedAtLabel}</p>
          </div>
        </div>
        <StatusChip status={r.status} />
      </div>

      {/* target agency + severity + repeat-offender */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-text-primary font-semibold">
          {t("admin.reports.against", { agency: r.targetAgency })}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            sev.soft,
            sev.text,
          )}
        >
          {t(`admin.reports.severity.${r.severity}`)}
        </span>
        {agencyReportCount > 1 ? (
          <Chip color="danger" variant="soft" size="sm">
            {t("admin.reports.agencyCount", { count: agencyReportCount })}
          </Chip>
        ) : null}
      </div>

      <p className="text-muted text-sm">{t("admin.reports.by", { name: r.reporterName })}</p>

      {/* reason */}
      <div className="bg-bg-ghostwhite rounded-xl px-3 py-2.5">
        <p className="text-muted text-[10px] font-medium uppercase tracking-wide">
          {t("admin.reports.reason")}
        </p>
        <p className="text-foreground/80 mt-1 text-sm">{r.reason}</p>
      </div>

      {/* admin note (resolved / dismissed) */}
      {r.adminNote ? (
        <div className="border-border rounded-lg border-l-4 border-l-[var(--primary)] bg-black/5 px-3 py-2 dark:bg-white/5">
          <p className="text-muted text-xs font-medium uppercase tracking-wide">
            {t("admin.reports.adminNote")}
          </p>
          <p className="text-foreground/80 mt-1 text-sm">{r.adminNote}</p>
        </div>
      ) : null}

      {/* inline actions for open reports */}
      {r.status === "open" ? <ResolvePanel report={r} /> : null}
    </div>
  );
}
