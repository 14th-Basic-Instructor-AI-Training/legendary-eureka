"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Star1, Edit2 } from "iconsax-reactjs";
import { Button, Form, Label, Modal, TextArea } from "@/ui";
import { useSession } from "@/lib/auth";
import { useToursStore } from "../store";
import { ReviewDraftSchema, type ReviewDraft } from "../schema";

/** Traveler-only modal to write a review. The store re-checks `writeReview`. */
export function WriteReviewModal({
  tourId,
  isOpen,
  onClose,
  onSuccess,
}: {
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const { user, role } = useSession();
  const submitReview = useToursStore((s) => s.submitReview);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewDraft>({
    resolver: zodResolver(ReviewDraftSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const onSubmit = (values: ReviewDraft) => {
    const ok = submitReview(role, tourId, values, {
      name: user?.name ?? "Traveler",
      avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(user?.email ?? "traveler")}`,
    });
    reset({ rating: 5, comment: "" });
    onClose();
    if (ok) onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
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
              <Modal.Heading>{t("tours.detail.reviews.modal.title")}</Modal.Heading>
            </Modal.Header>

            <Form
              className="flex flex-col gap-5"
              validationBehavior="aria"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Modal.Body className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label>{t("tours.detail.reviews.modal.ratingLabel")}</Label>
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            aria-label={`${star}`}
                            onClick={() => field.onChange(star)}
                            className="text-warning transition-transform hover:scale-110"
                          >
                            <Star1
                              size={28}
                              color="currentColor"
                              variant={star <= field.value ? "Bold" : "Linear"}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="review-comment">
                    {t("tours.detail.reviews.modal.commentLabel")}
                  </Label>
                  <Controller
                    control={control}
                    name="comment"
                    render={({ field }) => (
                      <TextArea
                        id="review-comment"
                        rows={4}
                        aria-invalid={Boolean(errors.comment)}
                        placeholder={t("tours.detail.reviews.modal.commentPlaceholder")}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.comment ? (
                    <p className="text-danger text-sm" role="alert">
                      {errors.comment.message}
                    </p>
                  ) : null}
                </div>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2">
                <Button type="button" variant="tertiary" onPress={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" variant="primary" isPending={isSubmitting}>
                  {t("tours.detail.reviews.modal.submit")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
