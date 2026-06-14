"use client";

import { useTranslation } from "react-i18next";
import { getFeaturedDestinations } from "@/features/destinations/data";
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

/**
 * Public traveler landing page — home for guests and signed-in travelers/agencies.
 * A split hero with a tabbed search (Tours · Destinations · Activities) leads into
 * the brief's required rows: popular destinations, trending tours, a traveler-only
 * "Recommended for you" strip (self-gated), top-rated agencies, and a trip
 * inspiration band. Supporting marketing sections (stats, testimonials, CTA) round
 * it out; admins reach their control panel from the header.
 */
export function LandingScreen() {
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
          fetcher={getFeaturedDestinations}
        />

        {/* Trending tours */}
        <FeaturedTours
          title={t("landing.trendingTours.title")}
          subtitle={t("landing.trendingTours.subtitle")}
        />

        {/* Recommended for you — signed-in travelers only (self-gated) */}
        <RecommendedForYou />

        {/* Top-rated agencies */}
        <TopAgencies />

        {/* Trip inspiration */}
        <TripInspiration />

        {/* Supporting marketing */}
        <AboutStats />
        <Testimonials />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
