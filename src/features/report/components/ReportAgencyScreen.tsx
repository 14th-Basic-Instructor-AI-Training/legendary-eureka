"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Buildings, Location } from "iconsax-reactjs";
import { Skeleton } from "@/ui";
import { useResource } from "@/lib/useResource";
import { getReportTarget } from "../data";
import { ReportForm } from "./ReportForm";
import { ReportSuccess } from "./ReportSuccess";

/**
 * Report-an-agency screen. Resolves the agency name for the header via the data
 * seam, then renders the form or the success state. Traveler-only — the
 * `(traveler)` shell guards the role; the data layer re-checks `reportAgency`.
 */
export function ReportAgencyScreen({ agencyId }: { agencyId: string }) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const fetcher = useCallback(() => getReportTarget(agencyId), [agencyId]);
  const { status, data } = useResource(fetcher);

  if (status === "loading") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-2xl items-center justify-center text-center">
        <p className="text-muted">{t("report.notFound")}</p>
      </div>
    );
  }

  if (submitted) return <ReportSuccess />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {t("report.title")}
        </h1>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          {t("report.subtitle")}
        </p>
      </div>

      {/* Agency context */}
      <div className="bg-background border-border flex items-center gap-3 rounded-2xl border p-4 shadow-sm">
        <span className="bg-primary-lightskyblue/15 text-primary-lightskyblue flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <Buildings size={22} color="currentColor" variant="Bold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-semibold">{data.agencyName}</p>
          <p className="text-muted flex items-center gap-1 text-sm">
            <Location size={14} color="currentColor" variant="Bold" />
            {t("report.reportingThis")}
          </p>
        </div>
      </div>

      <ReportForm agencyId={agencyId} onSubmitted={() => setSubmitted(true)} />
    </div>
  );
}
