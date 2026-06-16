"use client";

import { useTranslation } from "react-i18next";
import { useExploreStore } from "@/features/explore/store";
import type { Result } from "@/features/destinations/data";
import type { AgencyProfile, Destination, FeaturedTour } from "@/features/destinations/schema";
import type { LandingReview } from "@/types/review";
import type { TripInspirationResponse } from "@/types/trip-inspiration";
import { MarketingHeader } from "./MarketingHeader";
import { Hero } from "./Hero";
import { DestinationSection } from "./DestinationSection";
import { FeaturedTours } from "./FeaturedTours";
import { RecommendedForYou } from "./RecommendedForYou";
import { TopAgencies } from "./TopAgencies";
import { TripInspiration } from "./TripInspiration";
import { AboutStats } from "./AboutStats";
import { Testimonials } from "./Testimonials";
import { LandingCTA } from "./LandingCTA";
import { Footer } from "./Footer";

type LandingScreenProps = {
  popularDestinations: Result<Destination[]>;
  trendingTours: Result<FeaturedTour[]>;
  topAgencies: Result<AgencyProfile[]>;
  recentReviews: Result<LandingReview[]>;
  tripInspirations: Result<TripInspirationResponse[]>;
  /** Null when the viewer is not a signed-in traveler (section hidden). */
  recommendedTours: Result<FeaturedTour[]> | null;
  recommendedName: string;
};

/**
 * Public traveler landing page — home for guests and signed-in travelers/agencies. Purely
 * presentational: the server component (`app/[locale]/page.tsx`) fetches every section from
 * the backend and passes the results in. A split hero with a tabbed search leads into the
 * brief's required rows: popular destinations, trending tours, a traveler-only "Recommended
 * for you" strip, top-rated agencies, a trip-inspiration band, and real traveler reviews.
 */
export function LandingScreen({
  popularDestinations,
  trendingTours,
  topAgencies,
  recentReviews,
  tripInspirations,
  recommendedTours,
  recommendedName,
}: LandingScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main>
        <Hero />

        {/* Popular destinations */}
        <DestinationSection
          id="destinations"
          title={t("landing.popular.title")}
          subtitle={t("landing.popular.subtitle")}
          result={popularDestinations}
          actionLabel={t("common.viewAll")}
          actionHref="/explore"
        />

        {/* Trending tours */}
        <FeaturedTours
          id="tours"
          title={t("landing.trendingTours.title")}
          subtitle={t("landing.trendingTours.subtitle")}
          result={trendingTours}
          actionLabel={t("common.viewAll")}
          actionHref="/explore"
          onAction={() => useExploreStore.getState().setTab("tours")}
        />

        {/* Recommended for you — signed-in travelers only */}
        {recommendedTours ? (
          <RecommendedForYou result={recommendedTours} name={recommendedName} />
        ) : null}

        {/* Top-rated agencies */}
        <TopAgencies result={topAgencies} />

        {/* Trip inspiration */}
        <TripInspiration result={tripInspirations} />

        {/* Supporting marketing */}
        <AboutStats />
        <Testimonials result={recentReviews} />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
