import { auth } from "@/auth";
import { can } from "@/lib/permissions";
import { getPopularDestinations } from "@/actions/destination.action";
import { getTrendingTours, getRecommendedTours } from "@/actions/tour.action";
import { getTopRatedAgencies } from "@/actions/agency.action";
import { getRecentReviews } from "@/actions/review.action";
import { getTripInspirations } from "@/actions/trip-inspiration.action";
import { LandingScreen } from "@/features/landing/components/LandingScreen";
import type { Result } from "@/features/destinations/data";
import type { FeaturedTour } from "@/features/destinations/schema";

/**
 * Root route: the public landing page. A **server component** that fetches every dynamic
 * section from the backend (popular destinations, trending tours, recommended tours for the
 * signed-in traveler, top-rated agencies, trip inspirations, recent reviews) and hands the
 * results to the presentational `LandingScreen`.
 *
 * Home for everyone — guests and signed-in travelers/agencies — so there is no redirect here.
 * Login sends admins to /admin; the header offers each role a link to its own area.
 */
export default async function HomePage() {
  const session = await auth();
  const role = session?.role ?? null;
  // "Recommended for you" is a traveler-only capability (mirrors the permissions matrix).
  const showRecommended = Boolean(session?.user) && can(role, "createTripPlan");

  const [
    popularDestinations,
    trendingTours,
    topAgencies,
    recentReviews,
    tripInspirations,
    recommendedTours,
  ] = await Promise.all([
    getPopularDestinations(),
    getTrendingTours(),
    getTopRatedAgencies(),
    getRecentReviews("asc", 3),
    getTripInspirations(),
    showRecommended
      ? getRecommendedTours(session!.user.id)
      : Promise.resolve<Result<FeaturedTour[]> | null>(null),
  ]);

  return (
    <LandingScreen
      popularDestinations={popularDestinations}
      trendingTours={trendingTours}
      topAgencies={topAgencies}
      recentReviews={recentReviews}
      tripInspirations={tripInspirations}
      recommendedTours={recommendedTours}
      recommendedName={session?.user?.name ?? ""}
    />
  );
}
