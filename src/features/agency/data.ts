import { clientApiFetch, type PagedData } from "@/lib/api/client";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { AgencyProfileResponse, AgencyReviewResponse, AgencyStatsResponse } from "@/lib/api/profile";
import type {
  Activity,
  AgencyDashboardStats,
  AgencyProfile,
  AgencyReview,
  BookingRequest,
  Package,
  ProfileReview,
} from "./schema";

export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed" };

// ── Type mappers ──────────────────────────────────────────────────────────────

/** Convert API province enum (SIEM_REAP) to a readable display name (Siem Reap). */
function formatProvince(province: string | undefined): string | undefined {
  if (!province) return undefined;
  return province
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapPackage(t: TourPackageResponse): Package {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    location: formatProvince(t.province),
    days: t.durationDays,
    priceFrom: t.price ?? t.priceFrom ?? 0,
    currency: t.currency || "USD",
    status: (t.status?.toLowerCase() ?? "draft") as Package["status"],
    activityCount: t.activityCount ?? t.agenda?.length ?? 0,
    bookingsCount: t.bookingsCount ?? 0,
  };
}

function mapAgencyProfile(a: AgencyProfileResponse): AgencyProfile {
  const rb = a.ratingsBreakdown ?? {};
  return {
    id: a.id,
    name: a.agencyName || "",
    email: a.contactEmail || "",
    phone: a.contactPhone,
    website: a.website,
    streetAddress: a.address,
    isVerified: a.status === "APPROVED",
    averageRating: a.averageRating ?? 0,
    reviewCount: a.reviewCount ?? 0,
    ratingsBreakdown: {
      five: Number(rb["5"] ?? rb["five"] ?? 0),
      four: Number(rb["4"] ?? rb["four"] ?? 0),
      three: Number(rb["3"] ?? rb["three"] ?? 0),
      two: Number(rb["2"] ?? rb["two"] ?? 0),
      one: Number(rb["1"] ?? rb["one"] ?? 0),
    },
  };
}

function mapAgencyReview(r: AgencyReviewResponse): AgencyReview {
  return {
    id: r.id,
    travelerName: r.travelerName || "Traveler",
    rating: r.rating,
    comment: r.comment || "",
  };
}

function mapProfileReview(r: AgencyReviewResponse): ProfileReview {
  const initials = (r.travelerName || "T")
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: r.id,
    travelerName: r.travelerName || "Traveler",
    travelerInitials: initials || "T",
    rating: r.rating,
    comment: r.comment || "",
    date: r.date || new Date().toISOString(),
    packageName: "",
  };
}

// ── Getters ───────────────────────────────────────────────────────────────────

export async function getPackages(): Promise<Result<Package[]>> {
  try {
    const page = await clientApiFetch<PagedData<TourPackageResponse>>("/tours/mine", {
      params: { size: 50 },
    });
    return { ok: true, data: page.content.map(mapPackage) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getRecentReviews(): Promise<Result<AgencyReview[]>> {
  try {
    const page = await clientApiFetch<PagedData<AgencyReviewResponse>>("/agencies/me/reviews", {
      params: { size: 10 },
    });
    return { ok: true, data: page.content.map(mapAgencyReview) };
  } catch {
    return { ok: true, data: [] };
  }
}

export async function getDashboardStats(): Promise<Result<AgencyDashboardStats>> {
  try {
    const stats = await clientApiFetch<AgencyStatsResponse>("/agencies/me/stats");
    return {
      ok: true,
      data: {
        totalPackages: stats.totalPackages,
        activePackages: stats.activePackages,
        pendingBookings: stats.pendingBookings,
        totalActivities: stats.totalActivities,
        categoryCount: stats.categoryCount,
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
      },
    };
  } catch {
    return {
      ok: true,
      data: {
        totalPackages: 0,
        activePackages: 0,
        pendingBookings: 0,
        totalActivities: 0,
        categoryCount: 0,
        averageRating: 0,
        reviewCount: 0,
      },
    };
  }
}

export async function getAgencyProfile(): Promise<Result<AgencyProfile>> {
  try {
    const a = await clientApiFetch<AgencyProfileResponse>("/agencies/me");
    return { ok: true, data: mapAgencyProfile(a) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function getProfileReviews(): Promise<Result<ProfileReview[]>> {
  try {
    const page = await clientApiFetch<PagedData<AgencyReviewResponse>>("/agencies/me/reviews", {
      params: { size: 20 },
    });
    return { ok: true, data: page.content.map(mapProfileReview) };
  } catch {
    return { ok: true, data: [] };
  }
}

// ── Store seeders (synchronous — return empty defaults; stores load real data async) ──

export function initialPackages(): Package[] {
  return [];
}

export function initialActivities(): Activity[] {
  return [];
}

export function initialBookings(): BookingRequest[] {
  return [];
}
