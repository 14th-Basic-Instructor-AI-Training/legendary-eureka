"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Calendar, Profile2User, DocumentDownload, Star1 } from "iconsax-reactjs";
import { Button, Card, Chip, StatusChip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import { formatDate } from "@/lib/format";
import type { BookingHistory, RefundStatus } from "../schema";

const REFUND_COLOR: Record<RefundStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  refunded: "success",
  denied: "danger",
};

/** Booking history row. Actions adapt to the booking's lifecycle status. */
export function BookingHistoryCard({
  booking,
  onCancel,
}: {
  booking: BookingHistory;
  onCancel: (booking: BookingHistory) => void;
}) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const router = useLocalizedRouter();
  const [receiptNotice, setReceiptNotice] = useState(false);

  const isUpcoming = booking.status === "pending" || booking.status === "approved";
  const isCompleted = booking.status === "completed";

  return (
    <Card className="bg-background border-border flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
        <Image
          src={booking.tour.thumbnail}
          alt={booking.tour.name}
          fill
          sizes="(max-width: 640px) 100vw, 160px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold tracking-tight">{booking.tour.name}</h3>
            <p className="text-muted text-sm">{t("bookings.byAgency", { agency: booking.agencyName })}</p>
          </div>
          {booking.status === "cancelled" ? (
            <Chip color="default" variant="soft" size="sm">
              {t("status.cancelled")}
            </Chip>
          ) : (
            <StatusChip status={booking.status} />
          )}
        </div>

        <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1">
            <Calendar size={15} color="currentColor" variant="Bold" />
            {formatDate(booking.startDate, lng)}
          </span>
          <span className="flex items-center gap-1">
            <Profile2User size={15} color="currentColor" variant="Bold" />
            {t("bookings.travelers", { count: booking.travelers })}
          </span>
          {booking.status === "cancelled" && booking.refundStatus ? (
            <Chip color={REFUND_COLOR[booking.refundStatus]} variant="soft" size="sm">
              {t(`bookings.refund.${booking.refundStatus}`)}
            </Chip>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {isUpcoming ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push(`/tours/${booking.tour.slug}`)}
              >
                {t("bookings.actions.viewDetails")}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                className="text-danger"
                onPress={() => onCancel(booking)}
              >
                {t("bookings.actions.cancel")}
              </Button>
            </>
          ) : null}

          {isCompleted ? (
            <>
              {!booking.hasReview ? (
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => router.push(`/tours/${booking.tour.slug}`)}
                >
                  <Star1 size={15} color="currentColor" />
                  {t("bookings.actions.leaveReview")}
                </Button>
              ) : null}
              <Button variant="secondary" size="sm" onPress={() => setReceiptNotice(true)}>
                <DocumentDownload size={15} color="currentColor" />
                {t("bookings.actions.downloadReceipt")}
              </Button>
            </>
          ) : null}
        </div>

        {receiptNotice ? (
          <p className="bg-primary/8 text-primary rounded-lg px-3 py-1.5 text-xs">
            {t("bookings.receiptComingSoon")}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
