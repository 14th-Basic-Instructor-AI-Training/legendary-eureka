"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Location, TickCircle } from "iconsax-reactjs";
import { Card, Chip } from "@/ui";
import { formatRating } from "@/lib/format";
import type { AgencyProfile } from "../schema";

/** A top-agency teaser tile for the Discover "Top agencies" strip. */
export function AgencyCard({ agency }: { agency: AgencyProfile }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <Card className="bg-background border-border hover:shadow-primary flex h-full flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="border-border relative h-12 w-12 shrink-0 overflow-hidden rounded-full border">
          <Image
            src={agency.logo}
            alt={agency.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight">{agency.name}</h3>
          <p className="text-muted flex items-center gap-1 text-xs">
            <Location size={13} color="currentColor" variant="Bold" className="text-primary" />
            {agency.province}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-warning flex items-center gap-1 text-sm font-medium">
          <Star1 size={14} color="currentColor" variant="Bold" />
          {formatRating(agency.rating, lng)}
          <span className="text-muted font-normal">
            · {t("discover.agency.reviews", { count: agency.reviewCount })}
          </span>
        </span>
        <span className="text-muted text-xs">
          {t("discover.agency.tours", { count: agency.tourCount })}
        </span>
      </div>

      {agency.status === "APPROVED" ? (
        <div>
          <Chip color="success" variant="soft" size="sm">
            <span className="flex items-center gap-1">
              <TickCircle size={13} color="currentColor" variant="Bold" />
              {t("discover.agency.verified")}
            </span>
          </Chip>
        </div>
      ) : null}
    </Card>
  );
}
