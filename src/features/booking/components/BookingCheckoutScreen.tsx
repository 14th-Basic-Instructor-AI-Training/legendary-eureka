"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/ui";
import { useResource } from "@/lib/useResource";
import { useLocalizedRouter } from "@/lib/locale";
import { getBookingForCheckout, computePricing } from "../data";
import { createBookingAction } from "@/actions/booking";
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
  const router = useLocalizedRouter();
  const params = useSearchParams();

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
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    // POST /trips with the real package id — the backend routes the request to
    // the agency that owns the package, where it lands in their incoming list.
    const result = await createBookingAction({
      tourPackageId: tour.id,
      numberOfPeople: travelers,
      requestedDate: date || todayISO(),
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setReference(result.trip.id);
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
        <div className="flex flex-col gap-3">
          {submitError ? (
            <div className="bg-danger/10 text-danger rounded-lg px-3 py-2 text-sm" role="alert">
              {submitError}
            </div>
          ) : null}
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
        </div>
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
