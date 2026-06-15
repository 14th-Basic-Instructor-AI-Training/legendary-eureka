"use client";

import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { ReviewCard } from "@/features/destinations/components/ReviewCard";
import { useTravelerProfileData } from "../context";
import { EmptyState } from "./EmptyState";

/** Reviews tab: read-only list of the traveler's own reviews. */
export function ReviewsTab() {
  const { t } = useTranslation();
  const { reviews } = useTravelerProfileData();

  return (
    <section className="flex flex-col gap-5">
      {reviews.length === 0 ? (
        <EmptyState Icon={Star1} message={t("reviews.empty")} hint={t("reviews.emptyHint")} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={Math.min(i, 3) * 0.05}>
              <ReviewCard review={review} placeName={review.targetName} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
