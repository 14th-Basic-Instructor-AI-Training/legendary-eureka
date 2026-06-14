"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/ui";
import { useResource } from "@/lib/useResource";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { useTravelerStore } from "@/features/traveler/store";
import { BookingHistorySchema } from "@/features/traveler/schema";
import {
  getBookingForCheckout,
  computePricing,
  makeBookingReference,
} from "../data";
import {
  CheckoutStepSchema,
  PaymentMethodSchema,
  type CheckoutStep,
  type PaymentMethod,
} from "../schema";
import { CheckoutStepper } from "./CheckoutStepper";
import { ReviewStep } from "./ReviewStep";
import { PaymentStep } from "./PaymentStep";
import { ConfirmationStep } from "./ConfirmationStep";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Booking checkout — 3-step Review → Payment → Confirmation. Loads the tour via
 * the data seam, then drives the wizard locally; submitting appends the booking
 * to the traveler store (permission re-checked there) so it lands in History and
 * the status page can resolve it. Traveler-guarded by the `(traveler)` shell.
 */
export function BookingCheckoutScreen({ tourId }: { tourId: string }) {
  const { t } = useTranslation();
  const { role } = useSession();
  const router = useLocalizedRouter();
  const params = useSearchParams();
  const addBooking = useTravelerStore((s) => s.addBooking);

  const fetcher = useCallback(() => getBookingForCheckout(tourId), [tourId]);
  const { status, data: tour } = useResource(fetcher);

  const [step, setStep] = useState<CheckoutStep>(
    CheckoutStepSchema.enum.review,
  );
  const [travelers, setTravelers] = useState(() => {
    const n = Number(params.get("travelers"));
    return Number.isInteger(n) && n > 0 ? n : 1;
  });
  const [method, setMethod] = useState<PaymentMethod>(
    PaymentMethodSchema.enum.card,
  );
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const date = params.get("date") ?? "";

  if (status === "loading") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (status === "error" || !tour) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-2 text-center">
        <p className="text-muted">{t("booking.notFound")}</p>
      </div>
    );
  }

  const pricing = computePricing(tour.unitPrice, travelers, tour.platformFee);

  const goTo = (next: CheckoutStep) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const ref = makeBookingReference();
    const booking = BookingHistorySchema.parse({
      id: ref,
      tour: { slug: tour.slug, name: tour.title, thumbnail: tour.heroImage },
      agencyName: tour.agency.name,
      startDate: date || todayISO(),
      travelers,
      total: pricing.total,
      currency: tour.currency,
      status: "pending",
      hasReview: false,
    });
    const ok = addBooking(role, booking);
    setSubmitting(false);
    if (!ok) return;
    setReference(ref);
    goTo(CheckoutStepSchema.enum.confirmation);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <CheckoutStepper current={step} />

      {step === "review" ? (
        <ReviewStep
          tour={tour}
          date={date}
          travelers={travelers}
          onTravelersChange={setTravelers}
          pricing={pricing}
          onNext={() => goTo(CheckoutStepSchema.enum.payment)}
        />
      ) : null}

      {step === "payment" ? (
        <PaymentStep
          tour={tour}
          travelers={travelers}
          pricing={pricing}
          method={method}
          onMethodChange={setMethod}
          onBack={() => goTo(CheckoutStepSchema.enum.review)}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      ) : null}

      {step === "confirmation" ? (
        <ConfirmationStep
          tour={tour}
          date={date}
          travelers={travelers}
          total={pricing.total}
          reference={reference}
          onViewStatus={() => router.push(`/traveler/bookings/${reference}`)}
          onExplore={() => router.push("/explore")}
        />
      ) : null}
    </div>
  );
}
