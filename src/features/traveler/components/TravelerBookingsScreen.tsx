"use client";

import { useTranslation } from "react-i18next";
import { TravelerProfileProvider } from "../context";
import { initialProfile } from "../data";
import type { BookingHistory } from "../schema";
import { BookingHistoryTab } from "./BookingHistoryTab";

/**
 * Standalone "My Bookings" screen (the `/traveler/bookings` menu destination).
 * Reuses the segmented {@link BookingHistoryTab} from the profile by supplying
 * the same context — only `bookings` is read by the tab, so the other profile
 * fields are seeded empty.
 */
export function TravelerBookingsScreen({
  bookings,
  phone = "",
}: {
  bookings: BookingHistory[];
  phone?: string;
}) {
  const { t } = useTranslation();

  return (
    <TravelerProfileProvider
      value={{
        profile: initialProfile(),
        phone,
        bookings,
        bookmarks: [],
        tripPlans: [],
        reviews: [],
        activity: [],
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("bookings.nav.title")}
          </h1>
          <p className="text-muted text-sm">{t("bookings.subtitle")}</p>
        </header>
        <BookingHistoryTab />
      </div>
    </TravelerProfileProvider>
  );
}
