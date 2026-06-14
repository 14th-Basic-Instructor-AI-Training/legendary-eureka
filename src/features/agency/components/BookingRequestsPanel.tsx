"use client";

import { useTranslation } from "react-i18next";
import { TickCircle, CloseCircle, Profile2User } from "iconsax-reactjs";
import { Button, StatusChip } from "@/ui";
import { useSession } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { useAgencyStore } from "../store";

export function BookingRequestsPanel() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const bookings = useAgencyStore((s) => s.bookings);
  const approveBooking = useAgencyStore((s) => s.approveBooking);
  const rejectBooking = useAgencyStore((s) => s.rejectBooking);

  if (bookings.length === 0) {
    return <p className="text-muted py-8 text-center text-sm">{t("agency.bookings.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {bookings.map((b) => (
        <li key={b.id} className="bg-surface border-border rounded-2xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{b.packageTitle}</p>
                <StatusChip status={b.status} />
              </div>
              <p className="text-muted mt-1 flex items-center gap-1.5 text-sm">
                <Profile2User size={14} color="currentColor" />
                {b.travelerName} · {t("agency.bookings.guests", { count: b.guests })}
              </p>
              <p className="text-muted mt-0.5 text-sm">
                {b.datesLabel} · {formatPrice(b.total, b.currency, lng)}
              </p>
              <p className="text-muted/70 mt-0.5 text-xs">{b.requestedAtLabel}</p>
            </div>

            {b.status === "pending" ? (
              <div className="flex gap-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onPress={() => rejectBooking(role, b.id)}
                  className="text-danger"
                >
                  <CloseCircle size={16} color="currentColor" />
                  {t("agency.bookings.reject")}
                </Button>
                <Button variant="primary" size="sm" onPress={() => approveBooking(role, b.id)}>
                  <TickCircle size={16} color="currentColor" />
                  {t("agency.bookings.approve")}
                </Button>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
