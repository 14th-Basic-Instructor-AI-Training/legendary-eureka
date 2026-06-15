"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  TickCircle,
  CloseCircle,
  Calendar,
  Profile2User,
  Ticket,
  Clock,
  Eye,
  MoneyRecive,
  CloseSquare,
} from "iconsax-reactjs";
import { approveBookingAction, rejectBookingAction } from "@/features/agency/bookingActions";
import type { BookingRequest } from "@/features/agency/schema";
import { cn } from "@/lib/utils";
import { Button, SearchField, TextArea } from "@/ui";

// ---------------------------------------------------------------------------
// Status config (matches design: amber/green/red/gray)
// ---------------------------------------------------------------------------

const STATUS_CFG = {
  pending:   { label: "Pending",   bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
  approved:  { label: "Approved",  bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  rejected:  { label: "Rejected",  bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
  completed: { label: "Completed", bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  cancelled: { label: "Cancelled", bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF" },
} as const;

const PAYMENT_CFG = {
  paid:    { label: "Paid",    bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  unpaid:  { label: "Unpaid",  bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
  partial: { label: "Partial", bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
} as const;

const TABS = [
  { id: "all",       labelKey: "agency.bookings.tabAll" },
  { id: "pending",   labelKey: "agency.bookings.tabPending" },
  { id: "approved",  labelKey: "agency.bookings.tabApproved" },
  { id: "rejected",  labelKey: "agency.bookings.tabRejected" },
  { id: "cancelled", labelKey: "agency.bookings.tabCancelled" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: keyof typeof STATUS_CFG }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: keyof typeof PAYMENT_CFG }) {
  const cfg = PAYMENT_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function TravelerAvatar({ initials, name }: { initials?: string; name: string }) {
  const letters = initials ?? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
      style={{ background: "#185FA5" }}
    >
      {letters}
    </div>
  );
}

function LargeAvatar({ initials, name }: { initials?: string; name: string }) {
  const letters = initials ?? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
      style={{ background: "#185FA5" }}
    >
      {letters}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  urgent,
}: {
  label: string;
  value: number;
  subtext: string;
  icon: React.ElementType<{ size?: number; color?: string }>;
  iconBg: string;
  iconColor: string;
  urgent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: urgent ? "#FFFBEB" : "#FFFFFF",
        borderColor: urgent ? "#F59E0B" : "#E1E6EC",
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <span
          className="text-[13px] font-semibold"
          style={{ color: urgent ? "#92400E" : "#9BA8B5" }}
        >
          {label}
        </span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[9px] flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={18} color="currentColor" />
        </div>
      </div>
      <div
        className="mb-2 text-[44px] font-extrabold leading-none tracking-tight"
        style={{ color: urgent ? "#D97706" : "#0D233A" }}
      >
        {value}
      </div>
      <div className="text-[12px] font-semibold" style={{ color: urgent ? "#B45309" : "#9BA8B5" }}>
        {subtext}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bookings table
// ---------------------------------------------------------------------------

function BookingsTable({
  bookings,
  onView,
}: {
  bookings: BookingRequest[];
  onView: (b: BookingRequest) => void;
}) {
  const { t } = useTranslation();

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "#F1F5F9", color: "#C8D0DA" }}
        >
          <Ticket size={26} />
        </div>
        <p className="font-bold text-[15px]" style={{ color: "#0D233A" }}>
          {t("agency.bookings.emptyFiltered")}
        </p>
        <p className="mt-1 text-[12px]" style={{ color: "#9BA8B5" }}>
          {t("agency.bookings.emptyFilteredSub")}
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[14px] border"
      style={{ background: "#FFFFFF", borderColor: "#E1E6EC" }}
    >
      {/* Header */}
      <div
        className="grid items-center px-4 py-3 text-[10.5px] font-bold uppercase tracking-widest"
        style={{
          gridTemplateColumns: "1.2fr 1.3fr 1fr 0.7fr 0.9fr 0.9fr 80px",
          gap: "0 14px",
          background: "#F7F9FB",
          borderBottom: "1px solid #E1E6EC",
          color: "#9BA8B5",
        }}
      >
        <span>{t("agency.bookings.colTraveler")}</span>
        <span>{t("agency.bookings.colPackage")}</span>
        <span>{t("agency.bookings.colDate")}</span>
        <span>{t("agency.bookings.colGuests")}</span>
        <span>{t("agency.bookings.colPrice")}</span>
        <span>{t("agency.bookings.colStatus")}</span>
        <span />
      </div>

      {/* Rows */}
      {bookings.map((b, i) => (
        <div
          key={b.id}
          className="grid items-center px-4 py-3.5 transition-colors"
          style={{
            gridTemplateColumns: "1.2fr 1.3fr 1fr 0.7fr 0.9fr 0.9fr 80px",
            gap: "0 14px",
            borderTop: i > 0 ? "1px solid #E1E6EC" : "none",
            borderLeft: b.status === "pending" ? "3px solid #F59E0B" : "3px solid transparent",
            background: b.status === "pending" ? "rgba(245,158,11,0.025)" : "transparent",
          }}
        >
          {/* Traveler */}
          <div className="flex min-w-0 items-center gap-2.5">
            <TravelerAvatar initials={b.travelerInitials} name={b.travelerName} />
            <span
              className="truncate text-[13px] font-semibold"
              style={{ color: "#0D233A" }}
            >
              {b.travelerName}
            </span>
          </div>

          {/* Package */}
          <span
            className="truncate text-[12.5px]"
            style={{ color: "#323D4D" }}
          >
            {b.packageTitle}
          </span>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#9BA8B5" }}>
            <Calendar size={13} color="currentColor" />
            <span className="truncate">{b.datesLabel}</span>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "#9BA8B5" }}>
            <Profile2User size={13} color="currentColor" />
            <span>{b.guests}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-1 text-[12.5px] font-bold" style={{ color: "#323D4D" }}>
            <MoneyRecive size={13} color="#9BA8B5" />
            <span>${b.total}</span>
          </div>

          {/* Status */}
          <StatusBadge status={b.status as keyof typeof STATUS_CFG} />

          {/* Action */}
          <Button
            onPress={() => onView(b)}
            variant="secondary"
            size="sm"
            className="flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all"
            style={{ borderColor: "#E1E6EC", background: "#F7F9FB", color: "#185FA5" }}
          >
            <Eye size={12} color="currentColor" />
            {t("agency.bookings.view")}
          </Button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------

function DetailModal({
  booking,
  onClose,
  onApprove,
  onReject,
  onCancel,
}: {
  booking: BookingRequest;
  onClose: () => void;
  onApprove: (b: BookingRequest) => void;
  onReject: (b: BookingRequest) => void;
  onCancel: (b: BookingRequest) => void;
}) {
  const { t } = useTranslation();

  const timeline = [
    {
      event: t("agency.bookings.timelineCreated"),
      time: booking.requestedAtLabel,
      status: "done" as const,
    },
    {
      event: t("agency.bookings.timelineReview"),
      time: booking.status === "pending" ? t("agency.bookings.timelineNow") : undefined,
      status: booking.status === "pending" ? ("active" as const) : ("done" as const),
    },
    {
      event:
        booking.status === "rejected"
          ? t("agency.bookings.timelineRejected")
          : booking.status === "cancelled"
            ? t("agency.bookings.timelineCancelled")
            : t("agency.bookings.timelineApproved"),
      time: ["approved", "rejected", "cancelled"].includes(booking.status)
        ? t("agency.bookings.timelineCompleted")
        : undefined,
      status: ["approved", "rejected", "cancelled", "completed"].includes(booking.status)
        ? ("done" as const)
        : ("pending" as const),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,35,58,0.48)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex w-full flex-col rounded-[20px] bg-white"
        style={{
          maxWidth: 920,
          maxHeight: "90vh",
          boxShadow: "0 24px 64px rgba(13,35,58,0.22)",
        }}
      >
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between border-b px-6 py-5"
          style={{ borderColor: "#E1E6EC" }}
        >
          <div>
            <h2 className="text-[18px] font-extrabold tracking-tight" style={{ color: "#0D233A" }}>
              {t("agency.bookings.detailTitle")}
            </h2>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "#9BA8B5" }}>
              {t("agency.bookings.detailId", { id: booking.id })}
            </p>
          </div>
          <Button
            onPress={onClose}
            variant="secondary"
            size="sm"
            className="flex h-8 w-8 items-center justify-center rounded-[9px] border transition-all hover:bg-gray-50"
            style={{ borderColor: "#E1E6EC", color: "#9BA8B5", background: "#F7F9FB" }}
          >
            <CloseSquare size={15} color="currentColor" />
          </Button>
        </div>

        {/* Scrollable body — 2-column */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1.05fr" }}>
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-5">
              {/* Traveler */}
              <div>
                <p
                  className="mb-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#0D233A" }}
                >
                  {t("agency.bookings.sectionTraveler")}
                </p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <LargeAvatar initials={booking.travelerInitials} name={booking.travelerName} />
                    <div>
                      <p className="text-[14px] font-bold" style={{ color: "#0D233A" }}>
                        {booking.travelerName}
                      </p>
                      <p className="text-[11.5px]" style={{ color: "#9BA8B5" }}>
                        {booking.travelerInitials}
                      </p>
                    </div>
                  </div>
                  {booking.travelerEmail && (
                    <div>
                      <p className="mb-1 text-[11px]" style={{ color: "#9BA8B5" }}>
                        {t("agency.bookings.email")}
                      </p>
                      <p className="text-[12.5px] break-all" style={{ color: "#323D4D" }}>
                        {booking.travelerEmail}
                      </p>
                    </div>
                  )}
                  {booking.travelerPhone && (
                    <div>
                      <p className="mb-1 text-[11px]" style={{ color: "#9BA8B5" }}>
                        {t("agency.bookings.phone")}
                      </p>
                      <p className="text-[12.5px]" style={{ color: "#323D4D" }}>
                        {booking.travelerPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px" style={{ background: "#E1E6EC" }} />

              {/* Travel details */}
              <div>
                <p
                  className="mb-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#0D233A" }}
                >
                  {t("agency.bookings.sectionTravel")}
                </p>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <p className="mb-1 text-[11.5px]" style={{ color: "#9BA8B5" }}>
                      {t("agency.bookings.colPackage")}
                    </p>
                    <p className="text-[13px] font-semibold" style={{ color: "#323D4D" }}>
                      {booking.packageTitle}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11.5px]" style={{ color: "#9BA8B5" }}>
                      {t("agency.bookings.colDate")}
                    </p>
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "#323D4D" }}>
                      <Calendar size={13} color="#9BA8B5" />
                      {booking.datesLabel}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-[11.5px]" style={{ color: "#9BA8B5" }}>
                      {t("agency.bookings.colGuests")}
                    </p>
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "#323D4D" }}>
                      <Profile2User size={13} color="#9BA8B5" />
                      {t("agency.bookings.guestsCount", { count: booking.guests })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ background: "#E1E6EC" }} />

              {/* Special requests */}
              {booking.specialRequests && (
                <>
                  <div>
                    <p className="mb-1.5 text-[11.5px]" style={{ color: "#9BA8B5" }}>
                      {t("agency.bookings.specialRequests")}
                    </p>
                    <TextArea
                      readOnly
                      value={booking.specialRequests}
                      rows={3}
                      className="w-full resize-none rounded-[9px] border p-2.5 text-[12px] outline-none"
                      style={{
                        borderColor: "#E1E6EC",
                        background: "#F7F9FB",
                        color: "#323D4D",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <div className="h-px" style={{ background: "#E1E6EC" }} />
                </>
              )}

              {/* Payment */}
              {booking.paymentStatus && (
                <div>
                  <p
                    className="mb-2 text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "#0D233A" }}
                  >
                    {t("agency.bookings.sectionPayment")}
                  </p>
                  <PaymentBadge status={booking.paymentStatus as keyof typeof PAYMENT_CFG} />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-5">
              {/* Package summary card */}
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "#E1E6EC", background: "#F7F9FB" }}
              >
                <div
                  className="relative h-[100px] overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #185FA5 0%, #1455A0 100%)" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }}
                  />
                </div>
                <div className="p-4">
                  <p className="mb-1.5 text-[13.5px] font-bold" style={{ color: "#0D233A" }}>
                    {booking.packageTitle}
                  </p>
                  <div className="mb-3 flex items-center gap-1.5" style={{ color: "#9BA8B5" }}>
                    <Clock size={12} color="currentColor" />
                    <span className="text-[12px]">{t("agency.bookings.packageDuration")}</span>
                  </div>
                  <p
                    className="mb-2 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "#9BA8B5" }}
                  >
                    {t("agency.bookings.includedActivities")}
                  </p>
                  <ul className="list-disc pl-5 text-[12px] leading-relaxed" style={{ color: "#323D4D" }}>
                    <li>{t("agency.bookings.activityTemple")}</li>
                    <li>{t("agency.bookings.activityBoat")}</li>
                    <li>{t("agency.bookings.activityCooking")}</li>
                    <li>{t("agency.bookings.activityMarket")}</li>
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p
                  className="mb-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#0D233A" }}
                >
                  {t("agency.bookings.sectionTimeline")}
                </p>
                {timeline.map((item, i) => (
                  <div key={i} className={cn("flex gap-3", i < timeline.length - 1 && "mb-4")}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={{
                          background:
                            item.status === "done"
                              ? "#185FA5"
                              : item.status === "active"
                                ? "#F59E0B"
                                : "#E1E6EC",
                          boxShadow:
                            item.status === "done"
                              ? "inset 0 0 0 2px #185FA5"
                              : item.status === "active"
                                ? "inset 0 0 0 2px #F59E0B"
                                : "inset 0 0 0 2px #E1E6EC",
                        }}
                      >
                        {item.status === "done" && (
                          <TickCircle size={12} color="#FFFFFF" variant="Bold" />
                        )}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="w-0.5 flex-1" style={{ background: "#E1E6EC" }} />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[12.5px] font-bold" style={{ color: "#0D233A" }}>
                        {item.event}
                      </p>
                      {item.time && (
                        <p className="mt-0.5 text-[11px]" style={{ color: "#9BA8B5" }}>
                          {item.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl p-4" style={{ background: "#F7F9FB" }}>
                <p
                  className="mb-2.5 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#0D233A" }}
                >
                  {t("agency.bookings.sectionPrice")}
                </p>
                <div
                  className="mb-2 flex items-center justify-between border-b pb-2"
                  style={{ borderColor: "#E1E6EC" }}
                >
                  <span className="text-[12px]" style={{ color: "#9BA8B5" }}>
                    {t("agency.bookings.basePrice", { count: booking.guests })}
                  </span>
                  <span className="text-[12.5px] font-semibold" style={{ color: "#323D4D" }}>
                    ${Math.round(booking.total / booking.guests)} × {booking.guests} = ${booking.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold" style={{ color: "#0D233A" }}>
                    {t("agency.bookings.total")}
                  </span>
                  <span className="text-[16px] font-extrabold tracking-tight" style={{ color: "#185FA5" }}>
                    ${booking.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-shrink-0 items-center justify-end gap-2.5 border-t px-6 py-4"
          style={{ borderColor: "#E1E6EC", background: "#F7F9FB" }}
        >
          {booking.status === "pending" && (
            <>
              <Button
                onPress={() => onReject(booking)}
                variant="secondary"
                className="rounded-full border-[1.5px] px-[18px] py-2 text-[13px] font-semibold transition-colors hover:bg-red-50"
                style={{ borderColor: "#EF4444", color: "#EF4444", background: "#FFFFFF" }}
              >
                {t("agency.bookings.reject")}
              </Button>
              <Button
                onPress={() => onApprove(booking)}
                variant="primary"
                className="rounded-full px-[18px] py-2 text-[13px] font-semibold text-white transition-colors hover:opacity-90"
                style={{ background: "#10B981", boxShadow: "0 2px 8px rgba(16,185,129,0.28)" }}
              >
                {t("agency.bookings.approve")}
              </Button>
            </>
          )}
          {booking.status === "approved" && (
            <Button
              onPress={() => onCancel(booking)}
              variant="secondary"
              className="rounded-full border-[1.5px] px-[18px] py-2 text-[13px] font-semibold transition-colors hover:bg-red-50"
              style={{ borderColor: "#EF4444", color: "#EF4444", background: "#FFFFFF" }}
            >
              {t("agency.bookings.cancelBooking")}
            </Button>
          )}
          <Button
            onPress={onClose}
            variant="secondary"
            className="rounded-full border-[1.5px] px-[18px] py-2 text-[13px] font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E1E6EC", color: "#323D4D", background: "#FFFFFF" }}
          >
            {t("agency.bookings.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function BookingsContent({ bookings }: { bookings: BookingRequest[] }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [detailBooking, setDetailBooking] = useState<BookingRequest | null>(null);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const matchTab = activeTab === "all" || b.status === activeTab;
      const matchSearch =
        !q ||
        b.travelerName.toLowerCase().includes(q) ||
        b.packageTitle.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [bookings, activeTab, search]);

  async function handleApprove(b: BookingRequest) {
    const res = await approveBookingAction(b.id);
    if (res.ok) {
      setDetailBooking(null);
      router.refresh();
    }
  }

  async function handleReject(b: BookingRequest) {
    const res = await rejectBookingAction(b.id);
    if (res.ok) {
      setDetailBooking(null);
      router.refresh();
    }
  }

  function handleCancel(_b: BookingRequest) {
    // The agency cannot cancel a booking (cancel is traveler-only); just close.
    setDetailBooking(null);
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Page header */}
      <div
        className="flex-shrink-0 border-b bg-white px-7 py-6"
        style={{ borderColor: "#E1E6EC" }}
      >
        <h1
          className="text-[24px] font-extrabold tracking-tight leading-tight"
          style={{ color: "#0D233A" }}
        >
          {t("agency.bookings.pageTitle")}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "#9BA8B5" }}>
          {t("agency.bookings.pageSubtitle")}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid flex-shrink-0 grid-cols-4 gap-3.5 px-7 py-6">
        <StatCard
          label={t("agency.bookings.statTotal")}
          value={counts.all}
          subtext={t("agency.bookings.statTotalSub", { count: counts.approved })}
          icon={Ticket}
          iconBg="#EBF2FC"
          iconColor="#185FA5"
        />
        <StatCard
          label={t("agency.bookings.statPending")}
          value={counts.pending}
          subtext={t("agency.bookings.statPendingSub", { count: counts.pending })}
          icon={Clock}
          iconBg="#FEF3C7"
          iconColor="#B45309"
          urgent
        />
        <StatCard
          label={t("agency.bookings.statApproved")}
          value={counts.approved}
          subtext={t("agency.bookings.statApprovedSub", { count: counts.approved })}
          icon={TickCircle}
          iconBg="#D1FAE5"
          iconColor="#065F46"
        />
        <StatCard
          label={t("agency.bookings.statRejected")}
          value={counts.rejected}
          subtext={t("agency.bookings.statRejectedSub", { count: counts.rejected })}
          icon={CloseCircle}
          iconBg="#FEE2E2"
          iconColor="#991B1B"
        />
      </div>

      {/* Tab bar + search */}
      <div className="flex-shrink-0 px-7 pb-4">
        {/* Tabs */}
        <div className="flex gap-0" style={{ borderBottom: "2px solid #E1E6EC" }}>
          {TABS.map((tab) => {
            const count = counts[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 bg-transparent border-none px-3.5 py-2.5 text-[13px] transition-colors whitespace-nowrap"
                style={{
                  borderBottom: isActive ? "2px solid #185FA5" : "2px solid transparent",
                  marginBottom: -2,
                  color: isActive ? "#185FA5" : "#9BA8B5",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {t(tab.labelKey)}
                <span
                  className="rounded-full px-1.5 py-px text-[10.5px] font-bold transition-all"
                  style={
                    isActive
                      ? { background: "#185FA5", color: "#FFFFFF" }
                      : { background: "#E1E6EC", color: "#9BA8B5" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <SearchField
          value={search}
          onChange={setSearch}
          aria-label={t("agency.bookings.search")}
          className="mt-3.5 max-w-[340px]"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t("agency.bookings.search")} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      {/* Table */}
      <div className="flex-1 px-7 pb-12">
        <BookingsTable bookings={filtered} onView={setDetailBooking} />
      </div>

      {/* Detail modal */}
      {detailBooking && (
        <DetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
