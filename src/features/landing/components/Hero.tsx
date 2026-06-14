"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "iconsax-reactjs";
import { Button } from "@/ui";
import { LANDING_IMAGES, avatar } from "../images";
import { SOCIALS } from "./SocialIcons";

const PARTNERS = ["Booking.com", "Expedia", "Tripadvisor", "Trivago"];
const HERO_AVATARS = [12, 32, 47];

/**
 * Landing hero — full-bleed sky image with the headline, a primary call to
 * action, partner wordmarks, and a floating "popular places" card. Static (no
 * entrance animation); motion happens on scroll for the sections below.
 */
export function Hero() {
  const { t } = useTranslation();

  const scrollToDestinations = () =>
    document.getElementById("destinations")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <Image
        src={LANDING_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Left-weighted scrim keeps the headline legible over the bright sky. */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-16 md:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            {t("landing.hero.kicker")}
          </span>

          <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            {t("landing.hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onPress={scrollToDestinations}>
              {t("landing.hero.cta")}
              <ArrowRight size={18} color="currentColor" />
            </Button>

            <div className="flex items-center gap-3 text-white/90">
              <span className="text-xs font-semibold tracking-wide uppercase">
                {t("landing.hero.followUs")}
              </span>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ key, Glyph }) => (
                  <a
                    key={key}
                    href="#"
                    aria-label={key}
                    className="hover:bg-primary inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors"
                  >
                    <Glyph />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Partner wordmarks */}
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3">
            {PARTNERS.map((name) => (
              <span key={name} className="text-sm font-semibold tracking-tight text-white/70">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating "popular places" card */}
      <div className="animate-float absolute right-6 bottom-12 z-10 hidden w-60 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <Image src={LANDING_IMAGES.heroThumb} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">
              {t("landing.hero.popularNow")}
            </p>
            <p className="text-muted truncate text-xs">{t("landing.hero.popularCount")}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center">
          {HERO_AVATARS.map((n, i) => (
            <span
              key={n}
              className="border-background relative -ml-2 h-7 w-7 overflow-hidden rounded-full border-2 first:ml-0"
              style={{ zIndex: HERO_AVATARS.length - i }}
            >
              <Image src={avatar(n)} alt="" fill sizes="28px" className="object-cover" />
            </span>
          ))}
          <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
            +4.8★
          </span>
        </div>
      </div>
    </section>
  );
}
