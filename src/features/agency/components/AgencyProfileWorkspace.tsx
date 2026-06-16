"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  TickCircle,
} from "iconsax-reactjs";
import { Button, Card, Input, TextArea, Select, ListBox } from "@/ui";
import { LocationMap } from "@/features/destinations/components/LocationMap";
import { saveProfileAction, uploadAvatarAction, uploadFileAction } from "@/actions/agencyProfile";
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

/** Province options keyed by the backend `Province` enum (value sent to the API). */
const PROVINCE_OPTIONS: { id: string; label: string }[] = [
  { id: "PHNOM_PENH", label: "Phnom Penh" },
  { id: "SIEM_REAP", label: "Siem Reap" },
  { id: "SIHANOUKVILLE", label: "Sihanoukville" },
  { id: "KAMPOT", label: "Kampot" },
  { id: "BATTAMBANG", label: "Battambang" },
  { id: "KRATIE", label: "Kratie" },
  { id: "MONDULKIRI", label: "Mondulkiri" },
  { id: "RATANAKIRI", label: "Ratanakiri" },
  { id: "KEP", label: "Kep" },
  { id: "KAMPONG_CHAM", label: "Kampong Cham" },
  { id: "KAMPONG_SPEU", label: "Kampong Speu" },
  { id: "PREY_VENG", label: "Prey Veng" },
  { id: "TAKEO", label: "Takeo" },
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

type ProfileForm = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  province: string;
};

