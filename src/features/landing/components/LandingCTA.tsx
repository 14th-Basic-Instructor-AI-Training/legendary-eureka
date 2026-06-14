"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Button, Reveal } from "@/ui";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { LANDING_IMAGES } from "../images";

/**
 * Closing call-to-action strip — two image-led prompts. Shown to guests only;
 * once signed in, users reach their area from the header instead. The button
 * starts the sign-up flow.
 */
export function LandingCTA() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const { user } = useSession();

  if (user) return null;

  const items = [
    { image: LANDING_IMAGES.ctaBeach, title: t("landing.explore.confidence.title") },
    { image: LANDING_IMAGES.ctaIsland, title: t("landing.explore.oneStep.title") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        {items.map(({ image, title }, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-primary">
                <Image src={image} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <h3 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {title}
              </h3>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.16} className="mt-10 flex justify-center">
        <Button variant="primary" size="lg" onPress={() => router.push("/register")}>
          {t("landing.explore.cta")}
        </Button>
      </Reveal>
    </section>
  );
}
