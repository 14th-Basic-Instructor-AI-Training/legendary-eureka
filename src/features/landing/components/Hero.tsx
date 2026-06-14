"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowRight, Star1, Routing } from "iconsax-reactjs";
import { Button } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useLocalizedRouter } from "@/lib/locale";
import { formatRating } from "@/lib/format";
import { LANDING_IMAGES, avatar } from "../images";
import { HeroSearch } from "./HeroSearch";
import { LoginPromptModal } from "./LoginPromptModal";

const HERO_AVATARS = [12, 32, 47];

/**
 * Landing hero — Bayt-style split: a headline + dual CTAs on the left, a staggered
 * two-image collage with floating stat cards on the right, and the tabbed
 * `HeroSearch` spanning beneath. "Plan a trip" is gated by
 * `can(role, "createTripPlan")` — travelers go to their workspace, everyone else
 * gets the login-prompt modal (no hard redirect). Light-themed for the header.
 */
export function Hero() {
  const { t, i18n } = useTranslation();
  const router = useLocalizedRouter();
  const { role } = useSession();
  const canPlan = can(role, "createTripPlan");
  const [showLogin, setShowLogin] = useState(false);

  const handlePlan = () => {
    if (canPlan) router.push("/traveler/trips/new");
    else setShowLogin(true);
  };

  return (
    <section className="from-primary/5 to-background relative overflow-hidden bg-gradient-to-b">
      <div className="mx-auto w-full max-w-7xl px-4 pt-28 pb-12 md:px-8 md:pt-32 md:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left — headline + CTAs */}
          <div className="max-w-xl">
            <span className="border-border bg-surface text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              {t("landing.hero.kicker")}
            </span>

            <h1 className="text-foreground mt-5 text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="text-muted mt-5 max-w-lg text-base sm:text-lg">
              {t("landing.hero.subtitle")}
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full"
                onPress={() => router.push("/destinations")}
              >
                {t("landing.hero.actions.explore")}
                <ArrowRight size={18} color="currentColor" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full"
                onPress={handlePlan}
              >
                <Routing size={18} color="currentColor" variant="Bold" />
                {canPlan
                  ? t("landing.hero.actions.plan")
                  : t("landing.hero.actions.loginToPlan")}
              </Button>
            </div>

            <LocaleLink
              href="/#tours"
              className="text-muted hover:text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              {t("landing.hero.actions.pathAnchor")}
              <ArrowRight size={15} color="currentColor" />
            </LocaleLink>
          </div>

          {/* Right — staggered two-image collage with floating cards */}
          <div className="relative pb-10">
            {/* Large image (top-right) */}
            <div className="ml-auto w-[80%] sm:w-[74%]">
              <div className="shadow-primary relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
                <Image
                  src={LANDING_IMAGES.unleash}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>

            {/* Small image (bottom-left, overlapping) */}
            <div className="absolute bottom-6 left-0 w-[46%] sm:w-[42%]">
              <div className="border-background shadow-primary relative aspect-square w-full overflow-hidden rounded-[1.5rem] border-4">
                <Image
                  src={LANDING_IMAGES.ctaIsland}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 46vw, 22vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>

            {/* Card 1 — "tours listed" badge (top-right) */}
            <div className="bg-surface/95 border-border shadow-primary absolute top-5 right-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold backdrop-blur">
              <span className="bg-primary inline-flex h-7 w-7 items-center justify-center rounded-full text-white">
                <ArrowRight size={15} color="currentColor" />
              </span>
              {t("landing.hero.badgeListings")}
            </div>

            {/* Card 4 — action pills (top-left, above the small image) */}
            <div className="bg-surface/95 border-border shadow-primary absolute top-6 left-0 hidden flex-col gap-2 rounded-2xl border p-2.5 backdrop-blur sm:flex">
              <Button
                variant="primary"
                size="sm"
                className="rounded-full"
                onPress={() => router.push("/tours")}
              >
                {t("landing.hero.cards.bookNow")}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                className="rounded-full"
                onPress={() => router.push("/destinations")}
              >
                {t("landing.hero.cards.exploreTours")}
              </Button>
            </div>

            {/* Card 2 — destination tagline bubble (mid-right over large image) */}
            <div className="bg-surface/95 border-border shadow-primary absolute top-[38%] right-2 hidden w-52 rounded-2xl border p-3 backdrop-blur sm:block">
              <p className="text-foreground text-xs leading-snug font-medium">
                {t("landing.hero.exploreCard")}
              </p>
              <div className="text-warning mt-2 flex items-center gap-1 text-xs font-semibold">
                <Star1 size={13} color="currentColor" variant="Bold" />
                {formatRating(4.8, i18n.language)}
                <span className="text-muted font-normal">· {t("landing.hero.popularCount")}</span>
              </div>
            </div>

            {/* Card 3 — social proof (bottom-center) */}
            <div className="bg-surface/95 border-border shadow-primary absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur">
              <div className="flex items-center">
                {HERO_AVATARS.map((n, i) => (
                  <span
                    key={n}
                    className="border-surface relative -ml-2 h-9 w-9 overflow-hidden rounded-full border-2 first:ml-0"
                    style={{ zIndex: HERO_AVATARS.length - i }}
                  >
                    <Image src={avatar(n)} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ))}
              </div>
              <div className="text-sm whitespace-nowrap">
                <p className="text-foreground font-bold">{t("landing.hero.happyValue")}</p>
                <p className="text-muted text-xs">{t("landing.hero.happyClients")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed search */}
        <div className="mt-12">
          <HeroSearch />
        </div>
      </div>

      <LoginPromptModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </section>
  );
}
