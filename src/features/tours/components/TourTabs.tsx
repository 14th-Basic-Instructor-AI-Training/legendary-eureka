"use client";

import { useTranslation } from "react-i18next";
import { Tabs } from "@/ui";
import type { TourDetail } from "../types";
import { OverviewTab } from "./OverviewTab";
import { ItineraryTab } from "./ItineraryTab";
import { AgencyTab } from "./AgencyTab";
import { ReviewsTab } from "./ReviewsTab";

export type TourTabKey = "overview" | "itinerary" | "agency" | "reviews";

/** Tab navigation (Overview · Itinerary · Agency · Reviews) for the tour detail. */
export function TourTabs({
  tour,
  selectedKey,
  onSelectionChange,
}: {
  tour: TourDetail;
  selectedKey: TourTabKey;
  onSelectionChange: (key: TourTabKey) => void;
}) {
  const { t } = useTranslation();

  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(key) => onSelectionChange(key as TourTabKey)}
      variant="primary"
    >
      <Tabs.List aria-label={t("tours.detail.tabs.overview")}>
        <Tabs.Tab id="overview">{t("tours.detail.tabs.overview")}</Tabs.Tab>
        <Tabs.Tab id="itinerary">{t("tours.detail.tabs.itinerary")}</Tabs.Tab>
        <Tabs.Tab id="agency">{t("tours.detail.tabs.agency")}</Tabs.Tab>
        <Tabs.Tab id="reviews">{t("tours.detail.tabs.reviews")}</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel id="overview" className="pt-6">
        <OverviewTab tour={tour} />
      </Tabs.Panel>
      <Tabs.Panel id="itinerary" className="pt-6">
        <ItineraryTab tour={tour} />
      </Tabs.Panel>
      <Tabs.Panel id="agency" className="pt-6">
        <AgencyTab tour={tour} />
      </Tabs.Panel>
      <Tabs.Panel id="reviews" className="pt-6">
        <ReviewsTab tour={tour} />
      </Tabs.Panel>
    </Tabs>
  );
}
