"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowLeft2, ArrowRight2, CloseCircle } from "iconsax-reactjs";
import { Modal } from "@/ui";

/** Full-screen lightbox for a tour's photos — large image + thumbnail strip. */
export function TourGalleryModal({
  photos,
  title,
  isOpen,
  startIndex = 0,
  onClose,
}: {
  photos: string[];
  title: string;
  isOpen: boolean;
  startIndex?: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(startIndex);
  const safeIndex = Math.min(index, photos.length - 1);

  const go = (delta: number) =>
    setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="lg" placement="center">
          <Modal.Dialog>
            <Modal.Body className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <p className="text-foreground text-sm font-medium">
                  {title} · {safeIndex + 1}/{photos.length}
                </p>
                <button
                  type="button"
                  aria-label={t("tours.detail.gallery.close")}
                  onClick={onClose}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <CloseCircle size={24} color="currentColor" variant="Bold" />
                </button>
              </div>

              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black/5">
                <Image
                  src={photos[safeIndex]}
                  alt={`${title} ${safeIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover"
                />
                {photos.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label={t("tours.detail.reviews.prev")}
                      onClick={() => go(-1)}
                      className="bg-background/85 text-foreground hover:bg-background absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition-colors"
                    >
                      <ArrowLeft2 size={20} color="currentColor" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("tours.detail.reviews.next")}
                      onClick={() => go(1)}
                      className="bg-background/85 text-foreground hover:bg-background absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition-colors"
                    >
                      <ArrowRight2 size={20} color="currentColor" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${
                      i === safeIndex ? "ring-primary-lightskyblue" : "ring-transparent opacity-70"
                    }`}
                  >
                    <Image
                      src={photo}
                      alt={`${title} ${i + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
