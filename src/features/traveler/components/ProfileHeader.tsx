"use client";

import { useTranslation } from "react-i18next";
import { Edit2 } from "iconsax-reactjs";
import { Avatar, Button, Chip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { formatNumber } from "@/lib/format";
import { useTravelerStore } from "../store";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** One inline stat: bold value + muted label. */
function Stat({ value, label, lng }: { value: number; label: string; lng: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-foreground text-base font-bold tracking-tight">
        {formatNumber(value, lng)}
      </span>
      <span className="text-muted text-xs">{label}</span>
    </span>
  );
}

/**
 * Slim profile identity header: avatar + display name + traveler badge + joined
 * date on one row, an "Edit profile" shortcut into Settings, and a tidy inline
 * stats strip. Bio and photo edits live in the Settings tab.
 */
export function ProfileHeader() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
  const profile = useTravelerStore((s) => s.profile);

  const joined = t("profile.header.joined", {
    date: new Intl.DateTimeFormat(lng === "kh" ? "km" : lng === "kr" ? "ko" : "en", {
      year: "numeric",
      month: "long",
    }).format(new Date(profile.joinedAt)),
  });

  return (
    <section className="bg-surface border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <Avatar.Image src={profile.avatar} alt={profile.name} />
            <Avatar.Fallback>{initialsOf(profile.name)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{profile.name}</h1>
              <Chip color="accent" variant="soft" size="sm">
                {t(`profile.badge.${profile.badgeLevel}`)}
              </Chip>
            </div>
            <p className="text-muted mt-0.5 text-sm">{joined}</p>
            {profile.bio ? (
              <p className="text-foreground/80 mt-1 line-clamp-1 max-w-xl text-sm">{profile.bio}</p>
            ) : null}
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="self-start sm:self-auto"
          onPress={() => router.push("/traveler/profile?tab=settings")}
        >
          <Edit2 size={16} color="currentColor" />
          {t("profile.header.editProfile")}
        </Button>
      </div>

      <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4">
        <Stat value={profile.stats.countriesVisited} label={t("profile.stats.countries")} lng={lng} />
        <Stat value={profile.stats.tripsCompleted} label={t("profile.stats.trips")} lng={lng} />
        <Stat value={profile.stats.reviewsWritten} label={t("profile.stats.reviews")} lng={lng} />
        <Stat value={profile.stats.bookmarksSaved} label={t("profile.stats.bookmarks")} lng={lng} />
      </div>
    </section>
  );
}
