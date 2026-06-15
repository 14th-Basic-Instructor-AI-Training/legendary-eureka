"use client";

import { useTranslation } from "react-i18next";
import { StatusChip } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { formatDate } from "@/lib/format";
import { Panel } from "./Panel";
import type { AdminAgencyRequestSummary } from "@/lib/api/admin";

/** The latest agency-onboarding requests; a shortcut into the full requests queue. */
export function RecentTableCard({ rows }: { rows: AdminAgencyRequestSummary[] }) {
  const { t, i18n } = useTranslation();

  return (
    <Panel
      title={t("admin.dashboard.recent.title")}
      subtitle={t("admin.dashboard.recent.subtitle")}
      action={
        <LocaleLink href="/admin/requests" className="text-primary text-sm font-medium hover:underline">
          {t("admin.dashboard.recent.viewAll")}
        </LocaleLink>
      }
    >
      {rows.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">{t("admin.dashboard.recent.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-border border-b text-left text-xs">
                <th className="pb-2 font-medium">{t("admin.dashboard.recent.col.agency")}</th>
                <th className="pb-2 font-medium">{t("admin.dashboard.recent.col.applicant")}</th>
                <th className="hidden pb-2 font-medium md:table-cell">
                  {t("admin.dashboard.recent.col.submitted")}
                </th>
                <th className="pb-2 text-right font-medium">{t("admin.dashboard.recent.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-border/60 border-b last:border-0">
                  <td className="text-primary py-3 font-medium">{r.agencyName}</td>
                  <td className="text-muted py-3">{r.applicantEmail ?? "—"}</td>
                  <td className="text-muted hidden py-3 md:table-cell">
                    {formatDate(r.createdAt, i18n.language)}
                  </td>
                  <td className="py-3 text-right">
                    <StatusChip status={r.status.toLowerCase()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
