"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Camera, Edit2 } from "iconsax-reactjs";
import { Avatar, Button, Chip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { formatNumber } from "@/lib/format";
import { useTravelerProfileData } from "../context";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** One stat block: bold value stacked over a muted label. */
function Stat({ value, label, lng }: { value: number; label: string; lng: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-foreground text-xl font-bold tracking-tight">
        {formatNumber(value, lng)}
      </span>
      <span className="text-muted text-xs">{label}</span>
    </div>
  );
}

/**
 * Profile identity header: a cover banner with the avatar overlapping its
 * bottom-left, the name + traveler badge + joined date + bio beneath it, an
 * "Edit profile" shortcut into Settings, and a stats strip. Photo/bio edits live
 * in the Settings tab — the camera button routes there.
 */
export function ProfileHeader() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
  const profile = useTravelerProfileData().profile;

  const goToSettings = () => router.push("/traveler/profile?tab=settings");

  const joined = t("profile.header.joined", {
    date: new Intl.DateTimeFormat(lng === "kh" ? "km" : lng === "kr" ? "ko" : "en", {
      year: "numeric",
      month: "long",
    }).format(new Date(profile.joinedAt)),
  });

  return (
    <section className="bg-surface border-border overflow-hidden rounded-2xl border shadow-sm">
      {/* Cover banner */}
      <div className="relative h-36 w-full sm:h-48">
        <Image
          src={profile.coverImage}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Button
          variant="secondary"
          size="sm"
          className="bg-surface/90 absolute end-4 top-4 backdrop-blur"
          onPress={goToSettings}
        >
          <Camera size={16} color="currentColor" />
          {t("profile.header.editCover")}
        </Button>
      </div>

      {/* Identity */}
      <div className="px-5 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Avatar overlapping the cover */}
            <div className="ring-surface relative -mt-12 inline-flex self-start rounded-full ring-4 sm:-mt-14">
              <Avatar className="size-24 rounded-full text-2xl sm:size-28 [&_img]:rounded-full">
                <Avatar.Image src={profile.avatar} alt={profile.name} />
                <Avatar.Fallback>{initialsOf(profile.name)}</Avatar.Fallback>
              </Avatar>
              <button
                type="button"
                onClick={goToSettings}
                aria-label={t("profile.header.editAvatar")}
                title={t("profile.header.uploadComingSoon")}
                className="bg-primary text-primary-foreground ring-surface absolute bottom-1 end-1 inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 transition-transform hover:scale-105"
              >
                <Camera size={15} color="currentColor" variant="Bold" />
              </button>
            </div>

            <div className="min-w-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                <Chip color="accent" variant="soft" size="sm">
                  {t(`profile.badge.${profile.badgeLevel}`)}
                </Chip>
              </div>
              <p className="text-muted mt-0.5 text-sm">{joined}</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto"
            onPress={goToSettings}
          >
            <Edit2 size={16} color="currentColor" />
            {t("profile.header.editProfile")}
          </Button>
        </div>

        <p className="text-foreground/80 mt-3 max-w-2xl text-sm">
          {profile.bio || t("profile.header.bioEmpty")}
        </p>

        {/* Stats strip */}
        <div className="border-border mt-5 grid grid-cols-2 gap-4 border-t pt-5 sm:flex sm:flex-wrap sm:gap-x-10">
          <Stat value={profile.stats.countriesVisited} label={t("profile.stats.countries")} lng={lng} />
          <Stat value={profile.stats.tripsCompleted} label={t("profile.stats.trips")} lng={lng} />
          <Stat value={profile.stats.reviewsWritten} label={t("profile.stats.reviews")} lng={lng} />
          <Stat value={profile.stats.bookmarksSaved} label={t("profile.stats.bookmarks")} lng={lng} />
        </div>
      </div>
    </section>
  );
}
