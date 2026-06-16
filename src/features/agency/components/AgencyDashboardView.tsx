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

const DONUT_COLORS = [
  "#a5b4fc", // approved  — soft indigo/purple (matches reference large segment)
  "#fb923c", // pending   — orange
  "#f472b6", // rejected  — pink/magenta (matches reference tiny segment)
  "#93c5fd", // completed — sky blue (matches reference light-blue segment)
  "#fbbf24", // cancelled — amber/yellow (matches reference small segment)
];

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

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeToYear(data: MonthlyBookingResponse[]): MonthlyBookingResponse[] {
  const map = new Map(data.map((d) => [d.month, d.bookings]));
  return ALL_MONTHS.map((month) => ({ month, bookings: map.get(month) ?? 0 }));
}

function BookingsTrendChart({ data }: { data: MonthlyBookingResponse[] }) {
  const { t } = useTranslation();
  const normalized = normalizeToYear(data);
  const currentMonth = new Date().toLocaleString("en", { month: "short" });

  return (
    <Panel title={t("agency.dashboard.bookingsTrend")}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={normalized} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} tickCount={5} />
          <Tooltip
            {...tooltipProps}
            formatter={(value) => [`${value} bookings`, ""]}
          />
          <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
            {normalized.map((entry) => {
              const isCurrent = entry.month === currentMonth;
              const hasData = entry.bookings > 0;
              const fill = isCurrent
                ? "var(--color-primary)"
                : hasData
                  ? "var(--primary-lightskyblue)"
                  : "var(--border)";
              return <Cell key={entry.month} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

const STATUS_META = [
  { key: "approved",  label: "Approved",  colorIdx: 0 },
  { key: "pending",   label: "Pending",   colorIdx: 1 },
  { key: "rejected",  label: "Rejected",  colorIdx: 2 },
  { key: "completed", label: "Completed", colorIdx: 3 },
  { key: "cancelled", label: "Cancelled", colorIdx: 4 },
] as const;

function BookingStatusChart({ summary }: { summary: BookingStatusSummaryResponse }) {
  const { t } = useTranslation();

  const rows = STATUS_META.map((s) => ({
    ...s,
    value: summary[s.key as keyof BookingStatusSummaryResponse] as number,
    color: DONUT_COLORS[s.colorIdx],
  }));

  const data = rows.filter((d) => d.value > 0);
  const total = rows.reduce((sum, d) => sum + d.value, 0);

  return (
    <Panel title={t("agency.dashboard.bookingStatus")}>
      <div className="flex items-center gap-6">
        {/* Donut with center label */}
        <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length ? data : [{ name: "empty", value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={data.length > 1 ? 3 : 0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {data.length ? (
                  data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))
                ) : (
                  <Cell fill="var(--border)" />
                )}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center total overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-muted text-xs font-medium">Total</span>
            <span className="text-xl font-black leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
              {total}
            </span>
          </div>
        </div>

        {/* Legend rows */}
        <div className="flex flex-1 flex-col gap-2.5">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {row.label}
                </span>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
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
    </div>
  );
}
