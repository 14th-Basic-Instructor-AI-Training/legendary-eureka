"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Trash, Star1 } from "iconsax-reactjs";
import { Button, Reveal } from "@/ui";
import { useSession } from "@/lib/auth";
import { ReviewCard } from "@/features/destinations/components/ReviewCard";
import { useTravelerStore } from "../store";
import type { MyReview } from "../schema";
import { EditReviewModal } from "./EditReviewModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";

/** True while the 7-day post-submission edit window is still open. */
function isEditable(review: MyReview): boolean {
  return Date.now() < new Date(review.editableUntil).getTime();
}

/** Reviews tab: the traveler's own reviews with edit (7-day window) + delete. */
export function ReviewsTab() {
  const { t } = useTranslation();
  const { role } = useSession();
  const reviews = useTravelerStore((s) => s.reviews);
  const deleteReview = useTravelerStore((s) => s.deleteReview);

  const [editTarget, setEditTarget] = useState<MyReview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyReview | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) deleteReview(role, deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <section className="flex flex-col gap-5">
      {reviews.length === 0 ? (
        <EmptyState Icon={Star1} message={t("reviews.empty")} hint={t("reviews.emptyHint")} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reviews.map((review, i) => {
            const editable = isEditable(review);
            return (
              <Reveal key={review.id} delay={Math.min(i, 3) * 0.05}>
                <div className="flex h-full flex-col gap-2">
                  <ReviewCard review={review} placeName={review.targetName} />
                  <div className="flex items-center gap-2">
                    {editable ? (
                      <Button variant="secondary" size="sm" onPress={() => setEditTarget(review)}>
                        <Edit2 size={15} color="currentColor" />
                        {t("reviews.edit")}
                      </Button>
                    ) : (
                      <span className="text-muted text-xs">{t("reviews.editWindowExpired")}</span>
                    )}
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-danger"
                      onPress={() => setDeleteTarget(review)}
                    >
                      <Trash size={15} color="currentColor" />
                      {t("reviews.delete")}
                    </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      <EditReviewModal
        key={editTarget?.id ?? "closed"}
        review={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t("reviews.deleteConfirm.title")}
        description={t("reviews.deleteConfirm.description")}
        confirmLabel={t("reviews.deleteConfirm.confirm")}
      />
    </section>
  );
}
