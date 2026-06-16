"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Chip, Tabs } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useRealtimeReload } from "@/lib/useRealtimeReload";
import { AGENCY_REGISTERED } from "@/lib/realtime";
import { AgencyRequestsQueue } from "./AgencyRequestsQueue";
import { TourApprovalsQueue } from "@/features/tours/components/TourApprovalsQueue";
import { DestinationApprovalsQueue } from "@/features/tours/components/DestinationApprovalsQueue";
import { cn } from "@/lib/utils";
import type { AdminAgencyProfile } from "@/lib/api/admin";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { DestinationResponse } from "@/lib/api/destinations";

const RequestFlowPanel = dynamic(
  () =>
    import("./RequestFlowPanel").then((m) => ({ default: m.RequestFlowPanel })),
  { ssr: false },
);

type View = "card" | "table";
type RequestTab = "agencies" | "tourApprovals" | "destinations";

type Props = {
  agencies: AdminAgencyProfile[];
  tourApprovals?: TourPackageResponse[];
  pendingDestinations?: DestinationResponse[];
};

export function RequestsPage({
  agencies,
  tourApprovals = [],
  pendingDestinations = [],
}: Props) {
  const { t } = useTranslation();
  const params = useSearchParams();
  const tab = (params.get("tab") ?? "agencies") as RequestTab;
  const router = useLocalizedRouter();
  const refreshRouter = useRouter();
  const [view, setView] = useState<View>("card");

  // A newly-registered agency emits `AGENCY_REGISTERED`; refetch so it shows in
  // the queue (and bumps the pending-count chip) live, without a manual reload.
  useRealtimeReload(AGENCY_REGISTERED, () => refreshRouter.refresh());

  const pendingAgency = agencies.filter((r) => r.status === "PENDING").length;
  const pendingTour = tourApprovals.filter((p) => p.approvalStatus === "PENDING").length;
  const pendingDestination = pendingDestinations.length;

  // The React Flow lifecycle panel only models the agency onboarding flow.
  const showFlow = tab === "agencies";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 items-start",
        showFlow && "xl:grid-cols-[7fr_3fr]",
      )}
    >
      {/* ── left column ── */}
      <div className="flex flex-col gap-6">
        {/* page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-primary text-2xl font-bold tracking-tight">
              {t("admin.nav.requests")}
            </h1>
            <p className="text-muted mt-1 text-sm">{t("admin.pages.requests.subtitle")}</p>
          </div>

          {/* view toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-ghostwhite p-0.5 shrink-0">
            <button
              type="button"
              aria-label={t("admin.requests.viewCard")}
              onClick={() => setView("card")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "card"
                  ? "bg-white text-primary shadow-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              type="button"
              aria-label={t("admin.requests.viewTable")}
              onClick={() => setView("table")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "table"
                  ? "bg-white text-primary shadow-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* tabs */}
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) =>
            router.replace(`/admin/requests?tab=${String(key)}`)
          }
        >
          <div className="flex items-center justify-between gap-3">
            <Tabs.ListContainer>
              <Tabs.List aria-label={t("admin.nav.requests")} className="bg-primary/15! w-fit!">
                <Tabs.Tab id="agencies">
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {t("admin.requests.tabs.agencies")}
                  {pendingAgency > 0 ? (
                    <Chip color="warning" variant="soft" size="sm">
                      {pendingAgency}
                    </Chip>
                  ) : null}
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="tourApprovals">
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {t("admin.requests.tabs.tourApprovals")}
                  {pendingTour > 0 ? (
                    <Chip color="warning" variant="soft" size="sm">
                      {pendingTour}
                    </Chip>
                  ) : null}
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="destinations">
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {t("admin.requests.tabs.destinations")}
                  {pendingDestination > 0 ? (
                    <Chip color="warning" variant="soft" size="sm">
                      {pendingDestination}
                    </Chip>
                  ) : null}
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
            </Tabs.ListContainer>

            {tab === "agencies" && pendingAgency > 0 ? (
              <div className="bg-warning/10 border-warning/30 flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5">
                <span className="text-warning text-sm font-medium">
                  {t("admin.requests.pendingCount", { count: pendingAgency })}
                </span>
              </div>
            ) : null}
          </div>
          <Tabs.Panel id="agencies" className="pt-5">
            <AgencyRequestsQueue view={view} requests={agencies} />
          </Tabs.Panel>
          <Tabs.Panel id="tourApprovals" className="pt-5">
            <TourApprovalsQueue packages={tourApprovals} />
          </Tabs.Panel>
          <Tabs.Panel id="destinations" className="pt-5">
            <DestinationApprovalsQueue destinations={pendingDestinations} />
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* ── right column: React Flow panel (agency onboarding flow only) ── */}
      {showFlow ? (
        <div className="hidden xl:block">
          <RequestFlowPanel tab="agencies" agencies={agencies} editRequests={[]} />
        </div>
      ) : null}
    </div>
  );
}
