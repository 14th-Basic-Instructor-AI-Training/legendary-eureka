"use client";

import { useTranslation } from "react-i18next";
import { CloseCircle } from "iconsax-reactjs";
import { Button } from "@/ui";
import { useExploreStore } from "../store";
import { DestinationFilters } from "./filters/DestinationFilters";
import { TourFilters } from "./filters/TourFilters";

/** The filter panel content — the active tab's facets plus "Clear all filters". */
export function SidebarPanel() {
  const { t } = useTranslation();
  const tab = useExploreStore((s) => s.tab);
  const clearFilters = useExploreStore((s) => s.clearFilters);

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">{t("explore.filters.title")}</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-primary text-xs font-medium hover:underline"
        >
          {t("explore.filters.clearAll")}
        </button>
      </div>
      {tab === "destinations" ? <DestinationFilters /> : <TourFilters />}
    </div>
  );
}

/** Off-canvas drawer wrapping the same panel on mobile / narrow screens. */
export function MobileFilterDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-background absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto p-5 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-foreground text-lg font-semibold">{t("explore.filters.title")}</h2>
          <button type="button" onClick={onClose} aria-label={t("explore.filters.close")}>
            <CloseCircle size={22} color="currentColor" className="text-muted" />
          </button>
        </div>
        <SidebarPanel />
        <div className="mt-4">
          <Button variant="primary" size="md" className="w-full" onPress={onClose}>
            {t("explore.filters.showResults")}
          </Button>
        </div>
      </div>
    </div>
  );
}
