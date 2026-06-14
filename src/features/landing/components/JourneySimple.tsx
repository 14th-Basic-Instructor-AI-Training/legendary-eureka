"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Location, Airplane, ArrowRight } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { LANDING_IMAGES } from "../images";
import { SectionHeading } from "./SectionHeading";

/**
 * "Your journey, made simple" — a three-step band with an elevated, image-backed
 * "Book a ticket" card in the middle, flanked by two quieter steps.
 */
export function JourneySimple() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        align="center"
        title={t("landing.journey.title")}
        subtitle={t("landing.journey.subtitle")}
      />

      <div className="mt-4 grid grid-cols-1 items-center gap-5 md:grid-cols-3">
        <Reveal>
          <div className="bg-surface border-border flex h-full flex-col gap-3 rounded-3xl border p-7">
            <span className="bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-2xl">
              <Location size={24} color="currentColor" variant="Bold" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">
              {t("landing.journey.find.title")}
            </h3>
            <p className="text-muted text-sm">{t("landing.journey.find.desc")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="bg-primary relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl p-7 text-white shadow-primary md:-my-4 md:py-11">
            <div className="border-background/30 absolute -top-6 -right-6 h-28 w-28 overflow-hidden rounded-full border-4">
              <Image
                src={LANDING_IMAGES.journeyTicket}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Airplane size={24} color="currentColor" variant="Bold" />
            </span>
            <h3 className="text-xl font-semibold tracking-tight">
              {t("landing.journey.book.title")}
            </h3>
            <p className="max-w-[15rem] text-sm text-white/85">
              {t("landing.journey.book.desc")}
            </p>
            <button
              type="button"
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition-transform hover:scale-[1.03]"
            >
              {t("landing.journey.book.cta")}
              <ArrowRight size={16} color="currentColor" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="bg-surface border-border flex h-full flex-col gap-3 rounded-3xl border p-7">
            <span className="bg-primary/10 text-primary inline-flex h-12 w-12 items-center justify-center rounded-2xl">
              <Airplane size={24} color="currentColor" variant="Bold" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">
              {t("landing.journey.play.title")}
            </h3>
            <p className="text-muted text-sm">{t("landing.journey.play.desc")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
