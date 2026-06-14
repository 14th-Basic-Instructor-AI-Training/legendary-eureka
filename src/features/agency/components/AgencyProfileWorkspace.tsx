"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldTick,
  Sms,
  Call,
  Link21,
  Location,
  Briefcase,
  Star1,
  Camera,
  GalleryAdd,
  Edit2,
  Map1,
} from "iconsax-reactjs";
import { Button, Card, Input, TextArea, Skeleton } from "@/ui";
import { useResource } from "@/lib/useResource";
import { getAgencyProfile, getProfileReviews } from "../data";
import type { AgencyProfile, ProfileReview } from "../schema";

const CAMBODIA_PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Sihanoukville",
  "Kampot",
  "Battambang",
  "Kratie",
  "Mondulkiri",
  "Ratanakiri",
  "Kep",
  "Kampong Cham",
  "Kampong Speu",
  "Prey Veng",
  "Takeo",
];

// ── Initials avatar (replaces HeroUI Avatar whose typings are too narrow) ────

function InitialsAvatar({
  initials,
  size = "md",
  className = "",
}: {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dim =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "md"
        ? "h-10 w-10 text-sm"
        : size === "lg"
          ? "h-14 w-14 text-base"
          : "h-18 w-18 text-lg";
  return (
    <div
      className={`${dim} ${className} flex shrink-0 items-center justify-center rounded-full bg-[#185FA5] font-semibold text-white select-none`}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Star rating row ───────────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star1
          key={s}
          size={size}
          variant={s <= filled ? "Bold" : "Linear"}
          color={s <= filled ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

// ── Rating histogram bar ──────────────────────────────────────────────────────

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-12 shrink-0 items-center justify-end gap-1">
        <span className="text-muted text-sm tabular-nums">{star}</span>
        <Star1 size={12} variant="Bold" color="#F59E0B" />
      </div>
      <div className="bg-border h-2 flex-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted w-8 shrink-0 text-right text-sm tabular-nums">
        {count}
      </span>
    </div>
  );
}

// ── Labeled field wrapper (icon + label above the input) ──────────────────────

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <label className="text-foreground text-sm font-medium">{label}</label>
      </div>
      {children}
    </div>
  );
}

// ── Tab 1 — Profile Info ──────────────────────────────────────────────────────

