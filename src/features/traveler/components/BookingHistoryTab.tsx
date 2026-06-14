"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Receipt21 } from "iconsax-reactjs";
import { Reveal } from "@/ui";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useTravelerStore } from "../store";
import type { BookingHistory, BookingSegment, BookingStatus } from "../schema";
import { BookingHistoryCard } from "./BookingHistoryCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";

const SEGMENTS: BookingSegment[] = ["upcoming", "completed", "cancelled"];

/** Which statuses fall under each segment. */
const SEGMENT_STATUS: Record<BookingSegment, BookingStatus[]> = {
  upcoming: ["pending", "approved"],
  completed: ["completed"],
  cancelled: ["cancelled", "rejected"],
};

/** Booking History tab: a segmented control over the traveler's bookings. */
export function BookingHistoryTab() {
  const { t } = useTranslation();
  const { role } = useSession();
  const [segment, setSegment] = useState<BookingSegment>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<BookingHistory | null>(null);

  const bookings = useTravelerStore((s) => s.bookings);
  const cancelBooking = useTravelerStore((s) => s.cancelBooking);

  const visible = bookings.filter((b) => SEGMENT_STATUS[segment].includes(b.status));

  const confirmCancel = () => {
    if (cancelTarget) cancelBooking(role, cancelTarget.id);
    setCancelTarget(null);
  };

  return (
    <section className="flex flex-col gap-5">
      {/* Segmented control */}
      <div className="bg-surface inline-flex w-full gap-1 rounded-xl p-1 sm:w-auto">
        {SEGMENTS.map((seg) => {
          const isActive = seg === segment;
          return (
            <button
              key={seg}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSegment(seg)}
              className={cn(
                "flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors sm:flex-none",
                isActive ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground",
              )}
            >
              {t(`bookings.segments.${seg}`)}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState Icon={Receipt21} message={t(`bookings.empty.${segment}`)} />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((booking, i) => (
            <Reveal key={booking.id} delay={Math.min(i, 3) * 0.05}>
              <BookingHistoryCard booking={booking} onCancel={setCancelTarget} />
            </Reveal>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        title={t("bookings.cancelConfirm.title")}
        description={t("bookings.cancelConfirm.description", { tour: cancelTarget?.tour.name ?? "" })}
        confirmLabel={t("bookings.cancelConfirm.confirm")}
      />
    </section>
  );
}
