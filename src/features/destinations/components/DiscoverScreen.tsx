"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Reveal, Skeleton } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { MarketingHeader } from "@/features/landing/components/MarketingHeader";
import { Footer } from "@/features/landing/components/Footer";
import { SectionHeading } from "@/features/landing/components/SectionHeading";
import { useResource } from "../hooks";
import {
  getAllDestinations,
  getFeaturedTours,
  getRecentReviews,
  getTopAgencies,
  matchesFilter,
} from "../data";
import type { DestinationCategory, DiscoverFilter } from "../schema";
import { DiscoverSearchBar } from "./DiscoverSearchBar";
import { DestinationCard } from "./DestinationCard";
import { TourCard } from "./TourCard";
import { AgencyCard } from "./AgencyCard";
import { ReviewCard } from "./ReviewCard";

/** Card-shaped loading placeholder used by every grid section. */
function CardSkeleton() {
  return (
    <div className="bg-surface border-border overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
      <p className="text-muted text-sm">{t("discover.states.error")}</p>
      <Button variant="secondary" size="sm" onPress={onRetry}>
        {t("common.retry")}
      </Button>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="border-border rounded-2xl border border-dashed py-12 text-center">
      <p className="text-muted text-sm">{t("discover.states.empty")}</p>
    </div>
  );
}

const CATEGORIES: Array<DestinationCategory | "all"> = [
  "all",
  "destination",
  "thingToDo",
  "food",
  "stay",
];

/**
 * Discover Cambodia — the public `/[locale]/destinations` index. Browse-first for
 * everyone (guests included); the only role check is the `createTripPlan` CTA,
 * routed through `can()`. The destinations grid filters an already-loaded list in
 * memory for instant response; tours / agencies / reviews each load via the data
 * seam and render loading / empty / error explicitly.
 */
export function DiscoverScreen() {
  const { t } = useTranslation();
  const { role } = useSession();
  const [filter, setFilter] = useState<DiscoverFilter>({ query: "" });

  const patch = (p: Partial<DiscoverFilter>) => setFilter((f) => ({ ...f, ...p }));
  const clear = () => setFilter({ query: "" });

  const destinations = useResource(getAllDestinations);
  const tours = useResource(getFeaturedTours);
  const agencies = useResource(getTopAgencies);
  const reviews = useResource(getRecentReviews);

  const filtered = useMemo(
    () => (destinations.data ?? []).filter((d) => matchesFilter(d, filter)),
    [destinations.data, filter],
  );
  const placeNameOf = (slug: string) =>
    destinations.data?.find((d) => d.slug === slug)?.name;

  const canPlan = can(role, "createTripPlan");
  const activeCategory: DestinationCategory | "all" = filter.category ?? "all";

  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main>
        {/* Hero + search */}
        <section className="from-primary/10 to-background bg-gradient-to-b pt-28 pb-10 md:pt-32">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <Reveal className="flex max-w-2xl flex-col gap-4">
              <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t("discover.title")}
              </h1>
              <p className="text-muted text-base md:text-lg">{t("discover.subtitle")}</p>
              <div>
                {canPlan ? (
                  <LocaleLink href="/traveler">
                    <Button variant="primary" size="md">
                      {t("discover.cta.planTrip")}
                    </Button>
                  </LocaleLink>
                ) : (
                  <LocaleLink href="/login">
                    <Button variant="secondary" size="md">
                      {t("discover.cta.loginToPlan")}
                    </Button>
                  </LocaleLink>
                )}
              </div>
            </Reveal>

            <div className="mt-6">
              <DiscoverSearchBar filter={filter} onChange={patch} onClear={clear} />
            </div>

            {/* Category pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = activeCategory === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => patch({ category: c === "all" ? undefined : c })}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted hover:text-foreground",
                    )}
                  >
                    {c === "all"
                      ? t("discover.categories.all")
                      : t(`destinations.categories.${c}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results grid */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <SectionHeading title={t("discover.sections.results")} className="mb-0" />
              {destinations.status === "success" ? (
                <span className="text-muted shrink-0 text-sm">
                  {t("discover.sections.resultsCount", { count: filtered.length })}
                </span>
              ) : null}
            </div>

            {destinations.status === "loading" ? (
              <GridSkeleton count={6} />
            ) : destinations.status === "error" ? (
              <ErrorState onRetry={destinations.reload} />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((d, i) => (
                  <Reveal key={d.id} delay={Math.min(i, 3) * 0.05}>
                    <DestinationCard destination={d} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured tours */}
        <section className="bg-surface/40 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading
              title={t("discover.sections.featuredTours")}
              subtitle={t("discover.sections.featuredToursSubtitle")}
            />
            {tours.status === "loading" ? (
              <GridSkeleton />
            ) : tours.status === "error" ? (
              <ErrorState onRetry={tours.reload} />
            ) : !tours.data || tours.data.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tours.data.map((tour, i) => (
                  <Reveal key={tour.id} delay={Math.min(i, 3) * 0.06}>
                    <TourCard tour={tour} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Top agencies */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading
              title={t("discover.sections.topAgencies")}
              subtitle={t("discover.sections.topAgenciesSubtitle")}
            />
            {agencies.status === "loading" ? (
              <GridSkeleton count={4} />
            ) : agencies.status === "error" ? (
              <ErrorState onRetry={agencies.reload} />
            ) : !agencies.data || agencies.data.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {agencies.data.map((agency, i) => (
                  <Reveal key={agency.id} delay={Math.min(i, 3) * 0.05}>
                    <AgencyCard agency={agency} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent reviews */}
        <section className="bg-surface/40 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading
              title={t("discover.sections.recentReviews")}
              subtitle={t("discover.sections.recentReviewsSubtitle")}
            />
            {reviews.status === "loading" ? (
              <GridSkeleton />
            ) : reviews.status === "error" ? (
              <ErrorState onRetry={reviews.reload} />
            ) : !reviews.data || reviews.data.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.data.map((review, i) => (
                  <Reveal key={review.id} delay={Math.min(i, 3) * 0.05}>
                    <ReviewCard review={review} placeName={placeNameOf(review.targetSlug)} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
