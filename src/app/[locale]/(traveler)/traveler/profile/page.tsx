import { getMyTrips } from "@/lib/api/bookings";
import { getBookmarks } from "@/lib/api/bookmarks";
import { getMyTravelerProfile } from "@/lib/api/profile";
import { getMyReviews } from "@/lib/api/reviews";
import { getMyTripPlans } from "@/lib/api/tripPlans";
import { TravelerProfileScreen } from "@/features/traveler/components/TravelerProfileScreen";
import {
  apiBookmarkToBookmark,
  apiProfileToTravelerProfile,
  apiReviewToMyReview,
  apiTripPlanToTripPlan,
  buildRecentActivity,
  tripToBookingHistory,
} from "@/features/traveler/mappers";

export default async function TravelerProfilePage() {
  const [profileApi, tripsPage, bookmarksPage, tripPlansPage, reviewsPage] =
    await Promise.all([
      getMyTravelerProfile(),
      getMyTrips({ page: 0, size: 50 }),
      getBookmarks({ page: 0, size: 50 }),
      getMyTripPlans({ page: 0, size: 50 }),
      getMyReviews({ page: 0, size: 50 }),
    ]);

  const bookings = tripsPage.content.map(tripToBookingHistory);
  const bookmarks = bookmarksPage.content.map(apiBookmarkToBookmark);
  const tripPlans = tripPlansPage.content.map(apiTripPlanToTripPlan);
  const tripsCompleted = bookings.filter((b) => b.status === "completed").length;

  const profile = apiProfileToTravelerProfile(profileApi, {
    tripsCompleted,
    reviewsWritten: reviewsPage.content.length,
    bookmarksSaved: bookmarks.length,
  });

  const reviews = reviewsPage.content.map((r) =>
    apiReviewToMyReview(r, { name: profile.name, avatar: profile.avatar }),
  );

  const activity = buildRecentActivity(bookings, reviews, bookmarks);

  return (
    <TravelerProfileScreen
      profile={profile}
      phone={profileApi.phone ?? ""}
      bookings={bookings}
      bookmarks={bookmarks}
      tripPlans={tripPlans}
      reviews={reviews}
      activity={activity}
    />
  );
}
