"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowRight, Routing } from "iconsax-reactjs";
import { Button, concaveMaskStyle } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { useLocalizedRouter } from "@/lib/locale";
import { useExploreStore } from "@/features/explore/store";
import { LANDING_IMAGES, avatar } from "../images";
import { HeroSearch } from "./HeroSearch";
import { LoginPromptModal } from "./LoginPromptModal";

const HERO_AVATARS = [12, 32, 47];

/**
 * Landing hero — Bayt-style split: a headline + dual CTAs on the left, a staggered
 * two-image collage with floating cards on the right, and the tabbed `HeroSearch`
 * spanning beneath. "Plan a trip" is gated by `can(role, "createTripPlan")` —
 * travelers go to their workspace, everyone else gets the login-prompt modal.
 *
 * The two floating text cards use the brand concave bottom-corner treatment
 * (`concaveMaskStyle`) — content-driven height + real padding so the copy fits at
 * 16–18px without the corner accent ever clipping a glyph.
 */
export function Hero() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  const { role } = useSession();
  const canPlan = can(role, "createTripPlan");
  const [showLogin, setShowLogin] = useState(false);

  const handlePlan = () => {
    if (canPlan) router.push("/traveler/trips/new");
    else setShowLogin(true);
  };

  /** Open Explore on the Tours tab (the tour-oriented pills route here). */
  const openExploreTours = () => {
    useExploreStore.getState().setTab("tours");
    router.push("/explore");
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
                onPress={() => router.push("/explore")}
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

          {/* Right — staggered image collage with concave-corner cards */}
          <div className="relative flex flex-col gap-10 pb-2 sm:gap-8">
            {/* Big image (right-aligned, taller) — its floating cards anchor to it */}
            <div className="relative ml-auto w-[86%] sm:w-[80%]">
              <div className="shadow-primary relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem]">
                <Image
                  src={LANDING_IMAGES.unleash}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 86vw, 38vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* "3K+ tours listed" pill — top-right */}
              <div className="bg-surface/95 border-border shadow-primary absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-3.5 text-sm font-semibold backdrop-blur">
                {t("landing.hero.badgeListings")}
                <span className="bg-primary inline-flex h-7 w-7 items-center justify-center rounded-full text-white">
                  <ArrowRight size={14} color="currentColor" />
                </span>
              </div>

              {/* Two action pills — top-left, so they clear the stat card below */}
              <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={openExploreTours}
                  className="bg-primary shadow-primary rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-transform hover:-translate-y-0.5"
                >
                  {t("landing.hero.cards.bookNow")}
                </button>
                <button
                  type="button"
                  onClick={openExploreTours}
                  className="bg-surface/95 text-foreground border-border rounded-lg border px-4 py-2 text-sm font-semibold whitespace-nowrap shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5"
                >
                  {t("landing.hero.cards.exploreTours")}
                </button>
              </div>

              {/* Card B — stat card (concave corners), bottom-left, overhangs the image */}
              <div className="absolute -bottom-5 left-2 w-[78%] [filter:drop-shadow(0_14px_28px_rgb(0_0_0/0.18))] sm:w-[68%]">
                <div
                  className="bg-surface/95 w-full rounded-2xl px-5 py-5 backdrop-blur"
                  style={concaveMaskStyle(18)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center">
                      {HERO_AVATARS.map((n, i) => (
                        <span
                          key={n}
                          className="border-surface relative -ml-2.5 h-9 w-9 overflow-hidden rounded-full border-2 first:ml-0"
                          style={{ zIndex: HERO_AVATARS.length - i }}
                        >
                          <Image src={avatar(n)} alt="" fill sizes="36px" className="object-cover" />
                        </span>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground text-xl leading-none font-bold">
                        {t("landing.hero.happyValue")}
                      </p>
                      <p className="text-muted mt-1.5 text-sm leading-snug">
                        {t("landing.hero.happyClients")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small image (left-aligned) + Card A overlapping its bottom-right */}
            <div className="relative w-[54%] self-start sm:w-[48%]">
              <div className="shadow-primary relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem]">
                <Image
                  src={LANDING_IMAGES.ctaIsland}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 54vw, 22vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Card A — "Unlock the true potential…" (concave corners) */}
              <div className="absolute -right-6 -bottom-7 w-56 [filter:drop-shadow(0_14px_28px_rgb(0_0_0/0.18))] sm:w-60">
                <div
                  className="bg-surface/95 w-full rounded-2xl p-5 backdrop-blur"
                  style={concaveMaskStyle(18)}
                >
                  <span className="bg-primary/10 text-primary mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full">
                    <Routing size={18} color="currentColor" variant="Bold" />
                  </span>
                  <p className="text-foreground text-base leading-snug font-semibold">
                    {t("landing.hero.exploreCard")}
                  </p>
                </div>
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
