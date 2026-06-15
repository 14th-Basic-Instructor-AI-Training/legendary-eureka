"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { TOURS_CHANGED, DESTINATIONS_CHANGED } from "@/lib/realtime";
import { useRealtimeReload } from "@/lib/useRealtimeReload";
import { MarketingHeader } from "@/features/landing/components/MarketingHeader";
import { Footer } from "@/features/landing/components/Footer";
import { LoginPromptModal } from "@/features/landing/components/LoginPromptModal";
import type { Loadable } from "@/lib/useResource";
import { useResource } from "../hooks";
import { useExploreStore } from "../store";
import { getExploreDestinations, getExploreTours } from "../data";
import { ExploreTabs } from "./ExploreTabs";
import { ExploreToolbar } from "./ExploreToolbar";
import { SidebarPanel, MobileFilterDrawer } from "./ExploreSidebar";
import { ExploreResults, type ExplorePayload } from "./ExploreResults";

/**
 * Explore page — a two-column discovery surface. The Destinations / Tours tab
 * controls both the results grid and the sidebar facets. All view + filter state
 * lives in `useExploreStore`; results load through the data seam so loading /
 * error / empty states are exercised. Bookmarking a card as a guest opens a soft
 * login prompt (the write itself is gated in the store).
 */
export function ExploreScreen() {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const tab = useExploreStore((s) => s.tab);
  const sort = useExploreStore((s) => s.sort);
  const view = useExploreStore((s) => s.view);
  const destinationFilter = useExploreStore((s) => s.destinationFilter);
  const tourFilter = useExploreStore((s) => s.tourFilter);

  const activeFilter = tab === "destinations" ? destinationFilter : tourFilter;
  const resetKey = `${tab}|${sort}|${JSON.stringify(activeFilter)}`;

  const fetcher = useCallback(async (): Promise<Loadable<ExplorePayload>> => {
    if (tab === "destinations") {
      const res = await getExploreDestinations(destinationFilter, sort);
      return res.ok ? { ok: true, data: { tab: "destinations", items: res.data } } : { ok: false };
    }
    const res = await getExploreTours(tourFilter, sort);
    return res.ok ? { ok: true, data: { tab: "tours", items: res.data } } : { ok: false };
  }, [tab, sort, destinationFilter, tourFilter]);

  const { status, data, reload } = useResource(fetcher);
  const count = data?.items.length ?? 0;

  // Refetch when the admin publishes/archives/deletes a tour package (realtime),
  // and when this tab regains focus.
  useRealtimeReload(TOURS_CHANGED, reload);
  useRealtimeReload(DESTINATIONS_CHANGED, reload);

  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main className="pt-24 pb-16 md:pt-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Heading + tab switcher */}
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {t("explore.title")}
              </h1>
              <p className="text-muted mt-1 text-sm md:text-base">{t("explore.subtitle")}</p>
            </div>
            <ExploreTabs />
          </div>

          <div className="flex items-start gap-8">
            {/* Desktop sidebar */}
            <aside className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-[280px] shrink-0 overflow-y-auto pr-1 lg:block">
              <SidebarPanel />
            </aside>

            {/* Results column */}
            <div className="min-w-0 flex-1">
              <div className="mb-5">
                <ExploreToolbar
                  count={count}
                  loading={status === "loading"}
                  onOpenFilters={() => setFiltersOpen(true)}
                />
              </div>
              <ExploreResults
                status={status}
                payload={data}
                view={view}
                resetKey={resetKey}
                onRetry={reload}
                onRequireAuth={() => setLoginPromptOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <MobileFilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <LoginPromptModal isOpen={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </div>
  );
}
