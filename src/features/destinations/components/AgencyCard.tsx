"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Star1, Location, TickCircle } from "iconsax-reactjs";
import { Button, Card, Chip } from "@/ui";
import { formatRating, formatNumber } from "@/lib/format";
import { useLocalizedRouter } from "@/lib/locale";
import type { AgencyProfile } from "../schema";

/** A top-agency profile card for the landing "Top-rated agencies" row. */
export function AgencyCard({ agency }: { agency: AgencyProfile }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();

  const handleViewAgency = () => router.push(`/agencies/${agency.slug}`);

  return (
    <Card className="bg-background border-border hover:shadow-primary flex h-full flex-col items-center gap-3 rounded-2xl border p-5 text-center shadow-sm transition-shadow">
      <div className="border-border relative h-20 w-20 shrink-0 overflow-hidden rounded-full border">
        <Image
          src={agency.logo}
          alt={agency.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold tracking-tight">{agency.name}</h3>
          {agency.status === "APPROVED" ? (
            <TickCircle
              size={16}
              color="currentColor"
              variant="Bold"
              className="text-primary"
              aria-label={t("discover.agency.verified")}
            />
          ) : null}
        </div>
        <p className="text-muted text-sm">
          {t("discover.agency.ownedBy", { owner: agency.owner })}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {agency.tags.map((tag) => (
          <Chip key={tag} color="accent" variant="soft" size="sm">
            {tag}
          </Chip>
        ))}
        <Chip color="default" variant="soft" size="sm">
          <span className="flex items-center gap-1">
            <Location size={12} color="currentColor" variant="Bold" className="text-primary" />
            {agency.province}
          </span>
        </Chip>
      </div>

      <div className="border-border mt-1 grid w-full grid-cols-3 gap-2 border-t pt-4">
        <div className="flex flex-col items-center">
          <span className="text-warning flex items-center gap-1 font-semibold">
            <Star1 size={14} color="currentColor" variant="Bold" />
            {formatRating(agency.rating, lng)}
          </span>
          <span className="text-muted text-xs">{t("discover.agency.statRating")}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">{formatNumber(agency.tourCount, lng)}</span>
          <span className="text-muted text-xs">{t("discover.agency.statTours")}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">{formatNumber(agency.reviewCount, lng)}</span>
          <span className="text-muted text-xs">{t("discover.agency.statReviews")}</span>
        </div>
      </div>

      <Button className="mt-2 w-full" onPress={handleViewAgency}>
        {t("discover.agency.viewAgency")}
      </Button>
    </Card>
  );
}
