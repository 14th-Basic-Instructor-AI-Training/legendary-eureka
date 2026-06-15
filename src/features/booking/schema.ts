import { z } from "zod";

/**
 * Booking checkout — Zod is the source of truth for the 3-step flow
 * (Review → Payment → Confirmation) and the status timeline. The created booking
 * itself reuses the traveler `BookingHistory` shape so it lands in Booking
 * History and the status page can resolve it. Shapes stay compatible with the
 * wire `@/types/booking` DTO that swaps in once the backend lands.
 */

/** The three checkout steps, in order. */
export const CheckoutStepSchema = z.enum(["review", "payment", "confirmation"]);
export type CheckoutStep = z.infer<typeof CheckoutStepSchema>;

/** How the traveler pays — drives the Payment step's method cards. */
export const PaymentMethodSchema = z.enum(["card", "mobile", "cash"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/** The checkout draft assembled across the Review + Payment steps. */
export const CheckoutDraftSchema = z.object({
  tourId: z.string().min(1),
  /** ISO `YYYY-MM-DD`. */
  date: z.string().min(1),
  travelers: z.number().int().min(1),
  paymentMethod: PaymentMethodSchema,
});
export type CheckoutDraft = z.infer<typeof CheckoutDraftSchema>;

/** Card fields — only required (and shown) when the method is `card`. */
export const CardPaymentSchema = z.object({
  cardNumber: z.string().trim().min(12).max(23),
  cardName: z.string().trim().min(1),
  expiry: z.string().trim().min(4),
  cvc: z.string().trim().min(3).max(4),
});
export type CardPayment = z.infer<typeof CardPaymentSchema>;

/** A single node in the booking-status timeline. */
export const TimelineStateSchema = z.enum([
  "done",
  "current",
  "upcoming",
  "rejected",
]);
export type TimelineState = z.infer<typeof TimelineStateSchema>;

export const TimelineStepKeySchema = z.enum([
  "requested",
  "pendingReview",
  "decision",
  "completed",
]);
export type TimelineStepKey = z.infer<typeof TimelineStepKeySchema>;

export interface TimelineStep {
  key: TimelineStepKey;
  state: TimelineState;
}

/** Resolved price breakdown shown in the sticky Price Summary. */
export interface Pricing {
  subtotal: number;
  fee: number;
  total: number;
}
