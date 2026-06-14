import {
  AgencyRequestSchema,
  PlatformActivitySchema,
  ReportSchema,
  UserSummarySchema,
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