function ProfileInfoTab({
  form,
  setForm,
  profile,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  profile: AgencyProfile;
}) {
  const { t } = useTranslation();

  const initials = form.name
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
            readOnly
            className="cursor-default opacity-70"
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
          <Select
            aria-label={t("agency.profile.info.province")}
            selectedKey={form.province || null}
            onSelectionChange={(key) =>
              setForm((f) => ({ ...f, province: String(key) }))
            }
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {CAMBODIA_PROVINCES.map((p) => (
                  <ListBox.Item key={p} id={p} textValue={p}>
                    {p}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
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

type LocationPayload = {
  address: string;
  province: string;
  latitude?: number;
  longitude?: number;
};

function LocationTab({
  profile,
  onSaveLocation,
}: {
  profile: AgencyProfile;
  onSaveLocation: (loc: LocationPayload) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    streetAddress: profile.streetAddress ?? "",
    city: profile.city ?? "",
    province: profile.province ?? "",
    latitude: profile.lat !== undefined ? String(profile.lat) : "",
    longitude: profile.lng !== undefined ? String(profile.lng) : "",
  });

  const provinceLabel =
    PROVINCE_OPTIONS.find((p) => p.id === profile.province)?.label ?? profile.province ?? "";

  const currentAddressLine = profile.streetAddress
    ? `${profile.streetAddress}${profile.city ? `, ${profile.city}` : ""}${provinceLabel ? `, ${provinceLabel}` : ""}, Cambodia`
    : t("agency.profile.location.noAddress");

  // Live pin: the form coords while editing, otherwise the saved profile pin.
  const parsedLat = isEditing ? Number(form.latitude) : profile.lat;
  const parsedLng = isEditing ? Number(form.longitude) : profile.lng;
  const hasPin =
    parsedLat !== undefined &&
    parsedLng !== undefined &&
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    !(parsedLat === 0 && parsedLng === 0);

  async function handleSaveLocation() {
    setSaving(true);
    const combined = [form.streetAddress, form.city].filter(Boolean).join(", ");
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    await onSaveLocation({
      address: combined,
      province: form.province,
      latitude: form.latitude.trim() && Number.isFinite(lat) ? lat : undefined,
      longitude: form.longitude.trim() && Number.isFinite(lng) ? lng : undefined,
    });
    setSaving(false);
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      {/* Real per-place map when a pin exists, else a placeholder prompt. */}
      {hasPin ? (
        <LocationMap lat={parsedLat as number} lng={parsedLng as number} label={profile.name} />
      ) : (
        <div className="border-border flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl border bg-slate-100">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Map1 size={48} variant="Linear" color="#CBD5E1" />
            <p className="text-sm font-medium">
              {t("agency.profile.location.mapPlaceholder")}
            </p>
          </div>
        </div>
      )}

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
            <Select
              aria-label={t("agency.profile.location.province")}
              selectedKey={form.province || null}
              onSelectionChange={(key) =>
                setForm((f) => ({ ...f, province: String(key) }))
              }
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {PROVINCE_OPTIONS.map((p) => (
                    <ListBox.Item key={p.id} id={p.id} textValue={p.label}>
                      {p.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </Field>

          {/* Map pin coordinates — feed the per-place LocationMap above. */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={t("agency.profile.location.latitude")}>
              <Input
                type="number"
                inputMode="decimal"
                value={form.latitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latitude: e.target.value }))
                }
                placeholder="11.5564"
                aria-label={t("agency.profile.location.latitude")}
              />
            </Field>
            <Field label={t("agency.profile.location.longitude")}>
              <Input
                type="number"
                inputMode="decimal"
                value={form.longitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, longitude: e.target.value }))
                }
                placeholder="104.9282"
                aria-label={t("agency.profile.location.longitude")}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button
              onPress={handleSaveLocation}
              isDisabled={saving}
              className="bg-[#185FA5] text-white"
            >
              {saving ? t("common.saving") : t("agency.profile.location.saveLocation")}
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

type ProfileTab = "info" | "location" | "reviews";

type Props = {
  initialProfile: AgencyProfile;
  initialReviews: ProfileReview[];
};

export function AgencyProfileWorkspace({ initialProfile, initialReviews }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: initialProfile.name,
    tagline: initialProfile.tagline ?? "",
    description: initialProfile.description ?? "",
    email: initialProfile.email,
    phone: initialProfile.phone ?? "",
    website: initialProfile.website ?? "",
    province: initialProfile.province ?? "",
  });

  function handleSave() {
    setSaveError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveProfileAction({
        agencyName: form.name,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        contactPhone: form.phone || undefined,
        website: form.website || undefined,
      });
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setSaveError(result.error);
      }
    });
  }

  async function handleSaveLocation(loc: {
    address: string;
    province: string;
    latitude?: number;
    longitude?: number;
  }) {
    const result = await saveProfileAction({
      address: loc.address || undefined,
      province: loc.province || undefined,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    if (result.ok) {
      router.refresh();
    } else {
      setSaveError(result.error);
    }
  }

  async function handleAvatarSelected(file: File) {
    setSaveError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadAvatarAction(fd);
    if (result.ok) {
      router.refresh();
    } else {
      setSaveError(result.error);
    }
  }

  async function handleCoverSelected(file: File) {
    setSaveError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadFileAction(fd);
    if (result.ok) {
      setCoverPreview(result.url);
    } else {
      setSaveError(result.error);
    }
  }

  const initials = form.name
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
        <div
          className="group relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 via-sky-50 to-slate-200"
          style={coverPreview ? { backgroundImage: `url(${coverPreview})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!coverPreview && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <GalleryAdd size={40} variant="Linear" color="#CBD5E1" />
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleCoverSelected(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100"
            onClick={() => coverInputRef.current?.click()}
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
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAvatarSelected(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              aria-label={t("agency.profile.uploadAvatar")}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Camera size={18} variant="Linear" color="white" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 right-0 flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <TickCircle size={16} variant="Bold" color="#16a34a" />
              {t("common.saved")}
            </span>
          )}
          {saveError && (
            <span className="max-w-xs truncate text-sm text-red-500">{saveError}</span>
          )}
          {activeTab === "info" && (
            <Button
              onPress={handleSave}
              isDisabled={isPending}
              className="bg-[#185FA5] font-medium text-white shadow-sm"
            >
              {isPending ? t("common.saving") : t("agency.profile.saveChanges")}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Agency name + tagline ─────────────────────────────────────────── */}
      <div className="mb-6 pl-28">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold leading-none tracking-tight">
            {form.name}
          </h1>
          {initialProfile.isVerified && (
            <ShieldTick size={22} variant="Linear" color="#185FA5" />
          )}
        </div>
        {form.tagline && (
          <p className="text-muted mt-1.5 text-sm">{form.tagline}</p>
        )}
      </div>

      {/* ─── Tab navigation ────────────────────────────────────────────────── */}
      <div className="border-border mb-8 border-b">
        <div className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                setSaved(false);
                setSaveError(null);
              }}
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
      {activeTab === "info" && (
        <ProfileInfoTab form={form} setForm={setForm} profile={initialProfile} />
      )}
      {activeTab === "location" && (
        <LocationTab profile={initialProfile} onSaveLocation={handleSaveLocation} />
      )}
      {activeTab === "reviews" && (
        <ReviewsTab profile={initialProfile} reviews={initialReviews} />
      )}
    </div>
  );
}
