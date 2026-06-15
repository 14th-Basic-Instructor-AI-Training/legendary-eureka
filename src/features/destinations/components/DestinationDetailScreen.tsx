"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Map1, Routing2, Coffee, Buildings } from "iconsax-reactjs";
import { Button, Reveal, Skeleton } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { getDestinationBySlug } from "../data";
import { getToursByProvince } from "@/features/explore/data";
import { useResource } from "../hooks";
import type { Destination } from "../schema";
import { LocationMap } from "./LocationMap";
import { MarketingHeader } from "@/features/landing/components/MarketingHeader";
import { Footer } from "@/features/landing/components/Footer";
import { LoginPromptModal } from "@/features/landing/components/LoginPromptModal";
import { DetailHero } from "./detail/DetailHero";
import { AboutGallery } from "./detail/AboutGallery";
import { PoiSection } from "./detail/PoiSection";
import { ToursForDestination } from "./detail/ToursForDestination";
import { ReviewsBlock } from "./detail/ReviewsBlock";
import { QuickFactsCard } from "./detail/QuickFactsCard";
import { PlanTripCard } from "./detail/PlanTripCard";

/** Page shell shared by every state so the header/footer never flash. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <Shell>
      <Skeleton className="h-[58vh] w-full rounded-none" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-2 h-52 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </Shell>
  );
}

/** Error + not-found share one recoverable state with a route back to explore. */
function DetailError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <Shell>
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center md:px-8">
        <p className="text-muted text-base">{message}</p>
        <div className="flex items-center gap-3">
          {onRetry ? (
            <Button variant="secondary" size="sm" onPress={onRetry}>
              {t("common.retry")}
            </Button>
          ) : null}
          <LocaleLink href="/explore">
            <Button variant="primary" size="sm">
              {t("destinations.detail.breadcrumb.destinations")}
            </Button>
          </LocaleLink>
        </div>
      </div>
    </Shell>
  );
}

function DetailContent({ destination }: { destination: Destination }) {
  const { t } = useTranslation();
  const [showLogin, setShowLogin] = useState(false);
  const onRequireAuth = () => setShowLogin(true);

  const toursFetcher = useCallback(
    () => getToursByProvince(destination.province),
    [destination.province],
  );
  const tours = useResource(toursFetcher);

  const thingsToDo = destination.pois.filter(
    (p) => p.category === "sight" || p.category === "activity",
  );
  const food = destination.pois.filter((p) => p.category === "food");
  const stays = destination.pois.filter((p) => p.category === "stay");

  return (
    <Shell>
      <DetailHero destination={destination} toursCount={tours.data?.length} />

      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-12">
          <AboutGallery destination={destination} />

          {/* Map — kept right after the About section, using our MapLibre map. */}
          <Reveal>
            <h2 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
              <Map1 size={22} color="currentColor" variant="Bold" className="text-primary" />
              {t("destinations.detail.exploreMap")}
            </h2>
            <LocationMap lat={destination.lat} lng={destination.lng} label={destination.name} />
          </Reveal>

          <PoiSection title={t("destinations.detail.thingsToDo")} icon={Routing2} items={thingsToDo} />
          <PoiSection title={t("destinations.detail.whereToEat")} icon={Coffee} items={food} />
          <PoiSection title={t("destinations.detail.whereToStay")} icon={Buildings} items={stays} />

          <ToursForDestination
            destinationName={destination.name}
            status={tours.status}
            tours={tours.data}
          />

          <ReviewsBlock destination={destination} onRequireAuth={onRequireAuth} />
        </div>

        {/* Sticky sidebar */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <QuickFactsCard destination={destination} />
          <PlanTripCard onRequireAuth={onRequireAuth} />
        </aside>
      </div>

      <LoginPromptModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </Shell>
  );
}

/**
 * Destination detail screen — public (guests included). Loads one destination by
 * slug through the unified data seam and renders loading / not-found / error /
 * success. Follows the Claude Design handoff layout in the Jalat brand: cinematic
 * hero, About + 3D map, Things-to-do / Eat / Stay, tours, TripAdvisor-style
 * reviews, and a sticky Quick-Facts + "Make it your trip" sidebar.
 */
export function DestinationDetailScreen({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fetcher = useCallback(() => getDestinationBySlug(slug), [slug]);
  const { status, data, reload } = useResource(fetcher);

  if (status === "loading") return <DetailSkeleton />;
  if (status === "error" || !data) {
    return <DetailError message={t("destinations.states.notFound")} onRetry={reload} />;
  }
  return <DetailContent destination={data} />;
}
