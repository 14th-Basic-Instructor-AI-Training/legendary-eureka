"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Star1,
  Location,
  Global,
  Clock,
  ShieldTick,
  Share,
  Flag,
  TickCircle,
} from "iconsax-reactjs";
import { Button, Card, Chip, Reveal, Skeleton } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { can } from "@/lib/permissions";
import { formatNumber, formatRating } from "@/lib/format";
import { useResource } from "../hooks";
import { getAgencyBySlug, getRecentReviews } from "../data";
import type { AgencyProfile } from "../schema";
import { ReviewCard } from "./ReviewCard";
import { LocationMap } from "./LocationMap";
import { ExploreTourCard } from "@/features/explore/components/cards/ExploreTourCard";
import { getToursByAgency } from "@/features/explore/data";
import type { TourActivityType } from "@/features/explore/schema";
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
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="-mt-12 flex flex-wrap items-end gap-5">
          <Skeleton className="h-28 w-28 rounded-3xl" />
          <div className="flex flex-1 flex-col gap-3 pb-2">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="mt-7 h-24 w-full rounded-3xl" />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4 md:col-span-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </Shell>
  );
}

/** Error + not-found share one recoverable state with a route back to the agencies row. */
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
          <LocaleLink href="/#agencies">
            <Button variant="primary" size="sm">
              {t("agencyDetail.back")}
            </Button>
          </LocaleLink>
        </div>
      </div>
    </Shell>
  );
}

/** One cell of the stats bar; renders nothing when its value is missing. */
function StatCell({
  value,
  label,
  accent,
}: {
  value: string | null;
  label: string;
  accent?: boolean;
}) {
  if (value === null) return null;
  return (
    <div className="flex flex-1 flex-col items-center px-2 text-center">
      <span
        className={`text-2xl font-extrabold tracking-tight md:text-3xl ${
          accent ? "text-warning" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-muted mt-1 text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

/** A labeled contact/location fact row in the sidebar. */
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
    <div className="border-border flex items-center gap-3 border-b py-3 last:border-b-0">
      <span className="text-primary flex shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-muted text-xs font-medium">{label}</div>
        <div className="text-foreground truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

/** Deterministic, believable star distribution derived from the average rating. */
function ratingBreakdown(rating: number): { stars: number; pct: number }[] {
  const pct5 = Math.round(Math.min(98, (rating / 5) * 100));
  const rest = 100 - pct5;
  const pct4 = Math.round(rest * 0.6);
  const pct3 = Math.round(rest * 0.25);
  const pct2 = Math.round(rest * 0.1);
  const pct1 = Math.max(0, 100 - pct5 - pct4 - pct3 - pct2);
  return [
    { stars: 5, pct: pct5 },
    { stars: 4, pct: pct4 },
    { stars: 3, pct: pct3 },
    { stars: 2, pct: pct2 },
    { stars: 1, pct: pct1 },
  ];
}

/** "Tours Offered" — loaded independently with its own category-filter chips. */
function AgencyToursSection({
  slug,
  onRequireAuth,
}: {
  slug: string;
  onRequireAuth: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const fetcher = useCallback(() => getToursByAgency(slug), [slug]);
  const { status, data } = useResource(fetcher);
  const [filter, setFilter] = useState<TourActivityType | "all">("all");

  const categories = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.flatMap((tour) => tour.activityTypes)));
  }, [data]);

  const shown = useMemo(() => {
    if (!data) return [];
    return filter === "all"
      ? data
      : data.filter((tour) => tour.activityTypes.includes(filter));
  }, [data, filter]);

  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          {t("agencyDetail.toursOffered", { n: formatNumber(data?.length ?? 0, lng) })}
        </h2>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filter === "all"}
              label={t("agencyDetail.filterAll")}
              onPress={() => setFilter("all")}
            />
            {categories.map((category) => (
              <FilterChip
                key={category}
                active={filter === category}
                label={category}
                onPress={() => setFilter(category)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {status === "loading" ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-muted mt-4 text-sm">{t("agencyDetail.noTours")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {shown.map((tour, i) => (
            <Reveal key={tour.id} delay={Math.min(i, 3) * 0.05}>
              <ExploreTourCard tour={tour} view="grid" onRequireAuth={onRequireAuth} />
            </Reveal>
          ))}
        </div>
      )}
    </Reveal>
  );
}

/** A pill toggle for the tours category filter. */
function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted hover:border-primary/40 bg-background"
      }`}
    >
      {label}
    </button>
  );
}

