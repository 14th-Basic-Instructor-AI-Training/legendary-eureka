import {
  AdminDashboardSchema,
  AgencyRequestSchema,
  PlatformActivitySchema,
  ReportSchema,
  UserSummarySchema,
  type AdminDashboard,
  type AgencyRequest,
  type PlatformActivity,
  type Report,
  type UserSummary,
} from "./schema";

export const ADMIN_AGENCY_REQUESTS: AgencyRequest[] = [
  {
    id: "ar-1",
    agencyName: "Mekong Explorer Tours",
    applicantName: "Visnu Sok",
    email: "visnu@mekongexplorer.com",
    country: "Cambodia",
    submittedAtLabel: "1 hour ago",
    status: "pending",
  },
  {
    id: "ar-2",
    agencyName: "Seoul Day Trips",
    applicantName: "Ji-woo Park",
    email: "jiwoo@seouldaytrips.kr",
    country: "South Korea",
    submittedAtLabel: "Yesterday",
    status: "pending",
  },
  {
    id: "ar-3",
    agencyName: "Bayon Adventures",
    applicantName: "Rith Chenda",
    email: "rith@bayonadventures.com",
    country: "Cambodia",
    submittedAtLabel: "4 days ago",
    status: "approved",
  },
].map((r) => AgencyRequestSchema.parse(r));

export const ADMIN_REPORTS: Report[] = [
  {
    id: "rp-1",
    targetAgency: "Quick Cheap Tours",
    reporterName: "Dara Traveler",
    reason: "Tour did not match the description on the package page.",
    submittedAtLabel: "3 hours ago",
    status: "open",
  },
  {
    id: "rp-2",
    targetAgency: "Sunrise Trips Co.",
    reporterName: "Min-jun Kim",
    reason: "Guide cancelled last minute with no refund offered.",
    submittedAtLabel: "2 days ago",
    status: "open",
  },
].map((r) => ReportSchema.parse(r));

export const ADMIN_ACTIVITIES: PlatformActivity[] = [
  {
    id: "pa-1",
    title: "Angkor Wat Sunrise Tour",
    agencyName: "Angkor Trails Agency",
    category: "thingToDo",
    status: "published",
    rating: 4.9,
  },
  {
    id: "pa-2",
    title: "Han River Night Cruise",
    agencyName: "Hangang Journeys",
    category: "thingToDo",
    status: "published",
    rating: 4.6,
  },
  {
    id: "pa-3",
    title: "Gwangjang Market Food Walk",
    agencyName: "Seoul Day Trips",
    category: "food",
    status: "draft",
    rating: 0,
  },
].map((a) => PlatformActivitySchema.parse(a));

export const ADMIN_USERS: UserSummary[] = [
  {
    id: "u-admin",
    name: "Admin User",
    email: "admin@jalat.test",
    role: "admin",
    joinedAtLabel: "Jan 2026",
  },
  {
    id: "u-agency",
    name: "Angkor Trails Agency",
    email: "agency@jalat.test",
    role: "agency",
    joinedAtLabel: "Feb 2026",
  },
  {
    id: "u-traveler",
    name: "Dara Traveler",
    email: "traveler@jalat.test",
    role: "traveler",
    joinedAtLabel: "Mar 2026",
  },
].map((u) => UserSummarySchema.parse(u));

/** Mock analytics for the admin overview dashboard. Replaced by aggregation later. */
export const ADMIN_DASHBOARD: AdminDashboard = AdminDashboardSchema.parse({
  kpis: [
    { key: "pendingRequests", value: 12, deltaPct: 8.3, deltaDir: "up", deltaGood: false, comparison: "vsYesterday" },
    { key: "openReports", value: 5, deltaPct: 12.5, deltaDir: "down", deltaGood: true, comparison: "vsLastWeek" },
    { key: "activities", value: 248, deltaPct: 4.1, deltaDir: "up", deltaGood: true, comparison: "vsLastWeek" },
    { key: "users", value: 1860, deltaPct: 2.4, deltaDir: "up", deltaGood: true, comparison: "vsPrior30d" },
  ],
  // New activities published per day across the platform (last ~30 days, sampled).
  volume: [
    { label: "Apr 19", value: 18 }, { label: "Apr 22", value: 22 }, { label: "Apr 25", value: 17 },
    { label: "Apr 28", value: 26 }, { label: "May 1", value: 24 }, { label: "May 4", value: 31 },
    { label: "May 7", value: 28 }, { label: "May 10", value: 35 }, { label: "May 13", value: 33 },
    { label: "May 16", value: 41 }, { label: "May 19", value: 46 },
  ],
  // Share of activities by category.
  distribution: [
    { key: "thingToDo", value: 44, colorVar: "--primary-lightskyblue" },
    { key: "destination", value: 28, colorVar: "--blue" },
    { key: "food", value: 18, colorVar: "--purple" },
    { key: "stay", value: 10, colorVar: "--green" },
  ],
  // Agency requests resolved per day (approved vs rejected), last 8 days.
  approvals: [
    { label: "Apr 8", approved: 4, rejected: 1 }, { label: "Apr 9", approved: 6, rejected: 2 },
    { label: "Apr 10", approved: 5, rejected: 1 }, { label: "Apr 11", approved: 7, rejected: 3 },
    { label: "Apr 12", approved: 3, rejected: 0 }, { label: "Apr 13", approved: 8, rejected: 2 },
    { label: "Apr 14", approved: 6, rejected: 1 }, { label: "Apr 15", approved: 9, rejected: 2 },
  ],
  // New traveler/agency sign-ups per weekday, last 7 days.
  newUsers: [
    { label: "Mon", value: 54 }, { label: "Tue", value: 49 }, { label: "Wed", value: 62 },
    { label: "Thu", value: 47 }, { label: "Fri", value: 71 }, { label: "Sat", value: 58 },
    { label: "Sun", value: 41 },
  ],
  recentRequests: [
    { id: "ar-1", agencyName: "Mekong Explorer Tours", applicantName: "Visnu Sok", country: "Cambodia", submittedAtLabel: "1 hour ago", status: "pending" },
    { id: "ar-2", agencyName: "Seoul Day Trips", applicantName: "Ji-woo Park", country: "South Korea", submittedAtLabel: "Yesterday", status: "pending" },
    { id: "ar-3", agencyName: "Bayon Adventures", applicantName: "Rith Chenda", country: "Cambodia", submittedAtLabel: "4 days ago", status: "approved" },
    { id: "ar-4", agencyName: "Jeju Island Escapes", applicantName: "Min-seo Lee", country: "South Korea", submittedAtLabel: "5 days ago", status: "rejected" },
  ],
  feed: [
    { id: "fe-1", kind: "agencyApproved", subject: "Bayon Adventures", timeLabel: "12 min ago" },
    { id: "fe-2", kind: "reportResolved", subject: "Sunrise Trips Co.", timeLabel: "28 min ago" },
    { id: "fe-3", kind: "activityEdited", subject: "Angkor Wat Sunrise Tour", timeLabel: "1 hour ago" },
    { id: "fe-4", kind: "userJoined", subject: "Sokha Chan", timeLabel: "2 hours ago" },
  ],
});
