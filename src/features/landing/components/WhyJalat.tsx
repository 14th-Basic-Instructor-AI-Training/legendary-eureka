"use client";

import { useTranslation } from "react-i18next";
import { Profile2User, Star1, Routing, Messages2 } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { SectionHeading } from "./SectionHeading";
import type { ComponentType } from "react";

type IconType = ComponentType<{
  size?: number | string;
  color?: string;
  variant?: "Linear" | "Outline" | "Bold" | "Bulk" | "Broken" | "TwoTone";
}>;

const ITEMS: { key: string; Icon: IconType }[] = [
  { key: "local", Icon: Profile2User },
  { key: "trusted", Icon: Star1 },
  { key: "flexible", Icon: Routing },
  { key: "support", Icon: Messages2 },
];

/** Static value-prop band. Each item reveals on scroll. */
export function WhyJalat() {
  const { t } = useTranslation();

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading title={t("landing.why.title")} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ key, Icon }, i) => (
          <Reveal key={key} delay={Math.min(i, 4) * 0.08}>
            <div className="flex flex-col gap-3">
              <span className="bg-primary/10 text-primary inline-flex h-11 w-11 items-center justify-center rounded-xl">
                <Icon size={22} color="currentColor" variant="Bold" />
              </span>
              <h3 className="font-semibold tracking-tight">
                {t(`landing.why.items.${key}.title`)}
              </h3>
              <p className="text-muted text-sm">{t(`landing.why.items.${key}.desc`)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
