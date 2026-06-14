"use client";

import { useTranslation } from "react-i18next";
import { Reveal } from "@/ui";

const STATS = ["experience", "clients", "rating"] as const;

/**
 * "About us" intro paragraph plus the headline travel stats (years, travelers,
 * rating) shown as three large figures.
 */
export function AboutStats() {
  const { t } = useTranslation();

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          {t("landing.about.kicker")}
        </span>
        <h2 className="text-foreground mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          {t("landing.about.title")}
        </h2>
        <p className="text-muted mt-4 text-base">{t("landing.about.body")}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STATS.map((key, i) => (
          <Reveal key={key} delay={Math.min(i, 3) * 0.08}>
            <div className="bg-surface border-border flex flex-col items-center gap-2 rounded-3xl border p-8 text-center">
              <span className="text-primary text-5xl font-extrabold tracking-tight">
                {t(`landing.about.stats.${key}.value`)}
              </span>
              <span className="text-muted text-sm font-medium">
                {t(`landing.about.stats.${key}.label`)}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
