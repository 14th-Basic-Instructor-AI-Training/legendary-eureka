import type { AgencyProfileResponse, AgencyReviewResponse } from "@/lib/api/profile";
import type { AgencyProfile, ProfileReview, RatingsBreakdown } from "./schema";

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoString));
}

function toRatingsBreakdown(
  raw: Record<string, number> | null | undefined,
): RatingsBreakdown {
  return {
    five: raw?.["5"] ?? 0,
    four: raw?.["4"] ?? 0,
    three: raw?.["3"] ?? 0,
    two: raw?.["2"] ?? 0,
    one: raw?.["1"] ?? 0,
  };
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function splitBio(bio: string): { tagline?: string; description?: string } {
  const trimmed = bio.trim();
  if (!trimmed) return {};
  const newlineIdx = trimmed.indexOf("\n");
  if (newlineIdx === -1) return { tagline: trimmed };
  return {
    tagline: trimmed.slice(0, newlineIdx).trim() || undefined,
    description: trimmed.slice(newlineIdx + 1).trim() || undefined,
  };
}

export function apiProfileToAgencyProfile(api: AgencyProfileResponse): AgencyProfile {
  const { tagline, description } = splitBio(api.bio ?? "");

  return {
    id: api.id,
    name: api.agencyName,
    tagline,
    description,
    email: api.contactEmail,
    phone: api.contactPhone || undefined,
    website: api.website || undefined,
    streetAddress: api.address || undefined,
    isVerified: api.status === "APPROVED",
    averageRating: api.averageRating,
    reviewCount: api.reviewCount,
    ratingsBreakdown: toRatingsBreakdown(api.ratingsBreakdown),
  };
}

export function apiReviewToProfileReview(api: AgencyReviewResponse): ProfileReview {
  return {
    id: api.id,
    travelerName: api.travelerName,
    travelerInitials: initialsFromName(api.travelerName),
    rating: api.rating,
    comment: api.comment,
    date: formatDate(api.date),
    packageName: "",
  };
}

/** Build bio string for PUT /agencies/me from form fields. */
export function formToBio(tagline: string, description: string): string | undefined {
  const parts = [tagline.trim(), description.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join("\n\n") : undefined;
}
