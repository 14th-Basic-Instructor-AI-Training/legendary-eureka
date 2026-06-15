"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "iconsax-reactjs";
import { Button, Reveal, Skeleton } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useResource } from "@/lib/useResource";
import { MarketingHeader } from "@/features/landing/components/MarketingHeader";
import { Footer } from "@/features/landing/components/Footer";
import { getTourById } from "../data";
import { useToursStore } from "../store";
import type { TourDetail } from "../types";
import { TourGallery } from "./TourGallery";
import { TourHeader } from "./TourHeader";
import { TourQuickInfo } from "./TourQuickInfo";
import { TourTabs, type TourTabKey } from "./TourTabs";
import { TourBookingCard } from "./TourBookingCard";
import { SimilarTours } from "./SimilarTours";

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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    </Shell>
  );
}

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
          <LocaleLink href="/#tours">
            <Button variant="primary" size="sm">
              {t("tours.detail.back")}
            </Button>
          </LocaleLink>
        </div>
      </div>
    </Shell>
  );
}

function DetailContent({ tour }: { tour: TourDetail }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TourTabKey>("overview");
  const ensureTour = useToursStore((s) => s.ensureTour);

  // Seed the per-tour interaction state (reviews/bookmark/booking) once it loads.
  useEffect(() => {
    ensureTour(tour.id, tour.reviews);
  }, [ensureTour, tour.id, tour.reviews]);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8 mt-10 md:px-8">
        <LocaleLink
          href="/#tours"
          className="text-muted hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={18} color="currentColor" />
          {t("tours.detail.back")}
        </LocaleLink>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column (content) */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <TourGallery photos={tour.gallery} title={tour.title} />
            <TourHeader tour={tour} onReviewsClick={() => setTab("reviews")} />
            <TourQuickInfo tour={tour} />
            <TourTabs tour={tour} selectedKey={tab} onSelectionChange={setTab} />
          </div>

          {/* Right column (sticky booking) */}
          <aside className="lg:col-span-1">
            <Reveal>
              <TourBookingCard tour={tour} />
            </Reveal>
          </aside>
        </div>

        <SimilarTours tour={tour} />
      </div>
    </Shell>
  );
}

/**
 * Tour detail screen — public (guests included). Loads one tour by id/slug
 * through the data seam and renders loading / not-found / error / success.
 */
export function TourDetailScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const fetcher = useCallback(() => getTourById(id), [id]);
  const { status, data, reload } = useResource(fetcher);

  if (status === "loading") return <DetailSkeleton />;
  if (status === "error" || !data) {
    return <DetailError message={t("tours.states.notFound")} onRetry={reload} />;
  }
  return <DetailContent tour={data} />;
}
