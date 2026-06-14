"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1 } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { cn } from "@/lib/utils";
import { avatar } from "../images";
import { SectionHeading } from "./SectionHeading";

/** Testimonials are static marketing content: quote copy is localized, names
 * are proper nouns, avatars are placeholders. The middle card is highlighted. */
const TESTIMONIALS = [
  { key: "one", name: "Sophea Chan", avatarId: 5, stars: 5, featured: false },
  { key: "two", name: "Min-jun Park", avatarId: 33, stars: 5, featured: true },
  { key: "three", name: "Dara Kim", avatarId: 12, stars: 4, featured: false },
] as const;

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading align="center" title={t("landing.testimonials.title")} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {TESTIMONIALS.map(({ key, name, avatarId, stars, featured }, i) => (
          <Reveal key={key} delay={Math.min(i, 3) * 0.08}>
            <figure
              className={cn(
                "flex h-full flex-col gap-4 rounded-3xl border p-6 shadow-sm",
                featured
                  ? "bg-primary border-primary text-white md:-translate-y-3"
                  : "bg-background border-border",
              )}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star1
                    key={s}
                    size={16}
                    color="currentColor"
                    variant={s < stars ? "Bold" : "Linear"}
                    className={cn(
                      s < stars ? (featured ? "text-white" : "text-yellow") : "opacity-30",
                    )}
                  />
                ))}
              </div>

              <blockquote
                className={cn("flex-1 text-sm", featured ? "text-white/90" : "text-muted")}
              >
                “{t(`landing.testimonials.items.${key}`)}”
              </blockquote>

              <figcaption className="flex items-center gap-3">
                <span className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={avatar(avatarId)} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{name}</span>
                  <span className={cn("text-xs", featured ? "text-white/75" : "text-muted")}>
                    {t("landing.testimonials.role")}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
