"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { LANDING_IMAGES } from "../images";

/**
 * Seasonal promo banner — an aerial coastline image paired with a headline and a
 * discount call-to-action bar overlapping the bottom edge.
 */
export function UnleashBanner() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <Reveal>
        <div className="bg-surface border-border grid grid-cols-1 gap-6 overflow-hidden rounded-[2rem] border p-4 md:grid-cols-2 md:p-6">
          <div className="relative min-h-64 overflow-hidden rounded-3xl">
            <Image
              src={LANDING_IMAGES.unleash}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center gap-5 px-2 py-4 md:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
              {t("landing.unleash.title")}
            </h2>
            <p className="text-muted text-base">{t("landing.unleash.desc")}</p>

            <div className="bg-background border-border mt-1 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-primary inline-flex items-center rounded-xl px-3 py-2 text-lg font-extrabold text-white">
                  {t("landing.unleash.badge")}
                </span>
                <span className="text-muted text-sm">{t("landing.unleash.deadline")}</span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="bg-foreground hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                {t("landing.unleash.cta")}
                <ArrowRight size={16} color="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
