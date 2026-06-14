"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Chip, Tabs } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { useAdminStore } from "../store";
import { AgencyRequestsQueue } from "./AgencyRequestsQueue";
import { EditRequestsQueue } from "./EditRequestsQueue";
import { cn } from "@/lib/utils";

const RequestFlowPanel = dynamic(
  () =>
    import("./RequestFlowPanel").then((m) => ({ default: m.RequestFlowPanel })),
  { ssr: false },
);

type View = "card" | "table";

export function RequestsPage() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const tab = (params.get("tab") ?? "agencies") as "agencies" | "editRequests";
  const router = useLocalizedRouter();
  const [view, setView] = useState<View>("card");

  const agencyRequests = useAdminStore((s) => s.agencyRequests);
  const editRequests = useAdminStore((s) => s.editRequests);

  const pendingAgency = agencyRequests.filter((r) => r.status === "pending").length;
  const pendingEdit = editRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-6 items-start">
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
              <Tabs.Tab id="editRequests">
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {t("admin.requests.tabs.editRequests")}
                  {pendingEdit > 0 ? (
                    <Chip color="accent" variant="soft" size="sm">
                      {pendingEdit}
                    </Chip>
                  ) : null}
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
            </Tabs.ListContainer>

            {tab === "agencies"
              ? pendingAgency > 0 && (
                  <div className="bg-warning/10 border-warning/30 flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5">
                    <span className="text-warning text-sm font-medium">
                      {t("admin.requests.pendingCount", { count: pendingAgency })}
                    </span>
                  </div>
                )
              : pendingEdit > 0 && (
                  <div className="bg-primary/8 border-primary/20 flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5">
                    <span className="text-primary text-sm font-medium">
                      {t("admin.editRequests.pendingCount", { count: pendingEdit })}
                    </span>
                  </div>
                )}
          </div>
          <Tabs.Panel id="agencies" className="pt-5">
            <AgencyRequestsQueue view={view} />
          </Tabs.Panel>
          <Tabs.Panel id="editRequests" className="pt-5">
            <EditRequestsQueue view={view} />
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* ── right column: React Flow panel ── */}
      <div className="hidden xl:block">
        <RequestFlowPanel tab={tab} />
      </div>
    </div>
  );
}
