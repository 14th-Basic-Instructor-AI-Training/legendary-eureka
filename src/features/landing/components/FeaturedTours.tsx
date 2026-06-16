"use client";

import { useTranslation } from "react-i18next";
import { Reveal } from "@/ui";
import { TrendingTourCard } from "@/features/tours/components/TrendingTourCard";
import type { Result } from "@/features/destinations/data";
import type { FeaturedTour } from "@/features/destinations/schema";
import { SectionHeading } from "./SectionHeading";

/**
 * Landing tours row — multi-day packages from agencies, rendered from a server-fetched
 * `Result`. Branches on error / empty / success. Reused for the "Trending tours" row and
 * (with a different `id` + title) the traveler "Recommended for you" strip.
 */
export function FeaturedTours({
  id = "tours",
  title,
  subtitle,
  result,
  actionLabel,
  actionHref,
  onAction,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  result: Result<FeaturedTour[]>;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const { t } = useTranslation();
  const data = result.ok ? result.data : null;

  return (
    <section id={id} className="bg-surface/40 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title={title ?? t("landing.tours.title")}
          subtitle={subtitle ?? t("landing.tours.subtitle")}
          actionLabel={actionLabel}
          actionHref={actionHref}
          onAction={onAction}
        />

        {!result.ok ? (
          <div className="border-border rounded-2xl border border-dashed py-12 text-center">
            <p className="text-muted text-sm">{t("destinations.states.error")}</p>
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
