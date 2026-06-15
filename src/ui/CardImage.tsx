"use client";

import { useState } from "react";
import Image from "next/image";
import { GallerySlash } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
};

/**
 * Card cover image with a graceful fallback. `next/image` renders nothing when
 * `src` is empty or points at a non-image URL (e.g. an `unsplash.com/photos/…`
 * page link rather than a direct `images.unsplash.com` file). When the source is
 * missing or fails to load we show a neutral placeholder instead of a blank tile.
 *
 * Fills its nearest positioned ancestor (the card's `relative` media box).
 */
export function CardImage({ src, alt, sizes, className }: Props) {
  // Track the src that failed (not a bare boolean) so a new src auto-clears the
  // error during render — no effect needed.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasSrc = typeof src === "string" && src.trim().length > 0;
  const failed = failedSrc === src;

  if (!hasSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="bg-muted/10 text-muted/50 absolute inset-0 flex items-center justify-center"
      >
        <GallerySlash size={32} color="currentColor" variant="Bold" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}
