"use client";

import { useTranslation } from "react-i18next";
import { Button, Reveal, Skeleton } from "@/ui";
import { TourCard } from "@/features/destinations/components/TourCard";
import { useResource } from "@/features/destinations/hooks";
import { getFeaturedTours } from "@/features/destinations/data";
import { SectionHeading } from "./SectionHeading";

function TourSkeleton() {
  return (
    <div className="bg-surface border-border overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Landing "Featured tours" row — multi-day packages from agencies. */
export function FeaturedTours() {
  const { t } = useTranslation();
  const { status, data, reload } = useResource(getFeaturedTours);

  return (
    <section id="tours" className="bg-surface/40 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading title={t("landing.tours.title")} subtitle={t("landing.tours.subtitle")} />

        {status === "loading" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <TourSkeleton key={i} />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
            <p className="text-muted text-sm">{t("destinations.states.error")}</p>
            <Button variant="secondary" size="sm" onPress={reload}>
              {t("common.retry")}
            </Button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="border-border rounded-2xl border border-dashed py-12 text-center">
            <p className="text-muted text-sm">{t("destinations.states.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((tour, i) => (
              <Reveal key={tour.id} delay={Math.min(i, 3) * 0.06}>
                <TourCard tour={tour} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
