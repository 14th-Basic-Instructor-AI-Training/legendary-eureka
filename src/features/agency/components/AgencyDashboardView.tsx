"use client";

// Which components require "use client" due to INTERACTIVITY:
//   BookingsTrendChart, BookingStatusChart — Recharts uses ResizeObserver + SVG browser APIs
//   QuickActions                           — useLocalizedRouter() wraps Next.js useRouter()
//
// StatsGrid, RecentBookingsTable, ReviewCard are in this client boundary because
// react-i18next's useTranslation() is a client-only hook in this project's i18n setup.
// If the project ever adds server-side i18n, those three could become server components.

import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Layer, Clock, Category, Star1, Add, Bag } from "iconsax-reactjs";
import { Avatar, StatusChip } from "@/ui";
import { useLocalizedRouter } from "@/lib/locale";
import {
  axisProps,
  gridProps,
  tooltipProps,
} from "@/features/admin/components/dashboard/chartTheme";
import type {
  AgencyStatsResponse,
  AgencyReviewResponse,
  MonthlyBookingResponse,
  BookingStatusSummaryResponse,
} from "@/lib/api/profile";
import type { TripResponse } from "@/lib/api/bookings";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AgencyDashboardViewProps {
  stats: AgencyStatsResponse;
  monthlyBookings: MonthlyBookingResponse[];
  bookingStatusSummary: BookingStatusSummaryResponse;
  reviews: AgencyReviewResponse[];
  trips: TripResponse[];
  agencyName: string;
}

const DONUT_COLORS = ["var(--primary-lightskyblue)", "var(--orange)", "var(--red)", "var(--green)", "var(--text-secondary)"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(isoDate: string) {
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border-border rounded-2xl border p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--primary-lightskyblue)" }}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tintBg: string;
  tintColor: string;
  urgent?: boolean;
}

function StatCard({ label, value, icon: Icon, tintBg, tintColor, urgent }: StatCardProps) {
  return (
    <div
      className="bg-surface border-border flex items-start gap-4 rounded-2xl border p-6 transition-shadow hover:shadow-primary"
      style={
        urgent
          ? ({ borderColor: "var(--yellow)", background: "var(--bg-yellow)" } as CSSProperties)
          : undefined
      }
    >
      <div
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: tintBg, color: tintColor } as CSSProperties}
      >
        <Icon size={24} variant="Bold" />
      </div>
      <div>
        <p className="text-muted mb-1.5 text-xs font-bold uppercase tracking-widest">{label}</p>
        <p
          className="text-3xl font-black leading-none tracking-tight"
          style={{ color: "var(--primary-lightskyblue)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: AgencyStatsResponse }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label={t("agency.dashboard.totalPackages")}
        value={stats.totalPackages}
        icon={Layer}
        tintBg="var(--bg-blue)"
        tintColor="var(--blue)"
      />
      <StatCard
        label={t("agency.dashboard.pendingBookings")}
        value={stats.pendingBookings}
        icon={Clock}
        tintBg="var(--bg-seashell)"
        tintColor="var(--orange)"
        urgent
      />
      <StatCard
        label={t("agency.dashboard.totalActivities")}
        value={stats.totalActivities}
        icon={Category}
        tintBg="var(--bg-lightgreen)"
        tintColor="var(--green)"
      />
      <StatCard
        label={t("agency.dashboard.avgRating")}
        value={stats.averageRating.toFixed(1)}
        icon={Star1}
        tintBg="var(--bg-yellow)"
        tintColor="var(--yellow)"
      />
    </div>
  );
}

// ── Charts — require "use client" (Recharts uses browser SVG / ResizeObserver) ─

function BookingsTrendChart({ data }: { data: MonthlyBookingResponse[] }) {
  const { t } = useTranslation();
  return (
    <Panel title={t("agency.dashboard.bookingsTrend")}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="bookings" fill="var(--primary-lightskyblue)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function BookingStatusChart({ summary }: { summary: BookingStatusSummaryResponse }) {
  const { t } = useTranslation();
  const data = [
    { name: "Approved", value: summary.approved },
    { name: "Pending", value: summary.pending },
    { name: "Rejected", value: summary.rejected },
    { name: "Completed", value: summary.completed },
    { name: "Cancelled", value: summary.cancelled },
  ].filter((d) => d.value > 0);

  return (
    <Panel title={t("agency.dashboard.bookingStatus")}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{value}</span>
            )}
          />
          <Tooltip {...tooltipProps} />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}

