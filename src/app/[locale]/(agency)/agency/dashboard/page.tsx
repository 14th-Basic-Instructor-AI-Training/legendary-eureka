"use client";

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
import {
  Layer,
  Clock,
  Category,
  Star1,
  Add,
  Bag,
} from "iconsax-reactjs";
import { Avatar, StatusChip, Skeleton } from "@/ui";
import { useSession } from "@/lib/auth";
import { useAgencyStore } from "@/features/agency/store";
import { useResource } from "@/lib/useResource";
import { useLocalizedRouter } from "@/lib/locale";
import { getDashboardStats, getRecentReviews } from "@/features/agency/data";
import { axisProps, gridProps, tooltipProps } from "@/features/admin/components/dashboard/chartTheme";
import type {
  AgencyDashboardStats,
  AgencyReview,
  BookingRequest,
} from "@/features/agency/schema";

/* ── Mock chart data ────────────────────────────────────── */

const MONTHLY_BOOKINGS = [
  { month: "Jan", bookings: 18 },
  { month: "Feb", bookings: 26 },
  { month: "Mar", bookings: 38 },
  { month: "Apr", bookings: 31 },
  { month: "May", bookings: 42 },
  { month: "Jun", bookings: 34 },
];

const BOOKING_STATUS_DATA = [
  { name: "Approved", value: 48 },
  { name: "Pending", value: 12 },
  { name: "Rejected", value: 5 },
];

const DONUT_COLORS = [
  "var(--primary-lightskyblue)",
  "var(--orange)",
  "var(--red)",
];

/* ── Helpers ────────────────────────────────────────────── */

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Panel wrapper ──────────────────────────────────────── */

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

/* ── Stat card ──────────────────────────────────────────── */

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

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[96px] rounded-2xl" />
      ))}
    </div>
  );
}

function StatsGrid({ stats }: { stats: AgencyDashboardStats }) {
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

/* ── Charts row ─────────────────────────────────────────── */

function BookingsTrendChart() {
  const { t } = useTranslation();
  return (
    <Panel title={t("agency.dashboard.bookingsTrend")}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={MONTHLY_BOOKINGS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipProps} />
          <Bar
            dataKey="bookings"
            fill="var(--primary-lightskyblue)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function BookingStatusChart() {
  const { t } = useTranslation();
  return (
    <Panel title={t("agency.dashboard.bookingStatus")}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={BOOKING_STATUS_DATA}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {BOOKING_STATUS_DATA.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i]} />
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

/* ── Recent bookings table ──────────────────────────────── */

function RecentBookingsTable({ bookings }: { bookings: BookingRequest[] }) {
  const { t } = useTranslation();

  if (bookings.length === 0) {
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
        {bookings.slice(0, 6).map((b) => (
          <tr key={b.id} className="border-border/60 border-b last:border-0 hover:bg-bg-ghostwhite">
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2.5">
                <Avatar size="sm">
                  <Avatar.Fallback>{initialsOf(b.travelerName)}</Avatar.Fallback>
                </Avatar>
                <span
                  className="font-bold"
                  style={{ color: "var(--primary-lightskyblue)" }}
                >
                  {b.travelerName}
                </span>
              </div>
            </td>
            <td className="text-muted py-3 pr-4 text-xs">{b.packageTitle}</td>
            <td className="text-muted py-3 pr-4 text-xs whitespace-nowrap">{b.datesLabel}</td>
            <td className="py-3">
              <StatusChip status={b.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Recent reviews ─────────────────────────────────────── */

function ReviewCard({ review }: { review: AgencyReview }) {
  return (
    <div className="bg-surface border-border flex gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-primary">
      <Avatar size="md">
        <Avatar.Fallback>{initialsOf(review.travelerName)}</Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p
            className="font-bold text-sm"
            style={{ color: "var(--primary-lightskyblue)" }}
          >
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
        <p className="text-muted text-xs leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

/* ── Quick actions ──────────────────────────────────────── */

function QuickActions() {
  const { t } = useTranslation();
  const router = useLocalizedRouter();
  return (
    <Panel title={t("agency.dashboard.quickActions")}>
      <p className="text-muted mb-5 text-sm">{t("agency.dashboard.quickActionsSub")}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/agency")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-8 font-bold text-base text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          style={{ backgroundColor: "var(--primary-lightskyblue)" }}
        >
          <Add size={28} variant="Bold" />
          {t("agency.dashboard.createActivity")}
        </button>
        <button
          onClick={() => router.push("/agency")}
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

/* ── Page ───────────────────────────────────────────────── */

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useSession();

  const bookings = useAgencyStore((s) => s.bookings);
  const statsState = useResource(getDashboardStats);
  const reviewsState = useResource(getRecentReviews);

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
          {user
            ? t("agency.dashboard.welcome", { name: user.name })
            : t("agency.dashboard.subtitle")}
        </p>
      </div>

      {/* Stats */}
      {statsState.status === "loading" && <StatsGridSkeleton />}
      {statsState.status === "error" && (
        <p className="text-muted text-sm">
          {t("common.error")}{" "}
          <button
            onClick={statsState.reload}
            className="text-primary-lightskyblue underline"
          >
            {t("common.retry")}
          </button>
        </p>
      )}
      {statsState.status === "success" && statsState.data && (
        <StatsGrid stats={statsState.data} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        <BookingsTrendChart />
        <BookingStatusChart />
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
          <RecentBookingsTable bookings={bookings} />
        </Panel>

        <div className="flex flex-col gap-4">
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("agency.dashboard.recentReviews")}
          </h2>
          {reviewsState.status === "loading" && <ReviewsSkeleton />}
          {reviewsState.status === "error" && (
            <p className="text-muted text-center text-sm">{t("common.error")}</p>
          )}
          {reviewsState.status === "success" && reviewsState.data && (
            <div className="flex flex-col gap-3">
              {reviewsState.data.map((r) => (
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
