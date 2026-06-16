"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/ui";
import { PopularDestinationCard } from "@/features/destinations/components/PopularDestinationCard";
import type { Result } from "@/features/destinations/data";
import type { Destination } from "@/features/destinations/schema";
import { SectionHeading } from "./SectionHeading";

/**
 * A titled destinations row, rendered from a server-fetched `Result`. Branches on
 * error / empty / success (data arrives with the server render, so there is no loading
 * state). Reused for the "Popular destinations" row; pass a custom `renderCard` to vary
 * the card.
 */
export function DestinationSection({
  id,
  title,
  subtitle,
  result,
  actionLabel,
  actionHref,
  onAction,
  renderCard = (destination) => <PopularDestinationCard destination={destination} />,
}: {
  id: string;
  title: string;
  subtitle?: string;
  result: Result<Destination[]>;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  renderCard?: (destination: Destination) => ReactNode;
}) {
  const { t } = useTranslation();
  const data = result.ok ? result.data : null;

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
        onAction={onAction}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((destination, i) => (
            <Reveal key={destination.id} delay={Math.min(i, 4) * 0.06}>
              {renderCard(destination)}
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
