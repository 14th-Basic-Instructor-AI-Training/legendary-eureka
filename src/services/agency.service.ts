import { apiFetch } from "@/lib/api/client";
import { AgencyProfilePageSchema, type AgencyProfileResponse } from "@/types/agency";
import type { Result } from "@/features/destinations/data";
import type { AgencyProfile, AgencyStatus } from "@/features/destinations/schema";

/**
 * Agency API access for the landing page "Top-rated agencies" row. Validates the backend
 * response with Zod, then maps the wire DTO to the `AgencyProfile` domain type the cards use.
 */

const AGENCY_STATUSES: readonly AgencyStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function toStatus(value: string): AgencyStatus {
  return (AGENCY_STATUSES as readonly string[]).includes(value)
    ? (value as AgencyStatus)
    : "APPROVED";
}

export function mapAgencyProfile(a: AgencyProfileResponse): AgencyProfile {
  return {
    id: a.id,
    slug: a.slug ?? a.id,
    name: a.agencyName ?? "",
    owner: a.agencyName ?? "",
    logo: a.avatarUrl ?? "",
    province: a.address ?? "",
    status: toStatus(a.status),
    rating: a.averageRating,
    reviewCount: a.reviewCount,
    tourCount: 0,
    tags: [],
    languages: [],
    about: a.bio ?? undefined,
  };
}

/** GET /agencies?filter=top_rated — approved agencies ranked by average rating. */
export async function fetchTopRatedAgencies(size = 4): Promise<Result<AgencyProfile[]>> {
  try {
    const data = await apiFetch<unknown>("/agencies", {
      auth: false,
      params: { filter: "top_rated", page: 0, size },
    });
    const page = AgencyProfilePageSchema.parse(data);
    return { ok: true, data: page.content.map(mapAgencyProfile) };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
