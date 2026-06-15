"use client";

import { useTranslation } from "react-i18next";
import { Button, Reveal, Skeleton } from "@/ui";
import { TrendingTourCard } from "@/features/tours/components/TrendingTourCard";
import { useResource } from "@/features/destinations/hooks";
import { getFeaturedTours } from "@/features/destinations/data";
import { TOURS_CHANGED } from "@/lib/realtime";
import { useRealtimeReload } from "@/lib/useRealtimeReload";
import { SectionHeading } from "./SectionHeading";

function TourSkeleton() {
  return (
    <div className="bg-background shadow-primary overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/**
 * Landing tours row — multi-day packages from agencies. Copy defaults to
 * "Featured tours" but accepts a title/subtitle so the same loader powers the
 * "Trending tours" row on the landing page.
 */
export function FeaturedTours({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
}: {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
} = {}) {
  const { t } = useTranslation();
  const { status, data, reload } = useResource(getFeaturedTours);

  // Refetch when the admin publishes/archives/deletes a tour package (realtime),
  // and when this tab regains focus.
  useRealtimeReload(TOURS_CHANGED, reload);

  return (
    <section id="tours" className="bg-surface/40 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title={title ?? t("landing.tours.title")}
          subtitle={subtitle ?? t("landing.tours.subtitle")}
          actionLabel={actionLabel}
          actionHref={actionHref}
          onAction={onAction}
        />

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
                <TrendingTourCard tour={tour} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