// ── Recent bookings table ─────────────────────────────────────────────────────

function RecentBookingsTable({ trips }: { trips: TripResponse[] }) {
  const { t } = useTranslation();

  if (trips.length === 0) {
    return (
      <p className="text-muted py-8 text-center text-sm">{t("agency.bookings.empty")}</p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-border border-b">
          {[
            t("agency.dashboard.colTraveler"),
            t("agency.dashboard.colPackage"),
            t("agency.dashboard.colDate"),
            t("agency.dashboard.colStatus"),
          ].map((h) => (
            <th
              key={h}
              className="text-muted pb-3 text-left text-xs font-bold uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {trips.slice(0, 6).map((trip) => (
          <tr
            key={trip.id}
            className="border-border/60 border-b last:border-0 hover:bg-bg-ghostwhite"
          >
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2.5">
                <Avatar size="sm">
                  <Avatar.Fallback>{trip.travelerInitials || initialsOf(trip.travelerDisplayName || trip.travelerName || "?")}</Avatar.Fallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {trip.travelerDisplayName || trip.travelerName}
                </span>
              </div>
            </td>
            <td className="text-muted py-3 pr-4 text-xs">{trip.tourPackageTitle}</td>
            <td className="text-muted py-3 pr-4 text-xs whitespace-nowrap">
              {formatDate(trip.requestedDate)}
            </td>
            <td className="py-3">
              <StatusChip status={trip.status.toLowerCase()} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Recent reviews ────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: AgencyReviewResponse }) {
  return (
    <div className="bg-surface border-border flex gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-primary">
      <Avatar size="md">
        <Avatar.Fallback>{initialsOf(review.travelerName)}</Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="font-bold text-sm" style={{ color: "var(--primary-lightskyblue)" }}>
            {review.travelerName}
          </p>
          <span
            className="flex items-center gap-0.5 text-sm font-bold"
            style={{ color: "var(--yellow)" }}
          >
            <Star1 size={14} variant="Bold" />
            {review.rating.toFixed(1)}
          </span>
        </div>
        <p className="text-muted text-xs leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
      </div>
    </div>
  );
}

// ── Quick actions — require "use client" (useLocalizedRouter wraps useRouter) ──

function QuickActions() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  return (
    <Panel title={t("agency.dashboard.quickActions")}>
      <p className="text-muted mb-5 text-sm">{t("agency.dashboard.quickActionsSub")}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/agency/activities")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 font-bold text-base text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          style={{ backgroundColor: "var(--primary-lightskyblue)" }}
        >
          <Add size={28} variant="Bold" />
          {t("agency.dashboard.createActivity")}
        </button>
        <button
          onClick={() => router.push("/agency/packages")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 font-bold text-base text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          style={{ backgroundColor: "var(--primary-lightskyblue)" }}
        >
          <Bag size={28} variant="Bold" />
          {t("agency.dashboard.createPackage")}
        </button>
      </div>
    </Panel>
  );
}

// ── Root view component ───────────────────────────────────────────────────────

export default function AgencyDashboardView({
  stats,
  monthlyBookings,
  bookingStatusSummary,
  reviews,
  trips,
  agencyName,
}: AgencyDashboardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 px-8 py-8 pb-12">
      {/* Header */}
      <div>
        <h1
          className="text-4xl font-black tracking-tight"
          style={{ color: "var(--primary-lightskyblue)" }}
        >
          {t("agency.dashboard.title")}
        </h1>
        <p className="text-muted mt-1 text-sm">
          {t("agency.dashboard.welcome", { name: agencyName })}
        </p>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        <BookingsTrendChart data={monthlyBookings} />
        <BookingStatusChart summary={bookingStatusSummary} />
      </div>

      {/* Bookings table + reviews */}
      <div className="grid grid-cols-2 gap-6">
        <Panel
          title={t("agency.dashboard.recentBookings")}
          action={
            <button className="text-primary-lightskyblue text-sm hover:underline">
              {t("agency.dashboard.viewAll")}
            </button>
          }
        >
          <RecentBookingsTable trips={trips} />
        </Panel>

        <div className="flex flex-col gap-4">
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("agency.dashboard.recentReviews")}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-muted text-center text-sm">{t("common.empty")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}
