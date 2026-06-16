"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { cn } from "@/lib/utils";
import type { Result } from "@/features/destinations/data";
import type { LandingReview } from "@/types/review";
import { SectionHeading } from "./SectionHeading";

/** Trust-strip stats shown above the cards; values + labels are localized marketing copy. */
const STATS = [
  { value: "stats.rating", label: "stats.ratingLabel", star: true },
  { value: "stats.reviews", label: "stats.reviewsLabel", star: false },
  { value: "stats.rebook", label: "stats.rebookLabel", star: false },
] as const;

/** Five stars with the first `Math.round(rating)` filled. Colours adapt to the
 * featured (dark) card so the outline stars stay visible. */
function Stars({ rating, featured }: { rating: number; featured: boolean }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star1
            key={i}
            size={15}
            color="currentColor"
            variant={i < filled ? "Bold" : "Outline"}
            className={cn(
              i < filled ? "text-yellow" : featured ? "text-white/40" : "text-border",
            )}
          />
        ))}
      </span>
      <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
    </span>
  );
}

/**
 * Real traveler reviews from the backend (`/reviews/recent`). The middle card is
 * highlighted. The trust-strip stats above remain static marketing copy. Renders an empty
 * state when there are no reviews yet.
 */
export function Testimonials({ result }: { result: Result<LandingReview[]> }) {
  const { t } = useTranslation();
  const reviews = result.ok ? result.data : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        align="center"
        title={t("landing.testimonials.title")}
        subtitle={t("landing.testimonials.subtitle")}
      />

      {/* Trust strip — social-proof stats centred above the cards. */}
      <Reveal className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {STATS.map(({ value, label, star }, i) => (
          <div key={label} className="flex items-center gap-8">
            {i > 0 ? <span className="hidden h-8 w-px bg-border sm:block" aria-hidden /> : null}
            <div className="flex flex-col items-center text-center">
              <span className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
                {star ? (
                  <Star1 size={20} color="currentColor" variant="Bold" className="text-yellow" />
                ) : null}
                {t(`landing.testimonials.${value}`)}
              </span>
              <span className="text-xs text-muted">{t(`landing.testimonials.${label}`)}</span>
            </div>
          </div>
        ))}
      </Reveal>

      {reviews.length === 0 ? (
        <div className="border-border rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted text-sm">{t("destinations.states.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((review, i) => {
            const featured = reviews.length >= 3 && i === 1;
            return (
              <Reveal key={review.id} delay={Math.min(i, 3) * 0.08}>
                <div className={cn("relative h-full", featured && "md:-translate-y-3")}>
                  <figure
                    className={cn(
                      "flex h-full min-h-[260px] flex-col gap-4 rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1",
                      featured
                        ? "border-transparent bg-primary text-white shadow-lg"
                        : "border-border bg-background shadow-primary hover:shadow-lg",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden
                        className={cn(
                          "font-serif text-6xl leading-[0.6]",
                          featured ? "text-white/30" : "text-primary/20",
                        )}
                      >
                        &ldquo;
                      </span>
                      <Stars rating={review.rating} featured={featured} />
                    </div>

                    <blockquote
                      className={cn("flex-1 text-sm", featured ? "text-white/90" : "text-muted")}
                    >
                      {review.comment}
                    </blockquote>

                    <figcaption className="flex items-center gap-3">
                      <span className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={review.authorAvatar}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">{review.authorName}</span>
                        <span className={cn("text-xs", featured ? "text-white/75" : "text-muted")}>
                          {t("landing.testimonials.role")}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
