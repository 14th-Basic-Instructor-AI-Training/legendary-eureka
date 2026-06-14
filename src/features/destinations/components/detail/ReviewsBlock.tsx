"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { Button, Reveal, Skeleton } from "@/ui";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getDestinationReviews } from "../../data";
import { useResource } from "../../hooks";
import type { Destination, Review } from "../../schema";
import { ReviewCard } from "../ReviewCard";
import { RatingBreakdown } from "./RatingBreakdown";

type Sort = "recent" | "highest" | "helpful";
const SORTS: readonly Sort[] = ["recent", "highest", "helpful"];

function sortReviews(reviews: Review[], sort: Sort): Review[] {
  const copy = [...reviews];
  switch (sort) {
    case "highest":
      return copy.sort((a, b) => b.rating - a.rating);
    case "helpful":
      return copy.sort((a, b) => b.photoCount - a.photoCount);
    case "recent":
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/**
 * TripAdvisor-style reviews block: a summary card (average, star row, verified
 * count, rating-breakdown bars) beside a sortable review list. "Write a review"
 * is gated by `can(role, "writeReview")`; guests get the login prompt.
 */
export function ReviewsBlock({
  destination,
  onRequireAuth,
}: {
  destination: Destination;
  onRequireAuth: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const [sort, setSort] = useState<Sort>("recent");

  const fetcher = useCallback(() => getDestinationReviews(destination.slug), [destination.slug]);
  const { status, data } = useResource(fetcher);

  const reviews = useMemo(() => sortReviews(data ?? [], sort), [data, sort]);

  const handleWrite = () => {
    if (can(role, "writeReview")) {
      // Wired to the write-review flow with the reviews feature later.
      return;
    }
    onRequireAuth();
  };

  return (
    <Reveal>
      <h2 className="text-foreground text-2xl font-bold tracking-tight">
        {t("destinations.detail.reviewsTitle")}
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
        {/* Summary */}
        <div className="bg-surface h-fit rounded-2xl p-6 text-center">
          <div className="text-foreground text-5xl font-extrabold leading-none">
            {formatRating(destination.rating, lng)}
          </div>
          <div className="text-warning mt-2 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star1
                key={s}
                size={16}
                color="currentColor"
                variant={s <= Math.round(destination.rating) ? "Bold" : "Linear"}
              />
            ))}
          </div>
          <p className="text-muted mt-2 text-sm">
            {t("destinations.detail.verifiedReviews", {
              count: destination.reviewCount,
            })}
          </p>
          {destination.ratingBreakdown && destination.ratingBreakdown.length > 0 ? (
            <RatingBreakdown buckets={destination.ratingBreakdown} />
          ) : null}
        </div>

        {/* List */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted text-sm">{t("destinations.detail.sortBy")}</span>
              {SORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={sort === s}
                  onClick={() => setSort(s)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    sort === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {t(`destinations.detail.sort.${s}`)}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" onPress={handleWrite}>
              {t("destinations.detail.writeReview")}
            </Button>
          </div>

          {status === "loading" ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="border-border rounded-2xl border border-dashed py-12 text-center">
              <p className="text-muted text-sm">{t("destinations.detail.reviewsSoon")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <p className="text-muted pt-1 text-center text-sm">
                {t("destinations.detail.showAllReviews", {
                  count: destination.reviewCount,
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
