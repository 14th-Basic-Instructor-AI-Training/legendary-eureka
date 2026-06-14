"use client";

import { useTranslation } from "react-i18next";
import { Global, TickCircle, Wallet3 } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { SectionHeading } from "./SectionHeading";
import type { ComponentType } from "react";

type IconType = ComponentType<{
  size?: number | string;
  color?: string;
  variant?: "Linear" | "Outline" | "Bold" | "Bulk" | "Broken" | "TwoTone";
}>;

const ITEMS: { key: string; Icon: IconType }[] = [
  { key: "variety", Icon: Global },
  { key: "inclusive", Icon: TickCircle },
  { key: "affordable", Icon: Wallet3 },
];

/** "Discover the world" — three value props with centered circular icons. */
export function DiscoverWorld() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        align="center"
        title={t("landing.discover.title")}
        subtitle={t("landing.discover.subtitle")}
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {ITEMS.map(({ key, Icon }, i) => (
          <Reveal key={key} delay={Math.min(i, 3) * 0.08}>
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="bg-primary inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-primary">
                <Icon size={28} color="currentColor" variant="Bold" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">
                {t(`landing.discover.items.${key}.title`)}
              </h3>
              <p className="text-muted max-w-xs text-sm">
                {t(`landing.discover.items.${key}.desc`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
