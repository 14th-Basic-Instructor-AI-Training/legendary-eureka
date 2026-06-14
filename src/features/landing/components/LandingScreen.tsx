"use client";

import { useTranslation } from "react-i18next";
import { getFeaturedDestinations, getThingsToDo } from "@/features/destinations/data";
import { MarketingHeader } from "./MarketingHeader";
import { Hero } from "./Hero";
import { RecommendedForYou } from "./RecommendedForYou";
import { DestinationSection } from "./DestinationSection";
import { JourneySimple } from "./JourneySimple";
import { FeaturedTours } from "./FeaturedTours";
import { UnleashBanner } from "./UnleashBanner";
import { AboutStats } from "./AboutStats";
import { DiscoverWorld } from "./DiscoverWorld";
import { Testimonials } from "./Testimonials";
import { LandingCTA } from "./LandingCTA";
import { Footer } from "./Footer";

/**
 * Public landing page — home for guests and signed-in travelers/agencies alike.
 * Re-themed to a modern flight/travel look: a full-bleed hero, popular places,
 * a "journey made simple" band, a seasonal promo, stats, value props, and
 * testimonials. Signed-in users additionally get the personalized
 * "Recommended for you" row (it self-gates on session); admins reach their
 * control panel from the header.
 */
export function LandingScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main>
        <Hero />
        <RecommendedForYou />
        <DestinationSection
          id="destinations"
          title={t("landing.popular.title")}
          subtitle={t("landing.popular.subtitle")}
          fetcher={getFeaturedDestinations}
        />
        <JourneySimple />
        <FeaturedTours />
        <UnleashBanner />
        <AboutStats />
        <DiscoverWorld />
        <DestinationSection
          id="things-to-do"
          title={t("landing.thingsToDo.title")}
          subtitle={t("landing.thingsToDo.subtitle")}
          fetcher={getThingsToDo}
        />
        <Testimonials />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
