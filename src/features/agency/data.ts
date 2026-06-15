import { clientApiFetch, type PagedData, type Province } from "@/lib/api/client";
import type { TourPackageResponse } from "@/lib/api/packages";
import type { AgencyProfileResponse, AgencyReviewResponse, AgencyStatsResponse } from "@/lib/api/profile";
import type {
  DestinationResponse,
  ActivityResponse,
  RestaurantResponse,
  AccommodationResponse,
} from "@/lib/api/activities";
import type {
  Activity,
  AgencyDashboardStats,
  AgencyProfile,
  AgencyReview,
  BookingRequest,
  NewActivityInput,
  Package,
  ProfileReview,
} from "./schema";

export type Result<T> = { ok: true; data: T } | { ok: false; error: "load_failed"; message?: string };

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

// ── Province mapping ──────────────────────────────────────────────────────────

const PROVINCE_TO_ENUM: Record<string, Province> = {
  "Siem Reap":      "SIEM_REAP",
  "Phnom Penh":     "PHNOM_PENH",
  "Battambang":     "BATTAMBANG",
  "Kampot":         "KAMPOT",
  "Sihanoukville":  "SIHANOUKVILLE",
  "Preah Vihear":   "PREAH_VIHEAR",
  "Koh Kong":       "KOH_KONG",
  "Kratie":         "KRATIE",
  "Kampong Thom":   "KAMPONG_THOM",
  "Kandal":         "KANDAL",
  "Takeo":          "TAKEO",
  "Kampong Cham":   "KAMPONG_CHAM",
  "Preah Sihanouk": "PREAH_SIHANOUK",
};

// ── Activity type mappers ─────────────────────────────────────────────────────

function mapDestinationToActivity(d: DestinationResponse): Activity {
  return {
    id: d.id,
    title: d.name,
    category: "destination",
    location: formatProvince(d.province) ?? d.province,
    priceFrom: d.priceFrom ?? 0,
    currency: d.currency ?? "USD",
    status: "published",
    rating: d.rating ?? 0,
    description: d.description,
  };
}

function mapActivityResponseToActivity(a: ActivityResponse, location: string): Activity {
  return {
    id: a.id,
    title: a.name,
    category: "thingToDo",
    location,
    priceFrom: a.price ?? 0,
    currency: a.currency ?? "USD",
    status: "published",
    rating: 0,
    description: a.description,
  };
}

function mapRestaurantToActivity(r: RestaurantResponse, location: string): Activity {
  return {
    id: r.id,
    title: r.name,
    category: "food",
    location,
    priceFrom: 0,
    currency: r.currency ?? "USD",
    status: "published",
    rating: 0,
    description: r.description,
  };
}

function mapAccommodationToActivity(a: AccommodationResponse, location: string): Activity {
  return {
    id: a.id,
    title: a.name,
    category: "stay",
    location,
    priceFrom: a.pricePerNight ?? 0,
    currency: a.currency ?? "USD",
    status: "published",
    rating: a.starRating ?? 0,
    description: a.description,
  };
}

// ── Activities loader ─────────────────────────────────────────────────────────

const emptyPage = <T>(): PagedData<T> => ({
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
});

export interface ActivitiesResult {
  activities: Activity[];
  /** formatted province → first owned destination id (used when creating sub-items) */
  destByProvince: Record<string, string>;
}

