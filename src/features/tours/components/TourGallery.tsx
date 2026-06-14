"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { GalleryImport } from "iconsax-reactjs";
import { TourGalleryModal } from "./TourGalleryModal";

/** Hero image + 4-thumbnail strip with a "View all photos" button → lightbox. */
export function TourGallery({ photos, title }: { photos: string[]; title: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openAt = (i: number) => {
    setStartIndex(i);
    setOpen(true);
  };

  const thumbs = photos.slice(1, 5);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => openAt(0)}
        className="group relative aspect-[16/9] w-full overflow-hidden rounded-3xl"
      >
        <Image
          src={photos[0]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </button>

      {thumbs.length > 0 ? (
        <div className="relative grid grid-cols-4 gap-3">
          {thumbs.map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => openAt(i + 1)}
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
            >
              <Image
                src={photo}
                alt={`${title} ${i + 2}`}
                fill
                sizes="(max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}

          <button
            type="button"
            onClick={() => openAt(0)}
            className="bg-background/90 text-foreground hover:bg-background border-border absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium backdrop-blur transition-colors"
          >
            <GalleryImport size={15} color="currentColor" variant="Bold" />
            {t("tours.detail.gallery.viewAll", { count: photos.length })}
          </button>
        </div>
      ) : null}

      <TourGalleryModal
        photos={photos}
        title={title}
        isOpen={open}
        startIndex={startIndex}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
