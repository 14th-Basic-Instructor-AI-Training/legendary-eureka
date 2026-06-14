"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Flag } from "iconsax-reactjs";
import { Button, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAdminStore } from "../store";

/** Traveler reports queue: Admin resolves or dismisses reports against agencies. */
export function ReportsQueue() {
  const { t } = useTranslation();
  const { role } = useSession();
  const reports = useAdminStore((s) => s.reports);
  const resolveReport = useAdminStore((s) => s.resolveReport);
  const dismissReport = useAdminStore((s) => s.dismissReport);

  if (reports.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("admin.reports.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((r) => (
        <li key={r.id} className="bg-surface border-border rounded-2xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-danger/10 text-danger inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <Flag size={18} color="currentColor" variant="Bold" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{t("admin.reports.against", { agency: r.targetAgency })}</p>
                    <StatusChip status={r.status} />
                  </div>
                  <p className="text-muted text-sm">
                    {t("admin.reports.by", { name: r.reporterName })} · {r.submittedAtLabel}
                  </p>
                </div>
              </div>
              <p className="text-foreground/80 mt-2 text-sm">{r.reason}</p>
            </div>

            {r.status === "open" ? (
              <div className="flex gap-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onPress={() => dismissReport(role, r.id)}
                >
                  <CloseCircle size={16} color="currentColor" />
                  {t("admin.reports.dismiss")}
                </Button>
                <Button variant="primary" size="sm" onPress={() => resolveReport(role, r.id)}>
                  <TickCircle size={16} color="currentColor" />
                  {t("admin.reports.resolve")}
                </Button>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
