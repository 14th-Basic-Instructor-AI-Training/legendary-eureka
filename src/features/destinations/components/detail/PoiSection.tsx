"use client";

import type { ComponentType } from "react";
import { Reveal } from "@/ui";
import type { PointOfInterest } from "../../schema";
import { PoiCard } from "./PoiCard";

type IconProps = {
  size?: number;
  color?: string;
  variant?: "Linear" | "Bold";
  className?: string;
};

/**
 * One "Things to Do / Where to Eat / Where to Stay" band — a titled grid of
 * `PoiCard`s. Renders nothing when there are no matching POIs.
 */
export function PoiSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: ComponentType<IconProps>;
  items: PointOfInterest[];
}) {
  if (items.length === 0) return null;

  return (
    <Reveal>
      <h2 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
        <Icon size={22} color="currentColor" variant="Bold" className="text-primary" />
        {title}
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((poi) => (
          <PoiCard key={poi.id} poi={poi} />
        ))}
      </div>
    </Reveal>
  );
}
