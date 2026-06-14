import { getTourById } from "@/features/tours/data";
import type { TourDetail } from "@/features/tours/types";
import type { BookingStatus } from "@/features/traveler/schema";
import type { Pricing, TimelineStep } from "./schema";

/**
 * The ONE data seam for the booking checkout. The Review step loads its tour
 * through here (reusing the tours seam), and the pricing / reference / timeline
 * helpers keep that logic out of components. Returns typed results, never throws.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "not_found" | "load_failed" };

/** Load the tour being booked (by id or slug) for the checkout summary. */
export async function getBookingForCheckout(
  tourId: string,
): Promise<Result<TourDetail>> {
  return getTourById(tourId);
}

/**
 * Price breakdown. Reuses the tour's flat `platformFee` so the checkout total
 * matches what the traveler saw on the tour-detail booking card (no surprise
 * fee). `subtotal` scales with the traveler count.
 */
export function computePricing(
  unitPrice: number,
  travelers: number,
  platformFee: number,
): Pricing {
  const subtotal = unitPrice * travelers;
  return { subtotal, fee: platformFee, total: subtotal + platformFee };
}

/** Generate a human-readable booking reference, e.g. `JLT-4821`. */
export function makeBookingReference(): string {
  const n = 100 + Math.floor(Math.random() * 900);
  return `JLT-4${n}`;
}

/**
 * Map a booking lifecycle status to the 4-step status timeline
 * (Requested → Pending review → Approved/Rejected → Completed). The 3rd step
 * flips to `rejected` when the agency declined or the traveler cancelled.
 */
export function deriveTimeline(status: BookingStatus): TimelineStep[] {
  const declined = status === "rejected" || status === "cancelled";
  const past = status !== "pending"; // moved beyond the initial request
  const completed = status === "completed";

  return [
    { key: "requested", state: "done" },
    { key: "pendingReview", state: past ? "done" : "current" },
    {
      key: "decision",
      state: declined
        ? "rejected"
        : completed
          ? "done"
          : status === "approved"
            ? "current"
            : "upcoming",
    },
    { key: "completed", state: completed ? "done" : "upcoming" },
  ];
}
