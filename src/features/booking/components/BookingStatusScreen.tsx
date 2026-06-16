"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Profile2User, ShieldTick } from "iconsax-reactjs";
import { Button, Card, StatusChip } from "@/ui";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocalizedRouter } from "@/lib/locale";
import { formatDate, formatPrice } from "@/lib/format";
import { cancelBookingAction } from "@/actions/booking";
import type { BookingHistory } from "@/features/traveler/schema";
import { ConfirmDialog } from "@/features/traveler/components/ConfirmDialog";
import { BookingTimeline } from "./BookingTimeline";

/**
 * Booking status — renders the trip server-fetched by the page (`GET /trips/{id}`).
 * Shows the lifecycle timeline, tour + agency summary, and a real cancel
 * (`PUT /trips/{id}/cancel`) that re-pulls the page on success.
 */
export function BookingStatusScreen({ booking }: { booking: BookingHistory | null }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
  const refreshRouter = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!booking) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted">{t("booking.status.notFound")}</p>
        <Button
          variant="primary"
          size="sm"
          onPress={() => router.push("/traveler/profile?tab=bookings")}
        >
          {t("booking.status.backToHistory")}
        </Button>
      </div>
    );
  }

  const canCancel =
    booking.status === "pending" || booking.status === "approved";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <LocaleLink
        href="/traveler/profile?tab=bookings"
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={18} color="currentColor" />
        {t("booking.status.backToHistory")}
      </LocaleLink>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("booking.status.title", { ref: booking.id })}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusChip status={booking.status} />
            <span className="text-muted text-sm">
              {t("booking.status.bookedFor", {
                date: formatDate(booking.startDate, lng),
              })}
            </span>
          </div>
        </div>
        {canCancel ? (
          <Button
            variant="tertiary"
            className="text-danger"
            isDisabled={isPending}
            onPress={() => setConfirmOpen(true)}
          >
            {t("bookings.actions.cancel")}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="bg-background border-border rounded-2xl border p-5 shadow-sm">
          <h2 className="mb-5 font-semibold tracking-tight">
            {t("booking.status.statusHeading")}
          </h2>
          <BookingTimeline status={booking.status} />
        </Card>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push(`/tours/${booking.tour.slug}`)}
            className="bg-background border-border overflow-hidden rounded-2xl border text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative h-28 w-full">
              <Image
                src={booking.tour.thumbnail}
                alt={booking.tour.name}
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="font-semibold tracking-tight">
                {booking.tour.name}
              </p>
              <div className="text-muted mt-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Profile2User size={15} color="currentColor" variant="Bold" />
                  {t("bookings.travelers", { count: booking.travelers })}
                </span>
                <span className="text-foreground font-semibold">
                  {formatPrice(booking.total, booking.currency, lng)}
                </span>
              </div>
            </div>
          </button>

          <Card className="bg-background border-border rounded-2xl border p-4 shadow-sm">
            <h3 className="mb-3 font-semibold tracking-tight">
              {t("booking.status.agencyContact")}
            </h3>
            <div className="flex items-center gap-3">
              <span className="bg-primary-lightskyblue/15 text-primary-lightskyblue flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                {booking.agencyName.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {booking.agencyName}
                </p>
                <p className="text-primary-lightskyblue flex items-center gap-1 text-xs font-medium">
                  <ShieldTick size={13} color="currentColor" variant="Bold" />
                  {t("booking.status.verifiedAgency")}
                </p>
              </div>
            </div>
          </Card>

          <div className="text-muted flex items-center gap-2 text-sm">
            <Calendar size={15} color="currentColor" variant="Bold" />
            {formatDate(booking.startDate, lng)}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          startTransition(async () => {
            const res = await cancelBookingAction(booking.id);
            if (res.ok) refreshRouter.refresh();
          });
        }}
        title={t("bookings.cancelConfirm.title")}
        description={t("bookings.cancelConfirm.description", {
          tour: booking.tour.name,
        })}
        confirmLabel={t("bookings.cancelConfirm.confirm")}
      />
    </div>
  );
}
