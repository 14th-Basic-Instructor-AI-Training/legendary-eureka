"use client";

import { useTranslation } from "react-i18next";
import { Reveal, Skeleton } from "@/ui";
import { SectionHeading } from "@/features/landing/components/SectionHeading";
import { TrendingTourCard } from "@/features/tours/components/TrendingTourCard";
import { useExploreStore } from "@/features/explore/store";
import type { ExploreTour } from "@/features/explore/schema";
import type { ResourceStatus } from "../../hooks";

/**
 * "Tours in {name}" — packages running in the destination's province, rendered
 * with the shared `TrendingTourCard`. "View all" opens Explore on the Tours tab.
 * Presentational: the screen owns the fetch (it also feeds the hero tours count).
 */
export function ToursForDestination({
  destinationName,
  status,
  tours,
}: {
  destinationName: string;
  status: ResourceStatus;
  tours: ExploreTour[] | null;
}) {
  const { t } = useTranslation();

  // Hide the whole band when there are no tours (keeps the page tight).
  if (status === "success" && (!tours || tours.length === 0)) return null;

  return (
    <Reveal>
      <SectionHeading
        title={t("destinations.detail.toursIn", { name: destinationName })}
        actionLabel={t("common.viewAll")}
        actionHref="/explore"
        onAction={() => useExploreStore.getState().setTab("tours")}
        className="mb-5"
      />

      {status === "loading" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {(tours ?? []).slice(0, 4).map((tour) => (
            <TrendingTourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </Reveal>
  );
}