function ProfileInfoTab({ profile }: { profile: AgencyProfile }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: profile.name,
    tagline: profile.tagline ?? "",
    description: profile.description ?? "",
    email: profile.email,
    phone: profile.phone ?? "",
    website: profile.website ?? "",
    province: profile.province ?? "",
  });

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      {/* ── Left: editable fields ── */}
      <div className="space-y-5">
        <Field label={t("agency.profile.info.agencyName")}>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            aria-label={t("agency.profile.info.agencyName")}
          />
        </Field>

        <Field label={t("agency.profile.info.tagline")}>
          <Input
            value={form.tagline}
            onChange={(e) =>
              setForm((f) => ({ ...f, tagline: e.target.value }))
            }
            aria-label={t("agency.profile.info.tagline")}
          />
        </Field>

        <Field label={t("agency.profile.info.description")}>
          <TextArea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder={t("agency.profile.info.descriptionPlaceholder")}
            className="min-h-[120px]"
            aria-label={t("agency.profile.info.description")}
          />
        </Field>

        <Field
          icon={<Sms size={15} variant="Linear" color="#6B7280" />}
          label={t("agency.profile.info.email")}
        >
          <Input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            aria-label={t("agency.profile.info.email")}
          />
        </Field>

        <Field
          icon={<Call size={15} variant="Linear" color="#6B7280" />}
          label={t("agency.profile.info.phone")}
        >
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            aria-label={t("agency.profile.info.phone")}
          />
        </Field>

        <Field
          icon={<Link21 size={15} variant="Linear" color="#6B7280" />}
          label={t("agency.profile.info.website")}
        >
          <Input
            value={form.website}
            onChange={(e) =>
              setForm((f) => ({ ...f, website: e.target.value }))
            }
            aria-label={t("agency.profile.info.website")}
          />
        </Field>

        <Field
          icon={<Location size={15} variant="Linear" color="#6B7280" />}
          label={t("agency.profile.info.province")}
        >
          <select
            value={form.province}
            onChange={(e) =>
              setForm((f) => ({ ...f, province: e.target.value }))
            }
            className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
          >
            <option value="">—</option>
            {CAMBODIA_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Right: public preview card ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#185FA5]">
          {t("agency.profile.publicPreview")}
        </p>
        <Card className="overflow-hidden">
          {/* Mini cover gradient in preview */}
          <div className="flex h-20 items-end bg-gradient-to-br from-blue-100 via-sky-50 to-slate-200 px-4 pb-0">
            <div className="-mb-5 translate-y-0">
              <InitialsAvatar initials={initials} size="lg" className="border-2 border-white shadow-sm" />
            </div>
          </div>
          <div className="space-y-3 px-5 pb-5 pt-8">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-foreground font-semibold">{form.name}</p>
                {profile.isVerified && (
                  <ShieldTick size={15} variant="Linear" color="#185FA5" />
                )}
              </div>
              {form.tagline && (
                <p className="text-muted mt-0.5 text-sm">{form.tagline}</p>
              )}
            </div>

            <div className="border-border divide-border divide-y border-t text-sm">
              {form.email && (
                <div className="flex items-center gap-2 py-2">
                  <Sms size={14} variant="Linear" color="#9CA3AF" />
                  <span className="text-foreground/70 truncate">{form.email}</span>
                </div>
              )}
              {form.phone && (
                <div className="flex items-center gap-2 py-2">
                  <Call size={14} variant="Linear" color="#9CA3AF" />
                  <span className="text-foreground/70">{form.phone}</span>
                </div>
              )}
              {form.website && (
                <div className="flex items-center gap-2 py-2">
                  <Link21 size={14} variant="Linear" color="#185FA5" />
                  <span className="truncate text-[#185FA5]">{form.website}</span>
                </div>
              )}
              {form.province && (
                <div className="flex items-center gap-2 py-2">
                  <Location size={14} variant="Linear" color="#9CA3AF" />
                  <span className="text-foreground/70">
                    {form.province}, Cambodia
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Star1 size={14} variant="Bold" color="#F59E0B" />
              <span className="text-sm font-semibold">
                {profile.averageRating.toFixed(1)}
              </span>
              <span className="text-muted text-sm">({profile.reviewCount})</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 2 — Location ──────────────────────────────────────────────────────────

function LocationTab({ profile }: { profile: AgencyProfile }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    streetAddress: profile.streetAddress ?? "",
    city: profile.city ?? "",
    province: profile.province ?? "",
  });

  const currentAddressLine = profile.streetAddress
    ? `${profile.streetAddress}, ${profile.city}, ${profile.province}, Cambodia`
    : t("agency.profile.location.noAddress");

  return (
    <div className="space-y-6">
      {/* Map placeholder */}
      <div className="border-border flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl border bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Map1 size={48} variant="Linear" color="#CBD5E1" />
          <p className="text-sm font-medium">
            {t("agency.profile.location.mapPlaceholder")}
          </p>
          {profile.city && (
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              {profile.city}, {profile.province}
            </span>
          )}
        </div>
      </div>

      {/* Current address */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">
          <Location size={18} variant="Linear" color="#185FA5" />
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">
            {t("agency.profile.location.currentAddress")}
          </p>
          <p className="text-muted mt-0.5 text-sm">{currentAddressLine}</p>
        </div>
      </div>

      {!isEditing ? (
        <Button
          onPress={() => setIsEditing(true)}
          variant="outline"
          className="border-[#185FA5] text-[#185FA5]"
        >
          <span className="flex items-center gap-1.5">
            <Edit2 size={16} variant="Linear" />
            {t("agency.profile.location.editLocation")}
          </span>
        </Button>
      ) : (
        <div className="border-border space-y-5 rounded-2xl border p-6">
          <Field label={t("agency.profile.location.streetAddress")}>
            <Input
              value={form.streetAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, streetAddress: e.target.value }))
              }
              aria-label={t("agency.profile.location.streetAddress")}
            />
          </Field>

          <Field label={t("agency.profile.location.city")}>
            <Input
              value={form.city}
              onChange={(e) =>
                setForm((f) => ({ ...f, city: e.target.value }))
              }
              aria-label={t("agency.profile.location.city")}
            />
          </Field>

          <Field
            icon={<Location size={15} variant="Linear" color="#6B7280" />}
            label={t("agency.profile.location.province")}
          >
            <select
              value={form.province}
              onChange={(e) =>
                setForm((f) => ({ ...f, province: e.target.value }))
              }
              className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30"
            >
              <option value="">—</option>
              {CAMBODIA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Button
            variant="ghost"
            className="text-[#185FA5]"
          >
            <span className="flex items-center gap-1.5">
              <Location size={16} variant="Linear" />
              {t("agency.profile.location.dropPin")}
            </span>
          </Button>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button
              onPress={() => setIsEditing(false)}
              className="bg-[#185FA5] text-white"
            >
              {t("agency.profile.location.saveLocation")}
            </Button>
            <Button variant="ghost" onPress={() => setIsEditing(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 3 — Ratings & Reviews ─────────────────────────────────────────────────

function ReviewCard({ review }: { review: ProfileReview }) {
  const initials = review.travelerInitials.slice(0, 2).toUpperCase();
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <InitialsAvatar initials={initials} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {review.travelerName}
              </p>
              <StarRating rating={review.rating} size={13} />
            </div>
            <span className="text-muted shrink-0 text-xs">{review.date}</span>
          </div>
          <p className="text-foreground/80 mt-2.5 text-sm leading-relaxed">
            {review.comment}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <Briefcase size={13} variant="Linear" color="#9CA3AF" />
            <span className="text-muted text-xs">{review.packageName}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReviewsTab({
  profile,
  reviews,
}: {
  profile: AgencyProfile;
  reviews: ProfileReview[];
}) {
  const { t } = useTranslation();
  const { reviewCount, averageRating, ratingsBreakdown } = profile;

  return (
    <div className="space-y-8">
      {/* Rating overview card */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="text-foreground text-6xl font-bold leading-none tracking-tight">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} size={22} />
            <p className="text-muted text-sm">
              {t("agency.profile.reviews.totalReviews", { count: reviewCount })}
            </p>
          </div>

          <div className="flex-1 space-y-2.5">
            <RatingBar star={5} count={ratingsBreakdown.five} total={reviewCount} />
            <RatingBar star={4} count={ratingsBreakdown.four} total={reviewCount} />
            <RatingBar star={3} count={ratingsBreakdown.three} total={reviewCount} />
            <RatingBar star={2} count={ratingsBreakdown.two} total={reviewCount} />
            <RatingBar star={1} count={ratingsBreakdown.one} total={reviewCount} />
          </div>
        </div>
      </Card>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted text-sm">
            {t("agency.profile.reviews.empty")}
          </p>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="flex items-center justify-between pl-28">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="flex gap-6 border-b border-border">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

type ProfileTab = "info" | "location" | "reviews";

export function AgencyProfileWorkspace() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const profileState = useResource(getAgencyProfile);
  const reviewsState = useResource(getProfileReviews);

  if (profileState.status === "loading") return <ProfileSkeleton />;

  if (profileState.status === "error" || !profileState.data) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted text-sm">{t("agency.profile.error")}</p>
        <Button onPress={profileState.reload}>{t("common.retry")}</Button>
      </div>
    );
  }

  const profile = profileState.data;
  const reviews = reviewsState.data ?? [];

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const TABS: { key: ProfileTab; label: string }[] = [
    { key: "info", label: t("agency.profile.tabs.info") },
    { key: "location", label: t("agency.profile.tabs.location") },
    { key: "reviews", label: t("agency.profile.tabs.reviews") },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* ─── Agency Header ─────────────────────────────────────────────────── */}
      <div className="relative mb-16">
        {/* Cover photo */}
        <div className="group relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 via-sky-50 to-slate-200">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <GalleryAdd size={40} variant="Linear" color="#CBD5E1" />
          </div>
          <button
            type="button"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100"
          >
            <Camera size={13} variant="Linear" color="white" />
            {t("agency.profile.uploadCover")}
          </button>
        </div>

        {/* Avatar overlapping cover bottom */}
        <div className="absolute bottom-0 left-6 z-10 translate-y-1/2">
          <div className="group relative h-20 w-20 rounded-full border-4 border-white shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#185FA5]">
              <span className="select-none text-2xl font-bold text-white">
                {initials}
              </span>
            </div>
            <button
              type="button"
              aria-label={t("agency.profile.uploadAvatar")}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              <Camera size={18} variant="Linear" color="white" />
            </button>
          </div>
        </div>

        {/* Save Changes button — bottom-right of header zone */}
        <div className="absolute bottom-3 right-0">
          <Button
            onPress={() => {}}
            className="bg-[#185FA5] font-medium text-white shadow-sm"
          >
            {t("agency.profile.saveChanges")}
          </Button>
        </div>
      </div>

      {/* ─── Agency name + tagline ─────────────────────────────────────────── */}
      <div className="mb-6 pl-28">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold leading-none tracking-tight">
            {profile.name}
          </h1>
          {profile.isVerified && (
            <ShieldTick size={22} variant="Linear" color="#185FA5" />
          )}
        </div>
        {profile.tagline && (
          <p className="text-muted mt-1.5 text-sm">{profile.tagline}</p>
        )}
      </div>

      {/* ─── Tab navigation ────────────────────────────────────────────────── */}
      <div className="border-border mb-8 border-b">
        <div className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors duration-150 ${
                activeTab === key
                  ? "border-[#185FA5] text-[#185FA5]"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab content ───────────────────────────────────────────────────── */}
      {activeTab === "info" && <ProfileInfoTab profile={profile} />}
      {activeTab === "location" && <LocationTab profile={profile} />}
      {activeTab === "reviews" && (
        <ReviewsTab profile={profile} reviews={reviews} />
      )}
    </div>
  );
}
