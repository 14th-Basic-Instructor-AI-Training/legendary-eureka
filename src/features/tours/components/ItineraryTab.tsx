"use client";

import { useTranslation } from "react-i18next";
import type { TourDetail } from "../types";
import { TravelPlanTimeline } from "./TravelPlanTimeline";

/** Itinerary tab — the day-by-day travel-plan timeline. */
export function ItineraryTab({ tour }: { tour: TourDetail }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-foreground text-lg font-bold tracking-tight">
        {t("tours.detail.travelPlan.title")}
      </h2>
      <TravelPlanTimeline days={tour.travelPlan} />
    </div>
  );
}