export async function getActivities(): Promise<Result<ActivitiesResult>> {
  try {
    const [destPage, actPage, restPage, accPage] = await Promise.all([
      clientApiFetch<PagedData<DestinationResponse>>("/destinations/mine", { params: { size: 100 } })
        .catch((): PagedData<DestinationResponse> => emptyPage()),
      clientApiFetch<PagedData<ActivityResponse>>("/activities/mine", { params: { size: 100 } })
        .catch((): PagedData<ActivityResponse> => emptyPage()),
      clientApiFetch<PagedData<RestaurantResponse>>("/restaurants/mine", { params: { size: 100 } })
        .catch((): PagedData<RestaurantResponse> => emptyPage()),
      clientApiFetch<PagedData<AccommodationResponse>>("/accommodations/mine", { params: { size: 100 } })
        .catch((): PagedData<AccommodationResponse> => emptyPage()),
    ]);

    // Build destinationId → formatted province (for sub-item location)
    // and formatted province → first destination id (for creating sub-items)
    const provinceOfDest = new Map<string, string>();
    const destByProvince: Record<string, string> = {};
    for (const d of destPage.content) {
      const fp = formatProvince(d.province) ?? d.province;
      provinceOfDest.set(d.id, fp);
      if (!destByProvince[fp]) destByProvince[fp] = d.id;
    }

    const activities: Activity[] = [
      ...destPage.content.map(mapDestinationToActivity),
      ...actPage.content.map((a) => mapActivityResponseToActivity(a, provinceOfDest.get(a.destinationId) ?? "")),
      ...restPage.content.map((r) => mapRestaurantToActivity(r, provinceOfDest.get(r.destinationId) ?? "")),
      ...accPage.content.map((a) => mapAccommodationToActivity(a, provinceOfDest.get(a.destinationId) ?? "")),
    ];

    return { ok: true, data: { activities, destByProvince } };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

// ── Activity CRUD ─────────────────────────────────────────────────────────────

export async function createAgencyActivity(
  input: NewActivityInput,
  destinationId: string | null,
): Promise<Result<Activity>> {
  const province = (PROVINCE_TO_ENUM[input.location] ?? "PHNOM_PENH") as Province;
  try {
    switch (input.category) {
      case "destination": {
        const d = await clientApiFetch<DestinationResponse>("/destinations", {
          method: "POST",
          body: { name: input.title, province, travelType: "CULTURAL", description: input.description, priceFrom: input.priceFrom, currency: "USD", featured: false, trending: false },
        });
        return { ok: true, data: mapDestinationToActivity(d) };
      }
      case "thingToDo": {
        if (!destinationId) return { ok: false, error: "load_failed", message: "No destination found for this province. Create a Destination first." };
        const a = await clientApiFetch<ActivityResponse>(`/destinations/${destinationId}/activities`, {
          method: "POST",
          body: { type: "ACTIVITY", name: input.title, description: input.description, price: input.priceFrom, currency: "USD" },
        });
        return { ok: true, data: mapActivityResponseToActivity(a, input.location) };
      }
      case "food": {
        if (!destinationId) return { ok: false, error: "load_failed", message: "No destination found for this province. Create a Destination first." };
        const r = await clientApiFetch<RestaurantResponse>(`/destinations/${destinationId}/restaurants`, {
          method: "POST",
          body: { name: input.title, description: input.description, currency: "USD" },
        });
        return { ok: true, data: mapRestaurantToActivity(r, input.location) };
      }
      case "stay": {
        if (!destinationId) return { ok: false, error: "load_failed", message: "No destination found for this province. Create a Destination first." };
        const a = await clientApiFetch<AccommodationResponse>(`/destinations/${destinationId}/accommodations`, {
          method: "POST",
          body: { name: input.title, description: input.description, pricePerNight: input.priceFrom, currency: "USD" },
        });
        return { ok: true, data: mapAccommodationToActivity(a, input.location) };
      }
    }
  } catch (err) {
    return { ok: false, error: "load_failed", message: err instanceof Error ? err.message : undefined };
  }
}

export async function updateAgencyActivity(
  id: string,
  category: Activity["category"],
  input: NewActivityInput,
): Promise<Result<Activity>> {
  const province = (PROVINCE_TO_ENUM[input.location] ?? "PHNOM_PENH") as Province;
  try {
    switch (category) {
      case "destination": {
        const d = await clientApiFetch<DestinationResponse>(`/destinations/${id}`, {
          method: "PUT",
          body: { name: input.title, province, travelType: "CULTURAL", description: input.description, priceFrom: input.priceFrom, currency: "USD", featured: false, trending: false },
        });
        return { ok: true, data: mapDestinationToActivity(d) };
      }
      case "thingToDo": {
        const a = await clientApiFetch<ActivityResponse>(`/activities/${id}`, {
          method: "PUT",
          body: { type: "ACTIVITY", name: input.title, description: input.description, price: input.priceFrom, currency: "USD" },
        });
        return { ok: true, data: mapActivityResponseToActivity(a, input.location) };
      }
      case "food": {
        const r = await clientApiFetch<RestaurantResponse>(`/restaurants/${id}`, {
          method: "PUT",
          body: { name: input.title, description: input.description, currency: "USD" },
        });
        return { ok: true, data: mapRestaurantToActivity(r, input.location) };
      }
      case "stay": {
        const a = await clientApiFetch<AccommodationResponse>(`/accommodations/${id}`, {
          method: "PUT",
          body: { name: input.title, description: input.description, pricePerNight: input.priceFrom, currency: "USD" },
        });
        return { ok: true, data: mapAccommodationToActivity(a, input.location) };
      }
    }
  } catch (err) {
    return { ok: false, error: "load_failed", message: err instanceof Error ? err.message : undefined };
  }
}

export async function deleteAgencyActivity(
  id: string,
  category: Activity["category"],
): Promise<Result<void>> {
  try {
    const endpoint: Record<Activity["category"], string> = {
      destination: `/destinations/${id}`,
      thingToDo:   `/activities/${id}`,
      food:        `/restaurants/${id}`,
      stay:        `/accommodations/${id}`,
    };
    await clientApiFetch<void>(endpoint[category], { method: "DELETE" });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

// ── Package CRUD ──────────────────────────────────────────────────────────────

interface PackageMutationInput {
  title: string;
  description?: string;
  location?: string;
  priceFrom: number;
  days: number;
}

export async function createPackageApi(input: PackageMutationInput): Promise<Result<Package>> {
  const province = (PROVINCE_TO_ENUM[input.location ?? ""] ?? "PHNOM_PENH") as Province;
  try {
    const res = await clientApiFetch<TourPackageResponse>("/tours", {
      method: "POST",
      body: {
        title: input.title,
        description: input.description,
        province,
        travelType: "CULTURAL",
        price: input.priceFrom,
        currency: "USD",
        durationDays: input.days,
      },
    });
    return { ok: true, data: mapPackage(res) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function updatePackageApi(id: string, input: PackageMutationInput): Promise<Result<Package>> {
  const province = (PROVINCE_TO_ENUM[input.location ?? ""] ?? "PHNOM_PENH") as Province;
  try {
    const res = await clientApiFetch<TourPackageResponse>(`/tours/${id}`, {
      method: "PUT",
      body: {
        title: input.title,
        description: input.description,
        province,
        travelType: "CULTURAL",
        price: input.priceFrom,
        currency: "USD",
        durationDays: input.days,
      },
    });
    return { ok: true, data: mapPackage(res) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function deletePackageApi(id: string): Promise<Result<void>> {
  try {
    await clientApiFetch<void>(`/tours/${id}`, { method: "DELETE" });
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function publishPackageApi(id: string): Promise<Result<Package>> {
  try {
    const res = await clientApiFetch<TourPackageResponse>(`/tours/${id}/publish`, { method: "PUT" });
    return { ok: true, data: mapPackage(res) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}

export async function archivePackageApi(id: string): Promise<Result<Package>> {
  try {
    const res = await clientApiFetch<TourPackageResponse>(`/tours/${id}/archive`, { method: "PUT" });
    return { ok: true, data: mapPackage(res) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
