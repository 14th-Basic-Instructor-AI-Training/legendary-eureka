"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Hierarchy } from "iconsax-reactjs";
import { Chip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useRealtimeReload } from "@/lib/useRealtimeReload";
import { AGENCY_REGISTERED } from "@/lib/realtime";
import { AgencyRequestsQueue } from "./AgencyRequestsQueue";
import { TourApprovalsQueue } from "@/features/tours/components/TourApprovalsQueue";
import { DestinationApprovalsQueue } from "@/features/tours/components/DestinationApprovalsQueue";
import { cn } from "@/lib/utils";
import type { FlowItem } from "./RequestFlowPanel";
import type { AdminAgencyProfile } from "@/lib/api/admin";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { DestinationResponse } from "@/lib/api/destinations";

/** Outer concave fillet that blends the active tab's base down into the panel. */
const FILLET = "radial-gradient(circle 14px at top SIDE, transparent 13px, var(--color-bg-dashboard) 14px)";

const RequestFlowPanel = dynamic(
  () =>
    import("./RequestFlowPanel").then((m) => ({ default: m.RequestFlowPanel })),
  { ssr: false },
);

type View = "card" | "table" | "flow";
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
  const pendingDestination = pendingDestinations.filter(
    (d) => d.approvalStatus === "PENDING",
  ).length;

  const tabs: Array<{ id: RequestTab; label: string; count: number }> = [
    { id: "agencies", label: t("admin.requests.tabs.agencies"), count: pendingAgency },
    { id: "tourApprovals", label: t("admin.requests.tabs.tourApprovals"), count: pendingTour },
    { id: "destinations", label: t("admin.requests.tabs.destinations"), count: pendingDestination },
  ];

  // The flow view groups the active tab's items by submission day. Each tab maps
  // its own data into the shared FlowItem shape.
  const flowItems: FlowItem[] =
    tab === "agencies"
      ? agencies.map((a) => ({
          id: a.id,
          title: a.agencyName,
          sub: a.email,
          status: a.status,
          createdAt: a.createdAt,
        }))
      : tab === "tourApprovals"
        ? tourApprovals.map((p) => ({
            id: p.id,
            title: p.title,
            sub: p.agencyName,
            status: p.approvalStatus ?? "PENDING",
            createdAt: p.createdAt,
          }))
        : pendingDestinations.map((d) => ({
            id: d.id,
            title: d.name,
            sub: d.province,
            status: d.approvalStatus,
            createdAt: d.createdAt,
          }));
  const flowTitle =
    tab === "agencies"
      ? t("admin.requests.flow.agencyTitle")
      : tab === "tourApprovals"
        ? t("admin.requests.flow.tourTitle")
        : t("admin.requests.flow.destinationTitle");

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
        {/* page header */}
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <h1 className="text-primary text-2xl font-bold tracking-tight">
              {t("admin.nav.requests")}
            </h1>
            <p className="text-muted mt-1 text-sm">{t("admin.pages.requests.subtitle")}</p>
          </div>

          {/* view toggle — card / table / flow, available on every tab */}
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
            <button
              type="button"
              aria-label={t("admin.requests.viewFlow")}
              onClick={() => setView("flow")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "flow"
                  ? "bg-white text-primary shadow-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Hierarchy size={16} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Folder-tab header + panel — the active tab's notch slides between tabs
            and connects seamlessly into the panel below (matches the content page). */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            role="tablist"
            aria-label={t("admin.nav.requests")}
            className="relative z-10 flex shrink-0 justify-center gap-1"
          >
            {tabs.map((tt) => {
              const active = tab === tt.id;
              return (
                <button
                  key={tt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => router.replace(`/admin/requests?tab=${tt.id}`)}
                  className="relative px-8 pt-3 pb-4 cursor-pointer text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-2xl"
                >
                  {active ? (
                    <motion.span
                      layoutId="requestsTabNotch"
                      aria-hidden="true"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                      className="bg-bg-dashboard absolute inset-0 -z-10 rounded-t-2xl"
                    >
                      {/* Outer concave fillets — the curve flows from the tab side
                          down into the panel, instead of biting into the tab. */}
                      <motion.span
                        layout
                        className="absolute bottom-0 left-0 h-[14px] w-[14px] -translate-x-full"
                        style={{ background: FILLET.replace("SIDE", "left") }}
                      />
                      <motion.span
                        layout
                        className="absolute bottom-0 right-0 h-[14px] w-[14px] translate-x-full"
                        style={{ background: FILLET.replace("SIDE", "right") }}
                      />
                    </motion.span>
                  ) : null}
                  <span
                    className={cn(
                      "relative flex items-center gap-2 whitespace-nowrap transition-colors",
                      active ? "text-primary" : "text-muted hover:text-foreground",
                    )}
                  >
                    {tt.label}
                    {tt.count > 0 ? (
                      <Chip color="warning" variant="soft" size="sm">
                        {tt.count}
                      </Chip>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel — same bg-dashboard fill the active notch connects into. */}
          <div className="bg-bg-dashboard flex min-h-0 flex-1 flex-col rounded-t-3xl rounded-b-2xl p-5 sm:p-6">
            {view === "flow" ? (
              <RequestFlowPanel
                items={flowItems}
                title={flowTitle}
                subtitle={t("admin.requests.flow.byDaySub")}
              />
            ) : tab === "agencies" ? (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                {pendingAgency > 0 ? (
                  <div className="bg-warning/10 border-warning/30 flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5">
                    <span className="text-warning text-sm font-medium">
                      {t("admin.requests.pendingCount", { count: pendingAgency })}
                    </span>
                  </div>
                ) : null}
                <AgencyRequestsQueue view={view} requests={agencies} />
              </div>
            ) : tab === "tourApprovals" ? (
              <TourApprovalsQueue packages={tourApprovals} view={view} />
            ) : (
              <DestinationApprovalsQueue destinations={pendingDestinations} view={view} />
            )}
          </div>
        </div>
    </div>
  );
}
