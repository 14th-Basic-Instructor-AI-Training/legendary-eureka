"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, TickCircle } from "iconsax-reactjs";
import { Avatar, Button } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatDate, formatRating } from "@/lib/format";
import { getRatingBreakdown } from "../data";
import { useToursStore } from "../store";
import type { TourDetail, TourReview, ReviewSort } from "../types";
import { WriteReviewModal } from "./WriteReviewModal";

const PAGE_SIZE = 4;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Five-star row, filled up to `value`. */
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="text-warning flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star1
          key={star}
          size={size}
          color="currentColor"
          variant={star <= value ? "Bold" : "Linear"}
        />
      ))}
    </span>
  );
}

function sortReviews(reviews: TourReview[], sort: ReviewSort): TourReview[] {
  const copy = [...reviews];
  if (sort === "recent") return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === "highest") return copy.sort((a, b) => b.rating - a.rating);
  return copy.sort((a, b) => a.rating - b.rating);
}

const SORT_OPTIONS: ReviewSort[] = ["recent", "highest", "lowest"];

/** Reviews tab: rating breakdown, sort, review cards, pagination, write CTA. */
export function ReviewsTab({ tour }: { tour: TourDetail }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();

  const storedReviews = useToursStore((s) => s.byTour[tour.id]?.reviews);
  const reviews = storedReviews ?? tour.reviews;

  const [sort, setSort] = useState<ReviewSort>("recent");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [justPosted, setJustPosted] = useState(false);

  const breakdown = useMemo(() => getRatingBreakdown(tour), [tour]);
  const sorted = useMemo(() => sortReviews(reviews, sort), [reviews, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const canWrite = can(role, "writeReview");
  const isGuest = role === null;

  return (
    <div className="flex flex-col gap-8">
      {/* Rating breakdown */}
      <section className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center justify-center gap-1 sm:pr-6">
          <span className="text-foreground text-4xl font-extrabold tracking-tight">
            {formatRating(tour.rating, lng)}
          </span>
          <Stars value={Math.round(tour.rating)} size={16} />
          <span className="text-muted text-xs">
            {t("tours.detail.reviews.basedOn", { count: tour.reviewCount })}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = breakdown[star];
            const pct = tour.reviewCount > 0 ? (count / tour.reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="text-muted w-3 text-right">{star}</span>
                <Star1 size={12} color="currentColor" variant="Bold" className="text-warning" />
                <span className="bg-muted/15 h-2 flex-1 overflow-hidden rounded-full">
                  <span
                    className="bg-warning block h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="text-muted w-10 text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sort + write CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted text-sm">{t("tours.detail.reviews.sortLabel")}:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSort(option);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sort === option
                  ? "bg-primary-lightskyblue text-white"
                  : "border-border text-muted hover:text-foreground border"
              }`}
            >
              {t(`tours.detail.reviews.sort.${option}`)}
            </button>
          ))}
        </div>

        {canWrite ? (
          <Button variant="primary" size="sm" onPress={() => setModalOpen(true)}>
            {t("tours.detail.reviews.writeCta")}
          </Button>
        ) : isGuest ? (
          <LocaleLink href="/login">
            <Button variant="secondary" size="sm">
              {t("tours.detail.reviews.loginPrompt")}
            </Button>
          </LocaleLink>
        ) : null}
      </div>

      {canWrite ? (
        <p className="text-muted -mt-4 text-xs">{t("tours.detail.reviews.completedOnly")}</p>
      ) : null}

      {justPosted ? (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {t("tours.detail.reviews.modal.success")}
        </p>
      ) : null}

      {/* Review cards */}
      {pageItems.length === 0 ? (
        <p className="border-border text-muted rounded-2xl border border-dashed px-4 py-10 text-center text-sm">
          {t("tours.detail.reviews.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {pageItems.map((review) => (
            <li key={review.id} className="border-border flex flex-col gap-2 border-b pb-5 last:border-0">
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <Avatar.Image src={review.authorAvatar} alt={review.authorName} />
                  <Avatar.Fallback>{initialsOf(review.authorName)}</Avatar.Fallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-foreground text-sm font-medium">{review.authorName}</span>
                  <span className="text-muted text-xs">{formatDate(review.createdAt, lng)}</span>
                </div>
                <Stars value={review.rating} />
              </div>

              {review.bookingCompleted ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <TickCircle size={13} color="currentColor" variant="Bold" />
                  {t("tours.detail.reviews.verified")}
                </span>
              ) : null}

              <p className="text-muted text-sm leading-relaxed">{review.comment}</p>

              {review.photos.length > 0 ? (
                <div className="mt-1 flex gap-2">
                  {review.photos.slice(0, 3).map((photo) => (
                    <div key={photo} className="relative h-20 w-28 overflow-hidden rounded-lg">
                      <Image
                        src={photo}
                        alt={t("tours.detail.reviews.photoAlt")}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={safePage <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("tours.detail.reviews.prev")}
          </Button>
          <span className="text-muted text-sm">
            {t("tours.detail.reviews.page", { page: safePage, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={safePage >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t("tours.detail.reviews.next")}
          </Button>
        </div>
      ) : null}

      <WriteReviewModal
        tourId={tour.id}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setJustPosted(true);
          setSort("recent");
          setPage(1);
        }}
      />
    </div>
  );
}
