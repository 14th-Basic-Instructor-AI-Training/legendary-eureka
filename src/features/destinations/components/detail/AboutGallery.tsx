"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/ui";
import type { Destination } from "../../schema";

/**
 * "About {name}" — the long blurb plus a two-photo collage. Falls back to
 * `shortDescription` and `[heroImage]` when the richer detail data is absent.
 */
export function AboutGallery({ destination }: { destination: Destination }) {
  const { t } = useTranslation();
  const about = destination.about ?? destination.shortDescription;
  const gallery = destination.gallery.length > 0 ? destination.gallery : [destination.heroImage];
  const collage = gallery.slice(0, 2);

  return (
    <Reveal>
      <h2 className="text-foreground text-2xl font-bold tracking-tight">
        {t("destinations.detail.aboutTitle", { name: destination.name })}
      </h2>
      <p className="text-muted mt-3 text-base leading-relaxed">{about}</p>

      {collage.length > 0 ? (
        <div className="mt-6 grid h-52 grid-cols-3 gap-3 md:h-60">
          <div className="relative col-span-2 overflow-hidden rounded-2xl">
            <Image
              src={collage[0]}
              alt={destination.name}
              fill
              sizes="(max-width: 768px) 66vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={collage[1] ?? collage[0]}
              alt={destination.name}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}
    </Reveal>
  );
}
