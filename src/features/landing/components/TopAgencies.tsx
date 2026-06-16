"use client";

import { useTranslation } from "react-i18next";
import { Reveal } from "@/ui";
import { AgencyCard } from "@/features/destinations/components/AgencyCard";
import type { Result } from "@/features/destinations/data";
import type { AgencyProfile } from "@/features/destinations/schema";
import { SectionHeading } from "./SectionHeading";

/**
 * Landing "Top-rated agencies" row — approved partners, highest rated first, rendered from
 * a server-fetched `Result`. Branches on error / empty / success.
 */
export function TopAgencies({ result }: { result: Result<AgencyProfile[]> }) {
  const { t } = useTranslation();
  const data = result.ok ? result.data : null;

  return (
    <section id="agencies" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        title={t("landing.topAgencies.title")}
        subtitle={t("landing.topAgencies.subtitle")}
      />

      {!result.ok ? (
        <div className="border-border rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted text-sm">{t("destinations.states.error")}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="border-border rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted text-sm">{t("destinations.states.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((agency, i) => (
            <Reveal key={agency.id} delay={Math.min(i, 3) * 0.05}>
              <AgencyCard agency={agency} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
