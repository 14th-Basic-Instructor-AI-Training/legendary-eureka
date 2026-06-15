"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Location } from "iconsax-reactjs";
import { formatNumber, formatRating } from "@/lib/format";
import type { Destination } from "../../schema";
import { Breadcrumb } from "./Breadcrumb";

/**
 * Cinematic detail hero — full-bleed photo, breadcrumb, province line, big title,
 * blurb, and a rating · tours-available meta row. The `MarketingHeader` floats
 * over it (rendered by the screen shell), so the content is bottom-aligned with
 * top padding to clear the fixed header.
 */
export function DetailHero({
  destination,
  toursCount,
}: {
  destination: Destination;
  toursCount?: number;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <section className="relative flex min-h-[58vh] items-end overflow-hidden">
      <Image
        src={destination.heroImage}
        alt={destination.name}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-10 md:px-8">
        <Breadcrumb
          items={[
            { label: t("destinations.detail.breadcrumb.home"), href: "/" },
            { label: t("destinations.detail.breadcrumb.destinations"), href: "/explore" },
            { label: destination.name },
          ]}
        />

        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/90">
          <Location size={16} color="currentColor" variant="Bold" className="text-primary" />
          {destination.province} Province, {destination.country}
        </p>

        <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
          {destination.name}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
          {destination.shortDescription}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-white">
          <span className="flex items-center gap-1.5">
            <Star1 size={16} color="currentColor" variant="Bold" className="text-warning" />
            {formatRating(destination.rating, lng)}
            <span className="font-normal text-white/70">
              ({formatNumber(destination.reviewCount, lng)})
            </span>
          </span>
          {toursCount && toursCount > 0 ? (
            <>
              <span className="text-white/40">·</span>
              <span>{t("destinations.detail.toursAvailable", { count: toursCount })}</span>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
