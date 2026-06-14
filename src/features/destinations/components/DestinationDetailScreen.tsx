"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Star1, Location, Calendar, Category } from "iconsax-reactjs";
import { Button, Card, Chip, Reveal, Skeleton } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { formatPrice, formatRating } from "@/lib/format";
import { getDestinationBySlug } from "../data";
import { useResource } from "../hooks";
import type { Destination } from "../schema";
import { LocationMap } from "./LocationMap";
import { MarketingHeader } from "@/features/landing/components/MarketingHeader";
import { Footer } from "@/features/landing/components/Footer";

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
      <Skeleton className="h-[60vh] w-full rounded-none" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-4 md:col-span-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
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
          <LocaleLink href="/#destinations">
            <Button variant="primary" size="sm">
              {t("destinations.detail.back")}
            </Button>
          </LocaleLink>
        </div>
      </div>
    </Shell>
  );
}

/** A small labeled fact row in the booking sidebar. */
function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function DetailContent({ destination }: { destination: Destination }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { user } = useSession();
  const router = useLocalizedRouter();

  const priceLabel =
    destination.priceFrom === 0
      ? t("common.free")
      : formatPrice(destination.priceFrom, destination.currency, lng);

  const handleBook = () => {
    if (!user) router.push("/login");
    // Authenticated booking flow is wired with the bookings feature later.
  };

  return (
    <Shell>
      {/* Full-bleed hero with the marketing header floating over it. */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-10 md:px-8">
          <LocaleLink
            href="/#destinations"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} color="currentColor" />
            {t("destinations.detail.back")}
          </LocaleLink>

          <Chip color="default" variant="soft" size="sm">
            {t(`destinations.categories.${destination.category}`)}
          </Chip>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl">
            {destination.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-white/90">
            <span className="flex items-center gap-1.5 text-sm">
              <Location size={16} color="currentColor" variant="Bold" />
              {destination.city}, {destination.country}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Star1 size={16} color="currentColor" variant="Bold" className="text-yellow" />
              {formatRating(destination.rating, lng)}
              <span className="text-white/70">
                · {t("destinations.card.reviews", { count: destination.reviewCount })}
              </span>
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8 md:py-16">
        {/* Main column */}
        <div className="flex flex-col gap-10 md:col-span-2">
          <Reveal>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {t("destinations.detail.overview")}
            </h2>
            <p className="text-muted mt-3 text-base leading-relaxed">
              {destination.shortDescription}
            </p>
          </Reveal>

          {destination.tags.length > 0 ? (
            <Reveal>
              <h2 className="text-foreground text-xl font-bold tracking-tight">
                {t("destinations.detail.highlights")}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <Chip key={tag} color="default" variant="soft" size="sm">
                    {tag}
                  </Chip>
                ))}
              </div>
            </Reveal>
          ) : null}

          <Reveal>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {t("destinations.detail.location")}
            </h2>
            <p className="text-muted mt-2 flex items-center gap-1.5 text-sm">
              <Location size={16} color="currentColor" variant="Bold" className="text-primary" />
              {destination.city}, {destination.country}
            </p>
            <LocationMap lat={destination.lat} lng={destination.lng} label={destination.name} />
          </Reveal>

          <Reveal>
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {t("destinations.detail.reviews")}
            </h2>
            <p className="text-muted mt-3 text-sm">{t("destinations.detail.reviewsSoon")}</p>
          </Reveal>
        </div>

        {/* Booking sidebar */}
        <aside className="md:col-span-1">
          <Reveal>
            <Card className="bg-background border-border sticky top-24 flex flex-col gap-5 rounded-3xl border p-6 shadow-sm">
              <div>
                <span className="text-muted text-xs font-medium tracking-wide uppercase">
                  {t("destinations.detail.priceFrom")}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-foreground text-3xl font-extrabold tracking-tight">
                    {priceLabel}
                  </span>
                  {destination.priceFrom > 0 ? (
                    <span className="text-muted text-sm">
                      / {t("destinations.detail.perPerson")}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="border-border flex flex-col gap-3 border-y py-4">
                <Fact
                  icon={<Star1 size={16} color="currentColor" variant="Bold" />}
                  label={t("destinations.detail.rating")}
                  value={formatRating(destination.rating, lng)}
                />
                {destination.durationLabel ? (
                  <Fact
                    icon={<Calendar size={16} color="currentColor" variant="Bold" />}
                    label={t("destinations.detail.duration")}
                    value={destination.durationLabel}
                  />
                ) : null}
                <Fact
                  icon={<Category size={16} color="currentColor" variant="Bold" />}
                  label={t("destinations.detail.category")}
                  value={t(`destinations.categories.${destination.category}`)}
                />
              </div>

              <Button variant="primary" size="lg" onPress={handleBook}>
                {user ? t("destinations.detail.book") : t("destinations.detail.loginToBook")}
              </Button>
            </Card>
          </Reveal>
        </aside>
      </div>
    </Shell>
  );
}

/**
 * Destination detail screen — public (guests included). Loads one destination by
 * slug through the data seam and renders loading / not-found / error / success.
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