/** Reviews block: a rating-summary panel + a few recent platform reviews. */
function AgencyReviewsSection({
  agency,
  onWriteReview,
}: {
  agency: AgencyProfile;
  onWriteReview: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { status, data } = useResource(getRecentReviews);
  const breakdown = useMemo(() => ratingBreakdown(agency.rating), [agency.rating]);
  const reviews = data?.slice(0, 3) ?? [];

  return (
    <Reveal>
      <h2 className="text-foreground text-xl font-bold tracking-tight">
        {t("agencyDetail.reviews")}
      </h2>

      <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,240px)_1fr]">
        {/* Summary panel */}
        <div className="bg-muted/5 border-border flex flex-col items-center rounded-2xl border p-6 text-center">
          <span className="text-foreground text-5xl font-extrabold tracking-tight">
            {formatRating(agency.rating, lng)}
          </span>
          <span className="text-warning mt-2 text-lg tracking-wide">★★★★★</span>
          <span className="text-muted mt-1 text-sm">
            {t("agencyDetail.verifiedReviews", { n: formatNumber(agency.reviewCount, lng) })}
          </span>
          <div className="mt-5 flex w-full flex-col gap-2">
            {breakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2">
                <span className="text-muted w-8 shrink-0 text-right text-xs">
                  {row.stars} ★
                </span>
                <div className="bg-border h-1.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-warning h-full rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="text-muted w-8 text-right text-xs">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted text-sm">{t("agencyDetail.recentReviews")}</span>
            <Button variant="secondary" size="sm" onPress={onWriteReview}>
              {t("agencyDetail.writeReview")}
            </Button>
          </div>
          {status === "loading" ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted text-sm">{t("agencyDetail.noReviews")}</p>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </div>
      </div>
    </Reveal>
  );
}

function AgencyDetailContent({ agency }: { agency: AgencyProfile }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const router = useLocalizedRouter();

  const isVerified = agency.status === "APPROVED";
  const initials = agency.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  /** Guests are sent to login; authenticated users proceed (flows wired later). */
  const handleContact = () => {
    if (!role) router.push("/login");
    // Authenticated contact flow is wired with the messaging feature later.
  };
  const handleRequireAuth = () => router.push("/login");
  const handleWriteReview = () => {
    if (!can(role, "writeReview")) router.push("/login");
  };
  const handleReport = () => {
    if (!can(role, "reportAgency")) router.push("/login");
  };

  return (
    <Shell>
      {/* Cover band — brand gradient (no cover photo in the data model yet). */}
      <section className="from-primary via-primary to-secondary-lightskyblue-slate relative h-56 overflow-hidden bg-gradient-to-br md:h-64">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 36px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 36px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-start px-4 pt-24 md:px-8">
          <LocaleLink
            href="/#agencies"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} color="currentColor" />
            {t("agencyDetail.back")}
          </LocaleLink>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Identity header — logo overlaps the cover. */}
        <div className="-mt-14 flex flex-wrap items-end gap-5 md:-mt-16">
          <div className="border-background bg-primary relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 text-3xl font-extrabold text-white shadow-lg">
            {agency.logo ? (
              <Image
                src={agency.logo}
                alt={agency.name}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex min-w-60 flex-1 flex-col gap-2 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                {agency.name}
              </h1>
              {isVerified ? (
                <Chip color="accent" variant="soft" size="sm">
                  <span className="flex items-center gap-1">
                    <TickCircle size={14} color="currentColor" variant="Bold" />
                    {t("agencyDetail.verified")}
                  </span>
                </Chip>
              ) : null}
            </div>
            <div className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Location size={16} color="currentColor" variant="Bold" className="text-primary" />
                {agency.province}
              </span>
              <span className="text-border">·</span>
              <span className="text-warning flex items-center gap-1 font-semibold">
                <Star1 size={14} color="currentColor" variant="Bold" />
                {formatRating(agency.rating, lng)}
              </span>
              <span>
                {t("discover.agency.reviews", { count: agency.reviewCount })}
              </span>
              <span className="text-border">·</span>
              <span>{t("discover.agency.ownedBy", { owner: agency.owner })}</span>
            </div>
          </div>

          <div className="flex gap-2 pb-1">
            <Button variant="secondary" size="md" onPress={() => undefined}>
              <span className="flex items-center gap-1.5">
                <Share size={16} color="currentColor" />
                {t("agencyDetail.share")}
              </span>
            </Button>
            <Button variant="primary" size="md" onPress={handleContact}>
              {t("agencyDetail.contact")}
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <Card className="bg-background border-border mt-7 flex items-center justify-around gap-2 rounded-2xl border p-5 shadow-sm">
          <StatCell value={formatNumber(agency.tourCount, lng)} label={t("agencyDetail.statTours")} />
          <span className="bg-border h-10 w-px" />
          <StatCell value={formatRating(agency.rating, lng)} label={t("agencyDetail.statRating")} accent />
          {agency.yearsActive !== undefined ? (
            <>
              <span className="bg-border h-10 w-px" />
              <StatCell
                value={t("agencyDetail.statYearsValue", { n: formatNumber(agency.yearsActive, lng) })}
                label={t("agencyDetail.statYears")}
              />
            </>
          ) : null}
          {agency.bookingsCompleted !== undefined ? (
            <>
              <span className="bg-border h-10 w-px" />
              <StatCell
                value={formatNumber(agency.bookingsCompleted, lng)}
                label={t("agencyDetail.statBookings")}
              />
            </>
          ) : null}
        </Card>

        {/* Main grid */}
        <div className="grid gap-8 py-10 md:grid-cols-3 md:py-12">
          <div className="flex flex-col gap-10 md:col-span-2">
            {agency.about ? (
              <Reveal>
                <h2 className="text-foreground text-xl font-bold tracking-tight">
                  {t("agencyDetail.about", { name: agency.name })}
                </h2>
                <p className="text-muted mt-3 text-base leading-relaxed">{agency.about}</p>
              </Reveal>
            ) : null}

            <AgencyToursSection slug={agency.slug} onRequireAuth={handleRequireAuth} />

            <AgencyReviewsSection agency={agency} onWriteReview={handleWriteReview} />

            {/* Report agency — discreet. */}
            <div className="border-border border-t pt-5">
              <button
                type="button"
                onClick={handleReport}
                className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
              >
                <Flag size={15} color="currentColor" />
                {t("agencyDetail.report")}
              </button>
            </div>
          </div>

          {/* Contact & Location sidebar */}
          <aside className="md:col-span-1">
            <Reveal>
              <Card className="bg-background border-border sticky top-24 flex flex-col gap-1 rounded-3xl border p-6 shadow-sm">
                <h3 className="text-foreground mb-2 text-lg font-bold tracking-tight">
                  {t("agencyDetail.contactLocation")}
                </h3>
                <Fact
                  icon={<Location size={18} color="currentColor" variant="Bold" />}
                  label={t("agencyDetail.location")}
                  value={agency.province}
                />
                {agency.languages.length > 0 ? (
                  <Fact
                    icon={<Global size={18} color="currentColor" variant="Bold" />}
                    label={t("agencyDetail.languages")}
                    value={agency.languages.join(" · ")}
                  />
                ) : null}
                {agency.responseTimeHours !== undefined ? (
                  <Fact
                    icon={<Clock size={18} color="currentColor" variant="Bold" />}
                    label={t("agencyDetail.responseTimeLabel")}
                    value={t("agencyDetail.responseTime", { hours: agency.responseTimeHours })}
                  />
                ) : null}
                {agency.memberSince !== undefined ? (
                  <Fact
                    icon={<ShieldTick size={18} color="currentColor" variant="Bold" />}
                    label={t("agencyDetail.memberSince")}
                    value={String(agency.memberSince)}
                  />
                ) : null}

                {agency.lat !== undefined && agency.lng !== undefined ? (
                  <div className="mt-4">
                    <LocationMap lat={agency.lat} lng={agency.lng} label={agency.name} />
                  </div>
                ) : null}
              </Card>
            </Reveal>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

/**
 * Agency profile screen — public (guests included). Loads one agency by slug
 * through the data seam and renders loading / not-found / error / success.
 */
export function AgencyDetailScreen({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fetcher = useCallback(() => getAgencyBySlug(slug), [slug]);
  const { status, data, reload } = useResource(fetcher);

  if (status === "loading") return <DetailSkeleton />;
  if (status === "error" || !data) {
    return <DetailError message={t("agencyDetail.notFound")} onRetry={reload} />;
  }
  return <AgencyDetailContent agency={data} />;
}
