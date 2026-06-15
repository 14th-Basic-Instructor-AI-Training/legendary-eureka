"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star1, Edit2 } from "iconsax-reactjs";
import { Button, Form, Label, Modal, TextArea } from "@/ui";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useTravelerStore } from "../store";
import type { MyReview } from "../schema";

/** Edit one of the traveler's own reviews (rating + comment). */
export function EditReviewModal({
  review,
  onClose,
}: {
  review: MyReview | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { role } = useSession();
  const editReview = useTravelerStore((s) => s.editReview);

  // Initialized from `review` on mount; the parent keys this modal by review id
  // so a different review remounts it with fresh values (no sync effect needed).
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (review) editReview(role, review.id, { rating, comment: comment.trim() });
    onClose();
  };

  return (
    <Modal
      isOpen={review !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="md" placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex items-center gap-2">
              <Modal.Icon className="text-primary">
                <Edit2 size={20} color="currentColor" />
              </Modal.Icon>
              <Modal.Heading>{t("reviews.editModal.title")}</Modal.Heading>
            </Modal.Header>

            <Form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <Modal.Body className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label>{t("reviews.editModal.rating")}</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={t("reviews.editModal.ratingValue", { count: n })}
                        aria-pressed={n <= rating}
                        onClick={() => setRating(n)}
                        className={cn(
                          "transition-colors",
                          n <= rating ? "text-warning" : "text-muted/40",
                        )}
                      >
                        <Star1 size={28} color="currentColor" variant="Bold" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="review-comment">{t("reviews.editModal.comment")}</Label>
                  <TextArea
                    id="review-comment"
                    value={comment}
                    maxLength={500}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" onPress={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" variant="primary" isDisabled={comment.trim().length === 0}>
                  {t("common.save")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
