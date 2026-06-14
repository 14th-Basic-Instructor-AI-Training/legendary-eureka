import { DESTINATIONS, FEATURED_TOURS } from "./fixtures";
import type { Destination, DestinationCategory, FeaturedTour } from "./schema";

/**
 * The ONE data seam for destinations. Components import from here, never from
 * fixtures directly — swapping these for route handlers / server actions later
 * is a one-file change. Functions return typed results (never throw strings).
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

/** Simulate network latency so loading states are exercised in the static phase. */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getFeaturedDestinations(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.featured) };
}

export async function getTrendingDestinations(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.trending) };
}

export async function getDestinationsByCategory(
  category: DestinationCategory,
): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.category === category) };
}

export async function getAllDestinations(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS };
}

/** Convenience zero-arg getter for the landing "Things to do" row. */
export async function getThingsToDo(): Promise<Result<Destination[]>> {
  await delay();
  return { ok: true, data: DESTINATIONS.filter((d) => d.category === "thingToDo") };
}

export async function getDestinationBySlug(
  slug: string,
): Promise<Result<Destination>> {
  await delay();
  const match = DESTINATIONS.find((d) => d.slug === slug);
  return match ? { ok: true, data: match } : { ok: false, error: "not_found" };
}

export async function getFeaturedTours(): Promise<Result<FeaturedTour[]>> {
  await delay();
  return { ok: true, data: FEATURED_TOURS };
}
