"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "iconsax-reactjs";
import { Button, Card, Chip, DatePicker, NumberStepper } from "@/ui";
import { useSession } from "@/lib/auth";
import { useLocalizedRouter } from "@/lib/locale";
import { can } from "@/lib/permissions";
import { formatPrice } from "@/lib/format";
import { useToursStore } from "../store";
import { BookingDraftSchema } from "../schema";
import type { TourDetail, Availability } from "../types";

const AVAILABILITY_COLOR: Record<
  Availability,
  "success" | "warning" | "danger"
> = {
  available: "success",
  limited: "warning",
  full: "danger",
};

/** Sticky booking card: date, traveler counts, price breakdown, request + save. */
export function TourBookingCard({ tour }: { tour: TourDetail }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { role } = useSession();
  const router = useLocalizedRouter();

  const bookmarked = useToursStore(
    (s) => s.byTour[tour.id]?.bookmarked ?? false,
  );
  const toggleBookmark = useToursStore((s) => s.toggleBookmark);

  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [error, setError] = useState(false);

  const count = adults + children;
  const subtotal = tour.unitPrice * count;
  const total = subtotal + tour.platformFee;

  const canBook = can(role, "bookTour");
  const canSave = can(role, "bookmark");

  const handleRequest = () => {
    if (!role) {
      router.push("/login");
      return;
    }
    const parsed = BookingDraftSchema.safeParse({ date, adults, children });
    if (!parsed.success) {
      setError(true);
      return;
    }
    setError(false);
    // Hand off to the booking checkout, pre-filling date + traveler count.
    const query = new URLSearchParams({ date, travelers: String(count) });
    router.push(`/traveler/booking/${tour.slug}?${query.toString()}`);
  };

  return (
    <Card className="bg-background border-border sticky top-24 flex flex-col gap-5 rounded-3xl border p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            {t("tours.detail.booking.from")}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-foreground text-3xl font-extrabold tracking-tight">
              {formatPrice(tour.unitPrice, tour.currency, lng)}
            </span>
            <span className="text-muted text-sm">
              / {t("tours.detail.booking.perPerson")}
            </span>
          </div>
        </div>
        <Chip
          color={AVAILABILITY_COLOR[tour.availability]}
          variant="soft"
          size="sm"
        >
          {t(`tours.detail.booking.availability.${tour.availability}`)}
        </Chip>
      </div>

      <p className="text-foreground text-sm font-semibold">{tour.title}</p>

      <DatePicker
        label={t("tours.detail.booking.date")}
        value={date}
        onChange={(v) => {
          setDate(v);
          setError(false);
        }}
        aria-invalid={error}
      />

      <div className="border-border flex flex-col gap-3 border-y py-4">
        <NumberStepper
          label={t("tours.detail.booking.adults")}
          description={t("tours.detail.booking.adultsHint")}
          value={adults}
          onChange={setAdults}
          min={1}
          max={tour.groupSizeMax}
        />
        <NumberStepper
          label={t("tours.detail.booking.children")}
          description={t("tours.detail.booking.childrenHint")}
          value={children}
          onChange={setChildren}
          min={0}
          max={tour.groupSizeMax}
        />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="text-muted flex items-center justify-between">
          <span>
            {t("tours.detail.booking.unitPrice", {
              price: formatPrice(tour.unitPrice, tour.currency, lng),
              count,
            })}
          </span>
          <span className="text-foreground">
            {formatPrice(subtotal, tour.currency, lng)}
          </span>
        </div>
        <div className="text-muted flex items-center justify-between">
          <span>{t("tours.detail.booking.platformFee")}</span>
          <span className="text-foreground">
            {formatPrice(tour.platformFee, tour.currency, lng)}
          </span>
        </div>
        <div className="border-border flex items-center justify-between border-t pt-2 text-base font-bold">
          <span>{t("tours.detail.booking.total")}</span>
          <span>{formatPrice(total, tour.currency, lng)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isDisabled={Boolean(role) && !canBook}
          onPress={handleRequest}
        >
          {role
            ? t("tours.detail.booking.request")
            : t("tours.detail.booking.loginToBook")}
        </Button>
        {canSave ? (
          <button
            type="button"
            aria-label={
              bookmarked
                ? t("tours.detail.booking.saved")
                : t("tours.detail.booking.save")
            }
            onClick={() => toggleBookmark(role, tour.id)}
            className="border-border text-muted hover:text-primary-lightskyblue flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors"
          >
            <Heart
              size={20}
              color="currentColor"
              variant={bookmarked ? "Bold" : "Linear"}
              className={bookmarked ? "text-primary-lightskyblue" : ""}
            />
          </button>
        ) : null}
      </div>
    </Card>
  );
}
